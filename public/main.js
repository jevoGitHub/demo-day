document.querySelector("h2").addEventListener("click", connectFunc)

const replybtn = document.querySelectorAll(".reply-submit")
const reply = document.querySelectorAll(".reply").forEach(elem => elem.addEventListener("click", replyOption))
var trash = document.querySelectorAll(".trash")

function replyOption(event) {
  console.log(event.target.id)
  const a = event.target.id.split("_")
  const replyId = a[1]
  const replySectionId = `replysection_${replyId}`
  console.log(replySectionId)
  document.getElementById(replySectionId).classList.toggle("hidden")
}

for (let i = 0; i < replybtn.length; i++) {
  replybtn[i].addEventListener("click", replyFunc)
}

async function replyFunc(event) {
  document.querySelector(".reply-section").classList.add("hidden")
  const replyInputId = `input_${event.target.id}`
  const result = await fetch("/reply", {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'msgId': event.target.id,
      'msg': document.getElementById(replyInputId).value
    })
  })
  const json = await result.json()
  window.location.reload(true)
  document.querySelector(".msg-board").classList.remove("hidden")
}


function connectFunc() {
  // document.querySelector(".msg-board").classList.remove("hidden")
}


//trash feature

Array.from(trash).forEach(function (element) {
  element.addEventListener('click', function () {
    const saved = this.closest('section').querySelector('#saved').innerText;
    fetch('/saved', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'saved': saved
      })
    }).then(function (response) {
      window.location.reload();
    });
  });
});

// script for location finding

var x = document.getElementById("demo");
var mapView = document.querySelector(".map");
var msgLoc = document.querySelector("#location-input");

const geoLocation = document
  .querySelector("#location")
  .addEventListener("click", getLocation);

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

  msgLoc.value = [ position.coords.latitude, position.coords.longitude ]

  mapView.classList.remove("hidden");

  x.innerHTML =
    "Latitude: " +
    position.coords.latitude +
    "<br>Longitude: " +
    position.coords.longitude;

}

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

