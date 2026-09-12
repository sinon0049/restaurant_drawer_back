const { PlacesClient } = require('@googlemaps/places').v1

const placesClient = new PlacesClient({
   apiKey: process.env.GOOGLE_MAPS_APIKEY || ''
})

interface SearchRestaurantOptions {
   location: {
      lat: number;
      lng: number;
   }
   radius: number;
}

const callOptions = {
   otherArgs: {
      headers: {
         "X-Goog-FieldMask":
         "places.displayName,places.formattedAddress,places.photos,places.nationalPhoneNumber,places.location,places.currentOpeningHours,places.rating",
      },
   },
}

const searchNearbyRestaurants = async (opt: SearchRestaurantOptions) => {
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

   const [data] = await placesClient.searchNearby(request, callOptions);
   return data
}

const getPhoto = async (photoName: string) => {
   const getPhotoOptions = {
      name: `${photoName}/media`,
      maxWidthPx: 500
   }

   const [photoMediaResponse] = await placesClient.getPhotoMedia(getPhotoOptions)
   return photoMediaResponse
}

module.exports = { searchNearbyRestaurants, getPhoto }