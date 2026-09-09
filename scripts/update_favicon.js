import fs from 'fs';

const userLogo = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/112f378a-ecb9-4478-8636-5758060a1358/.user_uploaded/media_1788975535490.jpg';

if (fs.existsSync(userLogo)) {
    fs.copyFileSync(userLogo, 'd:/PC/csg-tool/public/favicon.png');
    fs.copyFileSync(userLogo, 'd:/PC/csg-tool/public/favicon.jpg');
    fs.copyFileSync(userLogo, 'd:/PC/csg-tool/public/favicon.ico');
    fs.copyFileSync(userLogo, 'd:/PC/csg-tool/resources/icon.png');
    console.log('✅ Favicon files have been overwritten with the new yellow Cóc Sài Gòn logo!');
} else {
    console.log('❌ User logo file not found');
}
