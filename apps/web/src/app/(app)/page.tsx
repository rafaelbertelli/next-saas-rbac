import { Header } from "@/components/header";
import { getUserProfile } from "../../_backend/users/get-user-profile";

export default async function Home() {
  const { user } = await getUserProfile();

  return (
    <div className="py-4">
      <Header />
      <main></main>
    </div>
  );
}
