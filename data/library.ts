export { authors, authorProfiles, type Author } from "@/data/authors";
export { works, workProfiles, getWorkBySlug, type Work } from "@/data/works";
export { genres, genreTabs, libraryCategories, literaryPeriods, periodTabs } from "@/data/taxonomy";

import { authorProfiles } from "@/data/authors";
import { workProfiles } from "@/data/works";

export const authorsWithWorks = authorProfiles.map((author) => ({
  ...author,
  works: workProfiles.filter((work) => work.author === author.name),
}));

export const featuredAuthor = authorsWithWorks.find((author) => author.slug === "ilia-chavchavadze") ?? authorsWithWorks[0];

export function getAuthorBySlug(slug: string) {
  return authorsWithWorks.find((author) => author.slug === slug);
}

export const adminActions = [
  { title: "ავტორის დამატება", description: "ავტორის ბიოგრაფიის, პერიოდის, მიმდინარეობისა და თემების მართვა.", premium: false },
  { title: "ნაწარმოების დამატება", description: "საგამოცდო ტექსტის ჟანრის, ავტორის, მოკლე შინაარსისა და თემების დამატება.", premium: false },
  { title: "ანალიზის დამატება", description: "დეტალური ანალიზის, ციტატების და ესეს გეგმის დამატება კონკრეტულ ნაწარმოებზე.", premium: true },
  { title: "ტესტის შექმნა", description: "ავტორზე ან ნაწარმოებზე მიბმული კითხვების და პასუხების მართვა.", premium: true },
  { title: "PDF მასალის ატვირთვა", description: "კონსპექტების, სავარჯიშოების და დამატებითი სასწავლო ფაილების ატვირთვა.", premium: false },
  { title: "წვდომის მართვა", description: "მასალის უფასო ან ფასიან გეგმაზე მიბმა.", premium: true },
];
