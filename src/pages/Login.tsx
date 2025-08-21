
import { useState } from "react";
import { Eye, EyeOff, Coffee, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message === "Invalid login credentials" 
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" 
            : "تحقق من بياناتك وأعد المحاولة",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "مرحباً بك!",
        description: "تم تسجيل الدخول بنجاح",
        variant: "default",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-teal-100 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-10 w-16 h-16 bg-emerald-200 rounded-full opacity-50 animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-teal-200 rounded-full opacity-30 animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* الشعار والعنوان */}
        <div className="text-center mb-8 space-y-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img 
                src="/src/assets/morisco-logo.png" 
                alt="موريسكو كافيه" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const coffeeIcon = target.parentElement?.querySelector('.coffee-fallback');
                  if (coffeeIcon) (coffeeIcon as HTMLElement).style.display = 'block';
                }}
              />
              <Coffee className="w-14 h-14 text-white coffee-fallback hidden" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-2xl animate-ping"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 arabic-font">
              موريسكو كافيه
            </h1>
            <h2 className="text-xl font-semibold text-emerald-600 mb-1 arabic-font">
              نظام إدارة المقهى
            </h2>
            <p className="text-gray-600 text-sm arabic-font">
              ادخل بياناتك للوصول إلى لوحة التحكم
            </p>
          </div>
        </div>

        {/* نموذج تسجيل الدخول */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl text-gray-800 mb-1 arabic-font">تسجيل الدخول</CardTitle>
            <CardDescription className="text-gray-600 arabic-font">
              ادخل بياناتك للوصول إلى حسابك
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium text-gray-700 arabic-font">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-4 h-4" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@cafe.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="pr-10 h-12 bg-gray-50/50 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 text-right"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium text-gray-700 arabic-font">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-4 h-4" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="pr-10 pl-10 h-12 bg-gray-50/50 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 text-right"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 arabic-font text-lg"
                disabled={isLoading}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="text-center pt-4">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-3 rounded-lg">
                <p className="text-sm text-emerald-700 arabic-font font-medium">
                  🔒 نظام آمن ومحمي
                </p>
                <p className="text-xs text-emerald-600 arabic-font mt-1">
                  إنشاء الحسابات الجديدة متاح للمديرين فقط
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 arabic-font">
            © 2024 موريسكو كافيه. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
