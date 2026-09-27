import { createFileRoute } from "@tanstack/react-router";
import { Formulary, type FormularySearch } from "@/components/formulary";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): FormularySearch => ({
    q: typeof search.q === "string" ? search.q : "",
    sp: search.sp === "dog" || search.sp === "cat" ? search.sp : "all",
    id: typeof search.id === "string" ? search.id : "",
  }),
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  return <Formulary search={search} />;
}
