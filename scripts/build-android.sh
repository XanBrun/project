#!/bin/bash

# 🎲 Script para construir APK de D&D Local con librerías actualizadas
# Uso: ./scripts/build-android.sh

set -e

echo "🎲 D&D Local - Construcción Android con Librerías Actualizadas"
echo "=============================================================="

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

# Instalar dependencias actualizadas
echo "📦 Instalando dependencias actualizadas..."
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

# Sincronizar con Capacitor
echo "🔄 Sincronizando con Capacitor..."
npx cap sync android

# Verificar que Android Studio esté configurado
if [ ! -d "android" ]; then
    echo "❌ Error: La plataforma Android no se configuró correctamente"
    exit 1
fi

# Construir APK
echo "🔨 Construyendo APK con Gradle..."
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

# Construir APK de debug
echo "🔨 Construyendo APK de debug..."
./gradlew assembleDebug

# Verificar que la APK se construyó
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK creada exitosamente!"
    echo "📍 Ubicación: android/$APK_PATH"
    
    # Mostrar información de la APK
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📊 Tamaño: $APK_SIZE"
    
    # Mostrar características incluidas
    echo "🔵 Características incluidas:"
    echo "   ✅ Capacitor 6.0"
    echo "   ✅ Bluetooth LE nativo"
    echo "   ✅ Splash Screen"
    echo "   ✅ Status Bar"
    echo "   ✅ Keyboard"
    echo "   ✅ Permisos Android optimizados"
else
    echo "❌ Error: No se pudo crear la APK"
    exit 1
fi

# Volver al directorio raíz
cd ..

echo ""
echo "🎉 ¡Construcción completada con librerías actualizadas!"
echo ""
echo "📱 Para instalar en dispositivo Android:"
echo "   adb install android/$APK_PATH"
echo ""
echo "🚀 Para abrir en Android Studio:"
echo "   npx cap open android"
echo ""
echo "📋 Librerías actualizadas incluidas:"
echo "   • Capacitor 6.0.0"
echo "   • Bluetooth LE 6.0.1"
echo "   • ESLint 8.57.0 (compatible)"
echo "   • TypeScript ESLint 7.18.0"
echo "   • React Hooks 4.6.0 (compatible)"
echo ""
echo "🎲 ¡Tu aplicación D&D está lista para aventuras móviles!"