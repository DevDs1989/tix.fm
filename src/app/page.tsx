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
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Last.fm Story Generator</h1>

        {/* Input + Fetch */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            placeholder="Enter Last.fm username"
            className="h-11 w-full max-w-sm rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm outline-none focus:border-zinc-500"
          />
          <button
            onClick={handleFetch}
            disabled={loading || !username.trim()}
            className="h-11 rounded-md bg-white px-5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Generating PNG..." : "Fetch"}
          </button>
        </div>

        {/* Error */}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {/* Generated Segment */}
        {pngUrl && (
          <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">PNG Generated</h2>
              <button
                onClick={handleDownload}
                className="h-10 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-black"
              >
                Download PNG
              </button>
            </div>

            <div className="overflow-auto rounded-lg border border-zinc-800 bg-black p-3">
              <img
                src={pngUrl}
                alt="Generated Last.fm story"
                className="mx-auto h-auto max-w-full rounded"
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
