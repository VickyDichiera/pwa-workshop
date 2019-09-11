const divInstall = document.getElementById('installContainer');
const installBtn = document.getElementById('installBtn');
const getBtn = document.getElementById('getBtn');
const postBtn = document.getElementById('postBtn');
const deleteSwBtn = document.getElementById('deleteSwBtn');


/* Check if browser supports 'serviceWorker' before register */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then((event) => {
            console.log('💁🏽', 'sw registered: ', event);
        });
}

/*Installable code*/
window.addEventListener('beforeinstallprompt', (event) => {
    console.log('💃🏽', 'beforeinstallprompt - ready to install: ', event);
    // Stash the event so it can be triggered later.
    window.deferredPrompt = event;
    // Remove the 'hidden' class from the install button container
    divInstall.classList.toggle('hidden', false);
});

installBtn.addEventListener('click', () => {
    console.log('👆🏽', 'installBtn-clicked');
    // const promptEvent = window.deferredPrompt
    // if (!promptEvent) {
    //     // The deferred prompt isn't available.
    //     return;
    // }
    // // Show the install prompt.
    // promptEvent.prompt();
    // // Log the result
    // promptEvent.userChoice.then((result) => {
    //     console.log('👍', 'userChoice', result);
    //     // Reset the deferred prompt variable, since
    //     // prompt() can only be called once.
    //     window.deferredPrompt = null;
    //     // Hide the install button.
    //     divInstall.classList.toggle('hidden', true);
    // });
});

window.addEventListener('appinstalled', (event) => {
    console.log('🕴🏼', 'appinstalled event: ', event);
});

//GET data button
getBtn.addEventListener('click', () => {
    fetch('https://httpbin.org/get')
        .then(function (response) {
            console.log(response);
            //response.json(); es un método que provee la API fetch
            // que extrae los datos y los convierte en un objeto json
            // la misma es una acción asincrónica
            return response.json();
        })
        .then((jsonData) => {
            setRetrivedDataElement('tenemos datos!');
            console.log(jsonData);
        })
        .catch((err) => {
            document.getElementById('retrivedContent').innerHTML = 'Algo ha ido mal: ' + err;
            document.getElementById('retrivedContentWrapper').classList.toggle('hidden', false);
        });
});


//Background syncronization //SyncManager API
postBtn.addEventListener('click', () => {

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((sw) => {
            setRetrivedDataElement('Probando background sync');

            sw.sync.register('sync-dummy-post');
            //Save it in indexedBD not acces to localstorage in sw
            //indexeDB.setItem('sync-dummy-data', JSON.stringify({ message: 'probando post request con fetch' }));
        })
    } else {
        setRetrivedDataElement('☹️ Sorry este navegador no tiene soporte para background sync y no hay conexión ');

        fetch('https://httpbin.org/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                message: 'probando post request con fetch'
            })
        })
            .then(function (response) {
                console.log(response);
                //response.json(); es un método que provee la API fetch
                // que extrae los datos y los convierte en un objeto json
                // la misma es una acción asincrónica
                return response.json();
            })
            .then((jsonData) => {
                setRetrivedDataElement(JSON.parse(jsonData.data).message);
                console.log(jsonData);
            })
            .catch((err) => {
                document.getElementById('retrivedContent').innerHTML = 'Algo ha ido mal: ' + err;
                document.getElementById('retrivedContentWrapper').classList.toggle('hidden', false);
            });
    }

});
setRetrivedDataElement = (data) => {
    document.getElementById('retrivedContent').innerHTML = '';
    document.getElementById('retrivedContent').innerHTML += data;
    document.getElementById('retrivedContentWrapper').classList.toggle('hidden', false);
}

/*Delete service worker*/
deleteSwBtn.addEventListener('click', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
            .then((registrations) => {
                for (let i; i < registrations.length; i++) {
                    registrations[i].unregister();
                }
            })
    }
});

/*Create cards on demand*/
function createCard(data) {
    let card = '<div class="card">' +
        '    <img class="photo" src="' + data.image.src + '" alt="' + data.image.alt + '">' +
        '        <div class="container">' +
        '            <h4><b>' + data.name + '</b></h4>' +
        '            <p>' + data.description + '</p>' +
        '        </div>' +
        '    </div>';
    let photoContainer = document.getElementById('photoContainer');
    photoContainer.insertAdjacentHTML('beforeend', card)
}

function createJonCard() {
    createCard({
        name: 'jon',
        description: 'un jon',
        image: {
            src: '/src/images/jon.jpg',
            alt: 'jonsimage'
        }
    })
}
