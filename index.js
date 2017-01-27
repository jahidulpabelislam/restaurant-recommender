var express = require("express"),
    app = express(),
    http = require("http").Server(app);

http.listen(9000);

app.use(express.static(__dirname + "/public"));

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


app.get("/recommendations/", function (req, res) {
        yelp.search({ term: 'food', location: 'Portsmouth' })
            .then(function (data) {
                res.send(JSON.stringify(response));
            })
            .catch(function (err) {
                res.send(JSON.stringify(response));
            });
});