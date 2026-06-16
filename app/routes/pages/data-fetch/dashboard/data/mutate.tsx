import { addNote, ITEM_ID } from "../_shared/api";
import type { Route } from "./+types/mutate";

// clientAction for the client-loader strategy's in-modal mutation. fetcher.submit()
// posts here; afterwards React Router automatically revalidates the dashboard
// clientLoader (overview total) AND the active item fetcher (the modal's own detail),
// so both the count and the modal's notes list reflect the new note.
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const noteValue = formData.get("note");
  const idValue = formData.get("id");
  const note = typeof noteValue === "string" ? noteValue : "";
  const id = typeof idValue === "string" ? idValue : ITEM_ID;
  return await addNote(id, note);
}

export default function MutateData() {
  return null;
}
