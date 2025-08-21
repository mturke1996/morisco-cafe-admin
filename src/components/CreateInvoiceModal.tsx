
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useCreateInvoice } from "@/hooks/useInvoices";

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    name: string;
  } | null;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
}

const CreateInvoiceModal = ({ open, onOpenChange, customer }: CreateInvoiceModalProps) => {
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0 }
  ]);
  const [notes, setNotes] = useState("");
  const createInvoice = useCreateInvoice();

  console.log("CreateInvoiceModal rendered with:", { open, customer });

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
    console.log("Added new item, total items:", items.length + 1);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      console.log("Removed item at index:", index, "remaining items:", newItems.length);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
    console.log("Updated item", index, field, "to:", value);
  };

  const calculateTotal = () => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    console.log("Calculated total:", total);
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    
    if (!customer) {
      console.error("No customer selected");
      return;
    }

    const validItems = items.filter(item => 
      item.description.trim() && 
      item.quantity > 0 && 
      item.unit_price > 0
    );
    
    console.log("Valid items:", validItems);
    
    if (validItems.length === 0) {
      console.error("No valid items found");
      return;
    }

    const invoiceData = {
      customer_id: customer.id,
      items: validItems,
      notes: notes.trim() || undefined,
    };

    console.log("Submitting invoice data:", invoiceData);

    createInvoice.mutate(invoiceData, {
      onSuccess: () => {
        console.log("Invoice created successfully, resetting form");
        setItems([{ description: "", quantity: 1, unit_price: 0 }]);
        setNotes("");
        onOpenChange(false);
      },
      onError: (error) => {
        console.error("Error creating invoice:", error);
      },
    });
  };

  if (!customer) {
    console.log("No customer provided");
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>العميل:</strong> {customer.name}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">عناصر الفاتورة</Label>
                <Button type="button" onClick={addItem} size="sm" variant="outline">
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة عنصر
                </Button>
              </div>
              
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-4 border rounded-lg">
                  <div className="col-span-6">
                    <Label htmlFor={`description-${index}`}>الوصف *</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="وصف المنتج أو الخدمة"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor={`quantity-${index}`}>الكمية *</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <Label htmlFor={`unit_price-${index}`}>السعر (د.ل) *</Label>
                    <Input
                      id={`unit_price-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="destructive"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="col-span-12 text-sm text-muted-foreground">
                    الإجمالي: {(item.quantity * item.unit_price).toFixed(2)} د.ل
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">الإجمالي الكلي:</span>
                <span className="text-xl font-bold text-blue-600">
                  {calculateTotal().toFixed(2)} د.ل
                </span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات إضافية للفاتورة"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={createInvoice.isPending || items.every(item => !item.description.trim())}
              >
                {createInvoice.isPending ? "جاري الإنشاء..." : "إنشاء الفاتورة"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceModal;
