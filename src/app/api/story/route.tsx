import { ImageResponse } from "next/og";

export const runtime = "edge";

type LastFmTopArtist = {
  name: string;
  playcount: string;
};

type LastFmTopTrack = {
  name: string;
  playcount: string;
  artist?: { name?: string };
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function getUserData(username: string) {
  const API_KEY = process.env.LASTFM_API_KEY;
  if (!API_KEY) throw new Error("LASTFM_API_KEY is not set");

  const base = "https://ws.audioscrobbler.com/2.0/";

  const [userInfoRes, topArtistsRes, topTracksRes] = await Promise.all([
    getJson<any>(
      `${base}?method=user.getinfo&user=${encodeURIComponent(username)}&api_key=${API_KEY}&format=json`,
    ),
    getJson<any>(
      `${base}?method=user.gettopartists&user=${encodeURIComponent(username)}&api_key=${API_KEY}&format=json&period=7day&limit=5`,
    ),
    getJson<any>(
      `${base}?method=user.gettoptracks&user=${encodeURIComponent(username)}&api_key=${API_KEY}&format=json&period=7day&limit=5`,
    ),
  ]);

  const user = userInfoRes?.user;
  const topArtists: LastFmTopArtist[] = topArtistsRes?.topartists?.artist ?? [];
  const topTracks: LastFmTopTrack[] = topTracksRes?.toptracks?.track ?? [];

  return {
    username,
    realname: user?.realname || "",
    country: user?.country || "",
    playcount: user?.playcount || "0",
    image:
      user?.image?.find((i: any) => i.size === "extralarge")?.["#text"] ||
      user?.image?.[user?.image?.length - 1]?.["#text"] ||
      "",
    topArtists,
    topTracks,
  };
}

function formatNum(n: string) {
  const num = Number(n || 0);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.trim();

    if (!username) {
      return new Response(
        JSON.stringify({ error: "Missing username query param" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = await getUserData(username);

    // Optional avatar fetch -> ArrayBuffer for next/og
    let avatarBuffer: ArrayBuffer | null = null;
    if (data.image) {
      try {
        const avatarRes = await fetch(data.image, { cache: "no-store" });
        if (avatarRes.ok) avatarBuffer = await avatarRes.arrayBuffer();
      } catch {
        avatarBuffer = null;
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "1080px",
            height: "1920px",
            display: "flex",
            flexDirection: "column",
            background: "#d9d6cf",
            color: "#111111",
            padding: "56px",
            fontFamily: "Arial",
            position: "relative",
          }}
        >
          {/* Top */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid rgba(0,0,0,0.35)",
              paddingBottom: "26px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 28,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                tix.fm
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 88,
                  lineHeight: 1,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                Weekly Story
              </div>
            </div>

            <div
              style={{
                border: "2px solid rgba(0,0,0,0.45)",
                padding: "10px 16px",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              @{data.username}
            </div>
          </div>

          {/* Profile block */}
          <div
            style={{
              marginTop: 30,
              border: "2px solid rgba(0,0,0,0.35)",
              background: "#dfddd7",
              display: "flex",
              padding: "24px",
              gap: "22px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                border: "2px solid rgba(0,0,0,0.4)",
                background: "#cfcac0",
                display: "flex",
                overflow: "hidden",
              }}
            >
              {avatarBuffer ? (
                <img
                  src={avatarBuffer as any}
                  alt="avatar"
                  width={150}
                  height={150}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 44,
                    fontWeight: 700,
                  }}
                >
                  {data.username.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 44, fontWeight: 800 }}>@{data.username}</div>
              <div style={{ fontSize: 28, opacity: 0.8 }}>
                {data.realname || "Last.fm listener"}
              </div>
              <div style={{ fontSize: 24, opacity: 0.7 }}>
                {data.country || "Unknown country"}
              </div>
              <div style={{ fontSize: 24, marginTop: 6 }}>
                Total scrobbles: <b>{formatNum(data.playcount)}</b>
              </div>
            </div>
          </div>

          {/* Two columns */}
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 24,
              flex: 1,
            }}
          >
            <div
              style={{
                flex: 1,
                border: "2px solid rgba(0,0,0,0.35)",
                background: "#dfddd7",
                padding: 20,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                Top Artists
              </div>

              {data.topArtists.length ? (
                data.topArtists.slice(0, 5).map((a, i) => (
                  <div
                    key={`${a.name}-${i}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid rgba(0,0,0,0.2)",
                      padding: "14px 0",
                      fontSize: 24,
                    }}
                  >
                    <div style={{ maxWidth: "75%", overflow: "hidden" }}>
                      {i + 1}. {a.name}
                    </div>
                    <div style={{ opacity: 0.75 }}>{formatNum(a.playcount)}</div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 24, opacity: 0.7 }}>No data</div>
              )}
            </div>

            <div
              style={{
                flex: 1,
                border: "2px solid rgba(0,0,0,0.35)",
                background: "#dfddd7",
                padding: 20,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                Top Tracks
              </div>

              {data.topTracks.length ? (
                data.topTracks.slice(0, 5).map((t, i) => (
                  <div
                    key={`${t.name}-${i}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      borderTop: "1px solid rgba(0,0,0,0.2)",
                      padding: "12px 0",
                    }}
                  >
                    <div style={{ fontSize: 24 }}>
                      {i + 1}. {t.name}
                    </div>
                    <div style={{ fontSize: 19, opacity: 0.72 }}>
                      {t.artist?.name || "Unknown artist"} · {formatNum(t.playcount)}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 24, opacity: 0.7 }}>No data</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 18,
              borderTop: "2px solid rgba(0,0,0,0.35)",
              paddingTop: 14,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 22,
              opacity: 0.8,
            }}
          >
            <div>Generated by tix.fm</div>
            <div>{new Date().toLocaleDateString("en-US")}</div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
      },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "Failed to generate PNG", detail: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
