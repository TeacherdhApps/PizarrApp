# 🚀 Guía: Convertir la Pizarra en una Mini App de Telegram

Hemos añadido y configurado con éxito el **Telegram Web Apps SDK** en la aplicación. La pizarra ya está preparada para:
1. **Inicializarse** automáticamente al abrirse dentro de Telegram.
2. **Expandirse** al alto completo del viewport disponible en el chat.
3. **Sincronizar colores** de la cabecera (`header`) y fondo de Telegram con el diseño premium oscuro de la pizarra.

---

## 🛠️ Paso 1: Crear tu Bot y Mini App en Telegram

Para que tu pizarra funcione dentro de Telegram, necesitas registrar un Bot y asociarle una Web App:

1. Abre Telegram y busca al [**@BotFather**](https://t.me/BotFather).
2. Envía el comando `/newbot` y sigue las instrucciones para darle un nombre y un nombre de usuario a tu bot.
3. Cuando esté listo, envía el comando `/newapp`.
4. Selecciona tu bot recién creado.
5. Introduce los detalles solicitados:
   - **Title**: El título de tu Mini App (ej. *Pizarra Táctica*).
   - **Description**: Breve descripción.
   - **Photo/GIF**: Sube una imagen promocional (puedes usar un PNG exportado de la pizarra).
6. **Web App URL**: Aquí debes configurar la dirección URL donde hospedarás la aplicación.
   - *Para producción:* La URL de tu hosting (ej. Vercel, Netlify, GitHub Pages).
   - *Para desarrollo local:* Lee el Paso 3 para usar un túnel seguro local.
7. Elige un **Short Name** (nombre corto para el enlace directo, ej. `t.me/TuBot/pizarra`).

---

## 🌐 Paso 2: Despliegue (Hosting)

Para producción, puedes compilar la app y subirla a cualquier plataforma de hosting estático gratuita:

```bash
# Generar la carpeta de producción dist/
npm run build
```

Sube el contenido de la carpeta `dist/` a:
* **Vercel** (`vercel deploy`)
* **Netlify**
* **Cloudflare Pages**
* **GitHub Pages**

---

## 💻 Paso 3: Probar en Local (Desarrollo)

Telegram requiere enlaces **HTTPS** obligatoriamente para cargar Mini Apps. Para probarla en tu ordenador de forma local:

1. Inicia tu servidor de desarrollo local de Vite:
   ```bash
   npm run dev
   ```
   *(Por defecto correrá en algo como `http://localhost:5173`)*
2. Crea un túnel HTTPS seguro usando **ngrok** o **localtunnel**:
   ```bash
   # Con localtunnel
   npx localtunnel --port 5173
   
   # O con ngrok
   ngrok http 5173
   ```
3. Copia la URL HTTPS que te proporcione el túnel (ej. `https://XXXX-XX-XX.loca.lt` o `https://XXXX.ngrok-free.app`).
4. Configura esa URL HTTPS en **@BotFather** mediante `/newapp` o modificando la configuración de la app existente con `/editapp`.
5. Abre el enlace directo de tu Mini App en Telegram para interactuar y programar en tiempo real.

---

## 💎 Características Integradas de Telegram

- **Carga Instantánea:** La biblioteca se carga desde el CDN oficial de Telegram y es validada por la política CSP robusta que implementamos.
- **Header Seamless:** La parte superior de la ventana del Mini App se funde con el tono oscuro `#12121a` de tu barra superior.
- **Seguridad Garantizada:** Conservamos la protección de inyección y XSS gracias a las reglas estrictas de cabecera.
