import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  json,
} from "remix";
import { getProfile } from "./utils/spotify";
import styles from "./styles/app.css";
import { destroySession } from "./utils/session.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export function meta() {
  return {
    charset: "utf-8",
    title: "New Remix App",
    viewport: "width=device-width,initial-scale=1",
  };
}

export async function action({ request }) {
  return destroySession(request);
}

export async function loader({ request }) {
  const data = await getProfile(request);
  return json(data);
}

export default function App() {
  const data = useLoaderData();

  console.log(data);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex items-center mt-3 mx-5">
          <div className="w-1/6">{data ? `Hey ${data.display_name}!` : ""}</div>
          <div className="flex justify-center w-full text-xl font-bold">
            Welcome to Remix Spotify!
          </div>
          <div className="w-1/6 flex justify-end">
            {data && (
              <Form method="post">
                <button className="border-2 p-2 rounded">Log Out</button>
              </Form>
            )}
          </div>
        </div>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
