import fs from 'fs';

const userLogo = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/112f378a-ecb9-4478-8636-5758060a1358/.user_uploaded/media_1788975773390.jpg';

if (fs.existsSync(userLogo)) {
    fs.copyFileSync(userLogo, 'd:/PC/csg-tool/public/favicon.jpg');
    fs.copyFileSync(userLogo, 'd:/PC/csg-tool/public/favicon.png');
    fs.copyFileSync(userLogo, 'd:/PC/csg-tool/public/favicon.ico');
    fs.copyFileSync(userLogo, 'd:/PC/csg-tool/resources/icon.png');
    console.log('✅ Successfully copied new Cóc Sài Gòn red/bronze drum logo to favicon.jpg, favicon.png, favicon.ico!');
} else {
    console.log('❌ File not found');
}
