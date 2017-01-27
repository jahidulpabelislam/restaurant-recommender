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

    var preferences = {"postcode": pCode, "food": chosenType, "distance": dist, "service": service};
    var preferencesJSON = JSON.stringify(preferences);

    var http = new XMLHttpRequest();
    var url = "recommendations";
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/json");

    //Call a function when the state changes.
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            alert(http.responseText);
        }
    };

    http.send(preferencesJSON);
    return false;
};
