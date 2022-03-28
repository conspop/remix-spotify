import { useLoaderData, json } from "remix";
import { getPlaylists } from "~/utils/spotify";

export const loader = async ({ request }) => {
  const playlists = await getPlaylists(request);
  return json(playlists);
};

export default function Index() {
  const data = useLoaderData();

  return (
    <>
      {data.map((playlist, index) => (
        <div style={{ marginBottom: "10px" }} key={index}>
          <strong>{playlist.name}</strong>
          {playlist.tracks.map((track) => {
            return (
              <div key={track.track?.id}>
                {track.track?.artists[0].name} - {track.track?.name}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
