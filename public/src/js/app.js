const divInstall = document.getElementById('installContainer');
const installBtn = document.getElementById('installBtn');
const getBtn = document.getElementById('getBtn');
const postBtn = document.getElementById('postBtn');
const deleteSwBtn = document.getElementById('deleteSwBtn');
const notificationsContainer = document.getElementById('notificationsContainer');
const notificationsBtn = document.getElementById('notificationsBtn');


/* Check if browser supports 'serviceWorker' before register */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then((event) => {
            console.log('💁🏽', 'sw registered: ', event);
        });
}

/*Installable code*/
window.addEventListener('beforeinstallprompt', (event) => {
    console.log('💃🏽', 'beforeinstallprompt - ready to install: ', event);
    // Guardar el evento para lanzarlo luego.
    window.deferredPrompt = event;
    // Mostrar el botón de instalar app
    divInstall.classList.toggle('hidden', false);
});

installBtn.addEventListener('click', () => {
    console.log('👆🏽', 'installBtn-clicked');
    // const promptEvent = window.deferredPrompt
    // // Show the install prompt.
    // promptEvent.prompt();
    // // Log the result
    // promptEvent.userChoice.then((result) => {
    //     console.log('👍', 'userChoice', result);
    //     window.deferredPrompt = null;
    //     divInstall.classList.toggle('hidden', true);
    // });
});

window.addEventListener('appinstalled', (event) => {
    //Metricas de apps instaladas
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

//IndexedDB
//Background syncronization //SyncManager API
postBtn.addEventListener('click', () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((sw) => {
            setRetrivedDataElement('Probando background sync');
            let card = {
                id: 'sync-dummy-post',
                name: 'jon',
                description: 'un jon',
                image: {
                    src: '/src/images/jon_.webp',
                    alt: 'jonsimage'
                }
            }
            addItemDB('cardsStore', card)
            .then((data)=>{
              console.log('success indexed db: ', data);
                sw.sync.register('sync-dummy-post');
            })
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

/*Enable Notifications*/
/* Check if browser supports 'serviceWorker' before register */
if ('Notification' in window) {
    notificationsContainer.classList.toggle('hidden', false);
    notificationsBtn.addEventListener('click', handleEnableNotifications);
}

function handleEnableNotifications() {
    let notificationsOptions = {
        body: 'soy una descripción',
        icon: '/src/images/icons/app-icon-96x96.png',
        image: '/src/images/jon.jpg',
        dir: 'ltr',//default
        lang: 'es-AR', //BCP 47
        vibrate: [100, 50, 200], //viabrate pattern
        badge: '/src/images/icons/app-icon-96x96.png', //recomendada por android, imagen que se muestra en la barra superior del movil

        tag: 'id-notification-enabled', //opcional: para no solapar notificaciones del mismo tipo
        renotify: true, //vibra el telefono muchas veces si tenemos muchas con el mismo tag, aunque no le muestra todas tipo spam

        actions: [
            { action: 'id-action-ok', title: 'yeah', icon: '/src/images/icons/app-icon-96x96.png' },
            { action: 'id-action-ko', title: 'no :(', icon: '/src/images/icons/app-icon-96x96.png' }
        ]
    }
    //Ask for permissions
    Notification.requestPermission((result) => {
        console.log('Elección del usuario: ', result);
        if (result === 'granted') {
            displayNotifications('Gracias', notificationsOptions);
        } else {
            displayNotifications('Te arrepentiras...', notificationsOptions);
        }
    })
}

function displayNotifications(title, options) {
    // browser way:
    //new Notification(title, options);

    // service worker way:
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((swRegistration) => {
            swRegistration.showNotification(title, options);
        })
    }
}






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
