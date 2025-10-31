import { Home, Church, Receipt, LayoutDashboard, Calendar, Building2, FileText, BookOpen, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const publicItems = [
    { title: "홈", url: "/", icon: Home },
    { title: "교회 목록", url: "/churches", icon: Church },
    { title: "영수증 조회", url: "/receipts", icon: Receipt },
  ];

  const userItems = user ? [
    { title: "대시보드", url: "/dashboard", icon: LayoutDashboard },
  ] : [];

  const adminItems = user?.role === "admin" ? [
    { title: "관리자 대시보드", url: "/admin", icon: LayoutDashboard },
    { title: "이벤트 관리", url: "/admin/events/manage", icon: Calendar },
    { title: "교회 관리", url: "/admin/churches/manage", icon: Building2 },
    { title: "영수증 관리", url: "/admin/receipts/manage", icon: FileText },
    { title: "BT 관리", url: "/admin/bt/manage", icon: BookOpen },
  ] : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Public Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "text-center" : ""}>
            {!isCollapsed && "메뉴"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end
                      className={({ isActive }) => 
                        isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Menu */}
        {user && userItems.length > 0 && (
          <>
            <Separator />
            <SidebarGroup>
              <SidebarGroupLabel className={isCollapsed ? "text-center" : ""}>
                {!isCollapsed && "내 메뉴"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url}
                          className={({ isActive }) => 
                            isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Admin Menu */}
        {adminItems.length > 0 && (
          <>
            <Separator />
            <SidebarGroup>
              <SidebarGroupLabel className={isCollapsed ? "text-center" : ""}>
                {!isCollapsed && "관리자"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url}
                          className={({ isActive }) => 
                            isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer with logout */}
      {user && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button
                variant="ghost"
                className={`w-full ${isCollapsed ? "px-2" : "justify-start"}`}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">로그아웃</span>}
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
