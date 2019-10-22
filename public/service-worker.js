importScripts('/src/js/indexedDButils.js');

let CACHE_VERSION = 28;
const CURRENT_CACHES = {
  static: 'static_cache_v' + CACHE_VERSION,
  dynamic: 'dynamic_cache_v' + CACHE_VERSION
};

let staticUrlsToCache = [
  '/',
  '/index.html',
  '/src/css/app.css',
  '/src/js/indexedDButils.js',
  '/src/js/app.js'
];
let dynamicUrlsToCache = [
  '/src/images/jon_.webp'
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
//   event.respondWith(fetch(event.request));
// });

/*Cache only*/
// self.addEventListener('fetch', (event) => {
//   event.respondWith(caches.match(event.request));
// });

/*Network then cache*/
// self.addEventListener('fetch', (event) => {
//   console.log('🙌🏽', 'fetching something: ', event.request.url);
//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         return caches.open(CURRENT_CACHES['dynamic'])
//           .then((cache) => {
//             cache.put(event.request, response.clone());
//             return response;
//           })
//       })
//       .catch((err) => {
//         return caches.match(event.request).then((cacheResponse) => {
//           if (cacheResponse) {
//             console.log('match response: ' + event.request.url);
//             return cacheResponse;
//           } else {
//             console.log('cant load resource from cache: ' + event.request.url);
//           }
//         })
//       })
//   )
// });

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
self.addEventListener('fetch', (event) => {
  console.log('🙌🏽', 'fetching something: ', event.request.method +' '+ event.request.url);
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log('match response: ' + event.request.url);
          return response;
        } else {
          console.log('network response: ' + event.request.url);
          return fetch(event.request).then((response) => {
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

          }).catch((err) => {
            console.log('cant load resource from cache');
          });
        }
      })
    )
  }

});

//Background sync
self.addEventListener('sync', (event) => {
  console.log('🤝', 'sync', event);
  if (event.tag === 'sync-dummy-post'){
    console.log('sync post');
    // let item = {
    //   id: 'sync-dummy-post',
    //   price: '$2.99',
    //   description: 'It is a purple banana!',
    //   created: new Date().getTime()
    // };
    // addItemDB('cardsStore',item)
    // .then((data)=>{
    //   console.log('success indexed db: ', data);
    //   return getItemDB('cardsStore', data);
    // })
    getItemDB('cardsStore', "sync-dummy-post")
      .then((item) => {
        console.log('retrive item from indexedDB', item);
        event.waitUntil(

          fetch('https://httpbin.org/post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              message: 'probando post request con fetch'
            })
          }).then(() => {
            //delete item from indexedBD
            deleteItemDB('cardsStore', item.id)
              .then(() => {
                console.log('deleted item from store');
              })
              .catch((err) => {
                console.log('Woot! Did it: ', err);
              });
          })
        );

      })


  }
});

//React Notifications actions
self.addEventListener('notificationclick', (event)=> {
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