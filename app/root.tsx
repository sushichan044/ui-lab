import { Toaster } from "react-hot-toast";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Link } from "react-router";
import Fa6BrandsGithub from "~icons/fa6-brands/github";
import Fa6BrandsXTwitter from "~icons/fa6-brands/x-twitter";

import type { Route } from "./+types/root";

import { cn } from "./lib/cn";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { href: "https://fonts.googleapis.com", rel: "preconnect" },
  {
    crossOrigin: "anonymous",
    href: "https://fonts.gstatic.com",
    rel: "preconnect",
  },
  {
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    rel: "stylesheet",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
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
        {children}
        <Toaster position="bottom-right" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack != null && stack !== "" && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
