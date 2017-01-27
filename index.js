var express = require("express"),
app = express(),
http = require("http"),
server = http.Server(app);

server.listen(9000);

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/js"));
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

var Yelp = require('yelp');

var yelp = new Yelp({
  consumer_key: 'NYLIYvAuI7kb917AbxGG7g',
  consumer_secret: 'Fvm2IdcYp3S0pD19Vducgu9Pabs',
  token: 'qb7kTYEd0RbbqKnYxsNXyzS2ER1RAEA4',
  token_secret: '4cr6oFU8197yUKEtovdrcMhEJwM'
});

app.post('/recommendations/', function(req, res) {
  
  console.log(req.body);
});

app.get("/recommendations/", function (req, res) {

  /*yelp.search({term: 'food', location: 'Portsmouth'})
  .then(function (data) {
  res.send(JSON.stringify(response));
})
.catch(function (err) {
res.send(JSON.stringify(response));
});*/
var request = require('request');

request('https://maps.googleapis.com/maps/api/geocode/json?address=po11aq&key=AIzaSyDTY9OxJDd4_N2nVaNtdJng-YZcFYgmpEE', function (error, response, body) {
  console.log('Status Code: ' + response.statusCode);

  if (error || response.statusCode != 200) {
    console.log("Non 200 Response");
  }

  if (!error && response.statusCode == 200) {
    var locationResult = JSON.parse(body);
    var lat =  locationResult.results[0].geometry.location.lat,
    lng = locationResult.results[0].geometry.location.lng;

    request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + lng + "&radius=5000&type=restaurant&key=AIzaSyAk--L5B1sdS9Q5TKi23t7a4jmqN30Z7bg", function (error, response, body) {
      console.log('Status Code: ' + response.statusCode);

      if (error || response.statusCode != 200) {
        console.log("Non 200 Response");
      }

      if (!error && response.statusCode == 200) {
        var placesResult = JSON.parse(body),
        restaurants = [];

        placesResult.results.forEach(function(restaurant) {

          request("https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyAk--L5B1sdS9Q5TKi23t7a4jmqN30Z7bg&placeid=" + restaurant.place_id, function (error, response, body) {

            console.log('Status Code: ' + response.statusCode);

            if (error || response.statusCode != 200) {
              console.log("Non 200 Response");
            }

            if (!error && response.statusCode == 200) {
              restaurants.push(JSON.parse(body));
              console.log("getting request");
            }

            if (restaurants.length === 5) {
              console.log("done");
              res.send(restaurants);
            }

          });
        });
      }
    });

  }
});
});
