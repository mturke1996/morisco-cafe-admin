export interface MenuItem {
  name: string;
  price?: number;
  prices?: { L: number; M: number };
  options?: string[];
  description?: string;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface MenuData {
  [key: string]: MenuCategory;
}

export const menuData: MenuData = {
  hotDrinks: {
    title: "مشروبات ساخنة",
    items: [
      {
        name: "قهوه عربيه سادا ",
        price: 8,
        options: ["سادة", "معدلة", "ناقصة"],
      },
      {
        name: "قهوه عربيه معدلة ",
        price: 8,
        options: ["سادة", "معدلة", "ناقصة"],
      },
      {
        name: "قهوه عربيه ناقصه ",
        price: 8,
        options: ["سادة", "معدلة", "ناقصة"],
      },
      { name: "كابتشينو", price: 6 },
      { name: "كابتشينو دبل", price: 7 },
      { name: "مكياتو", price: 5 },
      { name: "كريمه", price: 5 },
      { name: "نص نص", price: 5 },
      { name: "نسكافيه عادية", price: 6, options: ["عادي", "بالماء"] },
      { name: "نسكافيه عادية بالماء", price: 6, options: ["عادي", "بالماء"] },
      { name: "نسكافيه حبوب وحليب", price: 5, options: ["عادي", "بالماء"] },
      { name: "نسكافيه حبوب وماء", price: 5, options: ["عادي", "بالماء"] },
      { name: "نسكافيه كامل", price: 8, options: ["عادي", "بالماء"] },
      { name: "نسكافيه كامل بالماء", price: 6, options: ["عادي", "بالماء"] },
      { name: "نسكافيه لوز فقط", price: 7, options: ["عادي", "بالماء"] },
      { name: "نسكافيه نوتيلا فقط", price: 7, options: ["عادي", "بالماء"] },
      { name: "نسكافيه فل", price: 10, options: ["عادي", "بالماء"] },
      { name: "شاي اخضر كيس", price: 4 },
      { name: "شاي احمر كيس", price: 4 },
      { name: "شاي اخضر مغربي", price: 4 },
      { name: "شاي احمر مغربي", price: 4 },
      { name: "كافي لاتي", price: 7 },
      { name: "سيبسيال", price: 6 },
      { name: "هوت شوكلت", price: 12 },
    ],
  },
  coldDrinks: {
    title: "مشروبات باردة",
    items: [
      { name: "سبانش لاتيه ", price: 12 },
      { name: "ايس كافيه", price: 12 },
      { name: "فانيليا لاتيه", price: 12 },
      { name: "كراميل لاتيه", price: 12 },
      { name: "بندق لاتيه", price: 12 },
      { name: "ايس شوكلت", price: 12 },
      { name: "فرابتشينو", price: 13 },
    ],
  },
  cocktails: {
    title: "كوكتيلات",
    items: [
      { name: "كوكتيل فواكه موسمية", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "فراولة - موز - جوافة", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "فراولة - نعناع", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "فراولة - بنجر", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "فراولة - أناناس", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "فراولة - عنب - رمان", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "فراولة - كيوي - تفاح", price: 15, options: ["سكر", "بدون سكر"] },
      {
        name: "فراولة - كيوي - اناناس",
        price: 15,
        options: ["سكر", "بدون سكر"],
      },
      { name: "مانجا - موز", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "مانجا - موز - خوخ", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "مانجا - كيوي", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "مانجا - جوافة", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "مانجا - برتقال", price: 15, options: ["سكر", "بدون سكر"] },
      { name: "ليمون - مانجا", price: 15, options: ["سكر", "بدون سكر"] },
      {
        name: "ليمون - نعناع - زنجبيل",
        price: 15,
        options: ["سكر", "بدون سكر"],
      },
      { name: "فواكه قطع", price: 15, options: ["سكر", "بدون سكر"] },
    ],
  },
  naturalJuices: {
    title: "عصائر طبيعية",
    items: [
      { name: "مانجو", prices: { L: 11, M: 10 }, options: ["سكر", "بدون سكر"] },
      { name: "فراولة", prices: { L: 10, M: 9 }, options: ["سكر", "بدون سكر"] },
      { name: "كيوي", prices: { L: 15, M: 12 }, options: ["سكر", "بدون سكر"] },
      {
        name: "برتقال",
        prices: { L: 12, M: 10 },
        options: ["سكر", "بدون سكر"],
      },
      { name: "جوافة", prices: { L: 12, M: 9 }, options: ["سكر", "بدون سكر"] },
      {
        name: "قلعاوي",
        prices: { L: 12, M: 10 },
        options: ["سكر", "بدون سكر"],
      },
      {
        name: "أناناس",
        prices: { L: 12, M: 10 },
        options: ["سكر", "بدون سكر"],
      },
      { name: "هندي", prices: { L: 11, M: 10 }, options: ["سكر", "بدون سكر"] },
      {
        name: "ليموناده",
        prices: { L: 10, M: 8 },
        options: ["سكر", "بدون سكر"],
      },
      { name: "خوخ", prices: { L: 17, M: 15 }, options: ["سكر", "بدون سكر"] },
      { name: "رمان", prices: { L: 12, M: 10 }, options: ["سكر", "بدون سكر"] },
      { name: "عنب", prices: { L: 14, M: 12 }, options: ["سكر", "بدون سكر"] },
      {
        name: "أفوكادو لوز وعسل",
        prices: { L: 16, M: 14 },
        options: ["سكر", "بدون سكر"],
      },
    ],
  },
  Froppy: {
    title: "فروبي",
    items: [
      {
        name: "فراولة",
        prices: { L: 12, M: 10 },
        options: ["سكر", "بدون سكر"],
      },
      {
        name: "فراولة - موز",
        prices: { L: 12, M: 10 },
        options: ["سكر", "بدون سكر"],
      },
      {
        name: "فراولة - مانجا",
        prices: { L: 12, M: 10 },
        options: ["سكر", "بدون سكر"],
      },
      { name: "مانجا", prices: { L: 12, M: 10 }, options: ["سكر", "بدون سكر"] },
      { name: "موز", prices: { L: 12, M: 10 }, options: ["سكر", "بدون سكر"] },
      {
        name: "تمر - لوز",
        prices: { L: 14, M: 12 },
        options: ["سكر", "بدون سكر"],
      },
    ],
  },
  shakes: {
    title: "ميلك شيك",
    items: [
      { name: "نوتيلا", price: 15 },
      { name: "لوز", price: 15 },
      { name: "فستق", price: 17 },
      { name: "لوتس", price: 15 },
      { name: "أوريو", price: 15 },
      { name: "بندق", price: 17 },
      { name: "نوتيلا فستق", price: 17 },
      { name: "نوتيلا بندق", price: 17 },
      { name: "بقلاوة", price: 17 },
    ],
  },
  Smoothie: {
    title: "سموذي",
    items: [
      { name: "فراوله", price: 17 },
      { name: "مانجو", price: 17 },
      { name: "توت بري", price: 17 },
      { name: "فواكه استوائية", price: 17 },
      { name: "كرز", price: 17 },
      { name: "اناناس", price: 17 },
      { name: "فواكع برية", price: 17 },
    ],
  },
  crepes: {
    title: "كريب",
    items: [
      { name: "نوتيلا", price: 15 },
      { name: "نوتيلا لوز", price: 16 },
      { name: "نوتيلا لوتس", price: 17 },
      { name: "نوتيلا فستق", price: 18 },
      { name: "نوتيلا بندق", price: 18 },
      { name: "كريب براونيز", price: 20 },
      { name: "كريب كنافة", price: 17 },
      { name: "كريب موريسكو", price: 20 },
      { name: "كريب حار", price: 22 },
      { name: "كريب رد فيلفت", price: 18 },
      { name: "كريب سوشي", price: 22 },
      { name: "كريب دبي", price: 20, description: "نوتيلا - فستق - كنافة" },
    ],
  },
  croissants: {
    title: "كرواسون",
    items: [
      { name: "سادة", price: 7 },
      { name: "نوتيلا", price: 9 },
      { name: "نوتيلا لوز", price: 10 },
      { name: "عسل", price: 9 },
      { name: "عسل لوز", price: 10 },
      { name: "فستق", price: 10 },
      { name: "بندق", price: 10 },
      { name: "كامل", price: 12 },
      { name: "نوتيلا - فستق", price: 12 },
      { name: "نوتيلا - بندق", price: 12 },
      { name: "جبنه عسل", price: 10 },
      { name: "جبنه عسل زعتر", price: 10 },
      { name: "جبنه زيت زعتر", price: 10 },
      { name: "حار", price: 12 },
    ],
  },
  miniPancakes: {
    title: "ميني بان كيك",
    items: [
      { name: "نوتيلا", price: 12 },
      { name: "نوتيلا لوز", price: 15 },
      { name: "نوتيلا لوتس", price: 15 },
      { name: "نوتيلا فستق", price: 15 },
      { name: "نوتيلا بندق", price: 15 },
    ],
  },
  waffles: {
    title: "وافل",
    items: [
      { name: "نوتيلا", price: 15 },
      { name: "نوتيلا فستق", price: 15 },
      { name: "نوتيلا بندق", price: 15 },
      { name: "تـــــام", price: 20 },
    ],
  },
  kunafa: {
    title: "كنافة",
    items: [
      { name: "قشطة", price: 16 },
      { name: "قشطة ونوتيلا", price: 17 },
      { name: "قشطة وفستق", price: 18 },
      { name: "قشطة ولوتس", price: 17 },
      { name: "إضافة آيس كريم", price: 3 },
    ],
  },
  cakes: {
    title: "كيكات",
    items: [
      { name: "ردفلفيث", price: 15 },
      { name: "تشيز كيك لوتس", price: 15 },
      { name: "نوتيلا", price: 15 },
      { name: "نوتيلا-فستق", price: 15 },
      { name: "فراولة", price: 15 },
      { name: "روسية", price: 15 },
      { name: "سان سبستيان نوتيلا", price: 25 },
      { name: "سان سبستيان فستق", price: 25 },
      { name: "سان سبستيان ساده", price: 21 },
      { name: "براونيز", price: 18 },
      { name: "وايت فريش 4 طبقات", price: 22 },
      { name: "بينك فريش 4 طبقات", price: 22 },
      { name: "بانوفي", price: 15 },
      { name: "ترليشيا", price: 15 },
      { name: "كيك روسية بالخزايني والعوينة", price: 22 },
      { name: "كيك روسية بالبيكان", price: 22 },
      { name: "بستاشيو ونوتيلا كيك", price: 22 },
      { name: "كيك روسية بالبرتقال", price: 22 },
      { name: "كوكيز كيك", price: 15 },
      { name: "تراميسو", price: 15 },
      { name: "كرانشوكو كيك", price: 16 },
      { name: "كيك لاتي", price: 16 },
      { name: "كيك كراميل", price: 8 },
      { name: "بسبوسة قشطة", price: 7 },
      { name: "بسبوسة تشيز", price: 5 },
      { name: "بسبوسة نوتيلا", price: 5 },
    ],
  },
  sweets: {
    title: "حلويات وبقلاوة",
    items: [
      { name: "بقلاوه طرابلسية", price: 5 },
      { name: "زماله معسلة", price: 6 },
      { name: "حجيبات بحشوة الفستق", price: 6 },
      { name: "اصابع معسلة", price: 4 },
      { name: "بيكان رول", price: 10 },
      { name: "بيكان رول", price: 11 },
      { name: "مافن شكلاته", price: 8 },
      { name: "انجليش كيك لوز", price: 7 },
    ],
  },
  Mohjito: {
    title: "موهيتو",
    items: [
      { name: "كلاسيك", price: 10 },
      { name: "شوكولاتة", price: 10 },
      { name: "خوخ", price: 10 },
      { name: "رمان", price: 10 },
      { name: "برتقال", price: 10 },
      { name: "فراولة", price: 10 },
      { name: "باشن فروت", price: 10 },
      { name: "توت", price: 10 },
      { name: "توت بري", price: 10 },
      { name: "دلاج", price: 10 },
      { name: "علكة", price: 10 },
      { name: "ميكس", price: 10 },
    ],
  },
  iceCream: {
    title: "آيس كريم",
    items: [
      { name: "آيس كريم فانيليا", price: 7 },
      { name: "آيس كريم مانجو", price: 7 },
    ],
  },
  breakfast: {
    title: "إفطار",
    items: [
      {
        name: "إفطار موربسكو (شخصين)",
        price: 70,
        description:
          "شكشوكة تركية - فواكه - لوز- نوعان جبنة - فول - عسل بيض مطبوخ - زيتون - هريسة - مربى - حلوى شامية - سفنزه - 2 فطيرة - خبز بربوش سادة - خبز - إثنان شاي",
      },
      {
        name: "إفطار موربسكو (شخص)",
        price: 40,
        description:
          "شكشوكة تركية - نوعان جبنة - بيض مطبوخ - زيتون - هريسة - مربى - خبز - بربوش سادة - 1 شاي",
      },
    ],
  },
  shakshuka: {
    title: "شكشوكة تركية",
    items: [
      {
        name: "شكشوكة تركية",
        price: 18,
        description: "شكشوكة تركية - هريسة - زيتون - خبز أو توست",
      },
      {
        name: "اومليت مرتديلا",
        price: 15,
        description: "مرتيديلا - جبنه موزريلا - خبزه او توست",
      },
      {
        name: "اومليت خضار",
        price: 15,
        description: "خضار - جبنه موزريلا - خبزه او توست",
      },
      {
        name: "اومليت كلاسيك",
        price: 15,
        description: "جبنه موزريلا - خبزه او توست",
      },
    ],
  },
  toast: {
    title: "توست",
    items: [
      {
        name: "توب توست",
        price: 12,
        description: "جبنة موزاريلا - جبنة شيدر - جبنة بوك - جبنة شرائح - تن",
      },
      {
        name: "توب توست  هريسة",
        price: 12,
        description:
          "جبنة موزاريلا - جبنة شيدر - جبنة بوك - جبنة شرائح - تن + هريسه",
      },
      {
        name: "توست أجبان",
        price: 10,
        description: "جبنة موزاريلا - جبنة شيدر - جبنة بوك - جبنة شرائح",
      },
      {
        name: "توست أجبان هريسه",
        price: 10,
        description:
          "جبنة موزاريلا - جبنة شيدر - جبنة بوك - جبنة شرائح + هريسه",
      },
      {
        name: "توست تن",
        price: 8,
      },
      {
        name: " توست تن هريسه",
        price: 8,
        description: "توست تن + هريسه",
      },
      {
        name: "توست VIP",
        price: 15,
      },
    ],
  },
  sandwiches: {
    title: "سندويشات",
    items: [
      { name: "سندويش تن وجبنة", price: 12 },
      { name: "سندويش جبنة", price: 10 },
      { name: "سندويش شكشوكة", price: 14 },
      { name: "سندوتش تن وجبنه وهريسة", price: 12 },
      { name: "سندويش جبنة وهريسة", price: 10 },
      { name: "سندويش صحي (خبز شوفان + ريكوتا + زيت زيتون)", price: 15 },
    ],
  },
  pizza: {
    title: "بيتزا",
    items: [
      { name: "بيتزا مارغريتا", price: 18 },
      { name: "بيتزا تونا", price: 20 },
      { name: "بيتزا تونا ريو", price: 27 },
      { name: "بيتزا خضروات", price: 19 },
      { name: "بيتزا خضروات مشوية", price: 21 },
      { name: "بيتزا ريجينا", price: 19 },
      { name: "بيتزا فونجي", price: 20 },
      { name: "بيتزا تشيكن", price: 20 },
      { name: "بيتزا كباب", price: 22 },
    ],
  },
  pastries: {
    title: "معجنات",
    items: [
      { name: "كالزوني", price: 20 },
      { name: "صفيحة جبنة", price: 15 },
    ],
  },
};
