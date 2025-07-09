import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1>Hello darling</h1>
      <Button className="mt-4">Click me</Button>
      <Alert className="mt-4">
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>This is an alert description.</AlertDescription>
      </Alert>
    </div>
  );
}
