# 🎲 D&D Local - Aplicación Nativa Android

Una aplicación nativa de Android para gestionar aventuras de Dungeons & Dragons 5e con conectividad Bluetooth nativa para juego multijugador local.

![D&D Local](https://images.pexels.com/photos/1040157/pexels-photo-1040157.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Características Principales

### 🔵 **Bluetooth Nativo Completo**
- **Bluetooth LE nativo** para dispositivos Android
- **Escaneo automático** de dispositivos cercanos
- **Conexión estable** sin limitaciones del navegador
- **Permisos optimizados** para Android 6+ y 12+
- **Sincronización en tiempo real** entre dispositivos

### 🎯 **Sistema de Personajes Completo**
- **Creador de personajes** con sistema Point Buy
- **Gestión de monedas D&D 5e** (Platino, Oro, Electrum, Plata, Cobre)
- **Hojas de personaje** interactivas con estadísticas derivadas
- **Inventario y equipo** con integración a la tienda
- **Habilidades y competencias** configurables

### 🛒 **Tienda de Aventureros**
- **Carrito de compras** funcional con gestión de cantidades
- **Sistema de monedas** con conversión automática
- **Múltiples tiendas** especializadas con inventarios únicos
- **Filtros avanzados** por categoría, rareza y búsqueda
- **Checkout completo** con validación de fondos
- **Historial de transacciones** persistente

### 🎲 **Sistema de Dados Avanzado**
- **Todos los tipos de dados** (d4, d6, d8, d10, d12, d20, d100)
- **Modificadores** personalizables
- **Animaciones** visuales durante el lanzamiento
- **Historial persistente** de lanzamientos
- **Sincronización Bluetooth** de resultados

### ⚔️ **Combate Multijugador**
- **Iniciativa automática** con orden de turnos
- **Gestión de HP** en tiempo real
- **Condiciones de estado** aplicables
- **Sincronización** de acciones entre dispositivos
- **Integración con personajes** y su equipo

### 🗺️ **Sistema de Mapas Interactivo**
- **Navegación fluida** con zoom y paneo
- **Marcadores configurables** con tipos y visibilidad
- **Herramienta de medición** con escala
- **Cuadrícula configurable** opcional
- **Mapas de ejemplo** preconfigurados

### 📚 **Gestión de Campañas**
- **CRUD completo** para campañas
- **NPCs y ubicaciones** gestionables
- **Sesiones de campaña** con registro detallado
- **Estados de campaña** (planificación, activa, completada)
- **Plantillas de NPCs** predefinidas

## 🚀 Tecnologías Utilizadas

### **Frontend**
- **React 18** con TypeScript
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos responsivos
- **React Router** para navegación
- **Zustand** para gestión de estado global
- **LocalForage** para almacenamiento local
- **Lucide React** para iconografía

### **Móvil Nativo**
- **Capacitor 5** para aplicación nativa
- **Capacitor Bluetooth LE 6.0+** para conectividad nativa completa
- **Capacitor Device** para información del dispositivo
- **Capacitor Network** para estado de conectividad
- **Capacitor Preferences** para configuraciones nativas
- **Android SDK** para funcionalidades específicas
- **Gradle** para construcción de APK

### **APIs y Servicios**
- **Bluetooth LE API** nativa con escaneo automático
- **Permisos Android** optimizados para 6+ y 12+
- **Reconexión automática** a dispositivos conocidos
- **File System API** para almacenamiento
- **Status Bar API** para personalización
- **Splash Screen API** para pantalla de carga

## 📱 Instalación y Configuración

### **Requisitos Previos**
- **Node.js 18+** y npm
- **Android Studio** con SDK configurado
- **Java JDK 11+**
- **Variables de entorno** configuradas:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### **Instalación Rápida**

```bash
# 1. Clonar e instalar dependencias
git clone <repository-url>
cd dnd-local
npm install

# 2. Construir APK móvil con Bluetooth nativo
./scripts/build-mobile-apk.sh

# 3. Instalar en dispositivo
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### **Desarrollo Local**

```bash
# Servidor de desarrollo web
npm run dev

# Construcción para móvil
npm run build:mobile

# Abrir en Android Studio
npx cap open android

# Ejecutar en dispositivo
npx cap run android
```

## 🔵 Bluetooth Nativo Completo

### **Permisos Optimizados por Versión**

#### **Android 6-11:**
- `BLUETOOTH` - Acceso básico
- `BLUETOOTH_ADMIN` - Administración
- `ACCESS_COARSE_LOCATION` - Ubicación para escaneo
- `ACCESS_FINE_LOCATION` - Ubicación precisa

#### **Android 12+:**
- `BLUETOOTH_SCAN` - Escaneo sin ubicación
- `BLUETOOTH_CONNECT` - Conexión a dispositivos
- `BLUETOOTH_ADVERTISE` - Anuncio de servicios
- Permisos de ubicación opcionales

### **Características Nativas**
- **🔍 Escaneo Inteligente**: Busca automáticamente dispositivos D&D cercanos
- **🔗 Conexión Estable**: Sin limitaciones del navegador web
- **🔔 Notificaciones Nativas**: Mensajes en tiempo real
- **🔐 Gestión de Permisos**: Solicitud automática según versión Android
- **🔄 Reconexión Automática**: Se reconecta a dispositivos conocidos
- **📡 Información Detallada**: RSSI, MAC address, servicios disponibles
- **⚡ Rendimiento Optimizado**: Uso eficiente de batería

### **Mensajes Sincronizados**
- **🎲 Lanzamientos de Dados**: Compartidos en tiempo real con detalles completos
- **👤 Actualizaciones de Personajes**: Cambios automáticos sincronizados
- **⚔️ Acciones de Combate**: Turnos e iniciativa compartidos
- **🛒 Compras en Tienda**: Transacciones visibles para todo el grupo
- **📚 Eventos de Campaña**: Notificaciones de progreso distribuidas

## 🎮 Uso Multijugador

### **Configuración de Sesión**
1. **DM (Dungeon Master)**: 
   - Abre la aplicación móvil
   - Activa Bluetooth si no está encendido
   - La app se anuncia automáticamente como dispositivo D&D

2. **Jugadores**: 
   - Abren la aplicación móvil
   - Tocan "Buscar Dispositivos" en el estado Bluetooth
   - Seleccionan el dispositivo del DM de la lista
   - Conexión automática y estable

3. **Sincronización Automática**: 
   - Todos los eventos se comparten instantáneamente
   - Reconexión automática si se pierde la conexión
   - Historial de dispositivos para conexión rápida

### **Funciones Multijugador**
- **🎲 Dados Compartidos**: Resultados visibles para todos con animaciones
- **⚔️ Combate Sincronizado**: Turnos, HP y condiciones en tiempo real
- **🗺️ Mapas Colaborativos**: Marcadores y mediciones compartidas
- **💬 Eventos Automáticos**: Notificaciones de todas las acciones
- **🛒 Tienda Grupal**: Compras visibles para gestión de recursos

## 🛒 Tiendas Incluidas

### 🗡️ **Armería del Dragón de Hierro**
- Armas, armaduras y escudos
- Especializada en equipo de combate
- Reputación: 95%

### 🧪 **Pociones y Pergaminos de Elara**
- Objetos mágicos y consumibles
- Pociones de curación y pergaminos
- Descuento: 5% | Reputación: 88%

### 🎒 **Suministros del Aventurero**
- Equipo general y herramientas
- Todo lo necesario para aventuras
- Descuento: 10% | Reputación: 92%

### 🔨 **Herrería de Vulcano**
- Herramientas especializadas
- Trabajos de metal y herrajes
- Reputación: 96%

### 🐎 **Establos Reales de Pegaso**
- Monturas y vehículos
- Caballos de guerra y transporte
- Reputación: 90%

## 💰 Sistema de Monedas

El sistema implementa la economía oficial de D&D 5e:

- **Platino (pp)**: 1,000 cp
- **Oro (gp)**: 100 cp  
- **Electrum (ep)**: 50 cp
- **Plata (sp)**: 10 cp
- **Cobre (cp)**: 1 cp

### Características:
- **Conversión automática** entre denominaciones
- **Validación de fondos** antes de compras
- **Interfaz intuitiva** para gestión
- **Sincronización Bluetooth** de transacciones

## 🎯 Ejemplo de Juego Multijugador

1. **DM inicia sesión**: Configura campaña y activa Bluetooth
2. **Jugadores se conectan**: Escanean y conectan a la sesión
3. **Creación de personajes**: Cada jugador crea su héroe
4. **Aventura sincronizada**: Combate, dados y eventos compartidos
5. **Tienda colaborativa**: Compras visibles para todo el grupo

## 📊 Características Técnicas

### **Arquitectura Nativa**
- **Capacitor 5** para bridge nativo-web
- **Bluetooth LE** para comunicación eficiente
- **SQLite local** para almacenamiento offline
- **Service Workers** para cache inteligente

### **Optimizaciones Móviles**
- **Lazy loading** de componentes
- **Compresión de imágenes** automática
- **Cache de assets** para uso offline
- **Gestión de memoria** optimizada

### **Seguridad**
- **Encriptación** de mensajes Bluetooth
- **Validación** de datos en tiempo real
- **Permisos granulares** por funcionalidad
- **Almacenamiento seguro** local

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Servidor de desarrollo
npm run build              # Construcción web
npm run build:mobile       # Construcción + sync móvil

# Android
npm run android:dev        # Ejecutar en dispositivo
npm run mobile:apk         # Construir APK optimizada
npm run android:open       # Abrir Android Studio
npm run android:sync       # Sincronizar cambios

# Capacitor
npx cap add android        # Agregar plataforma Android
npx cap copy android       # Copiar assets
npx cap sync android       # Sincronizar todo
```

## 📈 Estado del Proyecto

**Versión**: 2.1.0 (Bluetooth Nativo Completo)  
**Estado**: Completamente Funcional ✅  
**Plataforma**: Android Nativo  
**Última actualización**: Diciembre 2024

### Funcionalidades Implementadas
- ✅ Aplicación nativa Android
- ✅ Bluetooth LE nativo completo con escaneo automático
- ✅ Permisos optimizados para Android 6+ y 12+
- ✅ Reconexión automática y gestión de errores
- ✅ Sistema de personajes avanzado
- ✅ Tienda con carrito de compras
- ✅ Sistema de monedas D&D 5e
- ✅ Combate multijugador sincronizado
- ✅ Gestión de campañas completa
- ✅ Mapas interactivos colaborativos
- ✅ Almacenamiento offline robusto
- ✅ Compartir dados y compras vía Bluetooth
- ✅ Interfaz móvil optimizada

## 🤝 Contribución

Este proyecto está diseñado para ser una herramienta completa para jugadores de D&D. Las contribuciones son bienvenidas para:

- Nuevos objetos y tiendas
- Mejoras en Bluetooth nativo
- Optimizaciones de rendimiento
- Nuevas características multijugador
- Corrección de errores

## 📄 Licencia

Proyecto de código abierto para la comunidad de D&D.

---

**¡Que comience la aventura nativa!** 🐉⚔️🎲📱