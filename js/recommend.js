function renderRestaurants(res) {
    var recommendationsElem = document.getElementById("recommendation");
    recommendationsElem.innerHTML = "";

    var recommendedRestaurants = res.recommendedRestaurants || [];
    if (recommendedRestaurants.length) {
        for (var i = 0; i < recommendedRestaurants.length; i++) {
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
            for (var i; i < restaurant.categories.length; i++) {
                cats.push(cat[0]);
            }

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

            recommendationsElem.appendChild(div);
        }
    }
    else if (res && res.error) {
        recommendationsElem.innerHTML = "<p>Error getting your recommendations, please try again later.</p>";
    }
    else {
        recommendationsElem.innerHTML = "<p>No recommendations found for your preferences.</p>";
    }
}

document.getElementById("preferences").onsubmit = function() {

    var foodType = document.getElementsByName("foodType");
    var chosenTypes = [];

    for (var i = 0; i < foodType.length; i++) {
        if (foodType[i].checked) {
            chosenTypes.push(foodType[i].value);
        }
    }

    var pCode = document.getElementById("pCode").value;
    var dist = document.getElementById("distance").value;
    var time = document.getElementById("time").value;
    var day = document.getElementById("day").value;

    var preferences = {
        "postcode": pCode,
        "food": chosenTypes,
        "distance": dist,
        "time": time,
        "day": day,
    };
    var preferencesJSON = JSON.stringify(preferences);

    var http = new XMLHttpRequest();
    var url = "recommendations";
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/json");

    //Call a function when the state changes.
    http.onreadystatechange = function() {
        if (http.readyState === 4 && http.status === 200) {
            var res = JSON.parse(http.responseText);
            renderRestaurants(res);
        }
    };

    http.send(preferencesJSON);
    return false;
};
