import { redirect } from "remix";
import { createSession, getToken } from "./session.server";

const baseUrl = process.env.BASE;

const response_type = "code";
const client_id = "ea95e81ababc4528bd581f0c2f830b6d";
const redirect_uri = `${baseUrl}/spotify`;
const scope =
  "user-read-private user-read-email playlist-read-private playlist-read-collaborative";
const state = generateRandomString(16);
const client_secret = process.env.CLIENT_SECRET;

const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=${response_type}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;
const tokenUrl = "https://accounts.spotify.com/api/token";

function generateRandomString(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function spotifyAuth() {
  throw redirect(authUrl);
}

export function spotifyToken(code) {
  const authString = Buffer.from(client_id + ":" + client_secret);
  const authStringB64 = authString.toString("base64");

  return fetch(tokenUrl, {
    method: "POST",
    body: new URLSearchParams({
      code: code,
      redirect_uri,
      grant_type: "authorization_code",
    }),
    headers: {
      Authorization: "Basic " + authStringB64,
    },
  }).then((response) => response.json());
}

export async function spotifyRefresh(refresh_token) {
  const authString = Buffer.from(client_id + ":" + client_secret);
  const authStringB64 = authString.toString("base64");

  const response = await fetch(tokenUrl, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
    headers: {
      Authorization: "Basic " + authStringB64,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        spotifyAuth();
      }
    })
    .then((data) => {
      return createSession("/", data);
    });
  return response;
}

export async function getPlaylists(request) {
  const token = await getToken(request);
  const { access_token, refresh_token } = token;

  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  });

  if (!response) {
    throw await spotifyRefresh(refresh_token);
  }

  const playlists = [];

  for (let i = 0; i < response.items.length; i++) {
    const playlistId = response.items[i].id;
    const playlistName = response.items[i].name;

    let next = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    let playlist = [];

    while (next) {
      const results = await fetch(next, {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }).then((response) => response.json());

      playlist = [...playlist, ...results.items];

      next = results.next;
    }

    playlists.push({
      name: playlistName,
      tracks: playlist,
    });
  }

  return playlists;
}

export async function getProfile(request) {
  const token = await getToken(request);

  if (!token) {
    return null;
  }

  const { access_token, refresh_token } = token;

  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  });

  if (!response) {
    throw await spotifyRefresh(refresh_token);
  }

  return response;
}
