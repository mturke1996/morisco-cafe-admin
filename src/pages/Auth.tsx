import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Shield, Coffee, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في نظام موريسكو كافيه",
      });
      navigate("/");
    } catch (error) {
      console.error("Auth error:", error);

      let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message?: string }).message)
          : "";

      if (message.includes("Invalid login credentials")) {
        errorMessage = "بيانات تسجيل الدخول غير صحيحة";
      } else if (message.includes("Email not confirmed")) {
        errorMessage = "يرجى تأكيد البريد الإلكتروني أولاً";
      }

      toast({
        title: "خطأ في تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* خلفية إسلامية متحركة */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 border-4 border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-32 h-32 border-4 border-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-10 right-1/3 w-40 h-40 border-4 border-white rounded-full animate-pulse delay-700"></div>
      </div>

      {/* محتوى رئيسي */}
      <div className="w-full max-w-lg mx-auto space-y-8 relative z-10">
        {/* شعار وعنوان التطبيق */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl border-8 border-emerald-600/30">
              <img
                src="/lovable-uploads/754f3f2a-b792-43bb-a32a-e44c16248177.png"
                alt="موريسكو كافيه"
                className="h-20 w-20 object-contain"
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
                className="h-16 w-16 text-emerald-600 coffee-fallback animate-pulse"
                style={{ display: "none" }}
              />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full animate-ping"></div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-white arabic-font drop-shadow-2xl">
              موريسكو كافيه
            </h1>
            <p className="text-emerald-200 font-semibold text-xl arabic-font">
              نظام الإدارة الاحترافي
            </p>
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg border border-white/30">
              <Shield className="w-5 h-5" />
              <span className="arabic-font">دخول آمن ومحمي</span>
            </div>
          </div>
        </div>

        {/* نموذج تسجيل الدخول */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-lg">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 arabic-font">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg arabic-font">
              أدخل بياناتك للوصول إلى لوحة الإدارة
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 text-right block arabic-font">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-600 w-5 h-5" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@morisco.cafe"
                    required
                    className="h-14 pr-14 text-right bg-gray-50 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-lg arabic-font transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 text-right block arabic-font">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-600 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-14 pr-14 pl-14 text-right bg-gray-50 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-lg arabic-font transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-lg arabic-font"
                >
                  <Shield className="w-6 h-6 ml-3" />
                  {loading ? "جاري تسجيل الدخول..." : "دخول آمن للنظام"}
                </Button>
              </div>
            </form>

            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm arabic-font">
                © 2024 موريسكو كافيه - نظام إدارة محمي ومؤمن
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
