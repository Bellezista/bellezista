import { ActualizarPasswordForm } from "@/components/auth/ActualizarPasswordForm";

export default async function ActualizarPasswordPage(
  props: PageProps<"/actualizar-password">,
) {
  const searchParams = await props.searchParams;
  // Destination carried from the reset flow (see RecuperarForm) so "Continuar"
  // returns the user to where they started.
  const next =
    typeof searchParams.next === "string" ? searchParams.next : "/mis-anuncios";

  return <ActualizarPasswordForm next={next} />;
}
