require('dotenv').config({ path: '.env.local' });
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function auditCloudinary() {
  try {
    console.log('\n📊 AUDITORÍA DE CLOUDINARY\n');
    console.log('='.repeat(60));

    // 1. Ver carpetas principales
    const folders = await cloudinary.api.root_folders();
    console.log('\n📁 CARPETAS PRINCIPALES:');
    folders.folders.forEach(f => console.log(`  - ${f.name}`));

    // 2. Ver recursos en alma-fotografia
    const almaResources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'alma-fotografia',
      max_results: 500,
    });

    console.log(`\n📸 ALMA-FOTOGRAFIA: ${almaResources.resources.length} archivos`);
    
    let totalBytes = 0;
    const byFolder = {};

    almaResources.resources.forEach(r => {
      totalBytes += r.bytes || 0;
      const folder = r.public_id.split('/')[1] || 'root';
      byFolder[folder] = (byFolder[folder] || 0) + (r.bytes || 0);
    });

    console.log('\n📊 DISTRIBUCIÓN POR CARPETA:');
    Object.entries(byFolder).forEach(([folder, bytes]) => {
      const mb = (bytes / 1024 / 1024).toFixed(2);
      console.log(`  - ${folder}: ${mb} MB`);
    });

    // 3. Ver archives si existen
    try {
      const archives = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'alma-fotografia/archives',
        resource_type: 'raw',
        max_results: 100,
      });

      if (archives.resources.length > 0) {
        console.log(`\n📦 ARCHIVES (ZIPs): ${archives.resources.length} archivos`);
        let archivesTotal = 0;
        archives.resources.forEach(r => {
          archivesTotal += r.bytes || 0;
          const mb = (r.bytes / 1024 / 1024).toFixed(2);
          console.log(`  - ${r.public_id}: ${mb} MB`);
        });
        const archivesMB = (archivesTotal / 1024 / 1024).toFixed(2);
        console.log(`  TOTAL ARCHIVES: ${archivesMB} MB`);
        totalBytes += archivesTotal;
      }
    } catch (e) {
      console.log('\n📦 ARCHIVES: No existen');
    }

    // 4. Ver galleries
    try {
      const galleries = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'galleries',
        max_results: 500,
      });

      if (galleries.resources.length > 0) {
        console.log(`\n🖼️ GALLERIES (fotos): ${galleries.resources.length} archivos`);
        let galleriesTotal = 0;
        galleries.resources.forEach(r => {
          galleriesTotal += r.bytes || 0;
        });
        const galleriesMB = (galleriesTotal / 1024 / 1024).toFixed(2);
        console.log(`  TOTAL: ${galleriesMB} MB`);
        totalBytes += galleriesTotal;
      }
    } catch (e) {
      console.log('\n🖼️ GALLERIES: No existen');
    }

    // 5. Ver gallery-covers
    try {
      const covers = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'gallery-covers',
        max_results: 100,
      });

      if (covers.resources.length > 0) {
        console.log(`\n🎨 GALLERY-COVERS: ${covers.resources.length} archivos`);
        let coversTotal = 0;
        covers.resources.forEach(r => {
          coversTotal += r.bytes || 0;
        });
        const coversMB = (coversTotal / 1024 / 1024).toFixed(2);
        console.log(`  TOTAL: ${coversMB} MB`);
        totalBytes += coversTotal;
      }
    } catch (e) {
      console.log('\n🎨 GALLERY-COVERS: No existen');
    }

    // RESUMEN FINAL
    const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
    console.log('\n' + '='.repeat(60));
    console.log(`\n💾 TOTAL CALCULADO: ${totalMB} MB`);
    console.log(`📊 CLOUDINARY REPORTA: 69.56 MB`);
    console.log(`❓ DIFERENCIA: ${(69.56 - totalMB).toFixed(2)} MB`);
    console.log('\n='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

auditCloudinary();