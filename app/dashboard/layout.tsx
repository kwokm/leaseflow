import Link from "next/link";
import { BrandMark, BrandWord } from "@/components/brand";
import { DeskFrame } from "@/components/desk/desk-frame";
import { PageWash } from "@/components/page-wash";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white print:bg-white">
      <PageWash />

      <header className="relative z-50 bg-white print:hidden">
        <div className="mx-auto flex h-16 max-w-header items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <BrandMark />
            <BrandWord />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/apply/prop-1">Apply as renter</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Open the desk</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-shell px-5 pb-12 pt-2 sm:px-8">
        <DeskFrame>{children}</DeskFrame>
      </div>
    </div>
  );
}
