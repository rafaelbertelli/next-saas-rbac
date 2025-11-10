import { getUserProfile } from "../../_backend/users/get-user-profile";

export default async function Home() {
  const { user } = await getUserProfile();

  return <h1 className="text-2xl font-bold">Projects</h1>;
}
