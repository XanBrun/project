# 🎲 D&D Local - Contexto del Proyecto

## 📋 Información General

**Nombre del Proyecto**: D&D Local - Compañero de Aventuras  
**Versión**: 2.0.0 (Nativa)  
**Tipo**: Aplicación Web Progresiva (PWA) con soporte para APK nativa  
**Propósito**: Aplicación completa para gestionar aventuras de Dungeons & Dragons 5e con conectividad Bluetooth local  

## 🎯 Objetivo Principal

Crear una aplicación integral que permita a jugadores y Dungeon Masters gestionar completamente sus sesiones de D&D 5e, incluyendo:
- Creación y gestión de personajes con sistema de monedas oficial
- Sistema de tienda completo con carrito de compras
- Lanzador de dados avanzado con historial
- Rastreador de combate con iniciativa automática
- Gestión de campañas con NPCs y ubicaciones
- Mapas interactivos con marcadores
- Conectividad Bluetooth para multijugador local

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 18** con TypeScript para componentes y lógica
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos responsivos y diseño
- **React Router** para navegación entre páginas
- **Zustand** para gestión de estado global
- **LocalForage** para almacenamiento local persistente
- **Lucide React** para iconografía consistente

### **Móvil Nativo**
- **Capacitor 5** para aplicación nativa Android
- **Capacitor Bluetooth LE** para conectividad nativa
- **Android SDK** para funcionalidades específicas
- **Gradle** para construcción de APK

### **APIs y Servicios**
- **Web Bluetooth API** para conectividad entre dispositivos
- **LocalStorage/IndexedDB** para persistencia de datos
- **Service Worker** para funcionalidad PWA
- **File System API** para exportación de datos

## 🏗️ Arquitectura del Proyecto

### **Estructura de Directorios**
```
src/
├── components/           # Componentes reutilizables
│   ├── Layout.tsx       # Layout principal con sidebar
│   ├── bluetooth/       # Componentes de Bluetooth
│   └── layout/          # Componentes de layout específicos
├── pages/               # Páginas principales de la aplicación
│   ├── Home.tsx         # Página de inicio
│   ├── Characters.tsx   # Gestión de personajes
│   ├── CharacterCreation.tsx  # Creador de personajes
│   ├── CharacterSheet.tsx     # Hoja de personaje
│   ├── Shop.tsx         # Sistema de tienda
│   ├── DiceRoller.tsx   # Lanzador de dados
│   ├── CombatTracker.tsx # Rastreador de combate
│   ├── CampaignManager.tsx # Gestor de campañas
│   ├── MapView.tsx      # Sistema de mapas
│   └── Settings.tsx     # Configuraciones
├── services/            # Servicios y lógica de negocio
│   ├── db.ts           # Gestión de base de datos local
│   └── bluetooth.ts    # Servicio de Bluetooth
├── stores/             # Stores de Zustand
│   └── bluetoothStore.ts # Estado global de Bluetooth
├── types/              # Definiciones de TypeScript
│   └── index.ts        # Tipos principales
└── utils/              # Utilidades y helpers
```

### **Patrones de Diseño Implementados**
- **Singleton**: Para servicios (Bluetooth, DB)
- **Custom Hooks**: Para lógica reutilizable
- **Compound Components**: Para interfaces complejas
- **Error Boundaries**: Para manejo de errores
- **Repository Pattern**: Para acceso a datos

## 🎮 Funcionalidades Principales

### **1. 👤 Sistema de Personajes**
- **Creador completo** con Point Buy system oficial D&D 5e
- **Sistema de monedas** (Platino, Oro, Electrum, Plata, Cobre)
- **Gestión de estadísticas** con cálculos automáticos
- **Inventario dinámico** con integración a tienda
- **Habilidades y competencias** configurables
- **Notas y personalización** completa

### **2. 🛒 Sistema de Tienda**
- **Carrito de compras** funcional con gestión de cantidades
- **5 tiendas especializadas** con inventarios únicos
- **Conversión automática** de monedas D&D 5e
- **Filtros avanzados** por categoría, rareza y búsqueda
- **Validación de fondos** en tiempo real
- **Historial de transacciones** persistente
- **Integración completa** con personajes

