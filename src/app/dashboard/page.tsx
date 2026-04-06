"use client";

import { useRef, useState } from "react";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleFetch = async () => {
    if (!username) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/lastfm?username=${encodeURIComponent(username)}`,
      );
      const data = await res.json();
      setArtists(data.artists || []);
      if (!data.artists || data.artists.length === 0) {
        setToast("No artists found for that username.");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setToast("Failed to fetch data.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleFetch();
  };

  const topArtist = artists[0];

  // Choose likely image field shape from Last.fm API: image is an array of { "#text": url, size: "extralarge" }
  const getArtistImage = (artist: any) => {
    if (!artist) return "";
    // try a few possibilities
    const imgArr = artist.image || artist.images || [];
    const candidate = imgArr.find(
      (i: any) =>
        i["#text"] &&
        (i.size === "extralarge" || i.size === "mega" || i.size === "large"),
    );
    return (
      candidate?.["#text"] ||
      imgArr[imgArr.length - 1]?.["#text"] ||
      artist.imageUrl ||
      ""
    );
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // convert dataURL to blob
  const dataURLToBlob = (dataURL: string) => {
    const parts = dataURL.split(",");
    const mime = parts[0].match(/:(.*?);/)?.[1] || "";
    const binary = atob(parts[1]);
    const len = binary.length;
    const u8arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8arr[i] = binary.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
  };

  const handleExport = async (useShare = false) => {
    if (!cardRef.current) return showToast("Nothing to export.");
    try {
      // dynamic import so we don't force a dependency unless this feature is used
      const htmlToImage = await import("html-to-image").then(
        (m) => m.default || m,
      );
      // ensure fonts and images are drawn: use cacheBust and scale for better resolution
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: null,
        pixelRatio: 2,
      });
      if (useShare && (navigator as any).canShare && (navigator as any).share) {
        const blob = dataURLToBlob(dataUrl);
        const file = new File([blob], `${username || "top-artist"}-card.png`, {
          type: blob.type,
        });
        try {
          // share the image file + a message
          await (navigator as any).share({
            files: [file],
            title: `${username}'s Top Artist`,
            text: `${username}'s #1 artist on Last.fm: ${topArtist?.name}`,
          });
          showToast("Shared!");
          return;
        } catch (shareErr) {
          // if user cancels or share fails, fall through to download
          console.warn("share error", shareErr);
        }
      }

      // fallback: download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${username || "top-artist"}-card.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Downloaded PNG");
    } catch (err) {
      console.error(err);
      showToast(
        "Export failed. Install the `html-to-image` package and try again.",
      );
    }
  };

  const copyProfileLink = async () => {
    const url = new URL(window.location.href);
    if (username) url.searchParams.set("username", username);
    try {
      await navigator.clipboard.writeText(url.toString());
      showToast("Share link copied!");
    } catch {
      showToast("Copy failed");
    }
  };

  const tweetShare = () => {
    const url = new URL(window.location.href);
    if (username) url.searchParams.set("username", username);
    const text = encodeURIComponent(
      `${username ? `${username}'s` : "My"} top artist on Last.fm: ${topArtist?.name || ""}`,
    );
    const tweetUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url.toString())}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-[#050a0f] text-white flex items-center justify-center p-6">
      {/* Input top */}
      <div className="w-full max-w-3xl absolute top-6 left-1/2 -translate-x-1/2 px-4">
        <div className="flex items-center gap-3 justify-center">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Last.fm username"
            className="w-72 md:w-96 px-4 py-2 rounded-full text-black focus:outline-none"
          />
          <button
            onClick={handleFetch}
            className="bg-gradient-to-r from-white/90 to-white/70 text-black px-5 py-2 rounded-full font-semibold shadow"
          >
            {loading ? "…" : "Fetch"}
          </button>
          <button
            onClick={() => {
              setUsername("rj"); // example quick demo username (optional)
              setTimeout(handleFetch, 50);
            }}
            className="text-sm text-gray-300 underline"
          >
            Demo
          </button>
        </div>
      </div>

      {/* Centerpiece: the shareable card */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-10">
        {/* Card preview */}
        <div
          ref={cardRef}
          className="relative w-[360px] h-[580px] rounded-3xl overflow-hidden p-6 flex flex-col justify-between bg-gradient-to-br from-green-500/20 via-black/40 to-purple-700/20 backdrop-blur border border-white/10 shadow-2xl"
        >
          {/* blurred artist cover background */}
          <div className="absolute inset-0">
            {topArtist ? (
              <img
                src={getArtistImage(topArtist)}
                alt={topArtist.name}
                className="w-full h-full object-cover opacity-30 scale-105 blur-sm"
                onError={(e) => {
                  // hide if broken
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
          </div>

          {/* Foreground content */}
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-300">
                Your #1 Artist
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold mt-3 leading-tight">
                {topArtist?.name || "No artist yet"}
              </h1>
              <p className="mt-2 text-sm text-gray-300 max-w-xs">
                {topArtist?.bio?.summary ||
                  topArtist?.summary ||
                  (topArtist
                    ? `${topArtist.playcount} plays this year`
                    : "Search a Last.fm username to preview your top artist.")}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <p className="text-6xl font-black">
                    {topArtist?.playcount ?? "—"}
                  </p>
                  <p className="text-sm text-gray-300">plays this year</p>
                </div>

                <div className="w-28 h-28 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                  {topArtist ? (
                    <img
                      src={getArtistImage(topArtist)}
                      alt={topArtist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-gray-400">No image</div>
                  )}
                </div>
              </div>

              {/* Equalizer animation */}
              <div className="flex items-end gap-2 h-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-md bg-white/90 animate-eq-${i % 3}`}
                    style={{
                      height: `${40 - i * 5}px`,
                      animationDuration: `${0.6 + i * 0.15}s`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Powered by Last.fm</span>
                <span className="italic">Make it yours — share it!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls & share actions */}
        <div className="w-full max-w-md flex flex-col gap-4">
          <div className="bg-white/5 border border-white/6 p-4 rounded-xl">
            <h3 className="text-lg font-semibold">Share your card</h3>
            <p className="text-sm text-gray-300 mt-1">
              Export a PNG or use your device share sheet. You can also copy a
              profile link or tweet it.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => handleExport(false)}
                className="px-4 py-2 rounded-md bg-white text-black font-semibold shadow"
              >
                Download PNG
              </button>

              <button
                onClick={() => handleExport(true)}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow"
              >
                Share (device)
              </button>

              <button
                onClick={copyProfileLink}
                className="px-3 py-2 rounded-md bg-white/10 text-white"
              >
                Copy Link
              </button>

              <button
                onClick={tweetShare}
                className="px-3 py-2 rounded-md bg-blue-600 text-white"
              >
                Tweet
              </button>
            </div>
          </div>

          <div className="bg-white/3 border border-white/6 p-4 rounded-xl">
            <h4 className="font-semibold">Tips</h4>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-300">
              <li>Try a few usernames to discover interesting artists.</li>
              <li>
                Use the Download button to attach the image to social posts.
              </li>
              <li>
                If the export says to install a package, run:{" "}
                <code className="bg-black/30 px-1 rounded">
                  npm i html-to-image
                </code>
              </li>
            </ul>
          </div>

          <div className="text-xs text-gray-400">
            Card preview is generated locally in your browser — we don't upload
            your card image anywhere.
          </div>
        </div>
      </div>

      {/* small toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-md shadow">
          {toast}
        </div>
      )}

      {/* animated equalizer keyframes */}
      <style jsx>{`
        @keyframes eq-0 {
          0% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1);
          }
          100% {
            transform: scaleY(0.4);
          }
        }
        @keyframes eq-1 {
          0% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(0.9);
          }
          100% {
            transform: scaleY(0.3);
          }
        }
        @keyframes eq-2 {
          0% {
            transform: scaleY(0.6);
          }
          50% {
            transform: scaleY(1);
          }
          100% {
            transform: scaleY(0.6);
          }
        }

        .animate-eq-0 {
          transform-origin: bottom;
          animation-name: eq-0;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .animate-eq-1 {
          transform-origin: bottom;
          animation-name: eq-1;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .animate-eq-2 {
          transform-origin: bottom;
          animation-name: eq-2;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  );
}
