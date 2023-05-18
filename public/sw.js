const filesToCache = [
    "https://b.tile.openstreetmap.org/10/506/332.png",
    "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js",
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyC-ENULiIcN4gEjuDWK9S42fE2ljikToEw&callback=initMap",
    // "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "javascripts/socket.js",
    "javascripts/bird.js",
    "javascripts/create.js",
    "javascripts/index.js",
    "manifest.json",
    "img/icon.png",
    "img/onBoarding.png",
    "/create",
    "/index",
    "/bird",
    "/"
];
const staticCacheName = 'birdWatching';

/**
 * Service Worker install Event Handler
 */
self.addEventListener('install', event => {
    console.log('Installing service worker');
    event.waitUntil(caches.open(staticCacheName).then(cache => {
        console.log('Caching file');
        return cache.addAll(filesToCache);
    }));
});

/**
 * Service Worker fetch Event Handler
 */
self.addEventListener('fetch', (event) => {
    const parsedUrl = new URL(event.request.url);
    if (parsedUrl.pathname === '/bird') {
        event.respondWith(
            caches.match(parsedUrl.pathname).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                } else {
                    const params = new URLSearchParams(parsedUrl.search);
                    const id = params.get('id');
                    const cacheKey = `/bird?id=${id}`;
                    return caches.match(cacheKey).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        } else {
                            return networkThenCache(event, cacheKey);
                        }
                    });
                }
            })
        );
    } else {
        event.respondWith(networkThenCache(event));
    }
});

/**
 * Service Worker sync Event Handler
 */
self.addEventListener('sync',  async (event) => {
    console.info('Event: Sync', event);
    try {
        const sightings = await getSightingFromIndexDB();
        const result = await syncDataToMongoDB(sightings);
        updateUnsync(result);

        const comments = await getCommentFromIndexDB();
        const commentResult = await syncCommentToMongoDB(comments);
        updateCommentUnsync(commentResult);

        console.info('All Sync Done!');
    } catch (error) {
        console.error('Sync Failed:', error);
    }
});


/**
 * Cache Handler, Network First then Cache approach
 */
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
        return new Response('You Are Offline Now!!!');
    }
}

/**
 * Get Unsynced Sightings From IndexDB
 */
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
            const result = [];

            cursorRequest.onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    const data = cursor.value;
                    if (data._id == -1){
                        result.push(data);
                    }
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };

            cursorRequest.onerror = function(event) {
                reject(event.target.error);
            };
        }
    })
}

/**
 * Get Unsynced Comments From IndexDB
 */
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
            const result = [];

            cursorRequest.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const data = cursor.value;
                    result.push(data)
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };

            cursorRequest.onerror = function (event) {
                reject(event.target.error);
            };
        }
    })
}

/**
 * Update IndexDb once the Sightings are sync to MongoDb
 */
function updateUnsync (data){
    console.log("Sync Sightings to MongoDB Done, Updating IndexDb...")
    const request = indexedDB.open("birdWatching",2);
    request.onerror = function(event) {
        reject(event.target.error);
    };
    request.onsuccess = function(event) {
        const birtWatchingIDB = event.target.result
        const transaction = birtWatchingIDB.transaction(["sighting"], "readwrite")
        const sightingStore = transaction.objectStore("sighting")

        var request = sightingStore.openCursor();
        request.onerror = function (event) {
            console.error('Failed to open cursor:', event.target.error);
        };
        request.onsuccess = function (event) {
            var cursor = event.target.result;

            if (cursor) {
                var indexData = cursor.value;
                if (cursor.value._id == -1) {
                    var updatedData = {
                        ...indexData,
                        _id: data.result[0]._id
                    };
                    var updateRequest = cursor.update(updatedData);
                    data.result.shift()

                    updateRequest.onerror = function (event) {
                        console.error('Failed to update data:', event.target.error);
                    };
                    updateRequest.onsuccess = function (event) {
                    };
                }
                cursor.continue();
            }
        }
    }
}

/**
 * Update IndexDB once the Comments are synced to MongoDB
 */
function updateCommentUnsync (data){
    console.log("Sync Comments to MongoDb Done,Updating IndexDb")
    const request = indexedDB.open("birdWatching",2);
    request.onerror = function(event) {
        reject(event.target.error);
    };
    request.onsuccess = function(event) {
        const birtWatchingIDB = event.target.result
        const transaction = birtWatchingIDB.transaction(["comment"], "readwrite")
        const commentStore = transaction.objectStore("comment")

        if (data.result == 200) {
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

/**
 * Sync Sightings to MongoDb handler
 */
async function syncDataToMongoDB(data) {
    console.log("Syncing Sightings to MongoDB:",data)
    var formData = new FormData();
    formData.append("data",JSON.stringify(data))

    data.forEach(function (obj) {
        Object.keys(obj).forEach(function (key) {
            if (key === 'photo') {
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

/**
 * Sync Sightings to MongoDB handler
 */
async function syncCommentToMongoDB(data) {
    console.log("Syncing Comments to MongoDB:",data)
    for (let i = 0; i < data.length; i++) {
        try {
            if (!isMongoDBObjectId(data[i].idBird)) {
                let MdbId = await findMdbIdByIdbId(data[i].idBird);
                data[i].idBird = MdbId;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

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

/**
 * Get MongoDb's id By IndexDb's id
 */
function findMdbIdByIdbId(IdbId){
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
                resolve(MdbId);
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        };
    })
}

/**
 * Check id is MongoDb ObjectId
 */
function isMongoDBObjectId(str) {
    const pattern = /^[0-9a-fA-F]{24}$/;
    return pattern.test(str);
}



