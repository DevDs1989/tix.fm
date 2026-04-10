import { NextResponse } from "next/server";
import albumArt from "album-art";

const API_KEY = process.env.LASTFM_API_KEY;

async function getArtistImage(artistName: string) {
  try {
    const url = await albumArt(artistName, artistName, "large");
    return url || null;
  } catch {
    return null;
  }
}

const VALID_PERIODS = [
  "7day",
  "1month",
  "3month",
  "6month",
  "12month",
  "overall",
];
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const period = VALID_PERIODS.includes(searchParams.get("period") ?? "")
    ? searchParams.get("period")!
    : "1month";
  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing LASTFM_API_KEY environment variable" },
      { status: 500 },
    );
  }

  try {
    // Top artists
    const topArtistsRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${encodeURIComponent(
        username,
      )}&period=${period}&api_key=${API_KEY}&format=json&limit=5`,
      { cache: "no-store" },
    );
    const topArtistsData = await topArtistsRes.json();

    if (!topArtistsRes.ok || topArtistsData?.error) {
      return NextResponse.json(
        { error: topArtistsData?.message || "Failed to fetch top artists" },
        { status: 400 },
      );
    }

    const userTopTracksRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${encodeURIComponent(
        username,
      )}&api_key=${API_KEY}&format=json&limit=200&period=${period}`,
      { cache: "no-store" },
    );
    const userTopTracksData = await userTopTracksRes.json();
    const allUserTracks: any[] = Array.isArray(
      userTopTracksData?.toptracks?.track,
    )
      ? userTopTracksData.toptracks.track
      : [];

    const baseArtists = Array.isArray(topArtistsData?.topartists?.artist)
      ? topArtistsData.topartists.artist
      : [];

    const artists = await Promise.all(
      baseArtists.map(async (artist: any) => {
        const artistName = artist?.name ?? "";

        const topTracks = allUserTracks
          .filter(
            (t: any) =>
              t?.artist?.name?.toLowerCase() === artistName.toLowerCase(),
          )
          .slice(0, 4)
          .map((t: any) => t?.name)
          .filter(Boolean);

        const image = await getArtistImage(artistName);

        return {
          name: artistName,
          playcount: artist?.playcount ?? "0",
          topTracks,
          image,
        };
      }),
    );

    return NextResponse.json({ artists });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
