// نظام فلترة الشتائم والكلمات المسيئة
// يتضمن الشتائم العربية والليبية

export const PROFANITY_WORDS = [
  // شتائم عربية شائعة
  'كلب', 'حمار', 'غبي', 'أحمق', 'بليد', 'حقير', 'وضيع', 'قذر',
  'نجس', 'خنزير', 'عاهر', 'زانية', 'فاسق', 'فاجر', 'منافق',
  'كذاب', 'لص', 'سارق', 'خائن', 'خاين', 'خاينة', 'خاينات',
  'مخنث', 'شاذ', 'منحرف', 'فاسد', 'فاسدة', 'فاسدات',
  'قبيح', 'قبيحة', 'مقزز', 'مقززة', 'مقززات',
  'مقرف', 'مقرفة', 'مقرفات', 'مقزز', 'مقززة',
  'مخجل', 'مخجلة', 'مخجلات', 'مخز', 'مخزة', 'مخزات',
  'مذل', 'مذلة', 'مذلات', 'مذلول', 'مذلولة', 'مذلولات',
  'محتقر', 'محتقرة', 'محتقرات', 'محتقرة', 'محتقرة',
  'مستحق', 'مستحقة', 'مستحقات', 'مستحق', 'مستحقة',
  'مستحق', 'مستحقة', 'مستحقات', 'مستحق', 'مستحقة',
  
  // شتائم ليبية خاصة
  'زق', 'زقة', 'زقات', 'زقان', 'زقانة', 'زقانات',
  'خر', 'خرة', 'خرات', 'خيران', 'خيرانة', 'خيرانات',
  'بعر', 'بعرة', 'بعرات', 'بعيران', 'بعيرانة', 'بعيرانات',
  'عك', 'عكة', 'عكات', 'عكان', 'عكانة', 'عكانات',
  'شخ', 'شخة', 'شخات', 'شخان', 'شخانة', 'شخانات',
  'نك', 'نكة', 'نكات', 'نكان', 'نكانة', 'نكانات',
  'طز', 'طزة', 'طزات', 'طزان', 'طزانة', 'طزانات',
  'طخ', 'طخة', 'طخات', 'طخان', 'طخانة', 'طخانات',
  'شل', 'شلة', 'شلات', 'شلان', 'شلانة', 'شلانات',
  'خل', 'خلة', 'خلات', 'خلان', 'خلانة', 'خلانات',
  'فل', 'فلة', 'فلات', 'فلان', 'فلانة', 'فلانات',
  'جل', 'جلة', 'جلات', 'جلان', 'جلانة', 'جلانات',
  'دل', 'دلة', 'دلات', 'دلان', 'دلانة', 'دلانات',
  'سل', 'سلة', 'سلات', 'سلان', 'سلانة', 'سلانات',
  'طل', 'تلة', 'تلات', 'تлан', 'تلانة', 'تلانات',
  'زل', 'زلة', 'زلات', 'زلان', 'زلانة', 'زلانات',
  'كل', 'كلة', 'كلات', 'كلان', 'كلانة', 'كلانات',
  'مل', 'ملة', 'ملات', 'ملان', 'ملانة', 'ملانات',
  'هل', 'هلة', 'هلات', 'هلان', 'هلانة', 'هلانات',
  'يل', 'يلة', 'يلات', 'يلان', 'يلانة', 'يلانات',
  
  // كلمات مسيئة أخرى
  'ميت', 'ميتة', 'ميتات', 'ميتان', 'ميتانة', 'ميتانات',
  'مقبوح', 'مقبوحة', 'مقبوحات', 'مقبوحان', 'مقبوحانة', 'مقبوحانات',
  'مقزز', 'مقززة', 'مقززات', 'مقززان', 'مقززانة', 'مقززانات',
  'مقرف', 'مقرفة', 'مقرفات', 'مقرفان', 'مقرفانة', 'مقرفانات',
  'مقزز', 'مقززة', 'مقززات', 'مقززان', 'مقززانة', 'مقززانات',
  'مقزز', 'مقززة', 'مقززات', 'مقززان', 'مقززانة', 'مقززانات',
  
  // كلمات إنجليزية مسيئة
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'crap',
  'stupid', 'idiot', 'moron', 'dumb', 'retard', 'fool',
  'loser', 'jerk', 'bastard', 'whore', 'slut', 'bitch',
  'cunt', 'piss', 'pissed', 'fucking', 'shitty', 'asshole',
  'dick', 'cock', 'pussy', 'fag', 'faggot', 'nigger',
  'kike', 'spic', 'chink', 'gook', 'wetback', 'towelhead',
  
  // كلمات مسيئة باللهجة الليبية
  'زقان', 'زقانة', 'زقانات', 'زقانين', 'زقانيات',
  'خران', 'خرانة', 'خرانات', 'خرانين', 'خرانيات',
  'بعيران', 'بعيرانة', 'بعيرانات', 'بعيرانين', 'بعيرانيات',
  'عكان', 'عكانة', 'عكانات', 'عكانين', 'عكانيات',
  'شخان', 'شخانة', 'شخانات', 'شخانين', 'شخانيات',
  'نكان', 'نكانة', 'نكانات', 'نكانين', 'نكانيات',
  'طزان', 'طزانة', 'طزانات', 'طزانين', 'طزانيات',
  'طخان', 'طخانة', 'طخانات', 'طخانين', 'طخانيات',
  'شلان', 'شلانة', 'شلانات', 'شلانين', 'شلانيات',
  'خلان', 'خلانة', 'خلانات', 'خلانين', 'خلانيات',
  'فلان', 'فلانة', 'فلانات', 'فلانين', 'فلانيات',
  'جلان', 'جلانة', 'جلانات', 'جلانين', 'جلانيات',
  'دلان', 'دلانة', 'دلانات', 'دلانين', 'دلانيات',
  'سلان', 'سلانة', 'سلانات', 'سلانين', 'سلانيات',
  'تлан', 'تلانة', 'تلات', 'تلاين', 'تلاينات',
  'زلان', 'زلانة', 'زلانات', 'زلانين', 'زلانيات',
  'كلان', 'كلانة', 'كلانات', 'كلانين', 'كلانيات',
  'ملان', 'ملانة', 'ملانات', 'ملانين', 'ملانيات',
  'هلان', 'هلانة', 'هلانات', 'هلانين', 'هلانيات',
  'يلان', 'يلانة', 'يلانات', 'يلانين', 'يلانيات',
];

