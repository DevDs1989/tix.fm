import { ImageResponse } from "next/og";

export const runtime = "edge";

type Artist = {
  name: string;
  playcount: string | number;
  topTracks?: string[];
  image?: string | null;
};

async function getData(username: string): Promise<Artist[]> {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) throw new Error("Missing LASTFM_API_KEY");

  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${encodeURIComponent(
      username,
    )}&api_key=${apiKey}&format=json&limit=5`,
    { cache: "no-store" },
  );

  if (!res.ok) throw new Error("Failed to fetch top artists");
  const data = await res.json();

  const baseArtists = Array.isArray(data?.topartists?.artist)
    ? data.topartists.artist
    : [];

  const artists: Artist[] = await Promise.all(
    baseArtists.slice(0, 5).map(async (artist: any) => {
      const artistName = artist?.name ?? "";
      let topTracks: string[] = [];

      try {
        const tracksRes = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(
            artistName,
          )}&api_key=${apiKey}&format=json&limit=4`,
          { cache: "no-store" },
        );
        const tracksData = await tracksRes.json();
        const tracksArray = Array.isArray(tracksData?.toptracks?.track)
          ? tracksData.toptracks.track
          : [];
        topTracks = tracksArray
          .slice(0, 4)
          .map((t: any) => t?.name)
          .filter(Boolean);
      } catch {
        topTracks = [];
      }

      const image =
        artist?.image?.find((i: any) => i.size === "extralarge")?.["#text"] ||
        artist?.image?.[artist?.image?.length - 1]?.["#text"] ||
        null;

      return {
        name: artistName,
        playcount: artist?.playcount ?? "0",
        topTracks,
        image,
      };
    }),
  );

  return artists;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.trim();
    if (!username) {
      return new Response(JSON.stringify({ error: "Missing username" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const artists = await getData(username);
    const totalScrobbles = artists.reduce(
      (sum, a) => sum + (Number(a.playcount) || 0),
      0,
    );

    return new ImageResponse(
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          background: "#d9d6cf",
          color: "#111",
          padding: "56px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderBottom: "1px solid rgba(0,0,0,.3)",
            paddingBottom: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "20px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            Tix.fm
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "10px",
              fontSize: "72px",
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            {username}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "8px",
              fontSize: "28px",
              opacity: 0.75,
            }}
          >
            {totalScrobbles.toLocaleString()} scrobbles
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {artists.map((artist, i) => (
            <div
              key={`${artist.name}-${i}`}
              style={{
                display: "flex",
                minHeight: "230px",
                border: "1px solid rgba(0,0,0,.35)",
                background: "#dfddd7",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {artist.image ? (
                <img
                  src={artist.image}
                  alt=""
                  width={540}
                  height={230}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    objectFit: "cover",
                    opacity: 0.2,
                    filter: "grayscale(100%) contrast(1.1)",
                  }}
                />
              ) : null}

              <div
                style={{
                  display: "flex",
                  width: "110px",
                  borderRight: "1px solid rgba(0,0,0,.35)",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "52px",
                  fontWeight: 900,
                  zIndex: 2,
                }}
              >
                №{i + 1}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  padding: "28px",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    margin: 0,
                    fontSize: "42px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {artist.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: "8px",
                    fontSize: "18px",
                    opacity: 0.75,
                    textTransform: "uppercase",
                  }}
                >
                  {Number(artist.playcount).toLocaleString()} plays
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "18px",
                    borderTop: "1px dashed rgba(0,0,0,.45)",
                    paddingTop: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: "14px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      opacity: 0.75,
                      marginBottom: "6px",
                    }}
                  >
                    Top 4 Songs
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px 18px",
                      fontSize: "24px",
                      lineHeight: 1.25,
                    }}
                  >
                    {(artist.topTracks ?? []).slice(0, 4).map((track, idx) => (
                      <div
                        key={`${track}-${idx}`}
                        style={{
                          display: "flex",
                          maxWidth: "400px",
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
                  display: "flex",
                  width: "160px",
                  borderLeft: "1px solid rgba(0,0,0,.35)",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  opacity: 0.85,
                  zIndex: 2,
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                Artist Ticket
              </div>
            </div>
          ))}
        </div>
      </div>,
      { width: 1080, height: 1920 },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Failed to generate PNG", detail: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
