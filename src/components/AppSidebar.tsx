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
  Star,
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
    title: "إدارة التقييمات",
    url: "/ratings",
    icon: Star,
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 hover:bg-yellow-100",
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
      className="border-r border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white shadow-2xl"
      collapsible="offcanvas"
      dir="ltr"
      style={{ width: isCollapsed ? "80px" : "280px" }}
    >
      <SidebarHeader className="border-b border-slate-200 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-6 shadow-lg">
        {!isCollapsed ? (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/95 shadow-xl border-2 border-emerald-200">
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
                className="h-8 w-8 text-emerald-600 coffee-fallback"
                style={{ display: "none" }}
              />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-black text-white drop-shadow-lg arabic-font">
                موريسكو كافيه
              </h2>
              <p className="text-sm text-emerald-100 font-semibold arabic-font">
                نظام الإدارة الذكي
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 shadow-lg border-2 border-emerald-200">
              <Coffee className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={`flex gap-2 mt-4 ${isCollapsed ? "flex-col" : ""}`}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/")}
            className={`${
              isCollapsed ? "w-full justify-center" : "flex-1"
            } bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 font-bold rounded-xl transition-all duration-300 hover:scale-105`}
          >
            <Home className="h-4 w-4 mr-2" />
            {!isCollapsed && "الرئيسية"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.history.back()}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 font-bold rounded-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-white via-slate-50 to-white p-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-sm font-bold text-slate-600 px-4 py-4 uppercase tracking-wider arabic-font text-right">
              القائمة الرئيسية
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={`w-full justify-start gap-4 px-4 py-3 text-sm font-bold transition-all duration-300 mx-2 my-1 rounded-xl border border-transparent hover:border-slate-200 hover:shadow-lg data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:border-emerald-500 data-[active=true]:shadow-xl ${
                      isCollapsed ? "justify-center px-2" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <button
                      onClick={() => navigate(item.url)}
                      className={`flex items-center gap-4 w-full text-slate-700 hover:text-slate-900 ${
                        isCollapsed ? "justify-center" : "flex-row-reverse"
                      }`}
                    >
                      {!isCollapsed && (
                        <span className="font-bold text-sm arabic-font text-right">
                          {item.title}
                        </span>
                      )}
                      <div
                        className={`p-3 rounded-xl transition-all duration-300 shadow-sm border border-slate-200/50 ${
                          location.pathname === item.url
                            ? "bg-white/20 text-white"
                            : item.bgColor
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 ${
                            location.pathname === item.url
                              ? "text-white"
                              : item.color
                          }`}
                        />
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4 bg-gradient-to-r from-slate-50 to-white">
        <div className="space-y-4">
          {!isCollapsed && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 shadow-md">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-slate-800 text-sm arabic-font">
                  {user?.email?.split("@")[0] || "المستخدم"}
                </p>
                <p className="text-xs text-slate-500 arabic-font">
                  مدير النظام
                </p>
              </div>
            </div>
          )}

          <Button
            variant="destructive"
            onClick={handleSignOut}
            className={`${
              isCollapsed
                ? "w-full justify-center px-2"
                : "w-full justify-start"
            } gap-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-red-500 hover:bg-red-600`}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && "تسجيل الخروج"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
