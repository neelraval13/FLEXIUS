// src/app/(app)/layout.tsx
import AppShell from "@/components/app-shell";
import OfflineSync from "@/components/offline-sync";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <OfflineSync />
      {children}
    </AppShell>
  );
}
