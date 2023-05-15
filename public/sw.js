const filesToCache = [
    "https://b.tile.openstreetmap.org/10/506/332.png",
    "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js",
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyC-ENULiIcN4gEjuDWK9S42fE2ljikToEw&callback=initMap",
    "javascripts/socket.js",
    "javascripts/bird.js",
    "javascripts/create.js",
    "javascripts/index.js",
    "manifest.json",
    "img/onBoarding.png",
    "/create",
    "/index",
    // "/bird/:id",
    "/"
];
const staticCacheName = 'birdWatching';


self.addEventListener('install', event => {
    console.log('Installing service worker');
    event.waitUntil(caches.open(staticCacheName).then(cache => {
        console.log('Caching file');
        return cache.addAll(filesToCache);
    }));
});

self.addEventListener('fetch', (event) => {
    // cache first
    event.respondWith(networkThenCache(event));

});

self.addEventListener('message', async function (event) {
    console.log('Received message:', event.data);
    if (event.data.action === "syncDataToMongoDB") {
        try {
            console.log("try")
            const result = await syncDataToMongoDB(event.data.data);
            const commentResult = await syncCommentToMongoDB(event.data.commentData);

            self.clients.claim().then(function () {
                self.clients.matchAll().then(function (clients) {
                    clients.forEach(function (client) {
                        client.postMessage({action: "syncDataResult", result: result,commentResult:commentResult});
                    });
                });
            });
        } catch (error) {
            console.error('Error syncing data to MongoDB:', error);
        }
    }
});



async function syncDataToMongoDB(data) {
    console.log("syncDataToMongoDB",data)


    // 创建一个新的 FormData 对象
    var formData = new FormData();
    formData.append("data",JSON.stringify(data))

    // 遍历数组中的每个对象
    data.forEach(function (obj) {
        Object.keys(obj).forEach(function (key) {
            if (key === 'photo') {
                // 如果属性名是 'photo'，将文件对象作为值添加到 FormData
                formData.append(key, obj[key]);
            }
        });
    });

    try {
        const response = await fetch('/syncToMongo', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to submit form');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.log('Error submitting form:', error);
        throw error;
    }
}

async function syncCommentToMongoDB(data) {
    console.log("syncCommentToMongoDB",data)

    try {
        const response = await fetch('/syncCommentToMongo', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to submit form');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.log('Error submitting form:', error);
        throw error;
    }
}

self.addEventListener('sync', async (event) => {
    console.info('Event: Sync', event);
    const sightings = await getSightingFromIndexDB();
    const comments = await getCommentFromIndexDB();



    const result = await syncDataToMongoDB(sightings);
    const commentResult = await syncCommentToMongoDB(comments);

    self.clients.claim().then(function () {
        self.clients.matchAll().then(function (clients) {
            clients.forEach(function (client) {
                client.postMessage({action: "syncDataResult", result: result,commentResult:commentResult});
            });
        });
    });

    console.log("sightings in sync:",sightings)
    console.log("comments in sync:",comments)
    console.log("sightings result in sync:",result)
    console.log("comments result in sync:",commentResult)

});


async function networkThenCache(event) {
    try {
        const networkResponse = await fetch(event.request);
        console.log('Calling network: ' + event.request.url);
        // Store the network response in a cache for future use

        const cache = await caches.open(staticCacheName);
        if (event.request.method === 'GET') {
            await cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.info('Failed to fetch from network:', error);
        // If the network request fails, try to find the corresponding resource from the cache
        const cache = await caches.open(staticCacheName);
        if (event.request.method === 'GET') {
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                console.log('Serving From Cache: ' + event.request.url);
                return cachedResponse;
            }
        }
        return new Response('Offline Page');
    }
}


async function getSightingFromIndexDB() {
    return new Promise(function(resolve, reject) {
        const request = indexedDB.open("birdWatching",2);
        request.onerror = function(event) {
            reject(event.target.error);
        };
        request.onsuccess = function(event) {


            const birtWatchingIDB = event.target.result
            const transaction = birtWatchingIDB.transaction(["sighting"],"readwrite")
            const sightingStore = transaction.objectStore("sighting")


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
        }
    })
}

async function getCommentFromIndexDB() {
    return new Promise(function(resolve, reject) {
        const request = indexedDB.open("birdWatching",2);
        request.onerror = function(event) {
            reject(event.target.error);
        };
        request.onsuccess = function(event) {

            const birtWatchingIDB = event.target.result
            const transaction = birtWatchingIDB.transaction(["comment"], "readwrite");
            const commentStore = transaction.objectStore("comment");
            const cursorRequest = commentStore.openCursor();
            const result = []; // 存储查询结果的数组

            cursorRequest.onsuccess = function (event) {
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

            cursorRequest.onerror = function (event) {
                // 处理错误，使用 Promise 的 reject 返回错误信息
                reject(event.target.error);
            };
        }
    })
}


// async function getDataFromIndexDB() {
//     return new Promise(function(resolve, reject) {
//         const request = indexedDB.open("birdWatching",2);
//         request.onerror = function(event) {
//             reject(event.target.error);
//         };
//         request.onsuccess = function(event) {
//
//
//             const birtWatchingIDB = event.target.result
//             const transaction = birtWatchingIDB.transaction(["sighting"],"readwrite")
//             const sightingStore = transaction.objectStore("sighting")
//
//
//             const getDataRequest = sightingStore.getAll();
//             getDataRequest.onerror = function(event) {
//                 reject(event.target.error);
//             };
//             getDataRequest.onsuccess = function(event) {
//                 resolve(event.target.result);
//             };
//         };
//     });
// }


