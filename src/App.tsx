import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  createBrowserRouter,
} from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy load components for better performance
const Employees = lazy(() => import("./pages/Employees"));
const EmployeeProfile = lazy(() => import("./pages/EmployeeProfile"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Customers = lazy(() => import("./pages/Customers"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVhProperty();
    window.addEventListener("resize", setVhProperty);
    window.addEventListener("orientationchange", setVhProperty);

    return () => {
      window.removeEventListener("resize", setVhProperty);
      window.removeEventListener("orientationchange", setVhProperty);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              <Route path="/auth" element={<Login />} />
              <Route
                path="/*"
                element={
                  <Layout>
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Index />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees"
                        element={
                          <ProtectedRoute>
                            <Suspense
                              fallback={
                                <LoadingSpinner size="lg" className="h-64" />
                              }
                            >
                              <Employees />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/:employeeId"
                        element={
                          <ProtectedRoute>
                            <Suspense
                              fallback={
                                <LoadingSpinner size="lg" className="h-64" />
                              }
                            >
                              <EmployeeProfile />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance"
                        element={
                          <ProtectedRoute>
                            <Suspense
                              fallback={
                                <LoadingSpinner size="lg" className="h-64" />
                              }
                            >
                              <Attendance />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/expenses"
                        element={
                          <ProtectedRoute>
                            <Suspense
                              fallback={
                                <LoadingSpinner size="lg" className="h-64" />
                              }
                            >
                              <Expenses />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reports"
                        element={
                          <ProtectedRoute>
                            <Suspense
                              fallback={
                                <LoadingSpinner size="lg" className="h-64" />
                              }
                            >
                              <Reports />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <Suspense
                              fallback={
                                <LoadingSpinner size="lg" className="h-64" />
                              }
                            >
                              <Settings />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customers"
                        element={
                          <ProtectedRoute>
                            <Suspense
                              fallback={
                                <LoadingSpinner size="lg" className="h-64" />
                              }
                            >
                              <Customers />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customer/:customerId"
                        element={
                          <ProtectedRoute>
                            <Suspense
                              fallback={
                                <LoadingSpinner size="lg" className="h-64" />
                              }
                            >
                              <CustomerProfile />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="*"
                        element={
                          <Suspense
                            fallback={
                              <div className="flex items-center justify-center h-64">
                                جاري التحميل...
                              </div>
                            }
                          >
                            <NotFound />
                          </Suspense>
                        }
                      />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
