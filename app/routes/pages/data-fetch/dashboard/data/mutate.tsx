import { submitNote } from "../_shared/api";
import type { Route } from "./+types/mutate";

// clientAction for the client-loader strategy's on-demand mutation (widget 4).
// fetcher.submit() posts here; afterwards React Router automatically revalidates
// the dashboard clientLoader, so the overview reflects the new note count.
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const value = formData.get("note");
  const note = typeof value === "string" ? value : "";
  return await submitNote(note);
}

export default function MutateData() {
  return null;
}
