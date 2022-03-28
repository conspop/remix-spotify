import { createCookieSessionStorage, redirect } from "remix";
import { spotifyAuth } from "./spotify";

const sessionSecret = process.env.SESSION_SECRET;

const storage = createCookieSessionStorage({
  name: "spotify_session",
  secure: process.env.NODE_ENV === "production",
  secrets: [sessionSecret],
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: true,
});

export async function createSession(redirectTo, token) {
  const session = await storage.getSession();
  session.set("token", token);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

function getSession(request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getToken(request) {
  const session = await getSession(request);
  const token = session.get("token");
  if (!token) {
    spotifyAuth();
  }
  return token;
}
