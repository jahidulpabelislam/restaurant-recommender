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
    var service = document.getElementById('service').value;
    var time = document.getElementById('time').value;
    var day = document.getElementById('day').value;

    var preferences = {"postcode": pCode, "food": chosenType, "distance": dist, "service": service, "time": time, "day": day};
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
                console.log(data.restaurantsRecommended);
                data.restaurantsRecommended.forEach(function (restaurant) {
                    var div = document.createElement("div");
                    var name = document.createElement("p");
                    var address = document.createElement("p");
                    var number = document.createElement("p");
                    var site = document.createElement("a");

                    div.className = "col-md-4";
                    name.innerHTML = restaurant.name;
                    address.innerHTML = restaurant.formatted_address;
                    name.innerHTML = restaurant.name;
                    number.innerHTML = restaurant.formatted_phone_number;
                    site.innerHTML = restaurant.website;

                    div.appendChild(name);
                    div.appendChild(address);
                    div.appendChild(number);
                    div.appendChild(site);

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