### **3. 🎲 Sistema de Dados**
- **Todos los tipos** de dados D&D (d4, d6, d8, d10, d12, d20, d100)
- **Modificadores** personalizables
- **Animaciones visuales** durante lanzamientos
- **Historial persistente** de todos los lanzamientos
- **Sincronización Bluetooth** entre dispositivos

### **4. ⚔️ Rastreador de Combate**
- **Iniciativa automática** con orden de turnos
- **Gestión de HP** en tiempo real
- **Condiciones de estado** aplicables
- **Integración con personajes** y su equipo
- **Plantillas de NPCs** predefinidas
- **Encuentros persistentes** guardados

### **5. 📚 Gestión de Campañas**
- **CRUD completo** para campañas
- **NPCs con plantillas** predefinidas y personalizables
- **Sistema de ubicaciones** con tipos y descripciones
- **Sesiones de campaña** con registro detallado
- **Estados de campaña** (planificación, activa, completada)
- **Campaña de ejemplo** "La Mina Perdida de Phandelver"

### **6. 🗺️ Sistema de Mapas**
- **Navegación fluida** con zoom y paneo
- **Marcadores configurables** con tipos y visibilidad
- **Herramienta de medición** con escala en pies
- **Cuadrícula configurable** opcional
- **3 mapas de ejemplo** preconfigurados
- **Gestión de visibilidad** para jugadores vs DM

### **7. 🔵 Conectividad Bluetooth**
- **Web Bluetooth API** para navegadores compatibles
- **Detección automática** de dispositivos D&D
- **Sincronización en tiempo real** de eventos
- **Manejo robusto** de errores y reconexión
- **Información detallada** de dispositivos conectados

## 💾 Gestión de Datos

### **Almacenamiento Local**
- **LocalForage** como capa de abstracción
- **IndexedDB** como almacenamiento principal
- **Fallback a localStorage** si IndexedDB no está disponible
- **Estructura normalizada** de datos
- **Validación completa** de integridad

### **Tipos de Datos Almacenados**
- Personajes con estadísticas completas
- Tiendas con inventarios dinámicos
- Transacciones de compra/venta
- Campañas con NPCs y ubicaciones
- Encuentros de combate
- Mapas con marcadores
- Historial de dados
- Configuraciones de usuario

### **Funciones de Backup**
- **Exportación completa** en formato JSON
- **Importación** de datos (preparado)
- **Limpieza selectiva** de datos
- **Validación** de estructura al cargar

## 🎨 Diseño y UX

