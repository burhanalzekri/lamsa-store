export type ProductColor = {
  id: string;
  name: string;
  hex: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  description: string;
  material: string;
  colors: ProductColor[];
};

const media = "/manus-storage/async-images/jNo1vWA8CbyB9n8NDTaLwb";

export const products: Product[] = [
  {
    id: "linen-set",
    name: "طقم لينن هادئ",
    category: "الأطقم",
    image: `${media}/image-2.webp`,
    price: 279,
    originalPrice: 349,
    badge: "وصل حديثًا",
    description: "طقم خفيف بقصة مريحة يرافقك من الصباح حتى المساء.",
    material: "مزيج لينن وقطن ناعم",
    colors: [
      { id: "sand", name: "رملي", hex: "#c6ad8b", stock: 7 },
      { id: "cream", name: "عاجي", hex: "#eee6d8", stock: 4 },
      { id: "stone", name: "حجري", hex: "#888077", stock: 2 },
    ],
  },
  {
    id: "rosa-blouse",
    name: "بلوزة روزا",
    category: "بلوزات",
    image: `${media}/image-3.webp`,
    price: 189,
    originalPrice: 239,
    badge: "لون الموسم",
    description: "لمسة وردية هادئة وتفصيل انسيابي ينسجم مع إطلالاتك اليومية.",
    material: "قماش كريب خفيف",
    colors: [
      { id: "rose", name: "وردي ترابي", hex: "#bd8d91", stock: 3 },
      { id: "ivory", name: "عاجي", hex: "#eee6d8", stock: 8 },
      { id: "plum", name: "برقوقي", hex: "#674551", stock: 0 },
    ],
  },
  {
    id: "olive-look",
    name: "إطلالة زيتونية",
    category: "الأطقم",
    image: `${media}/image-4.webp`,
    price: 329,
    originalPrice: 419,
    badge: "اختيار لمسة",
    description: "قصة واسعة وأنيقة بلون زيتوني يضيف عمقًا لخزانة الموسم.",
    material: "نسيج ناعم بملمس مطفي",
    colors: [
      { id: "olive", name: "زيتوني", hex: "#707354", stock: 11 },
      { id: "black", name: "أسود", hex: "#242323", stock: 5 },
      { id: "moss", name: "أخضر هادئ", hex: "#9c9d7e", stock: 2 },
    ],
  },
];

export const categories = ["الكل", "وصل حديثًا", "الأطقم", "بلوزات"];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);

export const getTotalStock = (product: Product) =>
  product.colors.reduce((total, color) => total + color.stock, 0);
