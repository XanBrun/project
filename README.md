# 🎲 D&D Local - Compañero de Aventuras

Una aplicación web completa para gestionar aventuras de Dungeons & Dragons 5e con conectividad Bluetooth local para juego multijugador.

![D&D Local](https://images.pexels.com/photos/1040157/pexels-photo-1040157.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Características Principales

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
- **Resultados detallados** con suma automática

### ⚔️ **Rastreador de Combate**
- **Iniciativa automática** con orden de turnos
- **Gestión de HP** en tiempo real
- **Condiciones de estado** aplicables
- **Encuentros persistentes** guardados automáticamente
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

### 📱 **Conectividad Bluetooth**
- **Multijugador local** sin necesidad de internet
- **Sincronización** de dados, personajes y eventos
- **Detección automática** de dispositivos compatibles
- **Manejo robusto** de conexiones y errores

## 🚀 Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos responsivos
- **React Router** para navegación
- **Zustand** para gestión de estado global
- **LocalForage** para almacenamiento local
- **Lucide React** para iconografía
- **Web Bluetooth API** para conectividad
- **PWA** con Service Worker para uso offline

## 🎮 Tiendas Incluidas

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
- **Integración completa** con personajes

## 🎯 Ejemplo de Juego Completo

1. **Crea tu Héroe**: Diseña un personaje con 100 monedas de oro iniciales
2. **Equipa tu Aventurero**: Visita tiendas especializadas con inventarios únicos
3. **Únete a la Campaña**: Explora "La Mina Perdida de Phandelver"
4. **Combate Épico**: Usa tu equipo en combate con iniciativa automática

## 📱 Instalación y Uso

### Requisitos
- Navegador moderno con soporte para Web Bluetooth
- HTTPS o localhost para funcionalidad Bluetooth
- JavaScript habilitado

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

### Navegadores Compatibles
- ✅ Chrome 56+
- ✅ Edge 79+
- ✅ Opera 43+
- ❌ Firefox (sin soporte Web Bluetooth)
- ❌ Safari (sin soporte Web Bluetooth)

## 🔧 Configuración

### Bluetooth
- La aplicación detecta automáticamente el soporte Bluetooth
- Requiere contexto seguro (HTTPS o localhost)
- Emparejamiento manual de dispositivos

### Almacenamiento
- Todos los datos se guardan localmente
- No requiere conexión a internet
- Función de exportación/importación de datos

## 📊 Características Técnicas

### Arquitectura
- **Componentes modulares** con separación clara de responsabilidades
- **Tipos TypeScript** bien definidos para toda la aplicación
- **Servicios reutilizables** para Bluetooth y base de datos
- **Estado global** gestionado con Zustand
- **Manejo robusto de errores** en todas las operaciones

### Rendimiento
- **Lazy loading** de componentes
- **Optimización de bundle** con chunks separados
- **Cache inteligente** para imágenes externas
- **PWA** para uso offline

### Seguridad
- **Validación de datos** en todas las operaciones
- **Sanitización** de entradas de usuario
- **Manejo seguro** de conexiones Bluetooth
- **Almacenamiento local** sin exposición de datos

## 🎨 Diseño

### Tema Visual
- **Paleta dorada/amber** inspirada en D&D
- **Gradientes elegantes** y efectos de profundidad
- **Iconografía consistente** con Lucide React
- **Animaciones suaves** y micro-interacciones
- **Diseño responsivo** para móviles y desktop

### Experiencia de Usuario
- **Navegación intuitiva** con sidebar fijo
- **Feedback visual** en todas las acciones
- **Estados de carga** y animaciones
- **Mensajes claros** de error y éxito
- **Accesibilidad** mejorada

## 📈 Estado del Proyecto

**Versión**: 1.0.0  
**Estado**: Completamente Funcional ✅  
**Última actualización**: Diciembre 2024

### Funcionalidades Implementadas
- ✅ Sistema de personajes completo
- ✅ Tienda con carrito de compras
- ✅ Sistema de monedas D&D 5e
- ✅ Lanzador de dados avanzado
- ✅ Rastreador de combate
- ✅ Gestión de campañas
- ✅ Mapas interactivos
- ✅ Conectividad Bluetooth
- ✅ Almacenamiento local
- ✅ PWA con Service Worker

## 🤝 Contribución

Este proyecto está diseñado para ser una herramienta completa para jugadores de D&D. Las contribuciones son bienvenidas para:

- Nuevos objetos y tiendas
- Mejoras en la interfaz
- Optimizaciones de rendimiento
- Corrección de errores
- Nuevas características

## 📄 Licencia

Proyecto de código abierto para la comunidad de D&D.

---

**¡Que comience la aventura!** 🐉⚔️🎲