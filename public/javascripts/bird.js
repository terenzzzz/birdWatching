window.onload = async function () {
    console.log("bird.onload")
    registerSync();
    identification_txt.style.display="block";

    // Get bird id from url query
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    const idBird = searchParams.get('id');

    /**
     * When offline, if the bird's id can be retrieved from IndexDB , get sighting id from IndexDB
     * and assign sighting details to the page
     */
    if (!isMongoDBObjectId(idBird)){ // when offline cannot access MongoDB server
        try{
            const sighting = await getSightingById(idBird)
            console.log("sighting:",sighting)

            let thumbnailElement = document.getElementById("thumbnail")
            thumbnailElement.src = URL.createObjectURL(sighting.photo)

            const buttonElement = document.getElementById('comment_btn');
            buttonElement.value = sighting.id;

            const descriptionElement = document.getElementById('description');
            descriptionElement.textContent  = sighting.description;

            const identificationElement = document.getElementById('identification');
            identificationElement.textContent  = sighting.identification;

            const nickNameElement = document.getElementById('nickName');
            nickNameElement.textContent  = `Created by: ${sighting.nickName}`;

            const dateTimeElement = document.getElementById('dateTime');
            dateTimeElement.textContent  = `Seen on: ${sighting.dateTime}`;

            const locationElement = document.getElementById('location');
            locationElement.textContent  = `${parseFloat(sighting.latitude).toFixed(2)},${parseFloat(sighting.longitude).toFixed(2)}`;

            initMapOffline(sighting.latitude,sighting.longitude)
        }catch (err){
            console.log(err)
        }

    }

};

/**
 * Check if the sighting ID has Type of MongoDb ObjectId
 * @param str id string of sighting in database
 * @returns {boolean}
 */
function isMongoDBObjectId(str) {
    const pattern = /^[0-9a-fA-F]{24}$/;
    return pattern.test(str);
}


/**
 * Handling the presentation of information on sighting page according to click events
 */

const connectButton = document.getElementById('comment_btn');
const sendButton = document.getElementById('chat_send');
const chatWindow= document.getElementById('chat_window');
const chatInput= document.getElementById('chat_input');


connectButton.addEventListener('click', () => {
    sendButton.style.display = 'block';
    chatWindow.style.display = 'block';
    chatInput.style.display = 'block';
    chatWindow.classList.add('chat_window-visible');
    chatInput.classList.add('chat_input-visible');
    sendButton.classList.add('chat_send-visible');
});




const tooltips = document.querySelectorAll('.tt')
tooltips.forEach(t => {
    new bootstrap.Tooltip(t)
})
var description_btn = document.getElementById("description_btn");
var comment_btn = document.getElementById("comment_btn");
var description_txt = document.getElementById("description_text");
var comment_txt = document.getElementById("comment_txt");
var location_txt = document.getElementById("location_text");
var identification_txt = document.getElementById("identification_txt");

comment_txt.style.display="none";
location_txt.style.display="none";
identification_txt.style.display="none";
description_txt.style.display="none";

description_btn.addEventListener("click", function() {
    description_txt.style.display="block";
    comment_txt.style.display="none";
    location_txt.style.display="none";
    identification_txt.style.display="none";
});

comment_btn.addEventListener("click", function() {
    comment_txt.style.display="block";
    description_txt.style.display="none";
    location_txt.style.display="none";
    identification_txt.style.display="none";
});

location_btn.addEventListener("click", function() {
    location_txt.style.display="block";
    description_txt.style.display="none";
    comment_txt.style.display="none";
    identification_txt.style.display="none";
});

identification_btn.addEventListener("click", function() {
    identification_txt.style.display="block";
    description_txt.style.display="none";
    location_txt.style.display="none";
    comment_txt.style.display="none";
});

/**
 * Handling Alert
 */
const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
const appendAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible fixed-top d-block" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
}

/**
 * View location offline
 * @param latitude latitude value
 * @param longitude longitude value
 */
function initMapOffline(latitude,longitude) {
    let map = L.map('map').setView([latitude, longitude], 10);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    let marker = L.marker([latitude, longitude]).addTo(map);
}

/**
 *  Registering sync event for the service worker
 */
function registerSync() {
    new Promise(function (resolve, reject) {
        Notification.requestPermission(function (result) {
            resolve();
        })
    }).then(function () {
        return navigator.serviceWorker.ready;
    }).then(async function (reg) {
        return reg.sync.register('sync-tag');
    }).then(function () {
        console.info('Sync registered');
    }).catch(function (err) {
        console.error('Failed to register sync:', err.message);
    });
}