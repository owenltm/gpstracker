function initMap(tourid = "1234") {
  var tourid = "1234";

  var uluru = { lat: -8.76703784, lng: 115.22095192 };

  const dbRef = firebase.database().ref();
  const tourRef = dbRef.child("Tours");
  const userRef = dbRef.child("Users");
  const locationRef = dbRef.child("Locations");

  const markers = [];

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

  tourRef.child(tourid).child('members').on('value', (tourMembersSnapshot) => {
    tourMembersSnapshot.forEach(member => {
      var id = member.val().id;

      userRef.child(id).get().then((userSnapshot) => {
        var user = userSnapshot.val();

        locationRef.child(id).get().then((locationSnapshot) => {
          var location = locationSnapshot.val();

          console.log(user.Images);

          markers.push({
            id: id,
            marker: new google.maps.Marker({
                      position: {lat: location.latitude, lng: location.longitude},
                      //*TODO: FIX Photo size (to 50px maybe ?)
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