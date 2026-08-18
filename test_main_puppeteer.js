import puppeteer from 'puppeteer';
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('http://localhost:5174');
    // Click login
    await page.waitForSelector('.login-btn', {timeout: 5000});
    console.log("Found login button, clicking...");
    await page.click('.login-btn');
    await page.waitForTimeout(2000);
    console.log("Done");
    await browser.close();
})();
