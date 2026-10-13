# Manual de Cableado Ethernet — T568A / T568B

Proyecto web interactivo (HTML + CSS + JavaScript puro) que sirve como manual práctico
para aprender los colores de un cable de red (Ethernet) según los estándares **T568A** y **T568B**.

## Contenido

- Introducción y terminología clave
- Código de colores para T568A y T568B (tabla + diagrama visual del conector RJ45)
- Cable directo vs. cable cruzado (con selector de escenario)
- Herramientas necesarias
- Guía paso a paso para crimpar un cable RJ45
- Mini quiz interactivo (5 preguntas)
- Errores comunes y buenas prácticas

## Cómo usar

Basta con abrir `index.html` en cualquier navegador moderno. No requiere instalación ni build.

```bash
# Opcional: servidor local
python -m http.server 8000
# luego abre http://localhost:8000
```

## Archivos

- `index.html` — estructura y contenido
- `styles.css` — estilos, tema claro/oscuro y responsive
- `script.js` — interactividad (cambio de estándar, selector, quiz)
- `game.html` — juego interactivo de memorización del orden
- `game.css` — estilos del juego
- `game.js` — lógica del juego (modos, puntuación, rachas)

## Juego incluido

Abre `game.html` para practicar:

- **Práctica**: sin límite de tiempo.
- **Contrarreloj**: 45 s por ronda (bono por tiempo + bono de velocidad).
- **Desafío**: 3 vidas y 35 s por ronda.
- **Extremo**: 2 vidas, 20 s por ronda y ×1.5 de puntos.
- El tiempo se reduce 2 s cada ronda (mín. 15 s).
- Cuenta regresiva 3-2-1, sonido y tensión visual cerca del final.
- Arrastra o toca los conductores para colocarlos en los 8 pines.
- Modo rápido "adivina el pin" con sistema de rachas.
- Guarda tu récord en el navegador.

## Licencia

Uso libre con fines educativos.
