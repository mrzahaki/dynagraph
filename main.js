const {app, BrowserWindow,  } = require('electron')
const path = require('path')


var mainWin;

function createWindow(){
    mainWin = new BrowserWindow({
        width: 1280,
        height: 720,
        autoHideMenuBar: true,
        icon: path.join (__dirname, 'frontend/static/images/logo_red.png'),
        webPreferences:{
          webSecurity: false,
          preload: path.join(__dirname, "preload.js")
        }
    });
    /*webSecurity:false*/
    mainWin.loadFile('frontend/static/build/index.html')
    // mainWin.maximize()

    // auto Open the DevTools on refresh 
    mainWin.webContents.on('did-frame-finish-load', () => {
      // We close the DevTools so that it can be reopened and redux reconnected.
      // This is a workaround for a bug in redux devtools.
      // mainWin.webContents.closeDevTools();
      
      mainWin.webContents.once('devtools-opened', () => {
        mainWin.focus();
      });
      
      // mainWin.webContents.openDevTools();
	});
}


app.whenReady().then(async () => {
    
  app.commandLine.appendSwitch("disable-http-cache");

  // const options = {
  //   loadExtensionOptions: { allowFileAccess: true },
  // };

  // installExtension([REDUX_DEVTOOLS], options)
  // .then((name) => console.log(`Added Extension:  ${name}`))
  // .catch((err) => console.log('An error occurred: ', err));

    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
    
  })

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })
