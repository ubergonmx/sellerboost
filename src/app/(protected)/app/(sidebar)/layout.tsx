import { SidebarProvider } from "@/components/layouts/sidebar/sidebar";
import { SidebarLayout } from "@/components/layouts/sidebar/sidebar-layout";

export default function MainSidebarLayout({ 
  children, 
  panel
}: Readonly<{
  children: React.ReactNode;
  panel: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <SidebarLayout panel={panel}>
        {children}
      </SidebarLayout>
    </SidebarProvider>
  );
}