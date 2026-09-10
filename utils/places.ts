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
         "places.displayName,places.formattedAddress,places.id,places.photos,places.nationalPhoneNumber,places.location",
      },
   },
}



const searchNearbyRestaurants = async (opt: SearchRestaurantOptions) => {
   console.log(opt)
   const request = {
      includedTypes: ["restaurant"],
      maxResultCount: 10,
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

   const [data] = await placesClient.searchNearby(request,callOptions);
   return data
}

module.exports = { searchNearbyRestaurants }