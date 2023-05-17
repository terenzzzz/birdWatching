/**
 * Initialise IndexDB
 */
let requestIndexedDB = indexedDB.open("birdWatching",2)
requestIndexedDB.addEventListener("error",handlerError)
requestIndexedDB.addEventListener("upgradeneeded",upgradeStores)
requestIndexedDB.addEventListener("success", handleSuccess)

/**
 * Insert Sighting into IndexDB
 * @param data new sighting
 * @param id sighting id
 */
function insertSighting (data,id){
    console.log("insertSighting to indexDB")
    const birtWatchingIDB = requestIndexedDB.result
    const transaction = birtWatchingIDB.transaction(["sighting"],"readwrite")
    const sightingStore = transaction.objectStore("sighting")
    // set id to stored in `Value` of IndexDB
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
 * Insert new comment of a sighting into IndexDB
 * @param data comment
 * @param id sighting id
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
 * Get all unsynced list of sighting (created when offline) from IndexDB
 */
function getSighting() {
    return new Promise((resolve, reject) => {
        const birtWatchingIDB = requestIndexedDB.result;
        const transaction = birtWatchingIDB.transaction(["sighting"], "readwrite");
        const sightingStore = transaction.objectStore("sighting");
        // retrieve a cursor that allows iterating over the objects in the object store
        const cursorRequest = sightingStore.openCursor();
        const result = []; // store result query

        cursorRequest.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const data = cursor.value;
                // add sighting created offline to result list
                if (data._id == -1){
                    result.push(data);
                }
                cursor.continue();
            } else {
                // once all objects have been iterated through, use Promise's resolve to return the list of
                // unsynced sightings
                resolve(result);
            }
        };

        cursorRequest.onerror = function(event) {
            // handle error, use Promise's reject to return an error message
            reject(event.target.error);
        };
    });
}

/**
 * Get specific sighting by id stored in IndexDB
 * @param id sighting id
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
 * Get All Comments From IndexDB
 */
function getComment() {
    return new Promise((resolve, reject) => {
        const birtWatchingIDB = requestIndexedDB.result;
        const transaction = birtWatchingIDB.transaction(["comment"], "readwrite");
        const commentStore = transaction.objectStore("comment");
        const cursorRequest = commentStore.openCursor();
        const result = [];

        cursorRequest.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const data = cursor.value;
                result.push(data)
                cursor.continue();
            } else {

                resolve(result);
            }
        };

        cursorRequest.onerror = function(event) {
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
 * Handling IndexDB Upgrade Stores
 */
function upgradeStores(ev){
    const db = ev.target.result
    db.createObjectStore("sighting",{keyPath:"id", autoIncrement : true})
    db.createObjectStore("comment",{keyPath:"id", autoIncrement : true})
    console.log("Object:'Sighting' and Object:'comment' created in upgradeStores" )
}

/**
 * Handling IndexDB Success
 */
function handleSuccess(ev){
    // init
    console.log("IndexDb Success" )
}

