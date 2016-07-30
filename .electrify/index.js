var app = require('app')
var path = require('path')
var BrowserWindow = require('browser-window')
var electrify = require('electrify')(__dirname)
var ipcRenderer = require('electron').ipcRenderer
var shell = require('electron').shell
var Menu = require('menu')
var dialog = require('electron').dialog

// Windows
var splash = null
var window = null

// Menubar
var template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function () {
          if (process.platform === 'darwin') return 'Ctrl+Command+F'
          else return 'F11'
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
          }
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function () {
          if (process.platform === 'darwin') return 'Alt+Command+I'
          else return 'Ctrl+Shift+I'
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.toggleDevTools()
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function () {
          require('electron').shell.openExternal('https://www.communecter.org/')
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  var name = require('electron').app.getName()
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function () { app.quit() }
      }
    ]
  })
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  )
}

app.on('ready', function () {
  // Menu
  var menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Splashscreen
  splash = new BrowserWindow({
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

  electrify.start(function (meteor_root_url) {
    // creates a new electron window
    window = new BrowserWindow({
      width: 360, height: 640,
      minWidth: 360, minHeight: 640,
      title: 'CommunEvent',
      icon: path.join(__dirname, 'icon.png'),
      webPreferences: {nodeIntegration: false,experimentalFeatures:true}
    })

    // open up meteor root url
    window.loadURL(meteor_root_url)

    // close splashscreen
    splash.close()
  })
})

app.on('window-all-closed', function () {
  app.quit()
})

app.on('will-quit', function terminate_and_quit (event) {
  // if electrify is up, cancel exiting with `preventDefault`,
  // so we can terminate electrify gracefully without leaving child
  // processes hanging in background
  if (electrify.isup() && event) {
    // holds electron termination
    event.preventDefault()

    // gracefully stops electrify
    electrify.stop(function () {
      // and then finally quit app
      app.quit()
    })
  }
})

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

electrify.methods({
  'openExternal': function (url, done) {
    shell.openExternal(url)
    done(null)
  },
  'saveAs': function (options, done) {
    if (typeof options !== 'undefined' && options !== null) {
      if (typeof options !== 'object') {
        return done(new Error('[saveAs] Wrong arguments: options should be an object'))
      }
      if (options.multiple) {
        delete options.multiple
        options.title = options.title || 'Choose a directory'
        options.properties = ['openDirectory', 'createDirectory']
        return dialog.showOpenDialog(options, function (path) {
          done(null, path)
        })
      }
    }
    dialog.showSaveDialog(options, function (filename) {
      done(null, filename)
    })
  },
  'setBadge': function (text, done) {
    if (app.dock) {
      app.dock.setBadge(text)
    }
    done(null)
  },
  'setBadgeCount': function (number, done) {
    app.setBadgeCount(number)
    done(null,number)
  },

  'window.close': function (done) {
    window.close()
    done(null)
  },
  'window.onclose': function (done) {
    window.once('close', function (e) {
      e.preventDefault()
      done(null)
    })
  },
  'window.onevent': function (type, done) {
    window.once(type, function (e) {
      done(null)
    })
  },
  'showDoneNotification': function (notification,done) {
    var notif = new window.Notification(notification.title, {
      body: notification.text,
      icon: '/icon.png',
      data: notification
    })
    notif.onclick = function () {
      ipcRenderer.send('focusWindow', 'main')
    }
    setTimeout(notif.close.bind(notif), 5000);
    done(null, notification.title);
  }
})
