const electron = require('electron')
// Module to control application life.
const {app, Menu} = require('electron')

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

//requiring electron dialogs to access system dialogs
const dialog = electron.dialog;

const fs = require('fs');
const path = require('path')
const url = require('url')
const buttons = [ 'Cancel', 'OK'];
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 768});

  //define template for the menu
  var menuTemplate = [{
        label: "Options",
        submenu: [{
            label: 'Open Music',
            accelerator: "CommandOrControl+O",
            click: function() {
                openFolderDialog();
            }
        },{
            label: 'Quit',
            // accelerator: "CommandOrControl+Q",
            click: function() {
              let agree = messageBox();
                // app.quit();
              dialog.showMessageBox({ type: 'info', buttons: buttons, message: 'Do you want to exit?' }, function (buttonIndex) {
                console.log(buttonIndex);
                  if(buttonIndex){
                    app.quit();
                  };
              });
            }
        }]
    }];

  var menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  //load dev console on start.
  mainWindow.webContents.openDevTools();

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})


//defining openFolderDialog to handle the files selected from dialog
function openFolderDialog(){
  dialog.showOpenDialog(mainWindow, {
    filters: [
      {name: 'Audios', extensions: ['mp3', 'm4a']},
    ],
    properties: ['openDirectory']
  },function(filePath){
    console.log("filePath ", filePath);
    if(filePath !== undefined){
      fs.readdir(filePath[0],function(err, files){
        var arr = [];
        for(var i=0;i<files.length;i++){
          if(files[i].substr(-4) === ".mp3" || files[i].substr(-4) === ".m4a"){
            arr.push(files[i]);
          }
        }
        var objToSend = {};
        objToSend.path = filePath[0];
        objToSend.files = arr;
        mainWindow.webContents.send('audio-file', objToSend);
        
      });
    }
  })
}

function messageBox(){
  

  dialog.showMessageBox({ type: 'info', buttons: buttons, message: 'Exit?' }, function (buttonIndex) {
      return buttonIndex;
  });
}

exports.openFolderDialog = openFolderDialog;