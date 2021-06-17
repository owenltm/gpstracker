var state = 0;
var points = [];
// var startPos, finishPos;

/* var startLatLayout = document.getElementById("startLatLayout");
var startLngLayout = document.getElementById("startLngLayout");
var finishLatLayout = document.getElementById("finishLatLayout");
var finishLngLayout = document.getElementById("finishLngLayout"); */

var db = firebase.firestore();
var toursCollection = db.collection("Tours");

const dbRef = firebase.database().ref();
const tourRef = dbRef.child("Tours");
const userRef = dbRef.child("Users");
const locationRef = dbRef.child("Locations");

const pointsList = document.getElementById("points-list");

function setState(newState){
  state = newState;
  console.log('set state');
  console.log(state);
}

if(points.length < 1){
  addPoint();
}

function addPoint() {
  const id = points.length;
  const item = document.createElement('div');
  item.className = "item";
  item.innerHTML = `
    <h4>Point ${points.length + 1}</h4>
    <p>Coords</p>
    <p>Lat: <span>00</span></p>
    <p>Lng: <span>00</span></p>
  `;
  item.addEventListener('click', function(){
    setState(id);
  });

  points.push({
    coords: null,
    marker: null,
    item: item
  });
  pointsList.appendChild(item);
}

function initMap() {
  const uluru = { lat: -2.5489, lng: 118.0149 };

  //MAPS
  var map = new google.maps.Map(document.getElementById('map'), {
    center: uluru,
    zoom: 6,
    styles: [{
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]  // Turn off points of interest.
    }, {
      featureType: 'transit.station',
      stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
    }],
    disableDoubleClickZoom: true,
    streetViewControl: false
  });

  console.log(state);

  google.maps.event.addListener(map, "click", (event) => {

    var point = points[state];
    var item = point.item;
    var latLayout = item.children[2];
    var lngLayout = item.children[3];

    var coords = event.latLng.toJSON();

    point.coords = coords;

    if(point.marker == null){
      point.marker = new google.maps.Marker({
        position: event.latLng,
        label: `${state + 1}`,
        map: map,
      });
    } else {
      point.marker.setPosition(event.latLng);
    }

    latLayout.innerHTML = `Lat: <span>${coords.lat}</span>`;
    lngLayout.innerHTML = `Lat: <span>${coords.lng}</span>`;
  });
}

function saveTour(){

  var poinstCount = points.length;
  const polys = [];

  for (let index = 1; index < poinstCount; index++) {
    const from = points[index-1].coords;
    const to = points[index].coords;

    console.log(`point ${index-1} to ${index}`);

    fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62485010dd16274149e4bdeee6e31f205107&start=${from.lng},${from.lat}&end=${to.lng},${to.lat}`
    )
    .then(response => response.json())
    .then(data => {
      const coords = data.features[0].geometry.coordinates;
  
      for (let i = 0; i < coords.length; i++) {
        polys.push({
          lat: coords[i][1],
          lng: coords[i][0],
        });
      }

      if(index == poinstCount-1){
        savePoly(polys);
      }
    });
  }
}

function savePoly(polys){
  console.log("save polys");
  console.log(polys);

  var tourname = document.getElementById("event-name").value;
  var tourdesc = document.getElementById("event-desc").value;
  var tourdate = document.getElementById("event-date").value;
  var tourroute = document.getElementById("event-route").value;

  toursCollection.add({
    name: tourname,
    desc: tourdesc,
    date: tourdate,
    route: tourroute,
    polys: polys
  }).then((docRef) => {
    tourRef.child(docRef.id).set({
      id: docRef.id,
      name: tourname,
      desc: tourdesc,
      date: tourdate,
      route: tourroute,
    })
  });
}