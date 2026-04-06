"use client";

import { useState } from "react";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    if (pngUrl) URL.revokeObjectURL(pngUrl);
    setPngUrl(null);

    try {
      const res = await fetch(
        `/api/story?username=${encodeURIComponent(username.trim())}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to generate PNG");
      }

      const blob = await res.blob();
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
        {/* Header */}
        <header className="border-b border-black/30 pb-4 sm:pb-5">
          <p className="text-[11px] sm:text-xs tracking-[0.2em] uppercase opacity-70">
            Powered by Last.fm | Made by Dev
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase leading-none sm:text-5xl lg:text-6xl">
            Tix.fm
          </h1>
          <p className="mt-2 text-sm sm:text-base opacity-75">
            Create your shareable music story card
          </p>
        </header>

        {/* Control card */}
        <section className="mt-5 sm:mt-6 rounded-none border border-black/35 bg-[#dfddd7] p-4 sm:p-5 lg:p-6 relative overflow-hidden">
          {/* subtle paper grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10 mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0.22) 0.6px, transparent 0.6px), radial-gradient(rgba(255,255,255,0.16) 0.6px, transparent 0.6px)",
              backgroundPosition: "0 0, 1.5px 1.5px",
              backgroundSize: "3px 3px, 3px 3px",
            }}
          />

          <div className="relative z-10 grid gap-3 sm:gap-4 md:grid-cols-[1fr_auto] md:items-end">
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
                placeholder=""
                className="h-11 sm:h-12 w-full border border-black/40 bg-[#e5e2db] px-3 sm:px-4 text-sm sm:text-base outline-none placeholder:text-black/45 focus:border-black/70"
              />
            </div>

            <button
              onClick={handleFetch}
              disabled={loading || !username.trim()}
              className="h-11 sm:h-12 w-full md:w-auto border border-black/50 bg-black px-5 sm:px-6 text-sm font-bold uppercase tracking-wide text-[#dfddd7] disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate PNG"}
            </button>
          </div>

          {error && (
            <p className="relative z-10 mt-3 text-sm text-red-700">{error}</p>
          )}
        </section>

        {/* Output */}
        {pngUrl && (
          <section className="mt-5 sm:mt-6 rounded-none border border-black/35 bg-[#dfddd7] p-3 sm:p-4 lg:p-5 relative overflow-hidden">
            {/* subtle paper grain */}
            <div
              className="pointer-events-none absolute inset-0 opacity-10 mix-blend-multiply"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(0,0,0,0.22) 0.6px, transparent 0.6px), radial-gradient(rgba(255,255,255,0.16) 0.6px, transparent 0.6px)",
                backgroundPosition: "0 0, 1.5px 1.5px",
                backgroundSize: "3px 3px, 3px 3px",
              }}
            />

            <div className="relative z-10 mb-3 sm:mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">
                PNG Generated
              </h2>
              <button
                onClick={handleDownload}
                className="h-10 sm:h-11 w-full sm:w-auto border border-black/50 bg-black px-4 sm:px-5 text-sm font-bold uppercase tracking-wide text-[#dfddd7]"
              >
                Download PNG
              </button>
            </div>

            <div className="relative z-10 overflow-auto border border-black/35 bg-[#d9d6cf] p-2 sm:p-3">
              <img
                src={pngUrl}
                alt="Generated Last.fm story"
                className="mx-auto block h-auto w-full max-w-[420px] sm:max-w-[520px] lg:max-w-[620px]"
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
