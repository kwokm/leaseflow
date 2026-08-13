import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { PageWash } from "@/components/page-wash";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard-nav";
import { HelpCircle } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen print:bg-white">
      <PageWash quiet />
      {/* Header */}
      <header className="relative z-50 border-b border-line bg-paper/95 backdrop-blur sticky top-0 print:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-ink">
            <BrandMark />
            <BrandWord />
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right">
                <div className="text-sm font-medium">John Landlord</div>
                <div className="text-xs text-mute-2">Property Manager</div>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">JL</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-line bg-paper/70 min-h-[calc(100vh-73px)] p-4 print:hidden">
          <DashboardNav />

          <div className="mt-8 p-4 bg-mist rounded-lg">
            <div className="text-sm font-semibold mb-2">Demo mode</div>
            <p className="text-xs text-mute mb-3">
              View as Renter to see the application flow
            </p>
            <Link href="/apply/prop-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                View Apply Flow
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}
