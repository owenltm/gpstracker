var url_string = window.location.href
var url = new URL(url_string);
var tourid = url.searchParams.get("tourid");
var memberid = url.searchParams.get("memberid");

var db = firebase.firestore();
var toursCollection = db.collection("Tours");

const dbRef = firebase.database().ref();
const userRef = dbRef.child("Users");

var speedData = [];
var altData = [];
var posData = [];
var timeData = [];

const chartOptions = {
  fill: true,
  plugins: {
    legend: {
      display: false
    }
  },
  tension: 0.2
}

function initMap() {
  const uluru = { lat: -8.76703784, lng: 115.22095192 };

  //MAPS
  var map = new google.maps.Map(document.getElementById('map'), {
    center: uluru,
    zoom: 15,
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

  userRef.child(memberid).get().then((snapshot) => {
    if (snapshot.exists()) {
      const value = snapshot.val();

      document.getElementById("profileImage").src = value.profileImage;
      document.getElementById("profileName").innerText = value.name;
      document.getElementById("profileEmail").innerText = value.email;
    }
  });

  toursCollection.doc(tourid).collection(memberid).orderBy("time").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        var data = doc.data();
  
        altData.push(data.altitude);
        speedData.push(data.speed * 3600 / 1000); //Convert m/s to km/h
        posData.push({lat: data.latitude,lng: data.longitude,});
        timeData.push(dayjs(data.time).format('HH:mm'));
    });
  
    var altChart = new Chart(
      document.getElementById('altChart'),
      {
        type: 'line',
        data: {
          labels: timeData,
          datasets: [{
            label: 'Altitude',
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            borderColor: 'rgb(255, 99, 132)',
            data: altData,
          }]
        },
        options: chartOptions
      },
    );
  
    var speedChart = new Chart(
      document.getElementById('speedChart'),
      {
        type: 'line',
        data: {
          labels: timeData,
          datasets: [{
            label: 'Speed',
            backgroundColor: 'rgba(33, 150, 243, 0.3)',
            borderColor: 'rgb(33, 150, 243)',
            data: speedData,
          }]
        },
        options: chartOptions
      },
    );

    //ROUTE POLY
    const flightPath = new google.maps.Polyline({
      path: posData,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    flightPath.setMap(map);
  });

}