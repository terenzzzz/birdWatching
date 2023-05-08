let requestIndexedDB = indexedDB.open("birdWatching",2)


requestIndexedDB.addEventListener("error",handlerError)
requestIndexedDB.addEventListener("upgradeneeded",upgradeStores)
requestIndexedDB.addEventListener("success", handleSuccess)



function insertSighting (data){
    console.log("insertSighting to indexDB")
    const birtWatchingIDB = requestIndexedDB.result
    const transaction = birtWatchingIDB.transaction(["sighting"],"readwrite")
    const sightingStore = transaction.objectStore("sighting")

    console.log(data)

    // var sighting = {
    //     identification : data.identification,
    //     nickName: data.nickName,
    //     description: data.description,
    //     dateTime: data.dateTime,
    //     latitude: data.latitude,
    //     longitude: data.longitude,
    //     photo: data.img
    // }
    //
    // console.log(sighting)


    const addRequest = sightingStore.add(data)
    addRequest.onsuccess = (event) => {
        console.log("New sighting added to database with id:", event.target.result)
        window.location.href = "/index";
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