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
    "/bird",
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
    event.respondWith(networkThenCache(event));
});

self.addEventListener('sync',  async (event) => {
    console.info('Event: Sync', event);

    try {
        const sightings = await getSightingFromIndexDB();
        const result = await syncDataToMongoDB(sightings);
        updateUnsync(result);

        const comments = await getCommentFromIndexDB();
        const commentResult = await syncCommentToMongoDB(comments);
        updateCommentUnsync(commentResult);

        // 所有任务执行完成
        console.log('所有任务执行完成');
    } catch (error) {
        // 处理错误
        console.error('任务执行失败:', error);
    }

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

function updateUnsync (data){
    // console.log("updateUnsync")
    console.log("updateUnsyncdata:",data.result)

    const request = indexedDB.open("birdWatching",2);
    request.onerror = function(event) {
        reject(event.target.error);
    };
    request.onsuccess = function(event) {
        const birtWatchingIDB = event.target.result
        const transaction = birtWatchingIDB.transaction(["sighting"], "readwrite")
        const sightingStore = transaction.objectStore("sighting")

        // 使用游标遍历对象存储空间中的数据
        var request = sightingStore.openCursor();
        request.onerror = function (event) {
            console.error('Failed to open cursor:', event.target.error);
        };
        request.onsuccess = function (event) {
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
                    updateRequest.onsuccess = function (event) {
                    };
                }
                // 继续遍历下一个数据项
                cursor.continue();
            }
        }
    }
}

function updateCommentUnsync (data){
    // console.log("updateUnsync")
    console.log("updateUnsyncdata:",data.result)
    const request = indexedDB.open("birdWatching",2);
    request.onerror = function(event) {
        reject(event.target.error);
    };
    request.onsuccess = function(event) {
        const birtWatchingIDB = event.target.result
        const transaction = birtWatchingIDB.transaction(["comment"], "readwrite")
        const commentStore = transaction.objectStore("comment")

        if (data.result == 200) {
            // 清除对象存储中的数据
            const clearRequest = commentStore.clear();

            clearRequest.onerror = function (event) {
                console.error('Failed to clear data:', event.target.error);
            };

            clearRequest.onsuccess = function (event) {
                console.log('Data cleared successfully');
            };
        }
    }
}

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

    for (let i = 0; i < data.length; i++) {
        try {
            if (!isMongoDBObjectId(data[i].idBird)) {
                let MdbId = await findMdbIdByIdbId(data[i].idBird);
                console.log("idBird:", data[i].idBird);
                console.log("getMdbId:", MdbId);
                data[i].idBird = MdbId;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    console.log("syncCommentToMongoDB Processed1:",data)

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

function findMdbIdByIdbId(IdbId){
    console.log("findMdbIdByIdbId")
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("birdWatching", 2);
        dbRequest.onerror = function (event) {
            reject(event.target.error);
        };
        dbRequest.onsuccess = function (event) {
            const birtWatchingIDB = event.target.result
            const transaction = birtWatchingIDB.transaction(["sighting"], "readwrite");
            const sightingStore = transaction.objectStore("sighting");

            const request = sightingStore.get(parseInt(IdbId));
            request.onsuccess = (event) => {
                const MdbId = event.target.result._id;
                console.log("BdbId from query:", MdbId)
                resolve(MdbId);
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        };
    })
}

function isMongoDBObjectId(str) {
    const pattern = /^[0-9a-fA-F]{24}$/;
    return pattern.test(str);
}



