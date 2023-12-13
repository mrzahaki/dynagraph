const { ipcRenderer, contextBridge } = require("electron");

const API = {
    getSize : () => ipcRenderer.invoke("GET/size")
}


contextBridge.exposeInMainWorld("api", API)