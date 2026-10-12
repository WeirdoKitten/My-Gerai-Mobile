import { Redirect } from "expo-router";

import { useAuth } from "@/lib/auth/AuthProvider";

export default function Index() {
  const { status } = useAuth();
  return <Redirect href={status === "signedIn" ? "/pesanan" : "/login"} />;
}
