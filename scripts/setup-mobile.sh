#!/bin/bash

# 📱 Script de configuración inicial para desarrollo móvil
# Uso: ./scripts/setup-mobile.sh

set -e

echo "📱 D&D Local - Configuración Móvil"
echo "=================================="

# Instalar dependencias de Capacitor
echo "📦 Instalando Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android

# Instalar herramientas adicionales
echo "🛠️  Instalando herramientas adicionales..."
npm install @capacitor/assets @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard

# Inicializar Capacitor si no existe
if [ ! -f "capacitor.config.ts" ]; then
    echo "🔧 Inicializando Capacitor..."
    npx cap init "D&D Local" "com.dndlocal.app"
fi

# Generar iconos y splash screens
echo "🎨 Generando iconos y splash screens..."
if [ ! -d "resources" ]; then
    mkdir -p resources
    echo "📁 Creado directorio resources/"
    echo "ℹ️  Coloca icon.png (1024x1024) y splash.png (2732x2732) en resources/"
fi

# Crear estructura de directorios
mkdir -p resources/android

# Agregar scripts al package.json
echo "📝 Configurando scripts..."
npm pkg set scripts.build:mobile="npm run build && npx cap sync"
npm pkg set scripts.android:dev="npx cap run android"
npm pkg set scripts.android:build="npx cap build android"
npm pkg set scripts.android:open="npx cap open android"

# Hacer ejecutables los scripts
chmod +x scripts/build-apk.sh

echo ""
echo "✅ Configuración móvil completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Instala Android Studio: https://developer.android.com/studio"
echo "2. Configura las variables de entorno ANDROID_HOME"
echo "3. Coloca icon.png y splash.png en resources/"
echo "4. Ejecuta: ./scripts/build-apk.sh"
echo ""
echo "🎲 ¡Prepárate para aventuras móviles!"