
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { ShiftClosureData } from "@/hooks/useShiftClosure";
import ShiftClosureCard from "./ShiftClosureCard";
import PrintShiftClosureModal from "./PrintShiftClosureModal";

interface ShiftClosuresListProps {
  shiftClosures: ShiftClosureData[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAddShiftClosure: () => void;
}

const ShiftClosuresList = ({ 
  shiftClosures, 
  selectedDate, 
  onDateChange, 
  onAddShiftClosure 
}: ShiftClosuresListProps) => {
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedClosure, setSelectedClosure] = useState<ShiftClosureData | null>(null);

  const handlePrintShiftClosure = (closure: ShiftClosureData) => {
    setSelectedClosure(closure);
    setPrintModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Shift Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button 
          onClick={onAddShiftClosure} 
          className="btn-gradient flex-shrink-0"
        >
          <Clock className="w-4 h-4 ml-2" />
          إغلاق وردية جديدة
        </Button>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="flex-1 bg-white/80 backdrop-blur-sm"
        />
      </div>

      {/* Shift Closures */}
      {shiftClosures.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">
              لا توجد ورديات مغلقة لهذا التاريخ
            </p>
            <Button onClick={onAddShiftClosure} className="btn-gradient">
              <Clock className="w-4 h-4 ml-2" />
              إغلاق وردية جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {shiftClosures.map((closure) => (
            <ShiftClosureCard
              key={closure.id}
              closure={closure}
              onPrint={handlePrintShiftClosure}
            />
          ))}
        </div>
      )}

      <PrintShiftClosureModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        closure={selectedClosure}
      />
    </div>
  );
};

export default ShiftClosuresList;
