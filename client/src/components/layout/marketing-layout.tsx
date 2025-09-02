import MarketingHeader from "./marketing-header";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main className="pt-0">
        {children}
      </main>
    </div>
  );
}