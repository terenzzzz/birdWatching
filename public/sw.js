const filesToCache = [
    // "partials/footer.ejs",
    // "partials/header.ejs",
    // "stylesheets/style.css",
    // "stylesheets/menu.css",
    "https://b.tile.openstreetmap.org/10/506/332.png",
    "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js",
    // "javascripts/add.js",
    "javascripts/create.js",
    // "javascripts/index.js",
    "javascripts/index.js",
    "manifest.json",
    "img/onBoarding.png",
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
        console.error('Failed to fetch from network:', error);
        // If the network request fails, try to find the corresponding resource from the cache
        const cache = await caches.open(staticCacheName);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            console.log('Serving From Cache: ' + event.request.url);
            return cachedResponse;
        }
        return new Response('Offline Page');
    }
}

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





