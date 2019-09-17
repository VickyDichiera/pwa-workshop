var db;

var openRequest = indexedDB.open('test_db', 3);
//Si sube la vs de la base o bien porque es nueva
openRequest.onupgradeneeded = function (e) {
  var db = e.target.result;
  console.log('running onupgradeneeded');
  if (!db.objectStoreNames.contains('cardsStore')) {
    var storeOS = db.createObjectStore('cardsStore',
      { keyPath: 'id' });
  }
};
openRequest.onsuccess = function (e) {
  console.log('running onsuccess');
  db = e.target.result;
};
openRequest.onerror = function (e) {
  console.log('onerror!');
  console.dir(e);
};

function promisifyRequest(request) {
  return new Promise(function (resolve, reject) {
    request.onsuccess = function () {
      resolve(request.result);
    };

    request.onerror = function () {
      reject(request.error);
    };
  });
}

function addItemDB(store, item) {
  var transaction = db.transaction([store], 'readwrite');
  var _store = transaction.objectStore(store);
  var request = _store.put(item);

  return promisifyRequest(request);
}

function getItemDB(store, itemId) {
  var transaction = db.transaction([store]);
  var _store = transaction.objectStore(store);
  var request = _store.get(itemId);

  return promisifyRequest(request);
}

function deleteItemDB(store, itemId) {
  var transaction = db.transaction([store], 'readwrite');
  var _store = transaction.objectStore(store);
  var request = _store.delete(itemId);

  return promisifyRequest(request);
}