// دالة لفحص النص بحثاً عن كلمات مسيئة
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  const normalizedText = text
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return PROFANITY_WORDS.some(word => 
    normalizedText.includes(word.toLowerCase())
  );
}

// دالة لاستخراج الكلمات المسيئة من النص
export function extractProfanityWords(text: string): string[] {
  if (!text) return [];
  
  const normalizedText = text
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return PROFANITY_WORDS.filter(word => 
    normalizedText.includes(word.toLowerCase())
  );
}

// دالة لتنظيف النص من الكلمات المسيئة
export function cleanProfanity(text: string, replacement: string = '***'): string {
  if (!text) return text;
  
  let cleanedText = text;
  const profanityWords = extractProfanityWords(text);
  
  profanityWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    cleanedText = cleanedText.replace(regex, replacement);
  });
  
  return cleanedText;
}

// دالة لتقييم مستوى المسيء في النص
export function getProfanityLevel(text: string): 'none' | 'low' | 'medium' | 'high' {
  if (!text) return 'none';
  
  const profanityWords = extractProfanityWords(text);
  const wordCount = text.split(/\s+/).length;
  const profanityRatio = profanityWords.length / wordCount;
  
  if (profanityWords.length === 0) return 'none';
  if (profanityRatio < 0.1) return 'low';
  if (profanityRatio < 0.3) return 'medium';
  return 'high';
}

// دالة لإنشاء تقرير عن المحتوى المسيء
export function generateProfanityReport(text: string) {
  const contains = containsProfanity(text);
  const words = extractProfanityWords(text);
  const level = getProfanityLevel(text);
  const cleaned = cleanProfanity(text);
  
  return {
    contains,
    words,
    level,
    cleaned,
    wordCount: text.split(/\s+/).length,
    profanityCount: words.length,
    profanityRatio: words.length / text.split(/\s+/).length
  };
}
