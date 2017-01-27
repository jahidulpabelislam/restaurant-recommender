var express = require("express"),
    app = express(),
    http = require("http"),
    server = http.Server(app),
    request = require('request'),
    Yelp = require('yelp'),
    bodyParser = require('body-parser');

server.listen(9000);

app.use(express.static(__dirname + "/js"));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

var yelp = new Yelp({
    consumer_key: 'NYLIYvAuI7kb917AbxGG7g',
    consumer_secret: 'Fvm2IdcYp3S0pD19Vducgu9Pabs',
    token: 'qb7kTYEd0RbbqKnYxsNXyzS2ER1RAEA4',
    token_secret: '4cr6oFU8197yUKEtovdrcMhEJwM'
});

app.post('/recommendations/', function (req, res) {

    yelp.search({term: 'food', location: 'po21 5jj', sort: 2, radius_filter: 20000, category_filter: "italian,french"})
        .then(function (data) {

            var restaurantsRecommended = [];

            var restaurants = data.businesses;

            restaurants.sort(function (a, b) {
                return a.rating - b.rating;
            });

            restaurants.forEach(function (restaurant) {

                var lat = restaurant.location.coordinate.latitude;
                var long = restaurant.location.coordinate.longitude;
                var name = restaurant.name;

                request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + long + "&keyword=" + name + "&radius=10&type=restaurant&key=AIzaSyCdKWpGk2NqT_Mdx0L7oudzR8mdLQ0KTYk", function (error, response, body) {

                    if (error || response.statusCode != 200) {
                        res.send(JSON.stringify(error));
                    }

                    if (!error && response.statusCode == 200) {
                        var placesResult = JSON.parse(body);

                        placesResult.results.forEach(function (restaurant) {

                            request("https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyCdKWpGk2NqT_Mdx0L7oudzR8mdLQ0KTYk&placeid=" + restaurant.place_id, function (error, response, body) {

                                if (error || response.statusCode != 200) {
                                    res.send(JSON.stringify(error));
                                }

                                if (!error && response.statusCode == 200) {
                                    restaurantsRecommended.push(JSON.parse(body).result);
                                }

                                if (restaurantsRecommended.length === 5) {
                                    res.send(restaurantsRecommended);
                                }

                            });
                        });
                    }
                });
            });
        })
        .catch(function (err) {
            res.send(JSON.stringify(err));
        });
});
