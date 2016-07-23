var app = require('app');
var path = require('path');
var browser   = require('browser-window');
var electrify = require('electrify')(__dirname);

var window    = null;

app.on('ready', function() {

  // Splashscreen
  splash = new browser({
    width: 628, height: 448,
    center: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    title: 'CommunEvent',
    icon: path.join(__dirname, 'icon.png'),
    frame: false
  })
  splash.loadURL('file://' + __dirname + '/splash.html')

  // electrify start
  electrify.start(function(meteor_root_url) {

    // creates a new electron window
    window = new browser({
      width: 360, height: 640,
      minWidth: 360, minHeight: 640,
      title: 'CommunEvent',
      icon: path.join(__dirname, 'icon.png'),
      'node-integration': false // node integration must to be off
    });

    // open up meteor root url
    window.loadURL(meteor_root_url);

    // close splashscreen
    splash.close()
  });
});


app.on('window-all-closed', function() {
  app.quit();
});


app.on('will-quit', function terminate_and_quit(event) {

  // if electrify is up, cancel exiting with `preventDefault`,
  // so we can terminate electrify gracefully without leaving child
  // processes hanging in background
  if(electrify.isup() && event) {

    // holds electron termination
    event.preventDefault();

    // gracefully stops electrify
    electrify.stop(function(){

      // and then finally quit app
      app.quit();
    });
  }
});

//
// =============================================================================
//
// the methods bellow can be called seamlessly from your Meteor's
// client and server code, using:
//
//    Electrify.call('methodname', [..args..], callback);
//
// ATENTION:
//    From meteor, you can only call these methods after electrify is fully
//    started, use the Electrify.startup() convenience method for this
//
//
// Electrify.startup(function(){
//   Electrify.call(...);
// });
//
// =============================================================================
//
// electrify.methods({
//   'method.name': function(name, done) {
//     // do things... and call done(err, arg1, ..., argN)
//     done(null);
//   }
// });
//
