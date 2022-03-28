import { Form, json, Link, useLoaderData, useTransition } from "remix";
import { getProfile, spotifyAuth } from "~/utils/spotify";

export async function action({ request }) {
  spotifyAuth();
}

export async function loader({ request }) {
  const data = await getProfile(request);
  return json(data);
}

export default function Index() {
  const data = useLoaderData();
  const transition = useTransition();

  if (!data) {
    return (
      <div className="flex justify-center">
        <Form method="post">
          <button className="border-2 m-5 p-2 rounded" type="submit">
            Log In To Spotify
          </button>
        </Form>
      </div>
    );
  }

  if (transition.state === "loading") {
    return (
      <>
        <div className="flex justify-center p-5 text-xl mb-10">
          Playlists.txt
        </div>
        <div className="flex flex-col justify-center items-center">
          Loading...
        </div>
      </>
    );
  }

  return (
    <div className="flex justify-center">
      <Link
        className="border-2 m-5 p-2 rounded"
        to="/playlists"
        prefetch="render"
      >
        Playlists.txt
      </Link>
    </div>
  );
}
