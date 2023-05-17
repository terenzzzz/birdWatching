
// Set max date for the input to today
document.getElementById("dateTime").setAttribute("max", getToday());


/**
 * Get Current Location and Initialise Map
 */
let marker = null;

navigator.geolocation.getCurrentPosition(function(position) {
    // Set the center to the user's current position
    let mapOptions = {
        center: [position.coords.latitude, position.coords.longitude],
        zoom: 10
    }
    let map = new L.map('map', mapOptions);
    let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(layer);
    // Set the latitude and longitude values according to the clicked location on map
    map.on('click', (event)=> {
        if(marker !== null){
            map.removeLayer(marker);
        }
        marker = L.marker([event.latlng.lat , event.latlng.lng]).addTo(map);
        document.getElementById('latitude').value = event.latlng.lat;
        document.getElementById('longitude').value = event.latlng.lng;
    })
})


const form = document.getElementById('addForm');
form.addEventListener('submit', handleFormSubmit);

/**
 * Sighting Create Form Submit Handler
 */
function handleFormSubmit(event) {
    console.log('handleFormSubmit executed')
    event.preventDefault();

    const form = document.getElementById('addForm');
    const formData = new FormData(form);
    formData.append('nickName', sessionStorage.getItem('nickName'));

    const sighting = {}
    for (const [key, value] of formData.entries()) {
        sighting[key] = value;
    }
    /* If online, post the form to `/create` endpoint then insert
     the sighting into indexDB with corresponding id from MongoDB,
     else if offline then insert sighting to indexDB with id = -1 */
    if (navigator.onLine) {

        fetch('/create', {
            method: 'POST',
            body: formData
        }).then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to submit form');
            }
            return response.json();
        }).then(function(data) {
            console.log("data.id:",data.id)
            var id = data.id;
            insertSighting(sighting,id)
        }).catch(function(error) {
            console.log('Error submitting form:', error);
            insertSighting(sighting,-1)
        })
    } else {
        insertSighting(sighting,-1)
    }
}

/**
 * Set Identification with Unknown
 */
function setUnknown() {
    document.getElementById("identification").value = "Unknown";
}

/**
 * Set Identification with Uncertain
 */
function setUncertain() {
    let identification = document.getElementById("identification").value;
    if (identification !== "") {
        identification += " (Uncertain)";
        document.getElementById("identification").value = identification;
    }
}


/**
 * Get Today's Date(yyyy-mm-dd)
 */
function getToday(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = yyyy + '-' + mm + '-' + dd; // ISO 8601 Format
    return today
}