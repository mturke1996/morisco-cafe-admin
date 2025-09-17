import { useState } from "react";
import { Users, Plus, Search, Check, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useCustomers,
  useCustomerStats,
  useDeleteCustomer,
} from "@/hooks/useCustomers";
import CustomerStatsCards from "@/components/CustomerStatsCards";
import CustomerCard from "@/components/CustomerCard";
import AddCustomerModal from "@/components/AddCustomerModal";
import AddDebtModal from "@/components/AddDebtModal";
import PayDebtModal from "@/components/PayDebtModal";
import DeleteCustomerModal from "@/components/DeleteCustomerModal";

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isAddDebtModalOpen, setIsAddDebtModalOpen] = useState(false);
  const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
  const [isDeleteCustomerModalOpen, setIsDeleteCustomerModalOpen] =
    useState(false);
  type CustomerDebt = {
    id: string;
    amount: number;
    paid_amount?: number | null;
    status: string;
    description?: string | null;
  };
  type Customer = {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    total_debt: number;
    total_paid: number;
    remaining_debt: number;
    debts?: CustomerDebt[];
  };

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedDebt, setSelectedDebt] = useState<CustomerDebt | null>(null);

  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: stats, isLoading: statsLoading } = useCustomerStats();

  // Filter and categorize customers
  const filteredCustomers =
    customers?.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Separate customers into categories
  const customersWithDebt = filteredCustomers.filter(
    (customer) => customer.remaining_debt > 0
  );
  const customersWithoutDebt = filteredCustomers.filter(
    (customer) => customer.remaining_debt <= 0 && customer.total_debt > 0
  );
  const newCustomers = filteredCustomers.filter(
    (customer) => customer.total_debt === 0
  );

  const handleAddDebt = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsAddDebtModalOpen(true);
  };

  const handlePayDebt = (debt: CustomerDebt) => {
    setSelectedDebt(debt);
    setIsPayDebtModalOpen(true);
  };

  const handleViewProfile = (customerId: string) => {
    navigate(`/customer/${customerId}`);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteCustomerModalOpen(true);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 p-3 sm:p-4 lg:p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <span>العملاء</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            إدارة العملاء ومتابعة الديون والحسابات
          </p>
        </div>

        {/* Stats Cards */}
        <CustomerStatsCards stats={stats} isLoading={statsLoading} />

        {/* Search and Add Controls */}
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="البحث في العملاء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-sm h-10 bg-white/80 border-gray-200/80 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>

              <Button
                className="btn-gradient w-full sm:w-auto text-sm h-10 px-4 shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => setIsAddCustomerModalOpen(true)}
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة عميل
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Tabs */}
        <Tabs defaultValue="with-debt" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/90 backdrop-blur-sm h-12 sm:h-14">
            <TabsTrigger
              value="with-debt"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">عليهم ديون</span>
              <span className="sm:hidden">ديون</span>
              <Badge variant="destructive" className="text-xs">
                {customersWithDebt.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="paid"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">دفعوا دينهم</span>
              <span className="sm:hidden">مدفوع</span>
              <Badge variant="default" className="text-xs bg-green-600">
                {customersWithoutDebt.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">عملاء جدد</span>
              <span className="sm:hidden">جدد</span>
              <Badge variant="secondary" className="text-xs">
                {newCustomers.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Loading State */}
          {customersLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="bg-white/80 backdrop-blur-sm animate-pulse"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Customers with Debt */}
              <TabsContent value="with-debt" className="space-y-3 sm:space-y-4">
                {customersWithDebt.length === 0 ? (
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="text-center py-12 sm:py-16">
                      <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">
                        لا توجد ديون معلقة
                      </h3>
                      <p className="text-muted-foreground">
                        جميع العملاء دفعوا ديونهم أو لا توجد ديون مسجلة
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {customersWithDebt.map((customer) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onViewProfile={handleViewProfile}
                        onAddDebt={handleAddDebt}
                        onPayDebt={handlePayDebt}
                        onDeleteCustomer={handleDeleteCustomer}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Customers who paid their debt */}
              <TabsContent value="paid" className="space-y-3 sm:space-y-4">
                {customersWithoutDebt.length === 0 ? (
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="text-center py-12 sm:py-16">
                      <Check className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">
                        لا توجد عملاء دفعوا ديونهم
                      </h3>
                      <p className="text-muted-foreground">
                        لا يوجد عملاء قاموا بدفع ديونهم بالكامل
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {customersWithoutDebt.map((customer) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onViewProfile={handleViewProfile}
                        onAddDebt={handleAddDebt}
                        onPayDebt={handlePayDebt}
                        onDeleteCustomer={handleDeleteCustomer}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* New customers */}
              <TabsContent value="new" className="space-y-3 sm:space-y-4">
                {newCustomers.length === 0 ? (
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="text-center py-12 sm:py-16">
                      <Users className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">
                        لا توجد عملاء جدد
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchTerm
                          ? "لم يتم العثور على عملاء جدد مطابقين للبحث"
                          : "ابدأ بإضافة العملاء الجدد"}
                      </p>
                      {!searchTerm && (
                        <Button
                          onClick={() => setIsAddCustomerModalOpen(true)}
                          className="btn-gradient"
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة أول عميل
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {newCustomers.map((customer) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onViewProfile={handleViewProfile}
                        onAddDebt={handleAddDebt}
                        onPayDebt={handlePayDebt}
                        onDeleteCustomer={handleDeleteCustomer}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Modals */}
        <AddCustomerModal
          open={isAddCustomerModalOpen}
          onOpenChange={setIsAddCustomerModalOpen}
        />

        <AddDebtModal
          open={isAddDebtModalOpen}
          onOpenChange={setIsAddDebtModalOpen}
          customer={selectedCustomer}
        />

        <PayDebtModal
          open={isPayDebtModalOpen}
          onOpenChange={setIsPayDebtModalOpen}
          debt={selectedDebt}
        />

        <DeleteCustomerModal
          open={isDeleteCustomerModalOpen}
          onOpenChange={setIsDeleteCustomerModalOpen}
          customer={selectedCustomer}
        />
      </div>
    </div>
  );
};

export default Customers;
