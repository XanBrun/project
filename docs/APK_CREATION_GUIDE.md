# 📱 Guía para Crear APK de D&D Local

## 🎯 Opciones para Crear APK

### 1. 🚀 **Capacitor (Recomendado)**
Capacitor es la mejor opción para convertir tu PWA en una app nativa.

#### Instalación
```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Inicializar Capacitor
npx cap init "D&D Local" "com.dndlocal.app"

# Agregar plataforma Android
npx cap add android
```

#### Configuración
```bash
# Construir la aplicación web
npm run build

# Sincronizar con Capacitor
npx cap sync

# Abrir en Android Studio
npx cap open android
```

### 2. 🔧 **Cordova (Alternativa)**
```bash
# Instalar Cordova
npm install -g cordova

# Crear proyecto Cordova
cordova create dnd-local com.dndlocal.app "D&D Local"
cd dnd-local

# Agregar plataforma Android
cordova platform add android

# Construir APK
cordova build android
```

### 3. 🌐 **PWA Builder (Microsoft)**
- Visita: https://www.pwabuilder.com/
- Ingresa tu URL: `https://tu-dominio.com`
- Descarga el paquete Android
- Sigue las instrucciones

## 🛠️ Configuración Detallada con Capacitor

### Paso 1: Preparar el Proyecto
```bash
# En tu directorio del proyecto
npm run build
```

### Paso 2: Configurar Capacitor
```json
// capacitor.config.ts
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
      showSpinner: false
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#D97706"
    }
  }
};

export default config;
```

### Paso 3: Configurar Android
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
```

### Paso 4: Construir APK
```bash
# Sincronizar cambios
npx cap sync android

# Abrir en Android Studio
npx cap open android

# O construir desde línea de comandos
cd android
./gradlew assembleDebug
```

## 📋 Requisitos Previos

### Para Capacitor/Cordova:
1. **Android Studio** instalado
2. **Java JDK 8+** 
3. **Android SDK** configurado
4. **Gradle** (incluido con Android Studio)

### Variables de Entorno:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 🎨 Personalización de la APK

### Iconos y Splash Screen
```bash
# Generar iconos automáticamente
npm install -g @capacitor/assets
npx capacitor-assets generate
```

### Estructura de Iconos:
```
resources/
├── icon.png (1024x1024)
├── splash.png (2732x2732)
└── android/
    ├── icon-foreground.png
    └── icon-background.png
```

### Configuración del Tema
```xml
<!-- android/app/src/main/res/values/styles.xml -->
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
    <item name="colorPrimary">#D97706</item>
    <item name="colorPrimaryDark">#B45309</item>
    <item name="colorAccent">#F59E0B</item>
</style>
```

## 🔐 Firma de la APK

### Generar Keystore
```bash
keytool -genkey -v -keystore dnd-local.keystore -alias dnd-local -keyalg RSA -keysize 2048 -validity 10000
```

### Configurar Gradle
```gradle
// android/app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file('dnd-local.keystore')
            storePassword 'tu-password'
            keyAlias 'dnd-local'
            keyPassword 'tu-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Construir APK de Producción
```bash
cd android
./gradlew assembleRelease
```

## 📱 Características Específicas para Móvil

### Bluetooth en Android
```typescript
// src/services/bluetooth-mobile.ts
import { Capacitor } from '@capacitor/core';

export const isMobile = () => {
  return Capacitor.isNativePlatform();
};

export const requestBluetoothPermissions = async () => {
  if (isMobile()) {
    // Solicitar permisos específicos de Android
    // Implementar con plugin de permisos
  }
};
```

### Configuración PWA Mejorada
```json
// public/manifest.json
{
  "name": "D&D Local - Compañero de Aventuras",
  "short_name": "D&D Local",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#D97706",
  "background_color": "#FEF3C7",
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 🚀 Distribución

### Google Play Store
1. Crear cuenta de desarrollador ($25 USD)
2. Subir APK firmada
3. Completar información de la app
4. Configurar precios y distribución
5. Enviar para revisión

### Distribución Directa
- Compartir archivo APK directamente
- Habilitar "Fuentes desconocidas" en Android
- Instalar manualmente

## 🔧 Scripts de Automatización

### package.json
```json
{
  "scripts": {
    "build:mobile": "npm run build && npx cap sync",
    "android:dev": "npx cap run android",
    "android:build": "npx cap build android",
    "android:open": "npx cap open android"
  }
}
```

### Script de Build Completo
```bash
#!/bin/bash
# build-apk.sh

echo "🏗️  Construyendo aplicación web..."
npm run build

echo "📱 Sincronizando con Capacitor..."
npx cap sync android

echo "🔨 Construyendo APK..."
cd android
./gradlew assembleRelease

echo "✅ APK creada en: android/app/build/outputs/apk/release/"
```

## 📊 Consideraciones Importantes

### Limitaciones de Bluetooth en Móvil
- Web Bluetooth API tiene soporte limitado en móviles
- Considerar usar plugins nativos de Bluetooth
- Implementar fallbacks para funcionalidad offline

### Optimizaciones para Móvil
- Reducir tamaño de bundle
- Optimizar imágenes
- Implementar lazy loading
- Configurar cache estratégico

### Testing
- Probar en dispositivos reales
- Verificar permisos de Bluetooth
- Testear conectividad offline
- Validar rendimiento en dispositivos de gama baja

## 🎯 Recomendación Final

**Para D&D Local, recomiendo usar Capacitor** porque:
- ✅ Mejor integración con PWAs
- ✅ Soporte nativo para Bluetooth
- ✅ Mantenimiento más fácil
- ✅ Mejor rendimiento
- ✅ Ecosistema activo

¡Tu aplicación D&D estará lista para aventuras móviles! 🎲📱