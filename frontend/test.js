const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("Navigating to http://localhost:3000/");
    await page.goto("http://localhost:3000/");
    await page.waitForTimeout(1000);

    // If on login page, fill form
    if (page.url().includes("/auth")) {
        console.log("Filling login form...");
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');

        // submit
        console.log("Submitting login form...");
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(3000);
    }

    console.log("Current URL:", page.url());
    await page.screenshot({ path: 'dashboard.png' });

    const content = await page.content();
    fs.writeFileSync('dom.txt', content);

    console.log("Done");
    await browser.close();
})();
