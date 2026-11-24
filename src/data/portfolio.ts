
export const portfolioCategories = [
  "All",
  "Weddings",
  "Corporate",
  "Social",
  "Destination",
  "Digital",
] as const;

export type PortfolioCategory =
  (typeof portfolioCategories)[number];

export type PortfolioItem = {
  id: string;
  title: string;
  category: Exclude<PortfolioCategory, "All">;
  description: string;
  image: string;
  alt: string;
  featured?: boolean;
};

export const portfolioItems: PortfolioItem[] = [
  {
    id: "wedding-concept",
    title: "A Timeless Celebration",
    category: "Weddings",
    description:
      "An editorial vision of elegant florals, warm light and meaningful traditions.",
    image: "/images/portfolio/wedding.jpg",
    alt: "Elegant wedding celebration inspiration",
    featured: true,
  },
  {
    id: "corporate-concept",
    title: "The Grand Gathering",
    category: "Corporate",
    description:
      "A sophisticated setting for memorable business and brand experiences.",
    image: "/images/portfolio/corporate.jpg",
    alt: "Corporate event and conference inspiration",
  },
  {
    id: "social-concept",
    title: "An Evening to Remember",
    category: "Social",
    description:
      "Personal celebrations with atmosphere, character and thoughtful details.",
    image: "/images/portfolio/private.jpg",
    alt: "Private celebration and party inspiration",
  },
  {
    id: "destination-concept",
    title: "Somewhere Extraordinary",
    category: "Destination",
    description:
      "A celebration inspired by beautiful surroundings and remarkable places.",
    image: "/images/portfolio/destination.jpg",
    alt: "Destination celebration inspiration",
    featured: true,
  },
  {
    id: "digital-concept",
    title: "Celebrations, Reimagined",
    category: "Digital",
    description:
      "Digital invitations, event websites and connected guest experiences.",
    image: "/images/portfolio/digital.jpg",
    alt: "Digital event experience inspiration",
  },
  {
    id: "celebration-concept",
    title: "The Art of Togetherness",
    category: "Social",
    description:
      "A creative celebration concept centered on atmosphere and connection.",
    image: "/images/portfolio/celebration.jpg",
    alt: "Luxury celebration setting inspiration",
  },
];
