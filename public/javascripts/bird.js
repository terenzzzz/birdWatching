
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