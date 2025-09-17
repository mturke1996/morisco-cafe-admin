-- Create Daily Offers table
CREATE TABLE IF NOT EXISTS daily_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL, -- عنوان العرض مثل "عرض اليوم"
  description TEXT, -- وصف العرض
  original_price DECIMAL(10,2) NOT NULL, -- السعر الأصلي
  offer_price DECIMAL(10,2) NOT NULL, -- سعر العرض
  discount_percentage INTEGER, -- نسبة الخصم
  image_url TEXT, -- صورة العرض
  is_active BOOLEAN DEFAULT true, -- نشط أم لا
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- تاريخ بداية العرض
  end_date TIMESTAMP WITH TIME ZONE, -- تاريخ نهاية العرض
  sort_order INTEGER DEFAULT 0, -- ترتيب العرض
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Daily Offer Items table (for multiple items in one offer)
CREATE TABLE IF NOT EXISTS daily_offer_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES daily_offers(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1, -- كمية العنصر في العرض
  sort_order INTEGER DEFAULT 0, -- ترتيب العنصر في العرض
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_offers_active ON daily_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_offers_dates ON daily_offers(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_daily_offers_sort ON daily_offers(sort_order);
CREATE INDEX IF NOT EXISTS idx_daily_offer_items_offer ON daily_offer_items(offer_id);
CREATE INDEX IF NOT EXISTS idx_daily_offer_items_menu ON daily_offer_items(menu_item_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_daily_offers_updated_at ON daily_offers;
CREATE TRIGGER update_daily_offers_updated_at 
    BEFORE UPDATE ON daily_offers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_daily_offers_updated_at();


