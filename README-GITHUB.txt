COSTA NORTE SPORT - PUBLICACIÓN EN GITHUB PAGES

1. Crear un repositorio nuevo en GitHub, por ejemplo:
   costa-norte-sport

2. Subir al repositorio estos 4 archivos:
   index.html
   app.js
   manifest.json
   sw.js

3. En GitHub:
   Settings -> Pages
   Source: Deploy from a branch
   Branch: main
   Folder: / (root)
   Guardar.

4. GitHub generará una dirección HTTPS para la aplicación.

5. Abrir esa dirección desde Chrome en Android.
   Menú -> Agregar a pantalla de inicio / Instalar aplicación.

IMPORTANTE:
- Esta versión guarda los datos localmente en el navegador/dispositivo.
- No tiene todavía una base de datos en la nube.
- WhatsApp automático se agregará en una etapa posterior.


Versión v5: estado de reserva automático según seña. Seña $0 = Pendiente de seña; seña > $0 = Confirmada. El saldo se calcula automáticamente.


CORRECCIÓN v5:
- El estado se recalcula automáticamente según la seña.
- Seña $0 = Pendiente de seña.
- Seña mayor a $0 = Confirmada.
- El saldo se recalcula al modificar precio o seña.
- Se actualizó la caché del Service Worker para evitar cargar la versión anterior.
