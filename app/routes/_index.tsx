import { Link } from "react-router";

import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "sushichan044's UI Lab" },
    {
      content:
        "sushichan044's UI Lab is a place to experiment with new web technologies or ui implementations.",
      name: "description",
    },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <header className="mx-auto container p-4 font-bold text-2xl flex justify-between flex-row">
        <Link to="/">sushichan044&apos;s UI Lab</Link>
        <div>a</div>
      </header>
      <main>{loaderData.message}</main>
    </>
  );
}
