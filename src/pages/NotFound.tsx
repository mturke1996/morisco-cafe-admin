import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-4" dir="rtl">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border-green-200">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              الصفحة غير موجودة
            </h2>
            <p className="text-gray-600 mb-6">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Home className="w-4 h-4 ml-2" />
              العودة للصفحة الرئيسية
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للصفحة السابقة
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              المسار المطلوب: {location.pathname}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
