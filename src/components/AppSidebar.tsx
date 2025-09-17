import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Clock,
  Receipt,
  UserCheck,
  FileText,
  Settings,
  LogOut,
  Coffee,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "الرئيسية",
    url: "/",
    icon: Home,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 hover:bg-emerald-100",
  },
  {
    title: "الموظفين",
    url: "/employees",
    icon: Users,
    color: "text-blue-700",
    bgColor: "bg-blue-50 hover:bg-blue-100",
  },
  {
    title: "الحضور والانصراف",
    url: "/attendance",
    icon: Clock,
    color: "text-purple-700",
    bgColor: "bg-purple-50 hover:bg-purple-100",
  },
  {
    title: "العملاء",
    url: "/customers",
    icon: UserCheck,
    color: "text-orange-700",
    bgColor: "bg-orange-50 hover:bg-orange-100",
  },
  {
    title: "إدارة القائمة",
    url: "/menu",
    icon: Menu,
    color: "text-green-700",
    bgColor: "bg-green-50 hover:bg-green-100",
  },
  {
    title: "المصروفات",
    url: "/expenses",
    icon: Receipt,
    color: "text-red-700",
    bgColor: "bg-red-50 hover:bg-red-100",
  },
  {
    title: "التقارير",
    url: "/reports",
    icon: FileText,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
  },
  {
    title: "الإعدادات",
    url: "/settings",
    icon: Settings,
    color: "text-gray-700",
    bgColor: "bg-gray-50 hover:bg-gray-100",
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "تم تسجيل خروجك من النظام",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar
      variant="inset"
      className="border-r border-border bg-gradient-to-b from-background via-muted/50 to-background shadow-lg"
      collapsible="offcanvas"
    >
      <SidebarHeader className="border-b border-border bg-gradient-to-r from-primary to-secondary p-6 shadow-md">
        {!isCollapsed && (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-lg border border-border">
              <img
                src="/src/assets/morisco-logo.png"
                alt="موريسكو كافيه"
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const coffeeIcon =
                    target.parentElement?.querySelector(".coffee-fallback");
                  if (coffeeIcon)
                    (coffeeIcon as HTMLElement).style.display = "block";
                }}
              />
              <Coffee
                className="h-8 w-8 text-primary coffee-fallback"
                style={{ display: "none" }}
              />
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-primary-foreground arabic-font">
                موريسكو كافيه
              </h2>
              <p className="text-sm text-primary-foreground/80 font-medium arabic-font">
                نظام الإدارة الذكي
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={`flex gap-3 mt-4 ${isCollapsed ? "flex-col" : ""}`}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/")}
            className={`${
              isCollapsed ? "w-full" : "flex-1"
            } bg-background/20 hover:bg-background/30 text-primary-foreground border-primary-foreground/20 font-bold`}
          >
            <Home className="h-4 w-4 ml-2" />
            {!isCollapsed && "الرئيسية"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.history.back()}
            className="bg-background/20 hover:bg-background/30 text-primary-foreground border-primary-foreground/20 font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-background via-muted/30 to-background">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-sm font-bold text-foreground/70 px-4 py-4 uppercase tracking-wider arabic-font">
              القائمة الرئيسية
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={`w-full justify-start gap-4 px-4 py-3 text-sm font-bold transition-all duration-300 mx-3 my-2 rounded-xl border border-transparent hover:border-border hover:shadow-md data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-primary data-[active=true]:shadow-lg ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <button
                      onClick={() => navigate(item.url)}
                      className={`flex items-center gap-4 w-full text-foreground hover:text-foreground ${
                        isCollapsed ? "justify-center" : ""
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl ${item.bgColor} transition-all duration-300 shadow-sm border border-border/50`}
                      >
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      {!isCollapsed && (
                        <span className="font-bold text-sm arabic-font">
                          {item.title}
                        </span>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4 bg-gradient-to-r from-muted/50 to-background">
        <div className="space-y-4">
          {!isCollapsed && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md">
                <Coffee className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-card-foreground text-sm arabic-font">
                  {user?.email?.split("@")[0] || "المستخدم"}
                </p>
                <p className="text-xs text-muted-foreground arabic-font">
                  مدير النظام
                </p>
              </div>
            </div>
          )}

          <Button
            variant="destructive"
            onClick={handleSignOut}
            className={`${
              isCollapsed ? "w-full justify-center" : "w-full justify-start"
            } gap-3 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 rounded-xl`}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && "تسجيل الخروج"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
