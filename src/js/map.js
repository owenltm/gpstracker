const uluru = { lat: -8.76703784, lng: 115.22095192 };

const dbRef = firebase.database().ref();
const tourRef = dbRef.child("Tours");
const userRef = dbRef.child("Users");
const locationRef = dbRef.child("Locations");

var db = firebase.firestore();
var toursCollection = db.collection("Tours");

//Tour options
var selectInput = document.getElementById("tours");

tourRef.get().then((tourSnapshot) => {
  tourSnapshot.forEach(tour => {
    const option = document.createElement('option');
    option.value = tour.val().id;
    option.innerHTML=tour.val().name;

    selectInput.appendChild(option)
  });
})

function initMap() {

  var tourid = document.getElementById("tours").value;
  var membersList = document.getElementById("members-list");

  const markers = [];

  //MAPS
  var map = new google.maps.Map(document.getElementById('map'), {
    center: uluru,
    zoom: 13,
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

  //POLYS
  if(tourid != null && tourid != ""){
    console.log(tourid);

    toursCollection.doc(tourid).get().then((doc) => {
      const data = doc.data(); 

      const tourPath = new google.maps.Polyline({
        path: data.polys,
        geodesic: true,
        strokeColor: "#03a9f4",
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });
      tourPath.setMap(map);
      
    });

  }

  //Member Markers
  if(tourid){
    
    tourRef.child(tourid).child('members').on('value', (tourMembersSnapshot) => {
      membersList.innerHTML = "";
      tourMembersSnapshot.forEach(member => {
        var id = member.val().id;
        var status = member.val().status;
  
        userRef.child(id).get().then((userSnapshot) => {
          var user = userSnapshot.val();

          const item = document.createElement('div');
          item.className = "member-item";
          item.innerHTML = `
            <div class="member-img">
              <img src=${user.thumbImage}>
            </div>
            <div class="member-details">
              <a href='detail.html?tourid=${tourid}&memberid=${id}'>
              <h4 class="member-name">${user.name}</h4>
              <span>${user.email}</span>
              <span class="member-status ${status}">${status}</span>
              </a>
            </div>
          `;

          membersList.appendChild(item);
  
          locationRef.child(id).get().then((locationSnapshot) => {
            var location = locationSnapshot.val();
  
            markers.push({
              id: id,
              marker: new google.maps.Marker({
                        position: {lat: location.latitude, lng: location.longitude},
                        icon: user.thumbImage != null ? user.thumbImage : "https://picsum.photos/50",
                        map: map,
                      }),
            })
          })
        });
      });
    })
  
    locationRef.on('value', (snapshot) => {
      const data = snapshot.val();
  
      markers.forEach((m, i) => {
        var m = markers[i];
  
        // console.log(data[m.id]);
  
        var marker = m.marker;
  
        marker.setPosition({
          lat: data[m.id].latitude,
          lng: data[m.id].longitude,
        });
      })
    })
  }
}