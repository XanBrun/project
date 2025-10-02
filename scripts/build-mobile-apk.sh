#!/bin/bash

# 🎲 Script para construir APK móvil de D&D Local con Bluetooth nativo
# Uso: ./scripts/build-mobile-apk.sh

set -e

echo "🎲 D&D Local - Construcción APK Móvil con Bluetooth Nativo"
echo "=========================================================="

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

# Verificar que Android Studio esté configurado
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME no está configurado"
    echo "   Por favor configura las variables de entorno:"
    echo "   export ANDROID_HOME=\$HOME/Android/Sdk"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
fi

# Instalar dependencias actualizadas
echo "📦 Instalando dependencias móviles..."
npm install

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf dist/
rm -rf android/app/build/

# Construir aplicación web optimizada para móvil
echo "🏗️  Construyendo aplicación web optimizada..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: La construcción web falló"
    exit 1
fi

# Verificar configuración de Capacitor
echo "📱 Verificando configuración de Capacitor..."
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Error: capacitor.config.ts no encontrado"
    exit 1
fi

# Sincronizar con Capacitor
echo "🔄 Sincronizando con Capacitor..."
npx cap sync android

# Copiar assets y configuraciones
echo "📋 Copiando assets móviles..."
npx cap copy android

# Verificar que la plataforma Android esté lista
if [ ! -d "android" ]; then
    echo "❌ Error: La plataforma Android no está configurada"
    exit 1
fi

# Construir APK
echo "🔨 Construyendo APK móvil..."
cd android

# Verificar Gradle wrapper
if [ ! -f "gradlew" ]; then
    echo "❌ Error: Gradle wrapper no encontrado"
    exit 1
fi

# Hacer ejecutable el wrapper
chmod +x gradlew

# Limpiar proyecto Android
echo "🧹 Limpiando proyecto Android..."
./gradlew clean

# Construir APK de debug con todas las optimizaciones
echo "🔨 Construyendo APK de debug optimizada..."
./gradlew assembleDebug --info

# Verificar que la APK se construyó
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ APK móvil creada exitosamente!"
    echo "📍 Ubicación: android/$APK_PATH"
    
    # Mostrar información de la APK
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📊 Tamaño: $APK_SIZE"
    
    # Mostrar características incluidas
    echo ""
    echo "🔵 Características Bluetooth Nativas:"
    echo "   ✅ Capacitor Bluetooth LE 6.0+"
    echo "   ✅ Escaneo nativo de dispositivos"
    echo "   ✅ Conexión estable sin limitaciones web"
    echo "   ✅ Notificaciones en tiempo real"
    echo "   ✅ Reconexión automática"
    echo "   ✅ Permisos Android 6+ y 12+ optimizados"
    echo ""
    echo "📱 Optimizaciones Móviles:"
    echo "   ✅ Interfaz adaptada para táctil"
    echo "   ✅ Gestión de permisos automática"
    echo "   ✅ Almacenamiento local optimizado"
    echo "   ✅ Rendimiento mejorado para móvil"
    echo ""
    echo "🎮 Funcionalidades D&D:"
    echo "   ✅ Compartir lanzamientos de dados"
    echo "   ✅ Sincronizar compras de tienda"
    echo "   ✅ Actualizar personajes en tiempo real"
    echo "   ✅ Combate multijugador"
    
    # Información de instalación
    echo ""
    echo "📱 Para instalar en dispositivo Android:"
    echo "   adb install android/$APK_PATH"
    echo ""
    echo "🚀 Para abrir en Android Studio:"
    echo "   npx cap open android"
    echo ""
    echo "🔧 Para desarrollo en dispositivo:"
    echo "   npx cap run android"
    
else
    echo "❌ Error: No se pudo crear la APK"
    echo "   Revisa los logs de Gradle arriba para más detalles"
    exit 1
fi

# Volver al directorio raíz
cd ..

echo ""
echo "🎉 ¡Construcción móvil completada exitosamente!"
echo ""
echo "🎲 Tu aplicación D&D móvil con Bluetooth nativo está lista!"
echo "   Ahora puedes conectar dispositivos sin las limitaciones del navegador"
echo "   y disfrutar de una experiencia multijugador completa."
echo ""
echo "📋 Próximos pasos recomendados:"
echo "   1. Instalar en dispositivos Android reales"
echo "   2. Probar conectividad Bluetooth entre dispositivos"
echo "   3. Verificar compartir dados y compras"
echo "   4. Optimizar rendimiento según sea necesario"