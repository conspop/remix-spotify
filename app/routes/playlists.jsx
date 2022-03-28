import { Outlet } from "remix";

export default function PlaylistsRoute() {
  return (
    <>
      <div className="flex justify-center p-5 text-xl">Playlists.txt</div>
      <Outlet />
    </>
  );
}
