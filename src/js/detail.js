var url_string = window.location.href
var url = new URL(url_string);
var tourid = url.searchParams.get("tourid");
var memberid = url.searchParams.get("memberid");

var db = firebase.firestore();
var toursCollection = db.collection("Tours");

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

toursCollection.doc(tourid).collection(memberid).get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
      var data = doc.data();

      altData.push(data.altitude);
      speedData.push(data.speed);
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
});