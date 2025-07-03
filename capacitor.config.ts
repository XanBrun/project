import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dndlocal.app',
  appName: 'D&D Local',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FEF3C7",
      showSpinner: false,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#D97706"
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    },
    BluetoothLe: {
      displayStrings: {
        scanning: "Buscando dispositivos...",
        cancel: "Cancelar",
        availableDevices: "Dispositivos disponibles",
        noDeviceFound: "No se encontraron dispositivos"
      }
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;