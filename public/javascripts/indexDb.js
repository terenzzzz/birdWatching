
/**
 * Init IndexDb
 */
let requestIndexedDB = indexedDB.open("birdWatching",2)
requestIndexedDB.addEventListener("error",handlerError)
requestIndexedDB.addEventListener("upgradeneeded",upgradeStores)
requestIndexedDB.addEventListener("success", handleSuccess)


/**
 * Insert Sighting into IndexDb
 */
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
        }, 100);
    };
    addRequest.onerror = (event) => {
        console.error("Error adding new sighting to database:", event.target.error)
    }
}

/**
 * Insert Comment into IndexDb
 */
function insertComment (data,id){
    console.log("insertComment",insertComment)
    const birtWatchingIDB = requestIndexedDB.result
    const transaction = birtWatchingIDB.transaction(["comment"],"readwrite")
    const commentStore = transaction.objectStore("comment")

    let parsedData = JSON.parse(data)

    let comment = {
        idBird: id,
        content: parsedData.content,
        nickname: parsedData.nickname,
        datetime: Date.now()
    };

    const addRequest = commentStore.add(comment)
    addRequest.onsuccess = (event) => {
        console.log("New Comment added to database with id:", event.target.result);
    };
    addRequest.onerror = (event) => {
        console.error("Error Comment new sighting to database:", event.target.error)
    }
}

/**
 * Get all Unsync Sightings From IndexDb
 */
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

/**
 * Get Specific Sighting By Sighting's IndexDb id
 */
function getSightingById(id) {
    let idBird = parseInt(id)
    return new Promise((resolve, reject) => {
        const birtWatchingIDB = requestIndexedDB.result;
        const transaction = birtWatchingIDB.transaction(["sighting"], "readwrite");
        const sightingStore = transaction.objectStore("sighting");

        const request = sightingStore.get(idBird);
        request.onsuccess = (event) => {
            const data = event.target.result;
            resolve(data);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Get All Comments From IndexDb
 */
function getComment() {
    return new Promise((resolve, reject) => {
        const birtWatchingIDB = requestIndexedDB.result;
        const transaction = birtWatchingIDB.transaction(["comment"], "readwrite");
        const commentStore = transaction.objectStore("comment");
        const cursorRequest = commentStore.openCursor();
        const result = []; // 存储查询结果的数组

        cursorRequest.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const data = cursor.value;
                result.push(data)
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


/**
 * Handling IndexDb Error
 */
function handlerError(err){
    console.log(`IndexDb Error: ${err}` )
}

/**
 * Handling IndexDb Upgrade Stores
 */
function upgradeStores(ev){
    const db = ev.target.result
    db.createObjectStore("sighting",{keyPath:"id", autoIncrement : true})
    db.createObjectStore("comment",{keyPath:"id", autoIncrement : true})
    console.log("Object:'Sighting' and Object:'comment' created in upgradeStores" )
}

/**
 * Handling IndexDb Success
 */
function handleSuccess(ev){
    // init
    console.log("IndexDb Success" )
}

