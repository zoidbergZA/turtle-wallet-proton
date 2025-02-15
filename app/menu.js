// @flow
import { app, Menu, shell, BrowserWindow, dialog } from 'electron';
import log from 'electron-log';
import LocalizedStrings from 'react-localization';
import npmPackage from '../package.json';

export const il8n = new LocalizedStrings({
  // eslint-disable-next-line global-require
  en: require('./il8n/en-menu.json')
});

const { version: currentVersion } = npmPackage;
const { productName } = npmPackage;

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
  }

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: `${productName}`,
      submenu: [
        {
          label: `${il8n.about} ${productName}`,
          click: () => {
            shell.openExternal(
              'http://github.com/turtlecoin/turtle-wallet-proton#readme'
            );
          }
        },
        { type: 'separator' },
        {
          label: `${il8n.hide} ${productName}`,
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: `${il8n.hide_others}`,
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        { label: il8n.show_all, selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: il8n.quit,
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    };
    const subMenuFile = {
      label: il8n.file,
      submenu: [
        {
          label: 'Open',
          accelerator: 'Command+O',
          click: () => {
            this.handleOpen();
          }
        },
        {
          label: il8n.new,
          accelerator: 'Command+N',
          click: () => {
            this.handleNew();
          }
        },
        {
          label: il8n.restore,
          click: () => {
            this.handleRestore();
          }
        },
        {
          label: il8n.save,
          accelerator: 'Command+S',
          click: () => {
            this.handleSave();
          }
        },
        {
          label: il8n.save_copy,
          click: () => {
            this.handleSaveAs();
          }
        },
        {
          label: il8n.close,
          accelerator: 'Command+W',
          click: () => {
            this.mainWindow.close();
          }
        }
      ]
    };
    const subMenuEdit = {
      label: il8n.edit,
      submenu: [
        { label: il8n.undo, accelerator: 'Command+Z', selector: 'undo:' },
        { label: il8n.redo, accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: il8n.cut, accelerator: 'Command+X', selector: 'cut:' },
        { label: il8n.copy, accelerator: 'Command+C', selector: 'copy:' },
        { label: il8n.paste, accelerator: 'Command+V', selector: 'paste:' },
        {
          label: il8n.select_all,
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    };
    const subMenuViewDev = {
      label: il8n.view,
      submenu: [
        {
          label: il8n.reload,
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: il8n.toggle_fullscreen,
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: il8n.toggle_devtools,
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd = {
      label: il8n.view,
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        }
      ]
    };
    const subMenuWallet = {
      label: il8n.wallet,
      submenu: [
        {
          label: il8n.password,
          click: () => {
            this.handlePasswordChange();
          }
        },
        {
          label: il8n.backup,
          click: () => {
            this.handleBackup();
          }
        },
        {
          label: il8n.lock,
          accelerator: 'Command+L',
          click: () => {
            this.handleLock();
          }
        }
      ]
    };
    const subMenuWindow = {
      label: il8n.window,
      submenu: [
        {
          label: il8n.minimize,
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        {
          label: il8n.close,
          accelerator: 'Command+W',
          selector: 'performClose:'
        },
        { type: 'separator' },
        { label: il8n.bring_all_front, selector: 'arrangeInFront:' }
      ]
    };
    const subMenuTools = {
      label: il8n.tools,
      submenu: [
        {
          label: il8n.export_csv,
          click: () => {
            this.handleExportToCsv();
          }
        }
      ]
    };
    const subMenuHelp = {
      label: il8n.help,
      submenu: [
        {
          label: `${currentVersion}`
        },
        {
          label: il8n.support,
          click() {
            shell.openExternal('https://discord.gg/P7urHQs');
          }
        },
        {
          label: il8n.report_bug,
          click() {
            shell.openExternal(
              'https://github.com/turtlecoin/turtle-wallet-proton/issues'
            );
          }
        },
        {
          label: il8n.feature_request,
          click() {
            shell.openExternal(
              'https://github.com/turtlecoin/turtle-wallet-proton/issues'
            );
          }
        }
      ]
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ? subMenuViewDev : subMenuViewProd;

    return [
      subMenuAbout,
      subMenuFile,
      subMenuEdit,
      subMenuWallet,
      subMenuView,
      subMenuWindow,
      subMenuTools,
      subMenuHelp
    ];
  }

  handleSave() {
    this.mainWindow.webContents.send('handleSave');
  }

  handleOpen() {
    this.mainWindow.webContents.send('handleOpen');
  }

  handleSaveAs() {
    this.mainWindow.webContents.send('handleSaveAs');
  }

  handleBackup() {
    this.mainWindow.webContents.send('handleBackup');
  }

  handleNew() {
    this.mainWindow.webContents.send('handleNew');
  }

  handlePasswordChange() {
    this.mainWindow.webContents.send('handlePasswordChange');
  }

  handleExportToCsv() {
    this.mainWindow.webContents.send('exportToCSV');
  }

  handleLock() {
    this.mainWindow.webContents.send('handleLock');
  }

  handleRestore() {
    this.mainWindow.webContents.send('handleSaveSilent');
    log.debug('Import menu selected.');
    // seed will be 0, keys will be 1
    const userSelection = dialog.showMessageBox(null, {
      type: 'info',
      buttons: [il8n.cancel, il8n.seed, il8n.keys],
      title: il8n.restore,
      message: il8n.seed_or_keys
    });
    if (userSelection === 1) {
      log.debug('User selected to import from seed...');
      this.mainWindow.webContents.send('importSeed');
    } else if (userSelection === 2) {
      log.debug('User selected to import from keys...');
      this.mainWindow.webContents.send('importKey');
    }
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: il8n.file,
        submenu: [
          {
            label: il8n.open,
            accelerator: 'Ctrl+O',
            click: () => {
              this.handleOpen();
            }
          },
          {
            label: il8n.new,
            accelerator: 'Ctrl+N',
            click: () => {
              this.handleNew();
            }
          },
          {
            label: il8n.restore,
            click: () => {
              this.handleRestore();
            }
          },
          {
            label: il8n.save,
            accelerator: 'Ctrl+S',
            click: () => {
              this.handleSave();
            }
          },
          {
            label: il8n.save_copy,
            click: () => {
              this.handleSaveAs();
            }
          },
          {
            label: il8n.close,
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            }
          }
        ]
      },
      {
        label: il8n.wallet,
        submenu: [
          {
            label: il8n.password,
            click: () => {
              this.handlePasswordChange();
            }
          },
          {
            label: il8n.backup,
            click: () => {
              this.handleBackup();
            }
          },
          {
            label: il8n.lock,
            accelerator: 'Ctrl+L',
            click: () => {
              this.handleLock();
            }
          }
        ]
      },
      {
        label: il8n.view,
        submenu:
          process.env.NODE_ENV === 'development'
            ? [
                {
                  label: il8n.reload,
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  }
                },
                {
                  label: il8n.toggle_fullscreen,
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                },
                {
                  label: il8n.toggle_devtools,
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.toggleDevTools();
                  }
                }
              ]
            : [
                {
                  label: il8n.toggle_fullscreen,
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                }
              ]
      },
      {
        label: il8n.tools,
        submenu: [
          {
            label: il8n.export_csv,
            click: () => {
              this.handleExportToCsv();
            }
          }
        ]
      },
      {
        label: il8n.help,
        submenu: [
          {
            label: `${currentVersion}`
          },
          {
            label: il8n.support,
            click() {
              shell.openExternal('https://discord.gg/P7urHQs');
            }
          },
          {
            label: il8n.about,
            click() {
              shell.openExternal(
                'http://github.com/turtlecoin/turtle-wallet-proton#readme'
              );
            }
          },
          {
            label: il8n.report_bug,
            click() {
              shell.openExternal(
                'https://github.com/turtlecoin/turtle-wallet-proton/issues'
              );
            }
          },
          {
            label: il8n.feature_request,
            click() {
              shell.openExternal(
                'https://github.com/turtlecoin/turtle-wallet-proton/issues'
              );
            }
          }
        ]
      }
    ];

    return templateDefault;
  }
}
