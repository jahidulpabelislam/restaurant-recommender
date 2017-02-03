const express = require("express"),
    app = express(),
    request = require('request'),
    Yelp = require('yelp'),
    bodyParser = require('body-parser'),
    yelp = new Yelp({
        consumer_key: "NYLIYvAuI7kb917AbxGG7g",
        consumer_secret: "Fvm2IdcYp3S0pD19Vducgu9Pabs",
        token: "P_Df1D20uc7AIHbb-mbKSVwNaKOUIvAd",
        token_secret: "Km6I_BsvztNr91_7nEagn2KMQSI"
    });

require("http").Server(app).listen(9000);

app.use(express.static(__dirname + "/js"));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post('/recommendations/', function (req, res) {

    //sets up the days to be used later
    const days = {"Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6};

    var responseData = {};

    const day = days[req.body.day],
        time = parseInt(req.body.time);

    yelp.search({term: "restaurants", location: req.body.postcode, sort: 2, radius_filter: parseInt(req.body.distance) * 1000, category_filter: req.body.food.join()}).then(function(data) {

        var restaurantsRecommended = [];

        var restaurants = data.businesses;

        restaurants.sort(function(a, b) {

            if (b.rating < a.rating) {
                return -1;
            } else if (b.rating > a.rating) {
                return 1;
            } else {
                if (b.review_count < a.review_count) {
                    return -1;
                } else if (b.review_count > a.review_count) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });

        var sent = false;

        if (restaurants.length < 1) {
            res.send(responseData);
        }

        restaurants.forEach(function(restaurant) {

            var lat = restaurant.location.coordinate.latitude;
            var long = restaurant.location.coordinate.longitude;
            var name = restaurant.name;

            request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + long + "&keyword=" + name + "%20" + restaurant.location.postal_code + "&radius=100&type=restaurant&key=AIzaSyDTY9OxJDd4_N2nVaNtdJng-YZcFYgmpEE", function(error, response, body) {

                if (!error && response.statusCode === 200) {

                    const placesResult = JSON.parse(body).results;
                    let found = false;

                    placesResult.forEach(function(place) {

                        var same = restaurant.name.includes(place.name) || place.name.includes(restaurant.name);

                        if (same) {

                            request("https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyCdKWpGk2NqT_Mdx0L7oudzR8mdLQ0KTYk&placeid=" + place.place_id, function(error2, response2, body2) {

                                if (!error2 && response2.statusCode === 200) {

                                    var placeResult = JSON.parse(body2).result,
                                        openingHours = placeResult.opening_hours;

                                    if (openingHours && openingHours.periods[day] && parseInt(openingHours.periods[day].open.time) <= time && parseInt(openingHours.periods[day].close.time) >= time && !found) {
                                        found = true;
                                        restaurantsRecommended.push(placeResult);
                                    }
                                }

                                if (restaurantsRecommended.length === 5 && !sent) {
                                    sent = true;
                                    responseData.restaurantsRecommended = restaurantsRecommended;
                                    res.send(responseData);
                                }
                            });
                        }
                    });
                }
            });
        });
    }).catch(function(err) {
        responseData.error = err;
        res.send(responseData);
    });
});
