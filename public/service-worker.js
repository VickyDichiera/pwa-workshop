let CACHE_VERSION = 2;
const CURRENT_CACHES = {
  static: 'static_cache_v' + CACHE_VERSION,
  dynamic: 'dynamic_cache_v' + CACHE_VERSION
};

let staticUrlsToCache = [
  '/',
  '/src/css/app.css',
  '/index.html',
  '/src/js/app.js'
];
let dynamicUrlsToCache = [
  '/src/images/jon.jpg'
];

let deleteOldCache = () => {
  let expectedCacheNames = Object.values(CURRENT_CACHES);
  return caches.keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!expectedCacheNames.includes(cacheName)) {
            console.log('📛', 'Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
}

self.addEventListener('install', (event) => {
  console.log('🙆🏽', 'install', event);
  event.waitUntil(
    caches.open(CURRENT_CACHES['static'])
      .then(function (cache) {
        console.log('🗃', 'Opened static cache: ' + CURRENT_CACHES['static']);
        return cache.addAll(staticUrlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🙋🏽', 'activate', event);
  //Se asegura que se ha activado correctamente, es necesario por ahora.
  // return self.clients.claim();

  event.waitUntil(
    //delete old cache before save a new one
    caches.keys().then((cacheNames) => {
      if (cacheNames.length > 0) {
        return deleteOldCache();
      }
    }),
    caches.open(CURRENT_CACHES['dynamic'])
      .then((cache) => {
        console.log('📂', 'Opened dynamic cache: ' + CURRENT_CACHES['dynamic']);
        return cache.addAll(dynamicUrlsToCache);
      })
  );
});

/* Cache strategies */
/*Network only*/
// self.addEventListener('fetch', (event) => {
//   console.log('🙌🏽', 'fetching something', event.request.url);
//   event.respondWith(fetch(event.request));
// });

/*Cache first then network(not saving data)*/
// self.addEventListener('fetch', (event) => {
//   console.log('🙌🏽', 'fetching something', event.request.url);

//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         console.log('match response: ' + event.request.url);
//         return response;
//       } else {
//         console.log('network response: ' + event.request.url);
//         return fetch(event.request);
//       }
//     })
//   )
// });

/*Cache first then network(saving data)*/
self.addEventListener('fetch', (event) => {
  console.log('🙌🏽', 'fetching something', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('match response: ' + event.request.url);
        return response;
      } else {
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        let fetchRequest = event.request.clone();
        console.log('network response: ' + event.request.url);
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200) {
            return response;
          } else {
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            let responseToCache = response.clone();
            caches.open(CURRENT_CACHES['dynamic'])
              .then((cache) => {
                console.log('📂', 'Saving in dynamic cache: ' + event.request.url);
                cache.put(event.request, responseToCache);
              });

            return response;

          }

        });
      }
    })
  )
  // event.respondWith(
  //   caches.match(event.request)
  //     .then(function (response) {
  //       // Cache hit - return response
  //       if (response) {
  //         return response;
  //       }

  //       // IMPORTANT: Clone the request. A request is a stream and
  //       // can only be consumed once. Since we are consuming this
  //       // once by cache and once by the browser for fetch, we need
  //       // to clone the response.
  //       var fetchRequest = event.request.clone();

  //       return fetch(fetchRequest).then(
  //         function (response) {
  //           // Check if we received a valid response
  //           if (!response || response.status !== 200 || response.type !== 'basic') {
  //             return response;
  //           }

  //           // IMPORTANT: Clone the response. A response is a stream
  //           // and because we want the browser to consume the response
  //           // as well as the cache consuming the response, we need
  //           // to clone it so we have two streams.
  //           var responseToCache = response.clone();

  //           caches.open(CURRENT_CACHES['static'])
  //             .then(function (cache) {
  //               cache.put(event.request, responseToCache);
  //             });

  //           return response;
  //         }
  //       );
  //     })
  // );
});