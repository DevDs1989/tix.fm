import { NextResponse } from "next/server";
import albumArt from "album-art";

const API_KEY = process.env.LASTFM_API_KEY;

async function getArtistImage(artistName: string) {
  // We use a self-titled album as a best-effort fallback query.
  // If it fails, return null (no crash).
  try {
    const url = await albumArt(artistName, artistName, "large");
    return url || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

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
      )}&api_key=${API_KEY}&format=json&limit=5`,
      { cache: "no-store" },
    );

    const topArtistsData = await topArtistsRes.json();

    if (!topArtistsRes.ok || topArtistsData?.error) {
      return NextResponse.json(
        { error: topArtistsData?.message || "Failed to fetch top artists" },
        { status: 400 },
      );
    }

    const baseArtists = Array.isArray(topArtistsData?.topartists?.artist)
      ? topArtistsData.topartists.artist
      : [];

    const artists = await Promise.all(
      baseArtists.map(async (artist: any) => {
        const artistName = artist?.name ?? "";

        // Top 4 tracks for this artist
        let topTracks: string[] = [];
        try {
          const tracksRes = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(
              artistName,
            )}&api_key=${API_KEY}&format=json&limit=4`,
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

        // Artist image via album-art
        const image = await getArtistImage(artistName);

        return {
          name: artistName,
          playcount: artist?.playcount ?? "0",
          topTracks,
          image, // string | null
        };
      }),
    );

    return NextResponse.json({ artists });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
