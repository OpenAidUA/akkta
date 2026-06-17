import 'server-only';
import playwright, { chromium, type Browser } from 'playwright-core';
import { renderActHtml, type ActTemplateData } from './template';

let browserInstance: Browser | null = null;

const isLocal = process.env.NODE_ENV === 'development';

async function getBrowser(): Promise<Browser> {
  if (browserInstance?.isConnected()) {
    return browserInstance;
  }

  if (isLocal) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });
  } else {
    const chromium = (await import('@sparticuz/chromium')).default;

    browserInstance = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  return browserInstance;
}

/**
 * Generates a PDF buffer from act data using Playwright (headless Chromium).
 */
export async function generateActPdf(data: ActTemplateData): Promise<Buffer> {
  const html = renderActHtml(data);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '15mm',
        right: '20mm',
        bottom: '15mm',
        left: '20mm',
      },
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

/**
 * Gracefully close the browser (for cleanup on server shutdown).
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance?.isConnected()) {
    await browserInstance.close();
    browserInstance = null;
  }
}
