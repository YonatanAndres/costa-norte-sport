COSTA NORTE SPORT - PUBLICACIÓN EN GITHUB PAGES

V7 - módulos principales sin WhatsApp

Archivos: index.html, app.js, manifest.json, sw.js

Incluye:
- Estado automático: seña $0 = Pendiente de seña; seña > $0 = Confirmada.
- Saldo automático.
- Prevención de duplicados y reemplazo opcional de una reserva pendiente por una confirmada.
- Reservas fijas por día de semana, con pausa/cancelación y duración de 1 a 3 horas.
- Bloqueo manual de horarios.
- Clientes reutilizables, autocompletado, historial y acceso a nueva reserva/reserva fija.
- Historial de reservas y cancelaciones.
- Configuración editable de precio, seña, canchas y horarios.
- Exportación/importación de respaldo JSON para no perder los datos al limpiar el navegador.
- WhatsApp queda para la siguiente etapa.

Publicación:
1. Reemplazar en GitHub los archivos existentes por los 4 archivos principales.
2. Commit changes.
3. Esperar a GitHub Pages y abrir la aplicación.
4. Si el teléfono conserva una versión vieja, cerrar la app/PWA y volver a abrirla; el Service Worker de V7 elimina la caché anterior.

IMPORTANTE: los datos siguen siendo locales en este dispositivo. El respaldo JSON es recomendable antes de limpiar datos del navegador o cambiar de dispositivo.
