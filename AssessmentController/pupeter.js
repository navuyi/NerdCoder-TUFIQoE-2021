const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    //await page.screenshot({ path: 'example.png' });

    setTimeout(async ()=>{
        await browser.close();
    }, 3000);

})();