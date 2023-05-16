window.onload = async function () {
    console.log("bird.onload")
    registerSync();
    identification_txt.style.display="block";

    const url = new URL(window.location.href);

        // 获取 URL 查询参数
    const searchParams = new URLSearchParams(url.search);

        // 获取 id 参数的值
    const idBird = searchParams.get('id');
    console.log("idBird",idBird)

    if (!isMongoDBObjectId(idBird)){
        try{
            const sighting = await getSightingById(idBird)
            console.log("sightingggggg:",sighting)

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

function isMongoDBObjectId(str) {
    const pattern = /^[0-9a-fA-F]{24}$/;
    return pattern.test(str);
}



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


const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
const alertTrigger = document.getElementById('liveAlertBtn')
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

function initMapOffline(latitude,longitude) {
    let center ={lat: parseFloat(latitude),lng: parseFloat(longitude)}
    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 9,
        center: center,
        draggable: true
    });
    var marker = new google.maps.Marker({
        position: center,
        map: map,
        title: 'Center'
    });
}


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