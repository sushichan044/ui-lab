import { Link } from "react-router";
import Fa6BrandsGithub from "~icons/fa6-brands/github";
import Fa6BrandsXTwitter from "~icons/fa6-brands/x-twitter";

import type { Route } from "./+types/_index";

import { cn } from "../lib/cn";

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
      <header
        className={cn(
          "grid grid-cols-[1fr_auto_auto] gap-4 md:gap-6",
          "font-bold text-2xl",
          "container mx-auto p-4",
        )}
      >
        <Link
          className="hover:opacity-70 focus:opacity-70 transition duration-300"
          to="/"
        >
          sushichan044&apos;s UI Lab
        </Link>
        <Link
          className="hover:opacity-70 focus:opacity-70 transition duration-300"
          target="_blank"
          to="https://x.com/sushichan044"
        >
          <span className="sr-only">Follow me on Twitter</span>
          <Fa6BrandsXTwitter aria-hidden />
        </Link>
        <Link
          className="hover:opacity-70 focus:opacity-70 transition duration-300"
          target="_blank"
          to="https://github.com/sushichan044/react-lab"
        >
          <span className="sr-only">Show this project on GitHub</span>
          <Fa6BrandsGithub aria-hidden />
        </Link>
      </header>
      <main className="mx-auto container p-4">{loaderData.message}</main>
    </>
  );
}
