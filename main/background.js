import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) serve({ directory: 'app' });
else app.setPath('userData', `${app.getPath('userData')} (development)`);

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    minWidth: 400,
    minHeight: 725,
    width: 1175,
    height: 725
  });

  if (isProd) await mainWindow.loadURL('app://./home.html');
  else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
  };

  mainWindow.focus();
})();

app.on('window-all-closed', () => {
  app.quit();
});
