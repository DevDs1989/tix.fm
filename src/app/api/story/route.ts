import { NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIDTH = 1080;
const HEIGHT = 1920;

let browserPromise: Promise<Browser> | null = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const targetUrl = `${base}/story-render?username=${encodeURIComponent(username)}`;

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
    });

    // IMPORTANT: don't block image requests
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 45000 });

    // tiny settle
    await new Promise((r) => setTimeout(r, 150));

    const png = (await page.screenshot({
      type: "png",
      fullPage: false,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    })) as Uint8Array;

    await page.close();

    const body = Buffer.from(png);

    return new NextResponse(body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "Content-Disposition": `inline; filename="${username}-story.png"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate PNG", detail: String(e) },
      { status: 500 },
    );
  }
}