### **Paleta de Colores**
- **Primario**: Amber/Dorado (#D97706, #F59E0B)
- **Secundario**: Gradientes complementarios
- **Estados**: Verde (éxito), Rojo (error), Azul (información)
- **Neutros**: Grises para texto y fondos

### **Principios de Diseño**
- **Responsive First**: Diseño móvil prioritario
- **Accesibilidad**: Contraste adecuado y navegación por teclado
- **Consistencia**: Componentes y patrones reutilizables
- **Feedback Visual**: Estados hover, loading y transiciones
- **Jerarquía Clara**: Tipografía y espaciado estructurado

### **Componentes de UI**
- **Sidebar fijo** con navegación principal
- **Cards interactivas** con efectos hover
- **Modales responsivos** para formularios
- **Botones con estados** y feedback visual
- **Formularios estructurados** con validación
- **Notificaciones** contextuales

## 📱 Soporte Móvil

### **PWA (Progressive Web App)**
- **Manifest completo** con iconos y configuración
- **Service Worker** para cache y offline
- **Instalación** en dispositivos móviles
- **Notificaciones** push (preparado)

### **APK Nativa (Android)**
- **Capacitor 5** para bridge nativo-web
- **Permisos Bluetooth** completos para Android
- **Optimizaciones** específicas para móvil
- **Scripts de construcción** automatizados

### **Responsividad**
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Componentes adaptativos** según tamaño de pantalla
- **Navegación móvil** con menú hamburguesa
- **Touch-friendly** con áreas de toque adecuadas

## 🔧 Configuración y Scripts

### **Scripts Disponibles**
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construcción para producción
npm run preview      # Vista previa de build
npm run lint         # Linting con ESLint
```

### **Scripts de Capacitor**
```bash
npm run build:mobile    # Build + sync móvil
npm run android:dev     # Ejecutar en dispositivo
npm run android:build   # Construir APK
npm run android:open    # Abrir Android Studio
```

### **Configuración de Vite**
- **Plugins**: React, PWA
- **Optimizaciones**: Chunking, minificación
- **Desarrollo**: HTTPS opcional, hot reload
- **Build**: Target ES2020, Terser minification

## 🚀 Estado del Proyecto

### **Funcionalidades Completadas** ✅
- [x] Sistema de personajes completo con monedas
- [x] Tienda con carrito de compras funcional
- [x] Lanzador de dados con historial
- [x] Rastreador de combate avanzado
- [x] Gestión de campañas con NPCs
- [x] Sistema de mapas interactivo
- [x] Conectividad Bluetooth básica
- [x] Almacenamiento local robusto
- [x] Diseño responsivo completo
- [x] PWA con Service Worker

### **En Desarrollo** 🔄
- [ ] Bluetooth nativo para APK
- [ ] Importación de datos
- [ ] Notificaciones push
- [ ] Más plantillas de NPCs
- [ ] Sistema de hechizos expandido

### **Futuras Mejoras** 📋
- [ ] Modo oscuro
- [ ] Más tipos de tiendas
- [ ] Sistema de logros
- [ ] Integración con APIs externas
- [ ] Multiplataforma (iOS)

## 🎯 Casos de Uso Principales

### **Para Jugadores**
1. **Crear personaje** con Point Buy system
2. **Gestionar monedas** y comprar equipo
3. **Lanzar dados** con modificadores
4. **Participar en combate** con iniciativa
5. **Conectar vía Bluetooth** con otros jugadores

### **Para Dungeon Masters**
1. **Gestionar campañas** completas
2. **Crear NPCs** con plantillas
3. **Configurar encuentros** de combate
4. **Usar mapas interactivos** con marcadores
5. **Coordinar sesión** vía Bluetooth

### **Para Grupos**
1. **Sesiones multijugador** con Bluetooth
2. **Compartir resultados** de dados
3. **Sincronizar combates** en tiempo real
4. **Gestionar tienda grupal** con transacciones
5. **Colaborar en mapas** con marcadores

## 🔍 Consideraciones Técnicas

### **Rendimiento**
- **Lazy loading** de componentes
- **Memoización** de cálculos pesados
- **Virtualización** para listas largas
- **Optimización** de imágenes
- **Code splitting** por rutas

### **Seguridad**
- **Validación** de datos en cliente
- **Sanitización** de inputs
- **Encriptación** de mensajes Bluetooth
- **Almacenamiento seguro** local

### **Compatibilidad**
- **Navegadores modernos** con ES2020
- **Web Bluetooth** (Chrome, Edge, Opera)
- **Android 6+** para APK nativa
- **PWA** en iOS y Android

### **Escalabilidad**
- **Arquitectura modular** para nuevas funciones
- **Tipos TypeScript** bien definidos
- **Servicios desacoplados** para fácil testing
- **Patrones consistentes** para mantenimiento

## 📚 Recursos y Referencias

### **D&D 5e**
- Sistema oficial de monedas y conversiones
- Reglas de creación de personajes
- Estadísticas y modificadores oficiales
- Plantillas de NPCs del Manual de Monstruos

### **Tecnologías**
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Capacitor](https://capacitorjs.com/)

### **Herramientas de Desarrollo**
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/)
- [LocalForage](https://localforage.github.io/localForage/)

---

**Última actualización**: Diciembre 2024  
**Estado**: Completamente Funcional con Sistema de Tienda  
**Próxima versión**: 2.1.0 con Bluetooth nativo mejorado