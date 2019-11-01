let CACHE_VERSION = 35;
const CURRENT_CACHES = {
  static: 'static_cache_v' + CACHE_VERSION,
  dynamic: 'dynamic_cache_v' + CACHE_VERSION
};

let staticUrlsToCache = [
  '',
  'index.html',
  'src/css/app.css',
  'src/js/indexedDButils.js',
  'src/js/app.js',
  'src/images/icons/app-icon-512x512.png'
];
let dynamicUrlsToCache = [
  'src/images/jon.png'
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
  event.waitUntil( //Espera a que termine la promesa, de lo contrario continua la ejecución
    caches.open(CURRENT_CACHES['static']) //Si la cache no existe la crea
      .then(function (cache) {
        console.log('🗃', 'Precaching app shell: ' + CURRENT_CACHES['static']);
        return cache.addAll(staticUrlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🙋🏽', 'activate', event);
  // return self.clients.claim();
  event.waitUntil(
    //clean cache
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
//   event.respondWith(fetch(event.request));
// });

/*Cache only*/
// self.addEventListener('fetch', (event) => {
//   event.respondWith(caches.match(event.request));
// });

/*Network then cache*/
self.addEventListener('fetch', (event) => {
  console.log('🙌🏽', 'fetching something: ', event.request.url);
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return caches.open(CURRENT_CACHES['dynamic'])
          .then((cache) => {
            //cache.put(event.request, response.clone());
            return response;
          })
      })
      .catch((err) => {
        return caches.match(event.request).then((cacheResponse) => {
          if (cacheResponse) {
            console.log('match response: ' + event.request.url);
            return cacheResponse;
          } else {
            console.log('cant load resource from cache: ' + event.request.url);
          }
        })
      })
  )
});

/*Cache first then network fallback(not saving data)*/
// self.addEventListener('fetch', (event) => {
//   console.log('🙌🏽', 'fetching something: ', event.request.url);

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

/*Cache then network fallback*/
// self.addEventListener('fetch', (event) => {
//   console.log('🙌🏽', 'fetching something: ', event.request.method +' '+ event.request.url);
//   if (event.request.method !== 'GET') {
//     event.respondWith(fetch(event.request));
//   } else {
//     event.respondWith(
//       caches.match(event.request).then((response) => {
//         if (response) {
//           console.log('match response: ' + event.request.url);
//           return response;
//         } else {
//           console.log('network response: ' + event.request.url);
//           return fetch(event.request).then((response) => {
//             // Comprobamos que la respuesta sea OK
//             if (!response || response.status !== 200) {
//               return response;
//             } else {
//               // IMPORTANTE: clonar la respuesta, solo puede ser consumida una vez.
//               let responseToCache = response.clone();
//               caches.open(CURRENT_CACHES['dynamic'])
//                 .then((cache) => {
//                   console.log('📂', 'Saving in dynamic cache: ' + event.request.url);
//                   cache.put(event.request, responseToCache);
//                 });
//               return response;

//             }

//           }).catch((err) => {
//             console.log('cant load resource from cache');
//           });
//         }
//       })
//     )
//   }

// });

//Background sync
importScripts('src/js/indexedDButils.js');
self.addEventListener('sync', (event) => {
  console.log('🤝', 'sync', event);
  if (event.tag === 'sync-dummy-post') {
    console.log('sync post');

    event.waitUntil(

      getItemDB('cardsStore', "sync-dummy-post")
        .then((item) => {
          console.log('recuperando item de indexedDB', item);

          fetch('https://httpbin.org/post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(item)
          }).then(() => {
            //borramos item de indexedBD
            deleteItemDB('cardsStore', item.id)
              .then(() => {
                console.log('deleted item from store');
              });
          })

        })

    );

  }
});

self.addEventListener('push', (event) => {
  console.log('🤝', 'push', event);
});

//React Notifications actions
self.addEventListener('notificationclick', (event) => {
  console.log('🔔', 'notification action recived', event.notification);

  let notification = event.notification;
  let action = event.action;

  if (action === 'id-action-ok') {
    console.log('action ok iuju');
  } else {
    console.log('action ko buu');
  }
  notification.close();
})

self.addEventListener('notificationclose', (event) => {
  console.log('🔔', 'notification was close', event.notification);
})