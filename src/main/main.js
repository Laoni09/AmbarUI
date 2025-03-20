const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require("axios");
const { exec } = require("child_process");
const fs = require('fs');
require('./ipc/concessionariasIpc'); 

let mainWindow;

app.whenReady().then(() => {
    const isPackaged = app.isPackaged;

    const backendPath = isPackaged
      ? path.join(process.resourcesPath, 'backend.exe') 
      : path.resolve(__dirname, '../../../AutoAMBAR/backend/dist/main.exe'); 
    
    if (!fs.existsSync(backendPath)) {
      console.error("⚠️ Backend não encontrado:", backendPath);
    } else {
      console.log("✅ Backend encontrado:", backendPath);
    }

    const backendProcess = exec(`"${backendPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar backend: ${error.message}`);
      }
      if (stderr) {
        console.error(`Erro do backend: ${stderr}`);
      }
      console.log(`Saída do backend: ${stdout}`);
    });

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
        autoHideMenuBar: true
    });
    
    mainWindow.loadFile('src/views/index.html');

    ipcMain.on('open-concessionarias', () => {
        mainWindow.loadFile('src/views/concessionarias.html');
    });

    ipcMain.on('open-art', () => {
        mainWindow.loadFile('src/views/art.html');
    });

    ipcMain.on("executar-services", async (event, serviceNome) => {
        console.log(backendPath)
        try {
            const resposta = await axios.get(`http://127.0.0.1:5000/executar/${serviceNome}`);
            event.reply("resposta-script", resposta.data);
        } catch (error) {
            event.reply("resposta-script", { erro: "Falha ao conectar ao backend." });
        }
    })
});
