
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
}
