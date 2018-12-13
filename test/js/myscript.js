
// Client ID and API key from the Developer Console
var CLIENT_ID = '466948006635-ih2e03baolvs65l3fmjuhdfmlo5bk13c.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAuCdYM9rltUx9tqDzQ4y0RbmfTT110Pow';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

var fileIds = [];

/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {
gapi.load('client:auth2', initClient);

  // window.fbAsyncInit = function() {
  // FB.init({
  //   appId            : '2211928082411164',
  //   autoLogAppEvents : true,
  //   xfbml            : true,
  //   version          : 'v3.1'
  //   });

    // FB.login(function(response) {
    //   if (response.authResponse) {
    //   console.log('Welcome!  Fetching your information.... ');
    //   FB.api('/me', function(response) {
    //     console.log('Good to see you, ' + response.name + '.');
    //   });
    //   } else {
    //     console.log('User cancelled login or did not fully authorize.');
    //   }
    // });

    // fbLogin();
  // };
}

// // Load the JavaScript SDK asynchronously
// (function(d, s, id) {
//   var js, fjs = d.getElementsByTagName(s)[0];
//   if (d.getElementById(id)) return;
//   js = d.createElement(s); js.id = id;
//   js.src = "//connect.facebook.net/en_US/sdk.js";
//   fjs.parentNode.insertBefore(js, fjs);
// }(document, 'script', 'facebook-jssdk'));


// // Facebook login with JavaScript SDK
// function fbLogin() {
//   FB.login(function (response) {
//     if (response.authResponse) {
//       // Get and display the user profile data
//       getFbUserData();
//     } else {
//       document.getElementById('status').innerHTML = 'User cancelled login or did not fully authorize.';
//     }
//   }, {scope: 'email'});
// }

// // Fetch the user profile data from facebook
// function getFbUserData(){
//   FB.api('/me', {locale: 'en_US', fields: 'id,first_name,last_name,email,link,gender,locale,picture'},
//   function (response) {
//     document.getElementById('fbLink').setAttribute("onclick","fbLogout()");
//     document.getElementById('fbLink').innerHTML = 'Logout from Facebook';
//     document.getElementById('status').innerHTML = 'Thanks for logging in, ' + response.first_name + '!';
//     document.getElementById('userData').innerHTML = '<p><b>FB ID:</b> '+response.id+'</p><p><b>Name:</b> '+response.first_name+' '+response.last_name+'</p><p><b>Email:</b> '+response.email+'</p><p><b>Gender:</b> '+response.gender+'</p><p><b>Locale:</b> '+response.locale+'</p><p><b>Picture:</b> <img src="'+response.picture.data.url+'"/></p><p><b>FB Profile:</b> <a target="_blank" href="'+response.link+'">click to view profile</a></p>';
//   });
// }

// // Logout from facebook
// function fbLogout() {
//   FB.logout(function() {
//     document.getElementById('fbLink').setAttribute("onclick","fbLogin()");
//     document.getElementById('fbLink').innerHTML = '<img src="fblogin.png"/>';
//     document.getElementById('userData').innerHTML = '';
//     document.getElementById('status').innerHTML = 'You have successfully logout from Facebook.';
//   });
// }

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    //listFiles();
    getFileIds("'sample'");
    // getDropboxFiles();
    
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/**
 * Print files.
 */
function listFiles() {
  gapi.client.drive.files.list({
    'pageSize': 10,
    'fields': "nextPageToken, files(id, name)"
  }).then(function(response) {
    appendPre('Files:');
    var files = response.result.files;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        appendPre(file.name + ' (' + file.id + ')');
      }
    } else {
      appendPre('No files found.');
    }
  });
}

function getFileIds(name) {
  var query = "name contains ";
  query += name

  // 'q': "name contains 'sample'"
  gapi.client.drive.files.list({
    'q': query
  }).then(function(response) {
    appendPre('Files:');
    var files = response.result.files;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        fileIds.push(file.id);
        console.log('FileId: ' + file.id);
        // appendPre(file.name + ' (' + file.id + ')');
      }

      printFile();
    } else {
      appendPre('No files found.');
    }
  });
}

function printFile() {
  console.log('printFile: fileids: ' + fileIds);

  for (var i = 0; i < fileIds.length; i++)
  {
    var request = gapi.client.drive.files.get(
      {'fileId': fileIds[i], 'fields': '*'});
    request.execute(function(resp) {
      console.log(resp);
      appendPre('File ID: ' + resp.id);
      appendPre('Name: ' + resp.name);
      appendPre('mimeType: ' + resp.mimeType);
      appendPre('webViewLink Link: ' + resp.webViewLink);
      // appendPre('Thumbnail Link: ' + resp.webViewLink);
      appendPre('\n');
    });
  }
}

// function getDropboxFiles(){
//   const dropboxV2Api = require('../src/dropbox-api.js');
//   const Hapi = require('hapi');
//   const fs = require('fs');
//   const path = require('path');
//   const Opn = require('opn');

//   const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json')));

//   //set auth credentials
//   const dropbox = dropboxV2Api.authenticate({
//     client_id: "hr545muc3332dtv",
//     client_secret: "o5g5iklumoikfg5",
//     redirect_uri: 'http://localhost:8000/oauth'
//   });


  // var fetch = require('isomorphic-fetch');

  // const app = require('express')();
  // const hostname = 'localhost';
  // const port = 8000;
  // //const https = require('https');

  // const config = {
  //   fetch: fetch,
  //   // clientId: 'hr545muc3332dtv',
  //   // clientSecret: 'o5g5iklumoikfg5',
  //   accessToken: 'LAkfPTS5G_AAAAAAAAAAHaOO-ggI4ph05p2IFiWiYKdGEUoWpj3-7_SP72K5Pdii'
  // };

  // const Dropbox = require('dropbox').Dropbox;
  // var dbx = new Dropbox(config);

// <script async defer src="https://apis.google.com/js/api.js"
//   onload="this.onload=function(){};handleClientLoad()"
//   onreadystatechange="if (this.readyState === 'complete') this.onload()">
// </script>