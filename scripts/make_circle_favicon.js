import fs from 'fs';
import path from 'path';

const userLogoPath = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/112f378a-ecb9-4478-8636-5758060a1358/.user_uploaded/media_1788975773390.jpg';

if (fs.existsSync(userLogoPath)) {
    const imgBuffer = fs.readFileSync(userLogoPath);
    const base64Img = imgBuffer.toString('base64');
    
    // Create perfect SVG with circular clipping mask
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <clipPath id="circleView">
      <circle cx="256" cy="256" r="252" />
    </clipPath>
  </defs>
  <image href="data:image/jpeg;base64,${base64Img}" width="512" height="512" preserveAspectRatio="xMidYMid slice" clip-path="url(#circleView)" />
</svg>`;

    fs.writeFileSync('d:/PC/csg-tool/public/favicon.svg', svgContent, 'utf8');
    console.log('✅ Successfully created public/favicon.svg (Pure Circular Icon)!');
} else {
    console.error('❌ Source image not found');
}
