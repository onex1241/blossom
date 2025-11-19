const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let flaskProcess;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false
        }
    });

    // Когда Flask поднимется — открываем сайт
    win.loadURL("http://127.0.0.1:5000");
}

app.whenReady().then(() => {
    // Запускаем Flask сервер внутри приложения
    const flaskPath = path.join(__dirname, "..", "venv", "bin", "python3");
    const appPath = path.join(__dirname, "..", "app.py");

    flaskProcess = spawn(flaskPath, [appPath], {
        cwd: path.join(__dirname, "..")
    });

    flaskProcess.stdout.on("data", data => {
        console.log(`Flask: ${data}`);
    });

    flaskProcess.stderr.on("data", data => {
        console.error(`Flask error: ${data}`);
    });

    createWindow();
});

// Закрытие Flask при выходе
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
    if (flaskProcess) flaskProcess.kill();
});
