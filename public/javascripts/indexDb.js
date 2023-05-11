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
        window.location.href = "/index";
        console.log("New sighting added to database with id:", event.target.result)
    }
    addRequest.onerror = (event) => {
        console.error("Error adding new sighting to database:", event.target.error)
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
                result.push(data); // 将对象数据添加到数组中
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
    console.log("Object:'Sighting' created in upgradeStores" )
}

function handleSuccess(ev){
    // init
    console.log("IndexDb Success" )
}