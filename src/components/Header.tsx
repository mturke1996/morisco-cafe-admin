import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  ArrowLeft,
  Home,
  Calendar,
  Coffee,
  Menu,
  X,
} from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      };
      setCurrentDate(now.toLocaleDateString("en-US", options));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      setMobileMenuOpen(false);
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

  if (!user) return null;

  return (
    <header
      className="bg-gradient-to-l from-emerald-500 via-emerald-600 to-emerald-700 shadow-2xl border-b-2 border-emerald-800 sticky top-0 z-50 backdrop-blur-md"
      dir="rtl"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Coffee Shop Name & Logo - Right side */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/95 shadow-xl border-2 border-emerald-200 overflow-hidden backdrop-blur-sm hover:scale-105 transition-all duration-300">
                <img
                  src="/lovable-uploads/6f94ee33-78e5-4785-9e28-4687fe0587d6.png"
                  alt="موريسكو كافيه"
                  className="h-10 w-10 object-contain drop-shadow-md"
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
                  className="h-7 w-7 text-emerald-600 coffee-fallback"
                  style={{ display: "none" }}
                />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-black text-white drop-shadow-2xl font-cairo tracking-wide">
                  موريسكو كافيه
                </h1>
                <p className="text-sm text-emerald-100 font-semibold font-cairo">
                  نظام الإدارة الذكي
                </p>
              </div>
            </div>

            {/* Date - Hidden on small screens */}
            <div className="hidden lg:flex items-center gap-3 bg-emerald-800/40 rounded-xl px-6 py-3 backdrop-blur-lg border border-emerald-400/30 shadow-xl hover:bg-emerald-800/50 transition-all duration-300">
              <Calendar className="h-5 w-5 text-emerald-100 drop-shadow-sm" />
              <span className="text-emerald-100 font-bold text-sm font-cairo drop-shadow-sm">
                {currentDate}
              </span>
            </div>
          </div>

          {/* Desktop Navigation - Left side */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Quick Home Button - Outside Menu */}
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/");
              }}
              className="bg-emerald-800/40 hover:bg-emerald-800/60 text-emerald-100 backdrop-blur-lg border-2 border-emerald-400/30 hover:border-emerald-300/50 rounded-xl px-6 py-3 font-bold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl group shadow-lg"
            >
              <Home className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-cairo">الرئيسية</span>
            </Button>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {location.pathname !== "/" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.history.back();
                  }}
                  className="bg-emerald-800/30 hover:bg-emerald-800/50 text-emerald-100 backdrop-blur-lg px-4 py-3 rounded-xl border-2 border-emerald-400/20 hover:border-emerald-300/40 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                </Button>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 bg-emerald-800/40 rounded-xl px-6 py-3 backdrop-blur-lg border-2 border-emerald-400/30 shadow-xl hover:bg-emerald-800/50 transition-all duration-300">
              <div className="w-8 h-8 bg-emerald-700/50 rounded-lg flex items-center justify-center">
                <span className="text-emerald-100 font-bold text-xs">👤</span>
              </div>
              <span className="text-emerald-100 font-bold text-sm font-cairo drop-shadow-sm">
                {user?.email?.split("@")[0] || "المستخدم"}
              </span>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleSignOut}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl font-bold text-sm px-6 py-3 rounded-xl transform hover:scale-105 transition-all duration-300 border-2 border-red-400 hover:border-red-300 group"
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-cairo">خروج</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center gap-3">
            {/* Quick Home Button for Mobile */}
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/");
              }}
              className="bg-emerald-800/40 hover:bg-emerald-800/60 text-emerald-100 backdrop-blur-lg border border-emerald-400/30 hover:border-emerald-300/50 rounded-xl p-3 transition-all duration-300 transform hover:scale-110 shadow-lg"
            >
              <Home className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-emerald-800/30 hover:bg-emerald-800/50 text-emerald-100 p-3 rounded-xl border border-emerald-400/20 hover:border-emerald-300/40 transition-all duration-300 backdrop-blur-lg shadow-lg"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-6 pb-4 border-t border-emerald-400/30 pt-6 backdrop-blur-lg bg-emerald-800/20 rounded-2xl mx-2">
            <div className="space-y-4">
              {/* Date Display */}
              <div className="flex items-center gap-3 text-emerald-100 text-sm mb-6 bg-emerald-800/30 rounded-2xl p-4 backdrop-blur-lg border border-emerald-400/20 shadow-lg">
                <Calendar className="h-4 w-4" />
                <span className="font-cairo font-medium">{currentDate}</span>
              </div>

              {/* Navigation Buttons */}
              {location.pathname !== "/" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.history.back();
                  }}
                  className="w-full bg-emerald-800/30 hover:bg-emerald-800/50 text-emerald-100 font-bold rounded-2xl border border-emerald-400/20 hover:border-emerald-300/40 transition-all duration-300 py-3 mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="font-cairo">رجوع</span>
                </Button>
              )}

              {/* User Info */}
              <div className="flex items-center gap-4 bg-emerald-800/40 rounded-2xl px-6 py-4 backdrop-blur-lg mb-4 border border-emerald-400/30 shadow-lg">
                <div className="w-10 h-10 bg-emerald-700/50 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-100 font-bold">👤</span>
                </div>
                <span className="text-emerald-100 font-bold text-sm font-cairo">
                  {user?.email?.split("@")[0] || "المستخدم"}
                </span>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleSignOut}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl transform hover:scale-105 transition-all duration-300 border-2 border-red-400 py-3 shadow-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="font-cairo">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
