
let requestIndexedDB = indexedDB.open("birdWatching",2)


requestIndexedDB.addEventListener("error",handlerError)
requestIndexedDB.addEventListener("upgradeneeded",upgradeStores)
requestIndexedDB.addEventListener("success", handleSuccess)



function insertSighting (data,id){
    console.log("insertSighting to indexDB")
    const birtWatchingIDB = requestIndexedDB.result
    const transaction = birtWatchingIDB.transaction(["sighting"],"readwrite")
    const sightingStore = transaction.objectStore("sighting")

    data._id = id
    console.log(data)

    const addRequest = sightingStore.add(data)
    addRequest.onsuccess = (event) => {
        console.log("New sighting added to database with id:", event.target.result);
        setTimeout(() => {
            window.location.href = "/index";
        }, 500); // 延迟500毫秒后执行重定向操作
    };
    addRequest.onerror = (event) => {
        console.error("Error adding new sighting to database:", event.target.error)
    }
}

function insertComment (data,id){
    const birtWatchingIDB = requestIndexedDB.result
    const transaction = birtWatchingIDB.transaction(["comment"],"readwrite")
    const commentStore = transaction.objectStore("comment")

    let parsedData = JSON.parse(data)
    console.log(parsedData)

    let comment = {
        idBird: id,
        content: parsedData.content,
        nickname: parsedData.nickname,
        datetime: Date.now()
    };

    const addRequest = commentStore.add(comment)
    addRequest.onsuccess = (event) => {
        console.log("New Comment added to database with id:", event.target.result);
        writeOnHistory('<b>' + "Me" + ':</b> ' + parsedData.content);
        var chatWindow = document.getElementById('chat_window');
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };
    addRequest.onerror = (event) => {
        console.error("Error Comment new sighting to database:", event.target.error)
    }
}

function updateUnsync (data){
    // console.log("updateUnsync")
    console.log("updateUnsyncdata:",data.result)

    const birtWatchingIDB = requestIndexedDB.result
    const transaction = birtWatchingIDB.transaction(["sighting"],"readwrite")
    const sightingStore = transaction.objectStore("sighting")

    // 使用游标遍历对象存储空间中的数据
    var request = sightingStore.openCursor();
    request.onerror = function(event) {
        console.error('Failed to open cursor:', event.target.error);
    };
    request.onsuccess = function(event) {
        var cursor = event.target.result;

        if (cursor) {
            var indexData = cursor.value;
            if (cursor.value._id == -1) {
                // 使用游标的 update() 方法更新对象
                var updatedData = {
                    ...indexData,
                    _id: data.result[0]._id
                };
                // 使用游标的 update() 方法更新对象
                var updateRequest = cursor.update(updatedData);
                data.result.shift()

                updateRequest.onerror = function (event) {
                    console.error('Failed to update data:', event.target.error);
                };
                updateRequest.onsuccess = function (event) {};
            }
            // 继续遍历下一个数据项
            cursor.continue();
        }
    }
}

function getSighting() {
    return new Promise((resolve, reject) => {
        const birtWatchingIDB = requestIndexedDB.result;
        const transaction = birtWatchingIDB.transaction(["sighting"], "readwrite");
        const sightingStore = transaction.objectStore("sighting");
        const cursorRequest = sightingStore.openCursor();
        const result = []; // 存储查询结果的数组

        cursorRequest.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const data = cursor.value;
                if (data._id == -1){
                    result.push(data); // 将对象数据添加到数组中
                }
                cursor.continue();
            } else {
                // 遍历完所有对象，使用 Promise 的 resolve 返回结果
                resolve(result);
            }
        };

        cursorRequest.onerror = function(event) {
            // 处理错误，使用 Promise 的 reject 返回错误信息
            reject(event.target.error);
        };
    });
}






function handlerError(err){
    console.log(`IndexDb Error: ${err}` )
}

function upgradeStores(ev){
    const db = ev.target.result
    db.createObjectStore("sighting",{keyPath:"id", autoIncrement : true})
    db.createObjectStore("comment",{keyPath:"id", autoIncrement : true})
    console.log("Object:'Sighting' and Object:'comment' created in upgradeStores" )
}

function handleSuccess(ev){
    // init
    console.log("IndexDb Success" )
}

