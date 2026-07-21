import { RegistroForm } from "@/components/auth/RegistroForm";

export default async function RegistroPage(props: PageProps<"/registro">) {
  const searchParams = await props.searchParams;
  const next =
    typeof searchParams.next === "string" ? searchParams.next : "/catalogo";

  return <RegistroForm next={next} />;
}
