const filesToCache = [
    // "partials/footer.ejs",
    // "partials/header.ejs",
    // "stylesheets/style.css",
    // "stylesheets/menu.css",
    // "javascripts/sync.js",
    "javascripts/index.js",
    "manifest.json",
    "img/onBoarding.png",
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
    event.respondWith(cacheThenNetwork(event));

});

self.addEventListener('sync', (event) => {
    console.info('Event: Sync', event);
});

async function cacheThenNetwork(event) {
    const cache = await caches.open(staticCacheName);
    const cachedResponse = await cache.match(event.request); // 返回promise对象
    if (cachedResponse) {
        console.log('Serving From Cache: ' + event.request.url);
        return cachedResponse;
    }

    const networkResponse = await fetch(event.request);
    console.log('Calling network: ' + event.request.url);
    return networkResponse;
}





