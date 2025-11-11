interface PageMainProps {
  title: string;
  isEmpty?: boolean;
  children?: React.ReactNode;
}

export function PageMain({ title, isEmpty = false, children }: PageMainProps) {
  const titleClass = isEmpty
    ? "text-muted-foreground text-sm"
    : "pb-4 text-2xl font-bold";

  return (
    <main className="mx-auto w-full max-w-[1200px]">
      <p className={titleClass}>{title}</p>
      {children}
    </main>
  );
}
