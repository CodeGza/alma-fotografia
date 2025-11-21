const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = path.join(__dirname, '..', 'public', 'img', 'logos', 'Logo_Blanco.png');
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

async function generateFavicons() {
  console.log('🎨 Generando favicons desde Logo_Blanco.png...\n');

  try {
    // Verificar que la imagen existe
    if (!fs.existsSync(sourceImage)) {
      throw new Error(`No se encuentra la imagen: ${sourceImage}`);
    }

    // 1. favicon.ico (múltiples tamaños en un archivo ICO)
    console.log('📦 Generando favicon.ico (16x16, 32x32, 48x48)...');

    // Para favicon.ico, generamos el tamaño más común (32x32)
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✅ favicon.ico creado');

    // 2. icon.png para Next.js App Router (180x180 recomendado)
    console.log('📦 Generando icon.png (180x180)...');
    await sharp(sourceImage)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(appDir, 'icon.png'));
    console.log('✅ icon.png creado');

    // 3. apple-touch-icon.png para iOS (180x180)
    console.log('📦 Generando apple-icon.png (180x180)...');
    await sharp(sourceImage)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(appDir, 'apple-icon.png'));
    console.log('✅ apple-icon.png creado');

    // 4. PWA icons para manifest.json
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    console.log('📦 Generando iconos PWA para manifest.json...');

    const iconsDir = path.join(publicDir, 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    for (const size of sizes) {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      console.log(`  ✅ icon-${size}x${size}.png creado`);
    }

    console.log('\n🎉 ¡Todos los favicons generados exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Actualizar public/manifest.json con los nuevos iconos');
    console.log('   2. Los iconos en src/app/ serán detectados automáticamente por Next.js');

  } catch (error) {
    console.error('❌ Error generando favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
