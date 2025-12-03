/**
 * Script para obtener un nuevo Google Refresh Token
 *
 * Uso:
 * 1. Asegúrate de tener las credenciales en .env.local:
 *    - GOOGLE_CLIENT_ID
 *    - GOOGLE_CLIENT_SECRET
 *    - GOOGLE_REDIRECT_URI (http://localhost:3000/api/auth/callback)
 *
 * 2. Ejecuta: node scripts/getGoogleToken.js
 * 3. Sigue el enlace que se muestra
 * 4. Autoriza la app
 * 5. Copia el código de la URL de callback
 * 6. Pégalo cuando el script lo pida
 * 7. Copia el refresh_token que te dé y actualízalo en Vercel
 */

import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes necesarios para Google Calendar
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Generar URL de autorización
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Importante para obtener refresh token
  scope: SCOPES,
  prompt: 'consent' // Forzar consentimiento para obtener nuevo refresh token
});

console.log('\n🔐 OBTENER GOOGLE REFRESH TOKEN\n');
console.log('1️⃣  Abre este enlace en tu navegador:\n');
console.log(authUrl);
console.log('\n2️⃣  Autoriza la aplicación con tu cuenta de Google');
console.log('3️⃣  Serás redirigido a: http://localhost:3000/api/auth/callback?code=...');
console.log('4️⃣  Copia el CÓDIGO de la URL (todo lo que viene después de code=)\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('5️⃣  Pega el código aquí: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log('\n✅ ¡Token obtenido exitosamente!\n');
    console.log('📋 Copia este refresh_token y actualízalo en Vercel:\n');
    console.log('───────────────────────────────────────────────────────');
    console.log(tokens.refresh_token);
    console.log('───────────────────────────────────────────────────────\n');
    console.log('🔧 Para actualizar en Vercel:');
    console.log('   1. Ve a tu proyecto en Vercel');
    console.log('   2. Settings → Environment Variables');
    console.log('   3. Edita GOOGLE_REFRESH_TOKEN');
    console.log('   4. Pega el token de arriba');
    console.log('   5. Redeploy para que tome efecto\n');

  } catch (error) {
    console.error('\n❌ Error obteniendo el token:', error.message);
  }

  rl.close();
});
