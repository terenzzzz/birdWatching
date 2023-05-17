
// Get today's date
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
today = dd + '-' + mm + '-' + yyyy;
// Set max date for the input to today
document.getElementById("dateTime").setAttribute("max", today);

// Add event listener for form submission
document.getElementById("addForm").addEventListener("submit", function(event) {
    // Get input date value
    var inputDate = document.getElementById("dateTime").value;

    // Convert input date to Date object
    var inputDateObj = new Date(inputDate.split("-").reverse().join("-"));

    // Check if input date is in the past and in the correct format
    if (inputDateObj >= today || isNaN(inputDateObj.getTime())) {
        event.preventDefault();
        document.getElementById("dateTime").classList.add("is-invalid");
    }
});

// get lat and long from click event on map
let mapOptions = {
    center:[53.383331, -1.466667],
    zoom:10
}

let map = new L.map('map' , mapOptions);

let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer);


let marker = null;
map.on('click', (event)=> {

    if(marker !== null){
        map.removeLayer(marker);
    }

    marker = L.marker([event.latlng.lat , event.latlng.lng]).addTo(map);

    document.getElementById('latitude').value = event.latlng.lat;
    document.getElementById('longitude').value = event.latlng.lng;

})

const form = document.getElementById('addForm');
form.addEventListener('submit', handleFormSubmit);

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
    if (navigator.onLine) {
        // 在线状态，发送请求
        fetch('/create', {
            method: 'POST',
            body: formData
        }).then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to submit form');
            }
            return response.json(); // 将响应转换为JSON格式
        }).then(function(data) {
            console.log("data.id:",data.id)
            var id = data.id; // 获取响应中的ID属性
            insertSighting(sighting,id)
        }).catch(function(error) {
            // 处理错误
            console.log('Error submitting form:', error);
            insertSighting(sighting,-1)
        })
    } else {
        insertSighting(sighting,-1)
    }
    console.log("fetch 完成");

}

function setUnknown() {
    document.getElementById("identification").value = "Unknown";
}

function setUncertain() {
    let identification = document.getElementById("identification").value;
    if (identification !== "") {
        identification += " (Uncertain)";
        document.getElementById("identification").value = identification;
    }
}
