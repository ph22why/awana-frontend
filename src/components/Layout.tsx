import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          <AppHeader />
          
          <main className="flex-1 p-6">
            <div className="container mx-auto">
              <AppBreadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
