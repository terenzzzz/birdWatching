let allSightings = []
window.onload = async function () {
    registerSync();
    var sightingsData = JSON.parse(document.getElementById('sighting-container').getAttribute('data-sightings'));

    try {
        allSightings = await combineSightings(sightingsData);
        // 在这里使用 result 值
        updateSightings(allSightings)
    } catch (error) {
        // 处理错误
        console.error('Error occurred:', error);
    }
};

(function () {
    console.log("init");
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: "./" })
            .then(function(registration) {
                console.info('Service worker registered');
                checkForUpdate(registration);
            })
            .catch(function(error) {
                console.error('Service worker registration failed ', error);
            });
    }
    function checkForUpdate(registration) {
        console.log("checkForUpdate");
        registration.addEventListener("updatefound", function() {
            if (navigator.serviceWorker.controller) {
                var installingWorker = registration.installing;
                installingWorker.onstatechange = function() {
                    console.info("Service Worker State :", installingWorker.state);
                    switch(installingWorker.state) {
                        case 'installed':
                            navigator.serviceWorker.ready
                                .then(function (registration) {
                                    /*
                                    * Notify user to refresh the webpage.
                                    */
                                    registration.showNotification('Site Content Updated\n Please Refresh.')
                                });
                            break;
                        case 'redundant':
                            throw new Error('The installing service worker became redundant.');
                    }
                }
            }
        });
    }
})();

function updateSightings(sightings) {
    console.log("sightings", sightings)

    // 创建一个新的 div 元素
    var parentDiv = document.getElementById('sighting-container');

    parentDiv.innerHTML = ""

    sightings.forEach(function (obj) {
        let photoUrl
        if (typeof obj.photo == "string"){
            photoUrl = obj.photo ? obj.photo.replace('public', '') : '/img/default.png';
        }else{
            photoUrl = '/img/default.png'
        }

        var templateString = `<div class="card mt-4">
          <div class="card-body row">
            <div class="col-2">
              <img src="${photoUrl}" class="img-thumbnail">
            </div>
            <div class="col-8">
              <h1>${obj.identification}</h1>
              <p class="m-0 p-0">Seen on ${obj.dateTime}</p>
              <p class="m-0 p-0">By ${obj.nickName}</p>
              <p class="m-0 p-0 text-primary">${parseFloat(obj.latitude).toFixed(2)},${parseFloat(obj.longitude).toFixed(2)}</p>
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

async function combineSightings (data) {
    try {
        const result = await getNotSync();
        // 在这里使用 result 值
        console.log("Received result:", result);
        result.forEach(function (obj) {
            data.push(obj)
        })
        return data
    } catch (error) {
        // 处理错误
        console.error('Error occurred:', error);
    }
}



async function getNotSync() {
    try {
        const result = await getSighting();
        console.log("result", result);
        return result; // 将 result 值返回给调用者
    } catch (error) {
        console.error('Error retrieving data:', error);
        throw error; // 将错误抛出给调用者
    }
}

function sortByDate() {
    let sorted = allSightings.sort(function (a, b) {
        let dateA = new Date(a.dateTime.split('-').reverse().join('-'));
        let dateB = new Date(b.dateTime.split('-').reverse().join('-'));
        return dateB - dateA;
    });
    updateSightings(sorted)
}

async function sortByIdntification() {
    var unknowList = []
    var elseList = []

    allSightings.forEach(st => {
        console.log(st.nickName)
        if (st.identification == "Unknow") {
            unknowList.push(st)
        } else {
            elseList.push(st)
        }
    });
    let sortedUnknow = unknowList.sort(function (a, b) {
        let dateA = new Date(a.dateTime.split('-').reverse().join('-'));
        let dateB = new Date(b.dateTime.split('-').reverse().join('-'));
        return dateB - dateA;
    });

    let sortedElse = elseList.sort(function (a, b) {
        let dateA = new Date(a.dateTime.split('-').reverse().join('-'));
        let dateB = new Date(b.dateTime.split('-').reverse().join('-'));
        return dateB - dateA;
    });

    sortedElse.forEach(st => {
        sortedUnknow.push(st)
    });
    updateSightings(unknowList)
}

function sortByLocation(){
    if (navigator.geolocation) {
        // Get Current Location
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log(`Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);

            // id:Distance
            var idDis =  {};
            var currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            // Calculate Distance and add to dictionary
            allSightings.forEach(st => {
                console.log(st)
                var point2 = new google.maps.LatLng(st.latitude, st.longitude);
                var distance = google.maps.geometry.spherical.computeDistanceBetween(currentLocation, point2);
                // turn into km
                var distanceInKm = distance / 1000;
                st.distance = distanceInKm
            });

            // Sorted Sightings Object
            var sorted = allSightings.sort(function(a, b) {
                return a.distance - b.distance;
            })

            console.log("sorted",sorted)
            updateSightings(sorted)
        }, function(error) {
            console.log("Error getting current position: " + error.message);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }

}

// Sync For Service Worker
function registerSync() {
    new Promise(function (resolve, reject) {
        Notification.requestPermission(function (result) {
            resolve();
        })
    }).then(function () {
        return navigator.serviceWorker.ready;
    }).then(async function (reg) {
        //here register your sync with a tagname and return it
        try {
            const result = await getNotSync();
            reg.active.postMessage({
                action: 'syncDataToMongoDB',
                data: result
            })
            console.log("result:::",result)
        } catch (error) {
            // 处理错误
            console.error('Error occurred:', error);
        }
        return reg.sync.register('sync-tag');

    }).then(function () {
        console.info('Sync registered');
    }).catch(function (err) {
        console.error('Failed to register sync:', err.message);
    });
}

navigator.serviceWorker.addEventListener('message', function(event) {
    if (event.data.action === "syncDataResult") {
        var results = event.data.result;
        // 处理同步数据结果
        updateUnsync(results)
    }
});

