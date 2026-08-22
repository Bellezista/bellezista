import { RecuperarForm } from "@/components/auth/RecuperarForm";

export default async function RecuperarPage(props: PageProps<"/recuperar">) {
  const searchParams = await props.searchParams;
  // Where to send the user once they've set a new password -- carried through
  // the whole reset flow so they land back where they started (see LoginForm).
  const next =
    typeof searchParams.next === "string" ? searchParams.next : "/mis-anuncios";

  return <RecuperarForm next={next} />;
}
