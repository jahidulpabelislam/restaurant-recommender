const express = require("express"),
    app = express(),

    request = require("request"),
    bodyParser = require("body-parser"),

    Yelp = require("yelp"),

    yelp = new Yelp({
        consumer_key: "NYLIYvAuI7kb917AbxGG7g",
        consumer_secret: "Fvm2IdcYp3S0pD19Vducgu9Pabs",
        token: "PpEfquG1t7T8OzuNkS3Bt46jQGkxt5yh",
        token_secret: "DIWO2SozLgCfb2vdBIaiuvTF23I",
    });

require("http").Server(app).listen(9000);

app.use(express.static(__dirname + "/js"));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/recommendations/", function(req, res) {
    const responseData = {};

    // Sets up the days to be used later
    const days = {
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

    yelp.search(yelpParams).then(function(data) {
        const restaurantsRecommended = [];

        const restaurants = data.businesses;

        restaurants.sort(function(a, b) {
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

        let sent = false;

        if (restaurants.length < 1) {
            res.send(responseData);
        }

        restaurants.forEach(function(restaurant) {
            const lat = restaurant.location.coordinate.latitude;
            const long = restaurant.location.coordinate.longitude;
            const name = restaurant.name;

            const mapsReqURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + long +
                               "&keyword=" + name + "%20" + restaurant.location.postal_code +
                               "&radius=100&type=restaurant&key=AIzaSyDTY9OxJDd4_N2nVaNtdJng-YZcFYgmpEE";

            request(mapsReqURL, function(error, response, body) {
                    if (!error && response.statusCode === 200) {

                        const placesResult = JSON.parse(body).results;
                        let found = false;

                        placesResult.forEach(function(place) {

                            const same = restaurant.name.includes(place.name) || place.name.includes(restaurant.name);

                            if (same) {

                                request("https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyCdKWpGk2NqT_Mdx0L7oudzR8mdLQ0KTYk&placeid=" + place.place_id, function(error2, response2, body2) {

                                        if (!error2 && response2.statusCode === 200) {

                                            const placeResult = JSON.parse(body2).result,
                                                openingHours = placeResult.opening_hours;

                                            if (
                                                openingHours &&
                                                openingHours.periods[day] &&
                                                parseInt(openingHours.periods[day].open.time) <=
                                                time &&
                                                parseInt(openingHours.periods[day].close.time) >=
                                                time &&
                                                !found
                                            ) {
                                                found = true;
                                                restaurantsRecommended.push({
                                                    name: placeResult.name,
                                                    address: placeResult.formatted_address,
                                                    phone: placeResult.formatted_phone_number,
                                                    rating: restaurant.rating,
                                                    categories: restaurant.categories,
                                                    website: placeResult.website
                                                });
                                            }
                                        }

                                        if (restaurantsRecommended.length === 5 && !sent) {
                                            sent = true;
                                            responseData.restaurantsRecommended = restaurantsRecommended;
                                            responseData.restaurantsRecommended.sort(function(a, b) {

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
                                            res.send(responseData);
                                        }
                                    }
                                );
                            }
                        });
                    }
                }
            );
        });
    }).catch(function(err) {
        responseData.error = err;
        res.send(responseData);
    });
});
