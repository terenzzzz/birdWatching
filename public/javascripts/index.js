console.log("index.js")

function updateSightings(sightings){
    // 创建一个新的 div 元素
    var parentDiv = document.getElementById('sighting-container');

    parentDiv.innerHTML=""

    sightings.forEach(function(obj) {
        var templateString = `<div class="card mt-4">
          <div class="card-body row">
            <div class="col-2">
              <img src="${obj.photo.replace('public', '')}" class="img-thumbnail">
            </div>
            <div class="col-8">
              <h1>${obj.identification}</h1>
              <p class="m-0 p-0">Seen on ${obj.dateTime}</p>
              <p class="m-0 p-0">By ${obj.nickName}</p>
              <p class="m-0 p-0 text-primary">${parseFloat(obj.latitude).toFixed(2)},${parseFloat(obj.longitude).toFixed(2)}</p>
            </div>
            <div class="col-2 d-flex justify-content-center align-items-center">
              <a href="/bird/${obj._id}"><i class="bi bi-arrow-right" style="font-size: 4rem"></i></a>
            </div>
          </div>
        </div>`
        // 将 HTML 模板字符串添加到父元素中
        parentDiv.innerHTML += templateString;
    });

}

function sortByDate(data){

    let sorted = data.sort(function(a, b) {
        let dateA = new Date(a.dateTime.split('-').reverse().join('-'));
        let dateB = new Date(b.dateTime.split('-').reverse().join('-'));
        return dateB - dateA;
    });

    updateSightings(sorted)
}

function sortByLocation(data){
    if (navigator.geolocation) {
        // Get Current Location
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log(`Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);

            // id:Distance
            var idDis =  {};
            var currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            // Calculate Distance and add to dictionary
            data.forEach(st => {
                console.log(st)
                var point2 = new google.maps.LatLng(st.latitude, st.longitude);
                var distance = google.maps.geometry.spherical.computeDistanceBetween(currentLocation, point2);
                // turn into km
                var distanceInKm = distance / 1000;
                idDis[st._id] = distanceInKm;
            });
            // Sort Dictionary by distance
            const sortedDict = Object.entries(idDis).sort((a, b) => a[1] - b[1]);


            // Sorted Sightings Object
            var sorted = []
            sortedDict.forEach(st=>{
                sorted.push(data.find(item => item._id === st[0]))
            })
            updateSightings(sorted)
        }, function(error) {
            console.log("Error getting current position: " + error.message);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }

}
