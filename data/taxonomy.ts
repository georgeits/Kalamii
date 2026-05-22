export type GenreKey = "poem" | "hagiography" | "fable" | "novel" | "story" | "play" | "publicistic";

export type PeriodKey =
  | "old-georgian"
  | "renaissance"
  | "romanticism"
  | "realism"
  | "modernism"
  | "contemporary";

export const literaryPeriods: Record<PeriodKey, string> = {
  "old-georgian": "ძველი ქართული ლიტერატურა",
  renaissance: "შუა საუკუნეები / რენესანსული ეპოქა",
  romanticism: "რომანტიზმი",
  realism: "რეალიზმი",
  modernism: "მოდერნიზმი",
  contemporary: "თანამედროვე ქართული ლიტერატურა",
};

export const genres: Record<GenreKey, string> = {
  poem: "ლექსი / პოემა",
  hagiography: "ჰაგიოგრაფია",
  fable: "სიბრძნე-სწავლებითი პროზა",
  novel: "რომანი / ვრცელი პროზა",
  story: "მოთხრობა",
  play: "დრამა",
  publicistic: "პუბლიცისტიკა",
};

export const periodTabs = ["ყველა", ...Object.values(literaryPeriods)];
export const genreTabs = ["ყველა", ...Object.values(genres)];

export const libraryCategories = [
  { title: "ქართული ენა", description: "გრამატიკა, ტექსტის გააზრება, არგუმენტაცია და წერითი დავალების სტრუქტურა." },
  { title: "ლიტერატურა", description: "საგამოცდო პერიოდი, ავტორი, ჟანრი, თემა და ტექსტის ანალიზის ჩარჩო." },
  { title: "ავტორები", description: "პროგრამის ავტორები დალაგებულია ეპოქებისა და ლიტერატურული მიმდინარეობების მიხედვით." },
  { title: "ნაწარმოებები", description: "სავალდებულო ტექსტები მოკლე შეჯამებით, თემებითა და საგამოცდო მიმართულებებით." },
  { title: "ტერმინები", description: "ლიტერატურული და ენობრივი ტერმინები განმარტებებით. სრული ბაზა დაემატება კონტენტის მართვიდან." },
  { title: "ტესტები", description: "ტესტები ჯერ არ გაქვთ გავლილი. შედეგები გამოჩნდება პირველი ტესტის დასრულების შემდეგ." },
];
