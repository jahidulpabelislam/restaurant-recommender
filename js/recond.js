
document.getElementById('done').onclick = function()
{


  //// Food Type
  var foodType = document.getElementsByName('myCheck');
  var food  = foodType[0]
  var chosenType = [];
  var typeCount  = 0

  while (typeCount < foodType.length) {
    if(foodType[typeCount].checked)
    {
      chosenType.push(foodType[typeCount].value);
    }
    typeCount++;
  }
  //console.log(chosenType);


//// Post code
 var pCode = document.getElementById('pCode').value;
 var dist = document.getElementById('distance').value;
 var service = document.getElementById('service').value;

var myObj = { "postcode":pCode, "food":chosenType, "distance":dist, "service":service };
var myJSON = JSON.stringify(myObj);
console.log(myObj);

var http = new XMLHttpRequest();
var url = "/recommendations";
http.open("POST", url, true);

//Send the proper header information along with the request
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
        alert(http.responseText);
    }
}
http.send(myObj);

}
