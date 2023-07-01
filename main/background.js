import { app, Menu } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

Menu.setApplicationMenu(false);

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 750,
    height: 450
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
