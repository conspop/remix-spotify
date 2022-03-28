import { redirect } from "remix";
import { spotifyToken } from "~/utils/spotify";
import { createSession } from "~/utils/session.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const response = await spotifyToken(code);
    return createSession("/", response);
  }

  return redirect("/");
};

export default function Spotify() {
  return null;
}
