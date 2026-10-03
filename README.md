# DoAide Draw — Free Online Whiteboard

A free, no-login online whiteboard and drawing tool at [draw.doaide.com](https://draw.doaide.com).

## Features

- **Freehand Drawing** — Smooth brush with adjustable width and opacity
- **Shape Tools** — Rectangle, circle, line, arrow, triangle, star, diamond
- **Text Tool** — Add text anywhere on the canvas
- **Sticky Notes** — Colored sticky notes with text
- **Eraser** — Erase drawings
- **Selection** — Select, move, resize, rotate objects
- **Pen/Brush Options** — Size (1-20px), colors, opacity
- **Fill Colors** — Fill shapes with colors
- **Grid/Dot Background** — Toggle grid or dot pattern background
- **Undo/Redo** — Full history (Ctrl+Z / Ctrl+Y)
- **Layers** — Basic layer support with visibility and lock
- **Export** — Download as PNG, SVG, or JSON
- **Import** — Load previously saved JSON drawings
- **Dark/Light Mode** — Toggle between themes
- **Infinite Canvas** — Pan (Space/H) and zoom (scroll wheel)
- **Keyboard Shortcuts** — V (select), P (pen), E (eraser), R (rect), C (circle), etc.
- **Share** — Share drawings on WhatsApp and Twitter/X with DoAide watermark

## Tech Stack

- React + TypeScript
- Vite
- react-konva / Konva
- Tailwind CSS

## Development

```bash
npm install
npm run dev
```

Dev server runs on `172.18.0.1:3060`.

## Build & Deploy

```bash
npm run build
```

### Production (systemd)

```bash
# Copy files to server
scp -r dist/ root@89.167.8.178:/opt/DoAide-Draw/dist/
scp doaide-draw.service root@89.167.8.178:/etc/systemd/system/

# On server
npm install -g serve
systemctl daemon-reload
systemctl enable doaide-draw
systemctl start doaide-draw
```

## License

Proprietary — DoAide
