#!/bin/bash

# 🎲 Script para construir APK de D&D Local
# Uso: ./scripts/build-apk.sh

set -e

echo "🎲 D&D Local - Construcción de APK"
echo "=================================="

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

# Verificar si Capacitor está instalado
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

# Verificar que Android Studio esté configurado
if [ ! -d "android" ]; then
    echo "❌ Error: La plataforma Android no se configuró correctamente"
    exit 1
fi

# Construir APK
echo "🔨 Construyendo APK..."
cd android

# Verificar que Gradle esté disponible
if [ ! -f "gradlew" ]; then
    echo "❌ Error: Gradle wrapper no encontrado"
    exit 1
fi

# Hacer ejecutable el wrapper de Gradle
chmod +x gradlew

# Construir APK de debug
echo "🔨 Construyendo APK de debug..."
./gradlew assembleDebug

# Verificar que la APK se construyó
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK de debug creada exitosamente!"
    echo "📍 Ubicación: android/$APK_PATH"
    
    # Mostrar información de la APK
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📊 Tamaño: $APK_SIZE"
else
    echo "❌ Error: No se pudo crear la APK"
    exit 1
fi

# Volver al directorio raíz
cd ..

echo ""
echo "🎉 ¡Construcción completada!"
echo "📱 Para instalar en dispositivo Android:"
echo "   adb install android/$APK_PATH"
echo ""
echo "🚀 Para abrir en Android Studio:"
echo "   npx cap open android"
echo ""
echo "🎲 ¡Tu aplicación D&D está lista para aventuras móviles!"