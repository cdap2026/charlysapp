/* Genera index.html (archivo único y autocontenido) a partir de:
   - src/app/globals.css  → CSS embebido (sin el import de Tailwind)
   - scripts/standalone.js → lógica de la app
   - public/images + public/icons → imágenes en base64
   Uso:  node scripts/build-index.js
*/
const fs = require("fs");
const read = (p) => fs.readFileSync(p, "utf8");
const bin = (p) => fs.readFileSync(p);

let css = read("src/app/globals.css").replace(/@import\s+"tailwindcss";?/, "").trim();

const extra = `
:root{--font-manrope:"Manrope",Arial,sans-serif}
body{font-family:"Manrope",Arial,sans-serif;-webkit-tap-highlight-color:transparent}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.exercise-visual.tone-squat{background:#eaf5ed;color:#3c9474}
.exercise-visual.tone-lunge{background:#fcf0e7;color:#c79572}
.exercise-visual.tone-press{background:#f1edf9;color:#9381b4}
.exercise-visual.tone-plank{background:#eaf2f8;color:#7399ba}
.media-banner>.banner-art{position:absolute;right:24px;top:13px;bottom:13px;width:238px;display:grid;place-items:center;background:linear-gradient(140deg,#ffffffd9,#edf4e9);border:3px solid #fffffff0;border-radius:9px;box-shadow:0 14px 30px #3f5c3a24;z-index:2;overflow:hidden}
.banner-art>svg{width:100%;height:100%;display:block;animation:bannerImg 12s ease-in-out infinite}
.help-3d-standalone{display:grid;place-items:center;background:linear-gradient(120deg,#eef4ea,#f7faf3)}
.help-3d-standalone>svg{height:100%;max-width:52%;display:block;animation:floaty 7s ease-in-out infinite}
@media(max-width:640px){.media-banner>.banner-art{width:150px;right:11px;top:11px;bottom:11px;border-width:2px}}
@media(prefers-reduced-motion:reduce){[data-reveal]{opacity:1!important;transform:none!important}}
`;

const dataUrl = (p, mime) => "data:" + mime + ";base64," + bin(p).toString("base64");
const size = (p) => fs.statSync(p).size;

const front = dataUrl("public/images/posture-studio.png", "image/jpeg");
const lateral =
  size("public/images/posture-lateral.png") <= 450 * 1024
    ? dataUrl("public/images/posture-lateral.png", "image/png")
    : "images/posture-lateral.png";
const back =
  size("public/images/posture-back.png") <= 450 * 1024
    ? dataUrl("public/images/posture-back.png", "image/png")
    : "images/posture-back.png";
const appleIcon = dataUrl("public/icons/apple-touch-icon.png", "image/png");

const favicon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="13" fill="#168b75"/><g transform="translate(8 7)" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="7" r="3.3" fill="#fff" stroke="none"/><path d="m7 13 8-1 8 5m-8-5 2 9 8 4m-8-4-7 6"/></g></svg>';

const manifest = encodeURIComponent(
  JSON.stringify({
    name: "Punto de Juego · Ciencia en movimiento",
    short_name: "Punto de Juego",
    lang: "es",
    start_url: ".",
    scope: ".",
    display: "standalone",
    background_color: "#f7f9f7",
    theme_color: "#168b75",
    icons: [{ src: appleIcon, sizes: "180x180", type: "image/png", purpose: "any" }],
  })
);

const js = read("scripts/standalone.js")
  .split("IMGFRONT")
  .join(front)
  .split("IMGLATERAL")
  .join(lateral)
  .split("IMGBACK")
  .join(back);

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Punto de Juego · Ciencia en movimiento</title>
<meta name="description" content="Evaluación postural asistida por cámara, registros morfométricos y biométricos, y análisis de técnica en rutinas de ejercicio. Archivo único, sin servidor.">
<meta name="theme-color" content="#168b75">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Punto de Juego">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}">
<link rel="apple-touch-icon" href="${appleIcon}">
<link rel="manifest" href="data:application/manifest+json,${manifest}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${css}</style>
<style>${extra}</style>
</head>
<body>
<div id="app"></div>
<div id="modal-root"></div>
<div id="toast-root"></div>
<noscript><div style="padding:40px;font-family:Arial;text-align:center">Activa JavaScript para usar Punto de Juego.</div></noscript>
<script>${js}</script>
</body>
</html>
`;

fs.writeFileSync("index.html", html);
console.log("index.html:", (html.length / 1024).toFixed(0), "KB");
console.log(
  "fotos → frontal: embebida | lateral:",
  lateral.startsWith("data:") ? "embebida" : "relativa",
  "| posterior:",
  back.startsWith("data:") ? "embebida" : "relativa"
);
