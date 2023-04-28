console.log("index.js")

function updateSightings(sightings){
    // 创建一个新的 div 元素
    var parentDiv = document.getElementById('sighting-container');

    parentDiv.innerHTML=""

    sightings.forEach(function(obj) {
        var templateString = `<div class="card mt-4">
          <div class="card-body row">
            <div class="col-2">
              <img src="${obj.photo.replace('public', '')}" class="img-thumbnail">
            </div>
            <div class="col-8">
              <h1>${obj.identification}</h1>
              <p class="m-0 p-0">Seen on ${obj.dateTime}</p>
              <p class="m-0 p-0">By ${obj.nickName}</p>
            </div>
            <div class="col-2 d-flex justify-content-center align-items-center">
              <a href="/bird/${obj._id}"><i class="bi bi-arrow-right" style="font-size: 4rem"></i></a>
            </div>
          </div>
        </div>`
        // 将 HTML 模板字符串添加到父元素中
        parentDiv.innerHTML += templateString;
    });

}

function sortByDate(data){

    let sorted = data.sort(function(a, b) {
        let dateA = new Date(a.dateTime.split('-').reverse().join('-'));
        let dateB = new Date(b.dateTime.split('-').reverse().join('-'));
        return dateB - dateA;
    });

    updateSightings(sorted)
}

function sortByLocation(data){
    // [
//     {nickName: 'Terenzzzz',  dateTime: '27-04-2023', }
//     {nickName: 'Terenzzzz',  dateTime: '26-04-2023', }
//     {nickName: 'Terenzzzz',  dateTime: '22-04-2023', }
//     {nickName: 'Terenzzzz',  dateTime: '24-04-2023', }
// ]
    console.log(data)
}