const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require("axios");
const { exec } = require("child_process");
require('./ipc/concessionariasIpc'); 

let mainWindow;

app.whenReady().then(() => {
    const backendPath = path.resolve(__dirname, '../../../AutoAMBAR/backend/dist/main.exe');

    console.log(`Backend inicializado de ${backendPath}`)

    const backendProcess = exec(backendPath, (error) => {
        if (error) console.error("Erro ao iniciar o backend:", error);
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
        console.log(backendPath)
        mainWindow.loadFile('src/views/concessionarias.html');
    });

    ipcMain.on('open-art', () => {
        console.log(backendPath)
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
