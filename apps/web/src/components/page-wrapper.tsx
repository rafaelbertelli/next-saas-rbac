import { Header } from "./header";

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="space-y-4 p-4">
      <Header />
      {children}
    </div>
  );
}
