"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import StoryRenderCard, { type Artist } from "@/components/StoryRenderCard";

const PERIODS = [
  { label: "7 Days", value: "7day" },
  { label: "1 Month", value: "1month" },
  { label: "3 Months", value: "3month" },
  { label: "6 Months", value: "6month" },
  { label: "1 Year", value: "12month" },
  { label: "All Time", value: "overall" },
];

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [period, setPeriod] = useState("1month");
  const [loading, setLoading] = useState(false);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);

  const captureRef = useRef<HTMLDivElement | null>(null);

  const handleFetch = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    if (pngUrl) URL.revokeObjectURL(pngUrl);
    setPngUrl(null);

    try {
      const res = await fetch(
        `/api/lastfm?username=${encodeURIComponent(username.trim())}&period=${period}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch");

      const nextArtists = Array.isArray(data?.artists)
        ? data.artists.slice(0, 5)
        : [];
      setArtists(nextArtists);

      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const node = captureRef.current;
      if (!node) throw new Error("Capture node missing");

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#d9d6cf",
      });

      const blob = await (await fetch(dataUrl)).blob();
      const objectUrl = URL.createObjectURL(blob);
      setPngUrl(objectUrl);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pngUrl) return;
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `${username || "lastfm"}-story.png`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-[#d9d6cf] text-[#111]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <header className="border-b border-black/30 pb-4 sm:pb-5">
          <p className="text-[11px] sm:text-xs tracking-[0.2em] uppercase opacity-70">
            Powered by Last.fm | Made by Dev
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase leading-none sm:text-5xl lg:text-6xl">
            Tix.fm
          </h1>
          <p className="mt-2 text-sm sm:text-base opacity-75">
            Share your music taste
          </p>
        </header>

        <section className="mt-5 sm:mt-6 rounded-none border border-black/35 bg-[#dfddd7] p-4 sm:p-5 lg:p-6">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-[11px] sm:text-xs uppercase tracking-[0.18em] opacity-70"
              >
                Last.fm Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                className="h-11 sm:h-12 w-full border border-black/40 bg-[#e5e2db] px-3 sm:px-4"
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={loading || !username.trim()}
              className="h-11 sm:h-12 w-full md:w-auto border border-black/50 bg-black px-5 sm:px-6 text-sm font-bold uppercase tracking-wide text-[#dfddd7] disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`border px-3 py-1 text-xs font-bold uppercase tracking-wide transition-colors ${
                  period === p.value
                    ? "border-black bg-black text-[#dfddd7]"
                    : "border-black/40 bg-transparent text-[#111] opacity-60 hover:opacity-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        </section>

        {pngUrl && (
          <section className="mt-5 sm:mt-6 rounded-none border border-black/35 bg-[#dfddd7] p-3 sm:p-4 lg:p-5">
            <div className="mb-3 sm:mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">
                Image Generated
              </h2>
              <button
                onClick={handleDownload}
                className="h-10 sm:h-11 w-full sm:w-auto border border-black/50 bg-black px-4 sm:px-5 text-sm font-bold uppercase tracking-wide text-[#dfddd7]"
              >
                Download Image
              </button>
            </div>

            <div className="overflow-auto border border-black/35 bg-[#d9d6cf] p-2 sm:p-3">
              <img
                src={pngUrl}
                alt="Generated Last.fm story"
                className="mx-auto block h-auto w-full max-w-[420px] sm:max-w-[520px] lg:max-w-[620px]"
              />
            </div>
          </section>
        )}

        {/* hidden capture surface */}
        <div
          style={{
            position: "fixed",
            left: -20000,
            top: 0,
            width: 1080,
            height: 1920,
            pointerEvents: "none",
          }}
        >
          <div ref={captureRef}>
            <StoryRenderCard username={username || "user"} artists={artists} />
          </div>
        </div>
      </div>
    </main>
  );
}
