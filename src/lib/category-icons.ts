import {
  Baby,
  Receipt,
  Coins,
  BookOpen,
  Briefcase,
  Shield,
  Wrench,
  Banknote,
  Heart,
  Smile,
  Shirt,
  FileText,
  CreditCard,
  Compass,
  Sparkles,
  Utensils,
  Laptop,
  Film,
  Trophy,
  Fuel,
  Dices,
  Zap,
  Package,
  Gift,
  ShoppingCart,
  Dumbbell,
  HeartPulse,
  Palette,
  Plane,
  Home,
  Globe,
  Car,
  PawPrint,
  Printer,
  Mail,
  PiggyBank,
  CalendarDays,
  Tv,
  Phone,
  ArrowLeftRight,
  HelpCircle,
  LucideIcon
} from "lucide-react";

export interface CategoryStyle {
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  chartColor?: string;
}

const categoryStyles: Record<string, CategoryStyle> = {
  // Baby / Maternity
  "baby": { icon: Baby, colorClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/20" },
  "maternity": { icon: Baby, colorClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/20" },

  // Bank Fees / Fees
  "banks fees": { icon: Receipt, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "bank fees": { icon: Receipt, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "fees": { icon: Receipt, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "fee": { icon: Receipt, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },

  // Benefits
  "benefit payment": { icon: Coins, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },

  // Books / Education / Training
  "books": { icon: BookOpen, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/10", borderClass: "border-indigo-500/20" },
  "education": { icon: BookOpen, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/10", borderClass: "border-indigo-500/20" },
  "training": { icon: BookOpen, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/10", borderClass: "border-indigo-500/20" },

  // Business / Self-Employment
  "business expenses": { icon: Briefcase, colorClass: "text-slate-400", bgClass: "bg-slate-500/10", borderClass: "border-slate-500/20" },
  "self-employment": { icon: Briefcase, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },

  // Insurances
  "car insurance": { icon: Shield, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
  "home insurance": { icon: Shield, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
  "travel insurance": { icon: Shield, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
  "insurance": { icon: Shield, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },

  // Car Maintenance Costs
  "car maintenance costs": { icon: Wrench, colorClass: "text-slate-400", bgClass: "bg-slate-500/10", borderClass: "border-slate-500/20" },
  "car maintenance": { icon: Wrench, colorClass: "text-slate-400", bgClass: "bg-slate-500/10", borderClass: "border-slate-500/20" },

  // Cash withdrawals
  "cash withdrawals": { icon: Banknote, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "cash": { icon: Banknote, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },

  // Cashback
  "cashback": { icon: Receipt, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },

  // Charity
  "charity": { icon: Heart, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },

  // Child Expenses
  "child & dependent expenses": { icon: Smile, colorClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/20" },

  // Clothing
  "clothing & shoes": { icon: Shirt, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },
  "clothing": { icon: Shirt, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },
  "clothes": { icon: Shirt, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },

  // Taxes
  "council tax": { icon: FileText, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "road tax": { icon: FileText, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "taxes": { icon: FileText, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "tax": { icon: FileText, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "tax rebate": { icon: Receipt, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },

  // Credit Card / Loans
  "credit card payments": { icon: CreditCard, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "credit card": { icon: CreditCard, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "loans": { icon: CreditCard, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },
  "loan": { icon: CreditCard, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },
  "student loan": { icon: CreditCard, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },

  // Days Out / Holidays
  "days out": { icon: Compass, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  "holidays": { icon: Plane, colorClass: "text-sky-400", bgClass: "bg-sky-500/10", borderClass: "border-sky-500/20" },
  "travel": { icon: Plane, colorClass: "text-sky-400", bgClass: "bg-sky-500/10", borderClass: "border-sky-500/20" },

  // Decorations
  "decorations": { icon: Sparkles, colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/20" },

  // Health
  "dentist": { icon: HeartPulse, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },
  "healthcare": { icon: HeartPulse, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },
  "health": { icon: HeartPulse, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },
  "medical": { icon: HeartPulse, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },

  // Food / Dining
  "eating out": { icon: Utensils, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  "dining out": { icon: Utensils, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  "dining": { icon: Utensils, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  "food": { icon: Utensils, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  "food & drink": { icon: Utensils, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  "restaurants": { icon: Utensils, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  "restaurant": { icon: Utensils, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  "takeaway": { icon: Utensils, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  "coffee": { icon: Utensils, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },

  // Tech / Electronics
  "electronics": { icon: Laptop, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "technology": { icon: Laptop, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "tech": { icon: Laptop, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },

  // Entertainment / Hobbies
  "entertainment": { icon: Film, colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/20" },
  "hobbies": { icon: Palette, colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/20" },
  "leisure": { icon: Film, colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/20" },

  // Sports
  "football": { icon: Trophy, colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/20" },
  "padel": { icon: Trophy, colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/20" },

  // Transport & Parking & Fuel
  "fuel": { icon: Fuel, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
  "parking": { icon: Car, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
  "transport": { icon: Car, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
  "car": { icon: Car, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
  "gas": { icon: Car, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },

  // Gambling
  "gambling": { icon: Dices, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },

  // Utilities
  "gas & electricity": { icon: Zap, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "utilities": { icon: Zap, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "electricity": { icon: Zap, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "water": { icon: Zap, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "power": { icon: Zap, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },

  // Merchandise & Household
  "general merchandise": { icon: Package, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "other household": { icon: Home, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },

  // Gifts
  "gifts to friends & family": { icon: Gift, colorClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/20" },

  // Groceries
  "groceries": { icon: ShoppingCart, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },
  "grocery": { icon: ShoppingCart, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },
  "supermarket": { icon: ShoppingCart, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },

  // Gym
  "gym": { icon: Dumbbell, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },
  "fitness": { icon: Dumbbell, colorClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20" },

  // Home / Mortgage
  "home improvement": { icon: Home, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },
  "home maintenance": { icon: Home, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },
  "mortgage": { icon: Home, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/10", borderClass: "border-indigo-500/20" },
  "housing": { icon: Home, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/10", borderClass: "border-indigo-500/20" },
  "rent": { icon: Home, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/10", borderClass: "border-indigo-500/20" },

  // IVF
  "ivf": { icon: Heart, colorClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/20" },

  // Finance / Income
  "interest": { icon: Coins, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },
  "other income": { icon: Coins, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },
  "salary": { icon: Banknote, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },
  "income": { icon: Coins, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },
  "sales": { icon: Coins, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },
  "securities trades": { icon: Coins, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },
  "pension": { icon: Briefcase, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },

  // NHS
  "nhs registration": { icon: Shield, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },

  // Online Services / TV & Internet
  "online services": { icon: Globe, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "tv & internet": { icon: Tv, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "internet": { icon: Tv, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "broadband": { icon: Tv, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },

  // Personal Care
  "personal care": { icon: Smile, colorClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/20" },

  // Pets
  "pets": { icon: PawPrint, colorClass: "text-orange-400", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },

  // Postage
  "postage": { icon: Mail, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },

  // Printer
  "printer": { icon: Printer, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },

  // Savings
  "savings": { icon: PiggyBank, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },
  "saving": { icon: PiggyBank, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },

  // Subscriptions
  "subscriptions": { icon: CalendarDays, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "subscription": { icon: CalendarDays, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },

  // Telephone & Mobile
  "telephone & mobile": { icon: Phone, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "mobile": { icon: Phone, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },
  "phone": { icon: Phone, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/20" },

  // Transfers
  "transfers": { icon: ArrowLeftRight, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },
  "transfer": { icon: ArrowLeftRight, colorClass: "text-zinc-400", bgClass: "bg-zinc-900/50", borderClass: "border-zinc-800/60" },

  // Weddings
  "weddings": { icon: Heart, colorClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/20" },
};

const colorToRgb: Record<string, string> = {
  "text-pink-400": "244, 114, 182",
  "text-zinc-400": "161, 161, 170",
  "text-emerald-400": "52, 211, 153",
  "text-indigo-400": "129, 140, 248",
  "text-slate-400": "148, 163, 184",
  "text-blue-400": "96, 165, 250",
  "text-orange-400": "251, 146, 60",
  "text-amber-400": "251, 191, 36",
  "text-violet-400": "167, 139, 250",
  "text-rose-400": "251, 113, 133",
  "text-cyan-400": "34, 211, 238",
  "text-sky-400": "56, 189, 248",
};

export function getCategoryStyle(categoryName: string): CategoryStyle & { chartColor: string } {
  const fallback = {
    icon: HelpCircle,
    colorClass: "text-zinc-450",
    bgClass: "bg-zinc-900/50",
    borderClass: "border-zinc-800/60",
    chartColor: "161, 161, 170"
  };

  if (!categoryName) return fallback;
  const normalized = categoryName.toLowerCase().trim();
  const base = categoryStyles[normalized];
  if (!base) return fallback;

  return {
    ...base,
    chartColor: colorToRgb[base.colorClass] || "161, 161, 170"
  };
}

export function getCategoryIcon(categoryName: string): LucideIcon {
  return getCategoryStyle(categoryName).icon;
}
