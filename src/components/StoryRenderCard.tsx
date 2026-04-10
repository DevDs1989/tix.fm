"use client";

export type Artist = {
  name: string;
  playcount: string | number;
  topTracks?: string[];
  image?: string | null;
};

export default function StoryRenderCard({
  username,
  artists,
}: {
  username: string;
  artists: Artist[];
}) {
  // const totalScrobbles = artists.reduce(
  //   (sum, a) => sum + (Number(a.playcount) || 0),
  //   0,
  // );

  return (
    <main
      style={{
        width: 1080,
        height: 1920,
        background: "#d9d6cf",
        color: "#111",
        padding: 56,
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid rgba(0,0,0,.3)",
          paddingBottom: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          Tix.fm
        </div>
        <h1
          style={{
            margin: "10px 0 0",
            fontSize: 72,
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          {username}
        </h1>
        <p style={{ marginTop: 8, fontSize: 28, opacity: 0.75 }}>Top Artists</p>
      </header>

      <section style={{ display: "grid", gap: 18 }}>
        {artists.map((artist, i) => (
          <article
            key={`${artist.name}-${i}`}
            style={{
              minHeight: 230,
              display: "grid",
              gridTemplateColumns: "110px 1fr 160px",
              border: "1px solid rgba(0,0,0,.35)",
              background: "#dfddd7",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {artist.image ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "50%",
                  height: "100%",
                  backgroundImage: `url("${artist.image}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(1) contrast(1.15)",
                  opacity: 0.4,
                  WebkitMaskImage:
                    "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,.95) 35%, rgba(0,0,0,.72) 60%, rgba(0,0,0,.35) 80%, rgba(0,0,0,.08) 94%, rgba(0,0,0,0) 100%)",
                  maskImage:
                    "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,.95) 35%, rgba(0,0,0,.72) 60%, rgba(0,0,0,.35) 80%, rgba(0,0,0,.08) 94%, rgba(0,0,0,0) 100%)",
                }}
              />
            ) : null}

            {/* Grain texture overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                pointerEvents: "none",
                opacity: 0.2,
                backgroundImage:
                  "radial-gradient(rgba(0,0,0,0.22) 0.6px, transparent 0.6px), radial-gradient(rgba(255,255,255,0.16) 0.6px, transparent 0.6px)",
                backgroundPosition: "0 0, 1.5px 1.5px",
                backgroundSize: "4px 4px, 4px 4px",
                mixBlendMode: "multiply",
              }}
            />

            <div
              style={{
                borderRight: "1px solid rgba(0,0,0,.35)",
                display: "grid",
                placeItems: "center",
                fontSize: 52,
                fontWeight: 900,
                zIndex: 2,
              }}
            >
              №{i + 1}
            </div>

            <div style={{ padding: 28, zIndex: 2 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 42,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {artist.name}
              </h2>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 18,
                  opacity: 0.75,
                  textTransform: "uppercase",
                }}
              >
                {Number(artist.playcount).toLocaleString()} plays
              </p>

              <div
                style={{
                  marginTop: 18,
                  borderTop: "1px dashed rgba(0,0,0,.45)",
                  paddingTop: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    opacity: 0.75,
                    marginBottom: 6,
                  }}
                >
                  Top 4 Songs
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                    fontSize: 24,
                    lineHeight: 1.25,
                  }}
                >
                  {(artist.topTracks ?? []).slice(0, 4).map((track, idx) => (
                    <div
                      key={`${track}-${idx}`}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {track}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                borderLeft: "1px solid rgba(0,0,0,.35)",
                display: "grid",
                placeItems: "center",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontSize: 18,
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 700,
                opacity: 0.85,
                zIndex: 2,
              }}
            ></div>
          </article>
        ))}
      </section>
    </main>
  );
}
