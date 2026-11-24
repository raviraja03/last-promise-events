
export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  tagline: string;
  description: string;
  introduction: string;
  image: string;
  imageAlt: string;
  highlights: string[];
  offerings: {
    title: string;
    description: string;
  }[];
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "weddings",
    title: "Weddings & Celebrations",
    shortTitle: "Weddings",
    eyebrow: "The Art of Togetherness",
    tagline: "Every love story deserves an extraordinary celebration.",
    description:
      "Thoughtfully curated weddings, engagements, receptions and meaningful celebrations.",
    introduction:
      "From intimate ceremonies to magnificent gatherings, we help bring your vision to life through thoughtful planning, creative direction and beautifully considered details.",
    image: "/images/wedding.jpg",
    imageAlt: "Elegant wedding celebration setting",
    highlights: [
      "Wedding celebrations",
      "Engagement ceremonies",
      "Sangeet and mehendi",
      "Receptions",
      "Guest experiences",
    ],
    offerings: [
      {
        title: "Concept & Creative Direction",
        description:
          "A distinctive event vision developed around your story, preferences and celebration style.",
      },
      {
        title: "Planning & Coordination",
        description:
          "Support with schedules, event logistics, suppliers and the flow of your celebration.",
      },
      {
        title: "Design & Atmosphere",
        description:
          "Thoughtful approaches to decor, lighting, florals and the overall guest experience.",
      },
      {
        title: "Digital Wedding Experiences",
        description:
          "Invitations, event websites, RSVP collection and guest communications.",
      },
    ],
    seoDescription:
      "Explore wedding planning, celebration design and digital wedding experiences with Last Promise Events.",
  },
  {
    slug: "corporate-events",
    title: "Corporate & Brand Events",
    shortTitle: "Corporate",
    eyebrow: "Experiences With Purpose",
    tagline: "Where exceptional experiences meet meaningful impact.",
    description:
      "Memorable corporate gatherings, brand launches and professional celebrations.",
    introduction:
      "We approach corporate events as an opportunity to communicate a story, strengthen relationships and create a lasting impression through purposeful experiences.",
    image: "/images/corporate.jpg",
    imageAlt: "Premium corporate event setting",
    highlights: [
      "Conferences",
      "Product launches",
      "Award ceremonies",
      "Brand activations",
      "Corporate celebrations",
    ],
    offerings: [
      {
        title: "Corporate Event Planning",
        description:
          "Structured planning for conferences, company celebrations and professional gatherings.",
      },
      {
        title: "Brand Experiences",
        description:
          "Event concepts that reflect your brand identity and connect with your audience.",
      },
      {
        title: "Production Coordination",
        description:
          "Coordination of event schedules, technical requirements and production partners.",
      },
      {
        title: "Digital Event Solutions",
        description:
          "Event registration, invitations, guest communications and branded event pages.",
      },
    ],
    seoDescription:
      "Discover corporate event planning, brand experiences, conferences and digital event solutions from Last Promise Events.",
  },
  {
    slug: "private-events",
    title: "Private & Social Events",
    shortTitle: "Private Events",
    eyebrow: "Personal. Meaningful. Memorable.",
    tagline: "Beautifully considered moments, made entirely yours.",
    description:
      "Intimate gatherings, birthdays, anniversaries and milestone celebrations.",
    introduction:
      "Some of life's most important occasions are the most personal. We create celebration concepts that reflect individual stories, memorable moments and genuine connection.",
    image: "/images/private.jpg",
    imageAlt: "Elegant private celebration setting",
    highlights: [
      "Birthdays",
      "Anniversaries",
      "Private dinners",
      "Milestone occasions",
      "Family celebrations",
    ],
    offerings: [
      {
        title: "Celebration Concepts",
        description:
          "Creative themes and event concepts tailored to the occasion and your personal style.",
      },
      {
        title: "Venue & Experience Planning",
        description:
          "Support with venue selection, event flow and guest experience.",
      },
      {
        title: "Decor & Styling",
        description:
          "Considered styling that brings character and atmosphere to your celebration.",
      },
      {
        title: "Personalized Digital Invitations",
        description:
          "Beautifully designed digital invitations and RSVP experiences.",
      },
    ],
    seoDescription:
      "Plan private celebrations, birthdays, anniversaries and milestone events with Last Promise Events.",
  },
  {
    slug: "destination-events",
    title: "Destination Experiences",
    shortTitle: "Destination",
    eyebrow: "Beyond Boundaries",
    tagline: "Extraordinary occasions in unforgettable places.",
    description:
      "Destination celebrations, retreats and experiences inspired by remarkable locations.",
    introduction:
      "The right destination becomes part of the story. We help shape the creative vision and coordination approach for celebrations where location, atmosphere and experience come together.",
    image: "/images/experience.jpg",
    imageAlt: "Destination event inspiration",
    highlights: [
      "Destination weddings",
      "Celebration retreats",
      "Venue experiences",
      "Guest itineraries",
      "Travel coordination planning",
    ],
    offerings: [
      {
        title: "Destination Concepts",
        description:
          "Creative planning built around the character and atmosphere of the chosen location.",
      },
      {
        title: "Venue Research",
        description:
          "Assistance exploring suitable venues and event environments.",
      },
      {
        title: "Guest Journey Planning",
        description:
          "Thoughtful schedules, communications and arrival experiences.",
      },
      {
        title: "Local Partner Coordination",
        description:
          "Planning support for coordinating event requirements with destination-based partners.",
      },
    ],
    seoDescription:
      "Explore destination wedding concepts, celebration retreats and location-inspired event experiences with Last Promise Events.",
  },
  {
    slug: "digital-experiences",
    title: "Digital Event Experiences",
    shortTitle: "Digital",
    eyebrow: "Celebrations, Connected",
    tagline: "Thoughtful technology for extraordinary experiences.",
    description:
      "Digital invitations, personalized event websites, RSVPs and guest-management experiences.",
    introduction:
      "We combine design and technology to make event communication more personal, organized and memorable — from the first invitation to the final celebration.",
    image: "/images/digital.jpg",
    imageAlt: "Digital event design and technology inspiration",
    highlights: [
      "Digital invitations",
      "Event websites",
      "RSVP management",
      "Guest communications",
      "Event technology",
    ],
    offerings: [
      {
        title: "Digital Invitations",
        description:
          "Beautiful invitation experiences designed to reflect the personality of your event.",
      },
      {
        title: "Personalized Event Websites",
        description:
          "Dedicated websites featuring event details, schedules, locations and stories.",
      },
      {
        title: "RSVP & Guest Management",
        description:
          "Digital workflows to collect responses and organize guest information.",
      },
      {
        title: "Event Communication Tools",
        description:
          "Digital touchpoints for sharing updates and essential event information.",
      },
    ],
    seoDescription:
      "Explore digital invitations, event websites, RSVP management and guest technology from Last Promise Events.",
  },
];

export function getServiceBySlug(
  slug: string
): Service | undefined {
  return services.find((service) => service.slug === slug);
}
