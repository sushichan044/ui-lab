import type { FC } from "react";
import { Suspense, use } from "react";

import type { Route } from "./+types/client-loader";

export function clientLoader() {
  const banana = new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve("banana");
    }, 3000);
  });

  return {
    banana,
  };
}

const BananaDisplay: FC<{ banana: Promise<string> }> = ({ banana }) => {
  const bananaValue = use(banana);

  return <div>{bananaValue}</div>;
};

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <main className="mx-auto container p-4">
      <div className="space-y-4 md:space-y-8">banana</div>
      <Suspense fallback={<div>Loading...</div>}>
        <BananaDisplay banana={loaderData.banana} />
      </Suspense>
    </main>
  );
}
