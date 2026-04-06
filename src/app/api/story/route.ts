import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v138.0.1/chromium-v138.0.1-pack.tar",
    );

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
      defaultViewport: { width: 1080, height: 1920 },
    });

    const page = await browser.newPage();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    await page.goto(
      `${baseUrl}/story-render?username=${encodeURIComponent(username)}`,
      { waitUntil: "networkidle0" },
    );

    const png = (await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1080, height: 1920 },
    })) as Uint8Array;

    await page.close();
    await browser.close();

    return new NextResponse(Buffer.from(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    if (browser) await browser.close();
    return NextResponse.json(
      { error: "Failed to generate PNG", detail: String(err) },
      { status: 500 },
    );
  }
}
