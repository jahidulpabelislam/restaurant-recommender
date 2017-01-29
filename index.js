const express = require("express"),
    app = express(),
    request = require('request'),
    Yelp = require('yelp'),
    bodyParser = require('body-parser'),
    yelp = new Yelp({
        consumer_key: "NYLIYvAuI7kb917AbxGG7g",
        consumer_secret: "Fvm2IdcYp3S0pD19Vducgu9Pabs",
        token: "Qqwq-Dr1yaEywOfQD7HjRvM02JlV4o64",
        token_secret: "hZnaVn2TFa1VJs-Xu37r-G1gDOo"
    });

require("http").Server(app).listen(9000);

app.use(express.static(__dirname + "/js"));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post('/recommendations/', function (req, res) {

    var responseData = {};

    yelp.search({term: "food", location: req.body.postcode, sort: 2, radius_filter: parseInt(req.body.distance) * 1000, category_filter: "french,italian" })
        .then(function (data) {

            var restaurantsRecommended = [];

            var restaurants = data.businesses;

            restaurants.sort(function (a, b) {
                return a.rating - b.rating;
            });

            var count = 0;

            restaurants.forEach(function (restaurant) {

                var lat = restaurant.location.coordinate.latitude;
                var long = restaurant.location.coordinate.longitude;
                var name = restaurant.name;

                request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + long + "&keyword=" + name + "&radius=10&type=restaurant&key=AIzaSyCdKWpGk2NqT_Mdx0L7oudzR8mdLQ0KTYk", function (error, response, body) {

                    count++;

                    if (!error && response.statusCode === 200) {
                        var placesResult = JSON.parse(body);

                        placesResult.results.forEach(function (restaurant) {

                            request("https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyCdKWpGk2NqT_Mdx0L7oudzR8mdLQ0KTYk&placeid=" + restaurant.place_id, function (error, response, body2) {

                                if (!error && response.statusCode === 200) {
                                    var day = 6,
                                        time = 1700,
                                        data = JSON.parse(body2).result,
                                        openingHours = data.opening_hours;

                                    if (openingHours && openingHours.periods[day] && parseInt(openingHours.periods[day].open.time) <= time && parseInt(openingHours.periods[day].close.time) >= time) {
                                        restaurantsRecommended.push(data);
                                    }
                                }

                                if (restaurantsRecommended.length === 5 || count >= restaurants.length) {
                                    responseData.restaurantsRecommended = restaurantsRecommended;
                                    res.send(responseData);
                                }

                            });
                        });
                    }
                });
            });
        })
        .catch(function (err) {
            responseData.error = err;
            res.send(responseData);
        });
});
