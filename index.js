const express = require("express"),
    app = express(),

    axios = require("axios"),

    bodyParser = require("body-parser"),

    Yelp = require("yelp-fusion"),

    yelp = Yelp.client("Rbcpq-glFZ-SWli6Ac2daTjuc1rOoIRMVn4JbvsDNdB8bi-cr7QRQjoqJ9GIlhmp-z-wd21TYv-qkuTIusncQLBhYef2wTZ1TtBQGyrJ3LmEZ5ciqwJCdPs3p49FXXYx");

require("http").Server(app).listen(9000);

app.use(express.static(__dirname + "/js"));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

const GOOGLE_API_KEY = "AIzaSyCdKWpGk2NqT_Mdx0L7oudzR8mdLQ0KTYk";

function sortRestaurants(restaurants) {
    return restaurants.sort(function(a, b) {
        if (b.rating < a.rating) {
            return -1;
        }
        else if (b.rating > a.rating) {
            return 1;
        }
        else if (b.review_count < a.review_count) {
            return -1;
        }
        else if (b.review_count > a.review_count) {
            return 1;
        }

        return 0;
    });
}

async function getGooglePlaceFoRestaurant(restaurant) {
    const name = restaurant.name;

    const lat = restaurant.coordinates.latitude;
    const long = restaurant.coordinates.longitude;

    const placesURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}` +
                      `&keyword=${name}%20${restaurant.location.zip_code}&radius=100&type=restaurant` +
                      `&key=${GOOGLE_API_KEY}`;

    const placesRes = await axios.get(placesURL);
    const places = placesRes.data.results;
    if (places) {
        for (let i = 0; i < places.length; i++) {
            const aPlace = places[i];

            if (restaurant.name.includes(aPlace.name) || aPlace.name.includes(restaurant.name)) {
                const placeURL = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${aPlace.place_id}&key=${GOOGLE_API_KEY}`;
                const placeRes = await axios.get(placeURL);
                if (placeRes) {
                    return placeRes.data.result;
                }
            }
        }
    }

    return null;
}

app.post("/recommendations/", async function(req, res) {
    const responseData = {},

        recommendedRestaurants = [],

        // Sets up the days to be used later
        days = {
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6,
        },

        day = days[req.body.day],
        time = parseInt(req.body.time),

        yelpParams = {
            term: "restaurants",
            location: req.body.postcode,
            sort: 2,
            radius_filter: parseInt(req.body.distance) * 1000,
            category_filter: req.body.food.join(),
        };

    await yelp.search(yelpParams).then(async function(data) {

        const restaurants = sortRestaurants(data.jsonBody.businesses);

        for (let i = 0; i < restaurants.length; i++) {
            const restaurant = restaurants[i];
            const place = await getGooglePlaceFoRestaurant(restaurant);

            if (place) {
                const openingHours = place.opening_hours;

                if (
                    openingHours &&
                    openingHours.periods &&
                    openingHours.periods[day] &&
                    parseInt(openingHours.periods[day].open.time) <= time &&
                    parseInt(openingHours.periods[day].close.time) >= time
                ) {
                    recommendedRestaurants.push({
                        name: place.name,
                        address: place.formatted_address,
                        phone: place.formatted_phone_number,
                        rating: restaurant.rating,
                        categories: restaurant.categories,
                        website: place.website
                    });
                }
            }
        }

    }).catch(function(err) {
        responseData.error = err;
    });

    responseData.recommendedRestaurants = sortRestaurants(recommendedRestaurants);

    res.send(responseData);
});
