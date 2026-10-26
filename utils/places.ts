import { v1 } from '@googlemaps/places'
import { google } from '@googlemaps/places/build/protos/protos';
import 'dotenv/config.js'

const placesClient = new v1.PlacesClient({
   apiKey: process.env.GOOGLE_MAPS_APIKEY || ''
})

interface SearchRestaurantOptions {
   location: {
      lat: number;
      lng: number;
   }
   radius: number;
}

interface Restaurant {
   location: {
      latitude: number;
      longitude: number;
   },
   name: string;
   phone: string;
   addr: string;
   rating: number;
   photo: string;
   openNow: boolean;
}

const callOptions = {
   otherArgs: {
      headers: {
         "X-Goog-FieldMask":
         "places.displayName,places.formattedAddress,places.photos,places.nationalPhoneNumber,places.location,places.currentOpeningHours,places.rating",
      },
   },
}

const toRestaurant = (place: google.maps.places.v1.IPlace): Restaurant => {
   const latitude = place.location?.latitude
   const longitude = place.location?.longitude

   if(typeof(latitude) !== 'number' || typeof(longitude) !== 'number') {
      throw new Error('Invalid latitude or longitude')
   }

   return {
      location: {
         latitude,
         longitude
      },
      name: place.displayName?.text ?? '',
      phone: place.nationalPhoneNumber ?? '',
      addr: place.formattedAddress ?? '',
      rating: place.rating ?? -1,
      photo: place.photos?.[0]?.name ?? '',
      openNow: place.currentOpeningHours?.openNow ?? false
   }
}

const searchNearbyRestaurants = async (opt: SearchRestaurantOptions) => {
   try {
      const request = {
         includedTypes: ["restaurant"],
         maxResultCount: 20,
         locationRestriction: {
            circle: {
               center: {
                     latitude: opt.location.lat,
                     longitude: opt.location.lng,
               },
               radius: opt.radius,
            },
         },
         languageCode: 'zh-TW'
      }

      const [response] = await placesClient.searchNearby(request, callOptions);

      if(response.places === null || response.places === undefined) {
         throw new Error('No restaurant nearby.')
      }

      return response.places.map(toRestaurant)
   } catch (error) {
      console.log('Search error: ', error)
      throw error
   }
}

const getPhotoUri = async (photoName: string) => {
   try {
      const getPhotoOptions = {
         name: `${photoName}/media`,
         maxWidthPx: 500
      }

      const [photoMediaResponse] = await placesClient.getPhotoMedia(getPhotoOptions)
      return photoMediaResponse
   } catch (error) {
      console.log('Get photo error: ', error)
   }
}

export { searchNearbyRestaurants, getPhotoUri }