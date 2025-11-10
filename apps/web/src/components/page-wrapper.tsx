import { Header } from "./header";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 p-4">
      <Header />
      {children}
    </div>
  );
}
