import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const targetUrl = `${base}/story-render?username=${encodeURIComponent(username)}`;

  let browser: puppeteer.Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    // helps prevent blocked resources in some envs
    await page.setExtraHTTPHeaders({
      "x-story-render": "1",
    });

    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });

    const png = await page.screenshot({
      type: "png",
      fullPage: false,
      clip: { x: 0, y: 0, width: 1080, height: 1920 },
    });

    return new NextResponse(png, {
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
  } finally {
    if (browser) await browser.close();
  }
}
