// This is the single, safe-to-share place to replace temporary store content.
// Email credentials and admin secrets belong only in .env, never in this file.
export const STORE_CONFIG = {
  name: "RUDRA OPTICAL",
  shortName: "Visiona",
  tagline: "See better. Look better.",
  description: "Thoughtfully chosen eyewear, practical lens guidance, and professional eye-test appointments—close to home.",
  phone: "+91 8218841976",
  whatsapp: "+91 8218841976",
  email: "akashchauhan20005@gmail.com",
  address: "Uttarahand, shyampur, 249204",
  mapUrl: "https://maps.google.com/?q=Your+Optical+Store",
  locationLabel: "shyampur",
  openingHours: [
    ["Monday – Saturday", "10:00 AM – 8:00 PM"],
    ["Sunday", "By appointment"]
  ],
  heroTitle: "See better.\nLook better.",
  heroDescription: "Find eyewear that feels like you, with personal guidance and eye-test appointments at our new local optical store.",
  about: {
    story: "Visiona Optical is a new local space being created for comfortable, considered eyewear. Replace this placeholder with the founder's story before launch.",
    vision: "To make choosing eyewear feel clear, personal, and unhurried.",
    approach: "We focus on listening first—then helping each visitor explore frames and lens options that suit their everyday life.",
    philosophy: "Eye care should be approachable. We explain options in plain language and encourage every customer to make an informed choice."
  },
  announcement: "Now opening soon · Eye-test appointments are available to request.",
  heroImage: "/assets/visiona-hero.png",
  collectionImage: "/assets/frame-collection.png"
};

export const CATEGORIES = [
  { id: "kids", title: "Kids", description: "Comfort-first frames for growing explorers.", accent: "cobalt" },
  { id: "men", title: "Men", description: "Everyday shapes with a considered edge.", accent: "sand" },
  { id: "women", title: "Women", description: "Expressive silhouettes for every day.", accent: "rose" },
  { id: "seniors", title: "Seniors", description: "Easy-fit frames for clear reading and comfort.", accent: "moss" },
  { id: "sunglasses", title: "Sunglasses", description: "Protection and style for brighter days.", accent: "amber" }
];

export const SERVICES = [
  {
    id: "eye-testing",
    icon: "◎",
    title: "Eye testing",
    description: "Request a professional eye-test appointment at a time that works for you. Our team will contact you to confirm it.",
    enabled: true
  },
  {
    id: "prescription",
    icon: "◌",
    title: "Prescription eyewear",
    description: "Explore frames and prescription eyewear options in person, with time to find a comfortable fit.",
    enabled: true
  },
  {
    id: "lenses",
    icon: "◍",
    title: "Lens guidance",
    description: "Talk through anti-reflective, blue-light filtering, reading, photochromic, and progressive lens options.",
    enabled: true
  },
  {
    id: "frame-guidance",
    icon: "◇",
    title: "Frame selection assistance",
    description: "Get thoughtful help choosing frame shapes and materials around comfort, style, and prescription needs.",
    enabled: true
  },
  {
    id: "frame-service",
    icon: "⌁",
    title: "Frame & lens services",
    description: "This service is a configurable placeholder—enable it only when your store offers it.",
    enabled: false
  }
];

export const PRODUCTS = [
  {
    id: "classic-round-black",
    name: "Classic Round Black",
    category: "men",
    ageGroup: "Adults",
    shape: "Round",
    material: "Acetate",
    color: "Black",
    style: "Everyday round",
    description: "A refined, easy-wearing round profile with a soft keyhole bridge. Ask in store about current availability and fitting.",
    availability: "Ask in store",
    featured: true,
    imagePosition: "16% 50%"
  },
  {
    id: "soft-square-sand",
    name: "Soft Square Sand",
    category: "women",
    ageGroup: "Adults",
    shape: "Square",
    material: "Acetate",
    color: "Sand",
    style: "Soft square",
    description: "A lightly translucent square frame with softened corners and warm sand colouring.",
    availability: "Ask in store",
    featured: true,
    imagePosition: "42% 50%"
  },
  {
    id: "champagne-aviator",
    name: "Champagne Aviator",
    category: "sunglasses",
    ageGroup: "Adults",
    shape: "Aviator",
    material: "Metal",
    color: "Champagne",
    style: "Lightweight aviator",
    description: "A slim metal aviator shape that keeps the look relaxed, polished, and light on the face.",
    availability: "Ask in store",
    featured: true,
    imagePosition: "60% 50%"
  },
  {
    id: "berry-reading",
    name: "Berry Reading",
    category: "seniors",
    ageGroup: "Seniors",
    shape: "Oval",
    material: "Acetate",
    color: "Burgundy",
    style: "Comfort reading",
    description: "A friendly rounded reading frame in a rich burgundy tone, designed for a comfortable daily fit.",
    availability: "Ask in store",
    featured: true,
    imagePosition: "84% 50%"
  },
  {
    id: "junior-sun-moss",
    name: "Junior Sun Moss",
    category: "kids",
    ageGroup: "Kids",
    shape: "Round",
    material: "TR90",
    color: "Moss",
    style: "Flexible round",
    description: "A flexible, low-fuss round shape for kids. Please visit for an in-person comfort check.",
    availability: "Ask in store",
    featured: false,
    imagePosition: "16% 50%"
  },
  {
    id: "slim-rectangle-ink",
    name: "Slim Rectangle Ink",
    category: "men",
    ageGroup: "Adults",
    shape: "Rectangle",
    material: "Metal",
    color: "Charcoal",
    style: "Minimal rectangle",
    description: "A clean-lined, slim metal rectangle for a minimal and precise look.",
    availability: "Ask in store",
    featured: false,
    imagePosition: "71% 50%"
  }
];

export const INQUIRY_TYPES = ["Eyeglasses", "Sunglasses", "Kids Eyewear", "Eye Testing", "Lenses", "Frame Availability", "General Question", "Other"];

