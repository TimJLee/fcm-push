const vapidPublicKey = "BCfq0O_Z_Yq8GrmfegakfIfHEWq3x3QF5Kqdzi8ubZfl5esBFfAZO0-TNvpfyB7Xm6UUw7oAsxRvfY0pF3k0OIE";
const convertedVPkey = urlB64ToUint8Array(vapidPublicKey);
function urlB64ToUint8Array(base64String)
{
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
       .replace(/\-/g, '+')
       .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
$(document).ready( function () {
  if ('serviceWorker' in navigator && 'PushManager' in window )
  {
    // Register serviceWorker
    navigator.serviceWorker.register('/client/worker.js').then(function(swReg) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', swReg.scope);
      // Add Button Listener
      $("#button").on("updateBtn", function (e, isSub) {
        if (Notification.permission === 'denied') 
          return $(this).html("Denied");
        if( isSub )
          $(this).attr("data-next-action","unsub").html("unsubscribe!");
        else
          $(this).attr("data-next-action","sub").html("subscribe!");
        $(this).removeAttr("disabled");
      }).on("click", function (e) {
        //Disabled Button until user response..
        $(this).attr("disabled", true);
        if( $(this).attr("data-next-action") == "sub" )
        { // Subscribing...
          swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVPkey
          })
          .then(function(subscription) {
             $.ajax({
                method : 'POST',
                url : '/push-send',
                dataType : 'json',
                data : {
                  subscription: JSON.stringify(subscription),
                  data: JSON.stringify({
                    title : 'TITLE',
                    body : 'Push send test..',
                    params : {
                      url : '/'
                    }
                  })	
              }
            }).done( function (res){
              console.log(res);
              $("#button").trigger("updateBtn",[true]);
            }).fail( function (err) {
              console.log(err);
            });							
          })
          .catch(function(err) {
            console.log('Failed to subscribe the user: ', err);
            $("#button").trigger("updateBtn",[false]);
          });	
        }
        else
        { // Unsubscribing..
          swReg.pushManager.getSubscription().then(function(subscription) {
            if (subscription) 
              return subscription.unsubscribe();
          })
          .catch(function(error) {
            console.log('Error unsubscribing', error);
            $("#button").trigger("updateBtn",[true]);
          })
          .then(function() {
            console.log('User is unsubscribed.');
            $("#button").trigger("updateBtn",[false]);
          });
        }
      });
      // Check Subscribe > and Update Button
      swReg.pushManager.getSubscription().then( function(subscription) {
        isSubscribed = !(subscription === null);
        //Update Button
        $("#button").trigger("updateBtn", [isSubscribed]);
        if (isSubscribed)
          console.log('User is subscribed.');
        else
          console.log('User is NOT subscribed.');
      });
    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  }
});
/*
if ("serviceWorker" in navigator) {
  send().catch(err => console.error(err));
}

async function send() {
  console.log('Registering service worker');
  const registration = await navigator.serviceWorker.
    register('/worker.js', {scope: '/'});
  console.log('Registered service worker'); 

  console.log('Registering push');
  const subscription = await registration.pushManager.
    subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
  console.log('Registered push');
  

  console.log('Sending push');
  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'content-type': 'application/json'
    }
  });
  console.log('Sent push');
}

// Boilerplate borrowed from https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
*/