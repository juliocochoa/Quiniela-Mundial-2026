# FIFA 2026 - Quiniela Mundial El Círculo (React App)

Este es un proyecto de React (Single Page Application) moderno, responsivo y dinámico, construido con **Vite**, **Tailwind CSS** y **React Router**. Integra en una sola interfaz interactiva las pantallas de Login, Pronósticos (My Picks), Resultados de Partidos y la Tabla de Clasificación Mundial.

## Estructura del Proyecto

El código está organizado de forma modular para seguir las mejores prácticas:

```
├── package.json                   # Dependencias de React y scripts de compilación
├── vite.config.js                 # Configuración de Vite
├── tailwind.config.js             # Configuración de colores corporativos de la FIFA y spacing
├── postcss.config.js              # Plugins CSS
├── index.html                     # Punto de entrada de la aplicación
├── app_preview.html               # ¡Prueba instantánea desde el navegador! (Sin instalar Node.js)
├── src/
│   ├── main.jsx                   # Inicialización y enrutamiento con BrowserRouter
│   ├── App.jsx                    # Componente principal, manejo del estado global y autenticación
│   ├── index.css                  # Estilos globales y clases Tailwind
│   └── components/
│       ├── Login.jsx              # Pantalla de inicio de sesión con validación de correo
│       ├── Picks.jsx              # Registro de predicciones y guardado persistente (localStorage)
│       ├── Results.jsx            # Marcadores en directo y finalizados, con filtros dinámicos
│       └── Leaderboard.jsx        # Tabla de posiciones mundial y podio de ganadores
```

---

## Cómo Ejecutar el Proyecto

Tienes dos formas de utilizar y probar esta aplicación:

### Opción 1: Visualización Instantánea (Recomendada si no tienes Node.js)
Hemos creado un archivo autónomo llamado **`app_preview.html`** en la raíz del proyecto.
1. Haz doble clic sobre [app_preview.html](file:///C:/Users/Julio/Documents/Proyectos/Quiniela%20Mundial%202026%20El%20Circulo/app_preview.html) para abrirlo en cualquier navegador (Chrome, Edge, Firefox).
2. Podrás navegar por las pantallas, iniciar sesión, ingresar goles, guardar tus picks, filtrar los resultados y realizar búsquedas de participantes en el Leaderboard. Funciona de manera idéntica al código de React compilado.

### Opción 2: Servidor de Desarrollo Local (Requiere Node.js y npm)
Una vez que tengas Node.js instalado en tu sistema, ejecuta los siguientes comandos en tu terminal dentro de esta carpeta:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
```

La consola te indicará la URL local (usualmente `http://localhost:5173`) para ver la aplicación web en tiempo real.
