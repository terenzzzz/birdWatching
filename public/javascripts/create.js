


const addToIDBBtn = document.getElementById("addToIDB")
const addToMongoDBBtn = document.getElementById("addToMongoDB")

addToIDBBtn.addEventListener('click',function (){
    insertSighting()
})

addToMongoDBBtn.addEventListener('click',function (){
    window.location.href = '/addToMongo';
})