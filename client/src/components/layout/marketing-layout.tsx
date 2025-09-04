import MarketingHeader from "./marketing-header";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden">
      <MarketingHeader />
      <main className="pt-0 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}