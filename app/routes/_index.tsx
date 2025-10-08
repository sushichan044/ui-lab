import { Link } from "react-router";

import type { Route } from "./+types/_index";
import { cloudflareContext } from "../context";

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
  const cf = cloudflareContext.get(context);

  return {
    cloudflareValue: cf.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Home() {
  return (
    <main className="mx-auto container p-4">
      <div className="grid gap-4">
        <section>
          <h2 className="text-xl font-bold">Input</h2>
          <Link className="link" to="/input/multi-checkbox">
            <p>Multi checkbox</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
