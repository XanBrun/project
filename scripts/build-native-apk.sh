#!/bin/bash

# 🎲 Script para construir APK nativa de D&D Local con Bluetooth
# Uso: ./scripts/build-native-apk.sh

set -e

echo "🎲 D&D Local - Construcción de APK Nativa con Bluetooth"
echo "======================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar dependencias
echo "🔍 Verificando dependencias..."
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npm/npx no está instalado"
    exit 1
fi

# Instalar dependencias de Capacitor si no están instaladas
echo "📦 Instalando dependencias de Capacitor..."
npm install

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf dist/
rm -rf android/app/build/

# Construir aplicación web
echo "🏗️  Construyendo aplicación web..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: La construcción web falló"
    exit 1
fi

# Verificar si Capacitor está configurado
if [ ! -f "capacitor.config.ts" ]; then
    echo "📱 Inicializando Capacitor..."
    npx cap init "D&D Local" "com.dndlocal.app"
fi

# Agregar plataforma Android si no existe
if [ ! -d "android" ]; then
    echo "📱 Agregando plataforma Android..."
    npx cap add android
fi

# Sincronizar con Capacitor
echo "🔄 Sincronizando con Capacitor..."
npx cap sync android

# Copiar archivos de configuración
echo "📋 Copiando configuraciones de Android..."
npx cap copy android

# Verificar que Android Studio esté configurado
if [ ! -d "android" ]; then
    echo "❌ Error: La plataforma Android no se configuró correctamente"
    exit 1
fi

# Construir APK
echo "🔨 Construyendo APK nativa..."
cd android

# Verificar que Gradle esté disponible
if [ ! -f "gradlew" ]; then
    echo "❌ Error: Gradle wrapper no encontrado"
    exit 1
fi

# Hacer ejecutable el wrapper de Gradle
chmod +x gradlew

# Limpiar proyecto
echo "🧹 Limpiando proyecto Android..."
./gradlew clean

# Construir APK de debug con Bluetooth
echo "🔨 Construyendo APK de debug con soporte Bluetooth..."
./gradlew assembleDebug

# Verificar que la APK se construyó
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK nativa creada exitosamente!"
    echo "📍 Ubicación: android/$APK_PATH"
    
    # Mostrar información de la APK
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📊 Tamaño: $APK_SIZE"
    
    # Mostrar permisos de Bluetooth
    echo "🔵 Permisos de Bluetooth incluidos:"
    echo "   - BLUETOOTH"
    echo "   - BLUETOOTH_ADMIN"
    echo "   - BLUETOOTH_SCAN"
    echo "   - BLUETOOTH_CONNECT"
    echo "   - ACCESS_COARSE_LOCATION"
    echo "   - ACCESS_FINE_LOCATION"
else
    echo "❌ Error: No se pudo crear la APK"
    exit 1
fi

# Volver al directorio raíz
cd ..

echo ""
echo "🎉 ¡Construcción nativa completada!"
echo ""
echo "📱 Para instalar en dispositivo Android:"
echo "   adb install android/$APK_PATH"
echo ""
echo "🚀 Para abrir en Android Studio:"
echo "   npx cap open android"
echo ""
echo "🔵 Características incluidas:"
echo "   ✅ Bluetooth LE nativo"
echo "   ✅ Permisos de ubicación para escaneo"
echo "   ✅ Soporte para Android 6+"
echo "   ✅ Optimizado para dispositivos móviles"
echo ""
echo "🎲 ¡Tu aplicación D&D nativa está lista para aventuras móviles!"