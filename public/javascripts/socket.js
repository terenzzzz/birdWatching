let name = null;
let roomNo = null;
let socket = io();


/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    // called when someone joins the room. If it is someone else it notifies the joining of the room
    socket.on('joined', function (room, userId) {
        if (userId === name) {
            // it enters the chat
            hideLoginInterface(room, userId);
        } else {
            // notifies that someone has joined the room
            writeOnHistory('<b>'+userId+'</b>' + ' has joined the chat ');

        }
    });

    // called when a message is received
    socket.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });

}


/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    console.log("sendChatText触发")
    let chatText = document.getElementById('chat_input').value;
    if (chatText != "" || chatText == null) {
        socket.emit('chat', roomNo, name, chatText);
    }
}

/**
 * used to connect to a room. It gets the username and room number from the
 * interface
 */
function connectToRoom() {
    roomNo = document.getElementById('comment_btn').value;
    name = sessionStorage.getItem("nickName")
    console.log(sessionStorage.getItem("nickName"))
    hideLoginInterface(roomNo, name);

    //if (!name) name = 'Unknown-' + Math.random();
    socket.emit('create or join', roomNo, name);
}

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
function writeOnHistory(text) {
    console.log("writeOnHistory:",text)
    const chatInterface = document.getElementById("chat_interface")
    document.getElementById('chat_interface').style.display = 'block';
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text + ' (' + new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit',
        year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + ')';
    chatInterface.appendChild(paragraph);

    var chatWindow = document.getElementById('chat_window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
    document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the username
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
}

function sendComment() {
    console.log("sendComment触发")
    const nickname =sessionStorage.getItem("nickName");
    const content = document.getElementById("chat_input").value;;
    const roomId = document.getElementById('comment_btn').value;
    if (navigator.onLine) {
        // 在线状态，发送请求
        fetch(`/bird/${roomId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nickname: nickname, content})
        })
        .catch(function() {
            console.log("Comment Add to Mongo Failed, calling insertComment");
            insertComment(JSON.stringify({nickname: nickname, content}), roomId);
        })
        .then(function() {
            console.log("fetch 完成");
        });
    } else {
        // 离线状态，调用 insertComment
        console.log("离线状态，调用 insertComment");
        insertComment(JSON.stringify({nickname: nickname, content}), roomId);
        console.log("fetch 完成");
    }
}

