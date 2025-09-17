import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Star,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Shield,
  MessageSquare,
  Phone,
  Calendar,
  User,
  BarChart3,
  RefreshCw,
  Download,
  Plus,
  Clock,
} from "lucide-react";
import {
  useRatings,
  useRatingStats,
  useApproveRating,
  useRejectRating,
  useDeleteRating,
} from "@/hooks/useRatings";
import { Rating, RatingFilters } from "@/types/ratings";
import { useToast } from "@/hooks/use-toast";
import {
  containsProfanity,
  extractProfanityWords,
  getProfanityLevel,
  generateProfanityReport,
} from "@/utils/profanityFilter";

const RatingsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDetails, setShowDetails] = useState<Rating | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { toast } = useToast();

  // Filters
  const filters: RatingFilters = {
    search: searchTerm || undefined,
    rating: selectedRating !== "all" ? parseInt(selectedRating) : undefined,
    is_approved:
      statusFilter === "approved"
        ? true
        : statusFilter === "pending"
        ? false
        : undefined,
    is_flagged: statusFilter === "flagged" ? true : undefined,
  };

  const { data: ratings = [], isLoading } = useRatings(filters);
  const { data: stats } = useRatingStats();
  const approveRating = useApproveRating();
  const rejectRating = useRejectRating();
  const deleteRating = useDeleteRating();

  const handleApprove = (id: string) => {
    approveRating.mutate(id, {
      onSuccess: () => {
        toast({
          title: "تم الموافقة",
          description: "تم الموافقة على التقييم بنجاح",
        });
      },
    });
  };

  const handleReject = (id: string) => {
    rejectRating.mutate(id, {
      onSuccess: () => {
        toast({
          title: "تم الرفض",
          description: "تم رفض التقييم",
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteRating.mutate(id, {
      onSuccess: () => {
        toast({
          title: "تم الحذف",
          description: "تم حذف التقييم بنجاح",
        });
      },
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-100";
    if (rating >= 3) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusBadge = (rating: Rating) => {
    if (rating.is_flagged) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Flag className="w-3 h-3" />
          محتوى مسيء
        </Badge>
      );
    }
    if (rating.is_approved) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          معتمد
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        في الانتظار
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل التقييمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 arabic-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            إدارة التقييمات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة تقييمات العملاء والتعليقات
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    إجمالي التقييمات
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.total_ratings}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    متوسط التقييم
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.average_rating.toFixed(1)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">معتمدة</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.approved_ratings}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">محتوى مسيء</p>
                  <p className="text-2xl font-bold text-red-900">
                    {
                      ratings.filter(
                        (r) => r.comment && containsProfanity(r.comment)
                      ).length
                    }
                  </p>
                  <p className="text-xs text-red-600">
                    {ratings.filter(
                      (r) => r.comment && containsProfanity(r.comment)
                    ).length > 0
                      ? `${
                          ratings.filter(
                            (r) => r.comment && containsProfanity(r.comment)
                          ).length
                        } تعليق يحتوي على شتائم`
                      : "لا توجد تعليقات مسيئة"}
                  </p>
                </div>
                <Flag className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث في التقييمات</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="ابحث في التقييمات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-32">
                <Label htmlFor="rating">التقييم</Label>
                <Select
                  value={selectedRating}
                  onValueChange={setSelectedRating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع التقييمات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التقييمات</SelectItem>
                    <SelectItem value="5">5 نجوم</SelectItem>
                    <SelectItem value="4">4 نجوم</SelectItem>
                    <SelectItem value="3">3 نجوم</SelectItem>
                    <SelectItem value="2">2 نجوم</SelectItem>
                    <SelectItem value="1">1 نجمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-40">
                <Label htmlFor="profanity">المحتوى المسيء</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="approved">معتمدة</SelectItem>
                    <SelectItem value="pending">معلقة</SelectItem>
                    <SelectItem value="flagged">محتوى مسيء</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Label htmlFor="status">الحالة</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="approved">معتمدة</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="flagged">محتوى مسيء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings List */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد تقييمات
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "لم يتم العثور على تقييمات تطابق البحث"
                  : "لم يتم إضافة أي تقييمات بعد"}
              </p>
            </CardContent>
          </Card>
        ) : (
          ratings.map((rating) => (
            <motion.div
              key={rating.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Rating Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {rating.customer_name}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {rating.customer_phone}
                          </p>
                        </div>
                        {getStatusBadge(rating)}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(rating.rating)}
                        </div>
                        <Badge className={getRatingColor(rating.rating)}>
                          {rating.rating} نجوم
                        </Badge>
                      </div>

                      {rating.comment && (
                        <div className="mb-2">
                          <p className="text-gray-700 mb-1">{rating.comment}</p>
                          {containsProfanity(rating.comment) && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-700 font-medium">
                                محتوى مسيء محتمل
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                {getProfanityLevel(rating.comment) === "high"
                                  ? "عالي"
                                  : getProfanityLevel(rating.comment) ===
                                    "medium"
                                  ? "متوسط"
                                  : "منخفض"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {rating.table_number && (
                          <span>طاولة: {rating.table_number}</span>
                        )}
                        {rating.order_id && <span>طلب: {rating.order_id}</span>}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(rating.created_at).toLocaleDateString(
                            "ar-SA"
                          )}
                        </span>
                      </div>

                      {rating.is_flagged && rating.flagged_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {rating.flagged_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetails(rating)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        التفاصيل
                      </Button>

                      {rating.comment && containsProfanity(rating.comment) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const report = generateProfanityReport(
                              rating.comment!
                            );
                            toast({
                              title: "تقرير المحتوى المسيء",
                              description: `تم العثور على ${
                                report.profanityCount
                              } كلمة مسيئة: ${report.words.join(", ")}`,
                              variant: "destructive",
                            });
                          }}
                          className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Shield className="w-4 h-4" />
                          تحليل المحتوى
                        </Button>
                      )}

                      {!rating.is_approved && !rating.is_flagged && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(rating.id)}
                          className="flex items-center gap-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          موافقة
                        </Button>
                      )}

                      {rating.is_approved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(rating.id)}
                          className="flex items-center gap-2"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          رفض
                        </Button>
                      )}

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(rating.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              تفاصيل التقييم
            </DialogTitle>
          </DialogHeader>
          {showDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم العميل</Label>
                  <p className="font-medium">{showDetails.customer_name}</p>
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <p className="font-medium">{showDetails.customer_phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>التقييم</Label>
                  <div className="flex items-center gap-2">
                    {renderStars(showDetails.rating)}
                    <span className="font-medium">
                      {showDetails.rating} نجوم
                    </span>
                  </div>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <div className="mt-1">{getStatusBadge(showDetails)}</div>
                </div>
              </div>

              {showDetails.comment && (
                <div>
                  <Label>التعليق</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">
                    {showDetails.comment}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {showDetails.table_number && (
                  <div>
                    <Label>رقم الطاولة</Label>
                    <p className="font-medium">{showDetails.table_number}</p>
                  </div>
                )}
                {showDetails.order_id && (
                  <div>
                    <Label>معرف الطلب</Label>
                    <p className="font-medium">{showDetails.order_id}</p>
                  </div>
                )}
              </div>

              <div>
                <Label>تاريخ التقييم</Label>
                <p className="font-medium">
                  {new Date(showDetails.created_at).toLocaleString("ar-SA")}
                </p>
              </div>

              {showDetails.is_flagged && showDetails.flagged_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="text-red-700">سبب وضع العلامة</Label>
                  <p className="text-red-700 mt-1">
                    {showDetails.flagged_reason}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetails(null)}>
                  إغلاق
                </Button>
                {!showDetails.is_approved && !showDetails.is_flagged && (
                  <Button onClick={() => handleApprove(showDetails.id)}>
                    موافقة
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatingsManagement;
