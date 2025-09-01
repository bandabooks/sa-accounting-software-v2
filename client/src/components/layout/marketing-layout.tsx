import MarketingHeader from "./marketing-header";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <MarketingHeader />
      <main className="w-full pt-0">
        {children}
      </main>
    </div>
  );
}