// نظام فلترة الشتائم والكلمات المسيئة
// عربي (فصحى + لهجات) + ليبي + إنجليزي

export const PROFANITY_WORDS = [
  // شتائم عربية شائعة + فصحى
  'كلب','حمار','غبي','أحمق','بليد','حقير','وضيع','قذر','نجس','خنزير',
  'عاهر','زانية','فاسق','فاجر','منافق','كذاب','لص','سارق','خائن','مخنث',
  'شاذ','منحرف','فاسد','قواد','ديوث','لوطي','قملة','زبالة',

  // شتائم جنسية
  'قحبة','شرموطة','عرص','معرص','متناك','منايك','منيوك','مخنث',
  'طيز','كس','زب','مص زب','لحس كس','كس امك','كس اختك',

  // شتائم عامية (مصري / شامي / خليجي)
  'ابن كلب','ابن حمار','ابن وسخة','ابن قحبة','ابن عاهرة',
  'شرموط','منيك','خول','طرطور','كسختك','يلعن شرفك','يلعن عرضك',
  'يلعن ابوك','يلعن امك','يا وسخة','يا متخلفة','يا منيلة',
  'يا قرد','يا تيس','يا خنزيرة','يا معفن','متناكة','يا متناك',

  // شتائم مغاربية (مغربي / جزائري / تونسي)
  'زامل','زمال','شرموط','مكوى','قحب','مخنت','حمار طرطور',
  'مزيط','كحبة','شلاكة','طيزكم','عرصة','ممحون',

  // شتائم ليبية خاصة
  'زق','زقان','خر','خران','بعر','بعرة','شخ','شخان','نك','نكان','طز','طزان',
  'عرة','عرصة','عرية','قحب','قحبة','زمال','زمالة','زلمة','زامل',
  'شرشوحة','ديوث','معفن','سطل','مكوى','طيحسيلة','طولك','دابس',
  'طحلوب','راقد','رافد','حويلي','ملوخية','ضفدع','مزروبة','مكسر',
  'بزاق','طرطور','كويز','مطوي','قرعة','مربوط','بوشكارة','دلاعة',
  'كحبة','مصلع','مخنزر','خنفسة','منيوك','عرصات','مغتصب',

  // كلمات إنجليزية مسيئة
  'fuck','shit','bitch','ass','damn','hell','crap','stupid','idiot','moron',
  'dumb','retard','fool','loser','jerk','bastard','whore','slut','cunt',
  'piss','pissed','fucking','shitty','asshole','dick','cock','pussy',
  'fag','faggot','nigger','kike','spic','chink','gook','wetback','towelhead',
  'prick','jackass','hoe','motherfucker','mf','sucker','scumbag','douche',

  // إنجليزي موسع
  'slutty','dickhead','cockhead','pussyhole','bullshit','dumbass',
  'shithead','shitface','fuckhead','fuckface','twat','slag','cum',
  'cumshot','cumdump','jerkoff','wanker','pisshead','tosser','bollocks',
  'arsehole','dipshit','twats','dickweed','cockwomble','fucktard',
  'jerkwad','nutjob','airhead','bitchass','hoeass','punkass','son of a bitch',
  'dogshit','horseshit','jackshit','ratchet','skank','thot','retarded'
];

// دالة لفحص النص بحثاً عن كلمات مسيئة
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  const normalizedText = text
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
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
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
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
