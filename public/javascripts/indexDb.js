let requestIndexedDB = indexedDB.open("birdWatching",2)


requestIndexedDB.addEventListener("error",handlerError)
requestIndexedDB.addEventListener("upgradeneeded",upgradeStores)
requestIndexedDB.addEventListener("success", handleSuccess)



function insertSighting (){
    const birtWatchingIDB = requestIndexedDB.result
    const transaction = birtWatchingIDB.transaction(["sighting"],"readwrite")
    const sightingStore = transaction.objectStore("sighting")

    var mySighting = {
        description: "Testing Description",
        dateTime: new Date(),
        nickName: "terenzzzz",
        latitude: 53,
        longitude: 42,
        identification: "Unknown",
        photo: "testing"
    };

    const addRequest = sightingStore.add(mySighting)
    addRequest.onsuccess = (event) => {
        console.log("New sighting added to database with id:", event.target.result)
    }
    addRequest.onerror = (event) => {
        console.error("Error adding new sighting to database:", event.target.error)
    }
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