const puppeteer = require('puppeteer');

async function getEmbedContent(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('embed');  // Ensure the <embed> element is loaded

  const embedContent = await page.$eval('embed', (embed) => embed.src);
  await browser.close();
  return embedContent;
}

module.exports = { getEmbedContent };
