/**
 * Script para intercambiar el código por el refresh token
 */

import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const code = '4/0Ab32j911Z81kE7n3foWo-ovYuhgTXDb9OMX_iK6pCdJpF8pfCaOGHveHuJzVTm6Y8tA2eQ';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/callback'
);

try {
  console.log('🔄 Intercambiando código por token...\n');

  const { tokens } = await oauth2Client.getToken(code);

  console.log('✅ ¡Token obtenido exitosamente!\n');
  console.log('📋 GOOGLE_REFRESH_TOKEN para Vercel:\n');
  console.log('───────────────────────────────────────────────────────');
  console.log(tokens.refresh_token);
  console.log('───────────────────────────────────────────────────────\n');
  console.log('🔧 Copia este token y actualízalo en Vercel:');
  console.log('   Settings → Environment Variables → GOOGLE_REFRESH_TOKEN\n');

} catch (error) {
  console.error('\n❌ Error obteniendo el token:', error.message);
  process.exit(1);
}
