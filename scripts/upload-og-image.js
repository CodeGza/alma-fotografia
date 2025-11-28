const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dav2dvukf',
  api_key: '935116792182475',
  api_secret: 'GicB1_-_Xs8pupFeJ6Q1hJBl0EU',
});

async function uploadOGImage() {
  try {
    console.log('Creando imagen OG...');

    const logoPath = path.join(__dirname, '../public/img/logos/logo_BN_SF.png');
    const outputPath = path.join(__dirname, '../public/og-image.png');

    // Crear imagen OG localmente con sharp (1200x630, logo centrado)
    // Primero crear fondo gris
    const background = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 3,
        background: { r: 45, g: 45, b: 45 } // #2D2D2D
      }
    }).png().toBuffer();

    // Redimensionar logo para que quepa bien (ancho máximo 600px para que sea visible pero no enorme)
    const resizedLogo = await sharp(logoPath)
      .resize(600, 300, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Obtener dimensiones del logo redimensionado
    const logoMeta = await sharp(resizedLogo).metadata();

    // Calcular posición para centrar
    const left = Math.floor((1200 - logoMeta.width) / 2);
    const top = Math.floor((630 - logoMeta.height) / 2);

    // Componer imagen final
    await sharp(background)
      .composite([{ input: resizedLogo, left, top }])
      .png()
      .toFile(outputPath);

    console.log('✅ Imagen OG creada localmente:', outputPath);

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      folder: 'alma-fotografia',
      public_id: 'og-image-final',
      overwrite: true,
    });

    console.log('✅ Subida a Cloudinary!');
    console.log('\n📋 URL para Open Graph:');
    console.log(result.secure_url);

    // Limpiar archivo temporal
    fs.unlinkSync(outputPath);

  } catch (error) {
    console.error('Error:', error);
  }
}

uploadOGImage();
