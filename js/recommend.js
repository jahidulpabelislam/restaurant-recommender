document.getElementById('preferences').onsubmit = function () {

    //// Food Type
    var foodType = document.getElementsByName('myCheck');
    var chosenType = [];
    var typeCount = 0;

    while (typeCount < foodType.length) {
        if (foodType[typeCount].checked) {
            chosenType.push(foodType[typeCount].value);
        }
        typeCount++;
    }

    //// Post code
    var pCode = document.getElementById('pCode').value;
    var dist = document.getElementById('distance').value;
    var time = document.getElementById('time').value;
    var day = document.getElementById('day').value;

    var preferences = {"postcode": pCode, "food": chosenType, "distance": dist, "time": time, "day": day};
    var preferencesJSON = JSON.stringify(preferences);

    var http = new XMLHttpRequest();
    var url = "recommendations";
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/json");

    //Call a function when the state changes.
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            const data = JSON.parse(http.responseText),
                recommendation = document.getElementById("recommendation");

            recommendation.innerHTML = "";

            if (data && data.restaurantsRecommended && data.restaurantsRecommended.length > 0) {
                data.restaurantsRecommended.forEach(function (restaurant) {
                    var div = document.createElement("div");
                    var div2 = document.createElement("div");
                    var div3 = document.createElement("div");
                    var div4 = document.createElement("div");
                    var name = document.createElement("h3");
                    var category = document.createElement("p");
                    var rating = document.createElement("p");
                    var address = document.createElement("p");
                    var number = document.createElement("p");
                    var site = document.createElement("a");

                    div.className = "col-md-4";
                    name.innerHTML = restaurant.name;
                    name.className = "panel-title";
                    address.innerHTML = "Address: " + restaurant.address;
                    number.innerHTML = "Phone Number: " + restaurant.phone;
                    rating.innerHTML = "Rating: " + restaurant.rating;
                    var cats = [];

                    restaurant.categories.forEach(function(cat) {
                        cats.push(cat[0]);
                    });

                    category.innerHTML = "Categories: " + cats.join(", ");
                    site.innerHTML = restaurant.website;
                    site.href = restaurant.website;

                    div2.className = "panel panel-default";
                    div3.className = "panel-heading";
                    div4.className = "panel-body";

                    div3.appendChild(name);
                    div4.appendChild(address);
                    div4.appendChild(number);
                    div4.appendChild(rating);
                    div4.appendChild(category);
                    div4.appendChild(site);

                    div2.appendChild(div3);
                    div2.appendChild(div4);

                    div.appendChild(div2);

                    recommendation.appendChild(div);
                });
            } else if (data && data.error) {
                recommendation.innerHTML = "<p>Error getting your Recommendations, please try again later.</p>";
            } else {
                recommendation.innerHTML = "<p>No Recommendations found for your preferences.</p>";
            }
        }
    };

    http.send(preferencesJSON);
    return false;
};
