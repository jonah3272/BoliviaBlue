import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  const images = [
    {
      input: 'header-og-image.jpg',
      output: 'header-og-image',
      sizes: [
        { width: 320, suffix: '-320w' },
        { width: 640, suffix: '-640w' },
        { width: 1280, suffix: '-1280w' }
      ]
    }
  ];

  for (const img of images) {
    const inputPath = path.join(publicDir, img.input);
    
    // Check if file exists
    try {
      await fs.access(inputPath);
    } catch (err) {
      console.log(`⚠️  Skipping ${img.input} - file not found`);
      continue;
    }

    console.log(`📸 Processing: ${img.input}`);

    // Generate WebP versions at different sizes
    for (const size of img.sizes) {
      const outputPath = path.join(publicDir, `${img.output}${size.suffix}.webp`);
      
      await sharp(inputPath)
        .resize(size.width)
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      const stats = await fs.stat(outputPath);
      console.log(`  ✅ Created ${path.basename(outputPath)} (${(stats.size / 1024).toFixed(2)} KB)`);
    }

    // Also create a full-size WebP
    const fullSizeOutput = path.join(publicDir, `${img.output}.webp`);
    await sharp(inputPath)
      .webp({ quality: 90 })
      .toFile(fullSizeOutput);
    
    const fullStats = await fs.stat(fullSizeOutput);
    console.log(`  ✅ Created ${path.basename(fullSizeOutput)} (${(fullStats.size / 1024).toFixed(2)} KB)\n`);
  }

  console.log('✨ Image optimization complete!');
}

optimizeImages().catch(console.error);

