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
    // "/bird/*",
    "/create",
    "/index",
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

self.addEventListener('sync', (event) => {
    console.info('Event: Sync', event);
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




// 从 IndexedDB 中读取离线数据


// async function cacheThenNetwork(event) {
//     const cache = await caches.open(staticCacheName);
//     const cachedResponse = await cache.match(event.request); // 返回promise对象
//     if (cachedResponse) {
//         console.log('Serving From Cache: ' + event.request.url);
//         return cachedResponse;
//     }
//
//     const networkResponse = await fetch(event.request);
//     console.log('Calling network: ' + event.request.url);
//     return networkResponse;
// }





