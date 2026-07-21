import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next =
    typeof searchParams.next === "string" ? searchParams.next : "/catalogo";

  return <LoginForm next={next} />;
}
