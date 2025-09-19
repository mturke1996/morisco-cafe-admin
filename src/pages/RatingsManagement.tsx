import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Reply,
  Edit,
  Save,
  X,
} from "lucide-react";
import {
  useRatings,
  useRatingStats,
  useApproveRating,
  useRejectRating,
  useDeleteRating,
  useAddRatingReply,
  useUpdateRatingReply,
  useDeleteRatingReply,
} from "@/hooks/useRatings";
import { Rating, RatingFilters, RatingReply } from "@/types/ratings";
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
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Rating | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingReply, setEditingReply] = useState<RatingReply | null>(null);
  const [editReplyText, setEditReplyText] = useState("");

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
  const addRatingReply = useAddRatingReply();
  const updateRatingReply = useUpdateRatingReply();
  const deleteRatingReply = useDeleteRatingReply();

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

  const handleReply = (rating: Rating) => {
    setReplyingTo(rating);
    setReplyText("");
    setShowReplyDialog(true);
  };

  const handleAddReply = () => {
    if (!replyingTo || !replyText.trim()) return;

    addRatingReply.mutate(
      {
        rating_id: replyingTo.id,
        reply_text: replyText.trim(),
        replied_by: "موريسكو كافيه",
      },
      {
        onSuccess: () => {
          toast({
            title: "تم إضافة الرد",
            description: "تم إضافة الرد بنجاح",
          });
          setShowReplyDialog(false);
          setReplyingTo(null);
          setReplyText("");
        },
      }
    );
  };

  const handleEditReply = (reply: RatingReply) => {
    setEditingReply(reply);
    setEditReplyText(reply.reply_text);
  };

  const handleUpdateReply = () => {
    if (!editingReply || !editReplyText.trim()) return;

    updateRatingReply.mutate(
      {
        id: editingReply.id,
        reply_text: editReplyText.trim(),
      },
      {
        onSuccess: () => {
          toast({
            title: "تم تحديث الرد",
            description: "تم تحديث الرد بنجاح",
          });
          setEditingReply(null);
          setEditReplyText("");
        },
      }
    );
  };

  const handleDeleteReply = (id: string) => {
    deleteRatingReply.mutate(id, {
      onSuccess: () => {
        toast({
          title: "تم حذف الرد",
          description: "تم حذف الرد بنجاح",
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
    <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 arabic-text">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              إدارة التقييمات
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              إدارة تقييمات العملاء والتعليقات
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">تصدير</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">تحديث</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-600">
                    إجمالي التقييمات
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-900">
                    {stats.total_ratings}
                  </p>
                </div>
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-600">
                    متوسط التقييم
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-green-900">
                    {stats.average_rating.toFixed(1)}
                  </p>
                </div>
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-yellow-600">
                    معتمدة
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-900">
                    {stats.approved_ratings}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-red-600">
                    محتوى مسيء
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-red-900">
                    {
                      ratings.filter(
                        (r) => r.comment && containsProfanity(r.comment)
                      ).length
                    }
                  </p>
                  <p className="text-xs text-red-600 hidden sm:block">
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
                <Flag className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm">
                البحث في التقييمات
              </Label>
              <div className="relative mt-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="ابحث في التقييمات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="rating" className="text-sm">
                  التقييم
                </Label>
                <Select
                  value={selectedRating}
                  onValueChange={setSelectedRating}
                >
                  <SelectTrigger className="mt-1">
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

              <div>
                <Label htmlFor="status" className="text-sm">
                  الحالة
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
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

              <div className="sm:col-span-1">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRating("all");
                    setStatusFilter("all");
                  }}
                  className="w-full mt-6 sm:mt-7 text-sm"
                >
                  <Filter className="w-4 h-4 ml-1" />
                  مسح الفلاتر
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings List */}
      <div className="space-y-3 sm:space-y-4">
        {ratings.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                لا توجد تقييمات
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
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
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Rating Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg truncate">
                            {rating.customer_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 truncate">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">
                              {rating.customer_phone}
                            </span>
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {getStatusBadge(rating)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(rating.rating)}
                        </div>
                        <Badge
                          className={`${getRatingColor(rating.rating)} text-xs`}
                        >
                          {rating.rating} نجوم
                        </Badge>
                      </div>

                      {rating.comment && (
                        <div className="mb-2">
                          <p className="text-sm sm:text-base text-gray-700 mb-1 break-words">
                            {rating.comment}
                          </p>
                          {containsProfanity(rating.comment) && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-red-700 font-medium">
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

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        {rating.table_number && (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            طاولة: {rating.table_number}
                          </span>
                        )}
                        {rating.order_id && (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            طلب: {rating.order_id}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
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

                      {/* Replies Section */}
                      {rating.replies && rating.replies.length > 0 && (
                        <div className="mt-3 sm:mt-4 space-y-2">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                            <Reply className="w-3 h-3 sm:w-4 sm:h-4" />
                            الردود ({rating.replies.length})
                          </h4>
                          <div className="space-y-2">
                            {rating.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-800 break-words">
                                      {reply.reply_text}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-xs text-gray-500">
                                      <span>بواسطة: {reply.replied_by}</span>
                                      <span className="hidden sm:inline">
                                        •
                                      </span>
                                      <span className="block sm:inline">
                                        {new Date(
                                          reply.created_at
                                        ).toLocaleString("ar-SA")}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditReply(reply)}
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 hover:bg-blue-100"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteReply(reply.id)
                                      }
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:bg-red-100"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetails(rating)}
                        className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">التفاصيل</span>
                        <span className="sm:hidden">تفاصيل</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReply(rating)}
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Reply className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">رد</span>
                        <span className="sm:hidden">رد</span>
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
                          className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">
                            تحليل المحتوى
                          </span>
                          <span className="sm:hidden">تحليل</span>
                        </Button>
                      )}

                      {!rating.is_approved && !rating.is_flagged && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(rating.id)}
                          className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">موافقة</span>
                          <span className="sm:hidden">موافقة</span>
                        </Button>
                      )}

                      {rating.is_approved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(rating.id)}
                          className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">رفض</span>
                          <span className="sm:hidden">رفض</span>
                        </Button>
                      )}

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(rating.id)}
                        className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">حذف</span>
                        <span className="sm:hidden">حذف</span>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              تفاصيل التقييم
            </DialogTitle>
          </DialogHeader>
          {showDetails && (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">اسم العميل</Label>
                  <p className="font-medium text-sm sm:text-base">
                    {showDetails.customer_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm">رقم الهاتف</Label>
                  <p className="font-medium text-sm sm:text-base">
                    {showDetails.customer_phone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">التقييم</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(showDetails.rating)}
                    <span className="font-medium text-sm sm:text-base">
                      {showDetails.rating} نجوم
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">الحالة</Label>
                  <div className="mt-1">{getStatusBadge(showDetails)}</div>
                </div>
              </div>

              {showDetails.comment && (
                <div>
                  <Label className="text-sm">التعليق</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm sm:text-base break-words">
                    {showDetails.comment}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {showDetails.table_number && (
                  <div>
                    <Label className="text-sm">رقم الطاولة</Label>
                    <p className="font-medium text-sm sm:text-base">
                      {showDetails.table_number}
                    </p>
                  </div>
                )}
                {showDetails.order_id && (
                  <div>
                    <Label className="text-sm">معرف الطلب</Label>
                    <p className="font-medium text-sm sm:text-base">
                      {showDetails.order_id}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm">تاريخ التقييم</Label>
                <p className="font-medium text-sm sm:text-base">
                  {new Date(showDetails.created_at).toLocaleString("ar-SA")}
                </p>
              </div>

              {showDetails.is_flagged && showDetails.flagged_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="text-red-700 text-sm">
                    سبب وضع العلامة
                  </Label>
                  <p className="text-red-700 mt-1 text-sm sm:text-base break-words">
                    {showDetails.flagged_reason}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(null)}
                  className="text-sm h-8 sm:h-9"
                >
                  إغلاق
                </Button>
                {!showDetails.is_approved && !showDetails.is_flagged && (
                  <Button
                    onClick={() => handleApprove(showDetails.id)}
                    className="text-sm h-8 sm:h-9"
                  >
                    موافقة
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Reply className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              إضافة رد على التقييم
            </DialogTitle>
          </DialogHeader>
          {replyingTo && (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                  {replyingTo.customer_name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">
                  {replyingTo.comment}
                </p>
                <div className="flex items-center gap-2">
                  {renderStars(replyingTo.rating)}
                  <span className="text-xs sm:text-sm text-gray-500">
                    {replyingTo.rating} نجوم
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="reply-text" className="text-sm">
                  نص الرد *
                </Label>
                <Textarea
                  id="reply-text"
                  placeholder="اكتب ردك هنا..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowReplyDialog(false)}
                  className="text-sm h-8 sm:h-9"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddReply}
                  disabled={!replyText.trim() || addRatingReply.isPending}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-sm h-8 sm:h-9"
                >
                  {addRatingReply.isPending ? (
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin ml-1" />
                  ) : (
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  )}
                  {addRatingReply.isPending ? "جاري الإضافة..." : "إضافة الرد"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Reply Dialog */}
      <Dialog open={!!editingReply} onOpenChange={() => setEditingReply(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              تعديل الرد
            </DialogTitle>
          </DialogHeader>
          {editingReply && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="edit-reply-text" className="text-sm">
                  نص الرد *
                </Label>
                <Textarea
                  id="edit-reply-text"
                  placeholder="اكتب ردك هنا..."
                  value={editReplyText}
                  onChange={(e) => setEditReplyText(e.target.value)}
                  rows={4}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEditingReply(null)}
                  className="text-sm h-8 sm:h-9"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpdateReply}
                  disabled={
                    !editReplyText.trim() || updateRatingReply.isPending
                  }
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-sm h-8 sm:h-9"
                >
                  {updateRatingReply.isPending ? (
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin ml-1" />
                  ) : (
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  )}
                  {updateRatingReply.isPending
                    ? "جاري التحديث..."
                    : "حفظ التغييرات"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatingsManagement;
