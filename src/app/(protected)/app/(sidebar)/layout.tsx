import { SidebarProvider } from "@/components/layouts/sidebar/sidebar";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      {children}
    </SidebarProvider>
  );
}