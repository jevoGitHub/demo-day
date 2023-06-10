var x = document.getElementById("demo");
var mapView = document.querySelector(".map");
var msgLocLat = document.querySelector("#latitude-input");
var msgLocLon = document.querySelector("#longitude-input");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;

  var mapOptions = {
    center: new google.maps.LatLng(lat, lng),
    zoom: 15,
  };

  var map = new google.maps.Map(document.getElementById("map"), mapOptions);

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    map: map,
  });

  msgLocLat.value = position.coords.latitude
  msgLocLon.value = position.coords.longitude

  mapView.classList.remove("hidden");

  x.innerHTML =
    "Latitude: " +
    position.coords.latitude +
    "<br>Longitude: " +
    position.coords.longitude;

}

getLocation()

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred."
      break;
  }
}