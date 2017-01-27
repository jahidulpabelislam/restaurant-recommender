var express = require("express"),
    app = express(),
    http = require("http").Server(app);

http.listen(9000);

app.use(express.static(__dirname + "/public"));

var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function (req, res) {
    res.sendFile("/index.html");
});

app.get("/recommendations/", function (req, res) {

});