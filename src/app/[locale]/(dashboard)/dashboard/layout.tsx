import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense
        fallback={<div aria-hidden className="h-16 border-b border-border/60" />}
      >
        <DashboardHeader />
      </Suspense>
      {children}
    </div>
  );
}