import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "../../_backend/users/get-user-profile";

export default async function Home() {
  const { user } = await getUserProfile();

  return (
    <div className="min-h-screen p-8">
      <h1>Hello darling</h1>
      <Button className="mt-4">Click me</Button>
      <Alert className="mt-4">
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>This is an alert description.</AlertDescription>
      </Alert>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
