type NavigationItem = {
  label: string;
  href: string;
};

export const navigationItems: NavigationItem[] = [
  { label: "მთავარი", href: "/dashboard" },
  { label: "ბიბლიოთეკა", href: "/library" },
  { label: "ავტორები", href: "/authors" },
  { label: "ნაწარმოებები", href: "/works" },
  { label: "სავარჯიშოები", href: "/quiz" },
  { label: "პროგრესი", href: "/dashboard#progress" },
  { label: "პროფილი", href: "/profile" },
  { label: "ადმინი", href: "/admin" },
];
