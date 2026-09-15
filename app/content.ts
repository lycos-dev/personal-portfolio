// Professional details from the supplied résumé and repositories, reviewed 2026-09-15.
export const portfolio = {
  name: "Lycos Blanza",
  resume: "/Lycos_Blanza_Resume.docx",
  email: "blanzalycos@gmail.com",
  phone: "0995 678 3687",
  phoneHref: "tel:+639956783687",
  location: "Lipa City, Batangas",
  github: "https://github.com/lycos-dev",
  linkedin: "https://www.linkedin.com/in/lycos-blanza-969305368",
  instagram: "https://www.instagram.com/_u/lcs.blnza",
  facebook: "https://www.facebook.com/LycosLB/",
  hero: { image: "/lycos-portrait.png", mask: "/lycos-portrait-cutout.png" },
};
export const projects = [
  {
    id: "safeseat", number: "01", title: "SafeSeat", category: "Embedded Systems / Undergraduate Thesis",
    description: "A privacy-conscious vehicle monitoring system that combines sensor inputs to identify potentially abnormal occupant conditions and trigger verification when needed.",
    focus: "Sensor fusion, anomaly detection, and consent-driven system design.",
    technologies: ["ESP32", "C++", "Python", "Computer Vision", "IoT"],
    details: ["Combines physiological and behavioral sensor inputs for occupant monitoring and anomaly detection.", "Adapts emergency logic to driver status, passenger presence, and user-defined escalation settings.", "Uses session-scoped data and granular consent, with camera-based verification triggered only when necessary."],
    url: "https://github.com/lycos-dev/SafeSeat",
  },
  {
    id: "influentify", number: "02", title: "Influentify", category: "Full-Stack / Creator Research",
    description: "A creator-sourcing workspace that brings public-profile discovery, evidence review, and shortlist exports into one repeatable workflow.",
    focus: "Reliable data handling across a React interface, Express API, and PostgreSQL database.",
    technologies: ["React", "TypeScript", "Express", "PostgreSQL", "Prisma"],
    details: ["Discovers public profiles through the Brave Search API and retains evidence from original source pages for review.", "Normalizes creator handles, rejects duplicates, and keeps previously used or voided creators out of new lists.", "Separates fit scoring from data confidence and exports reviewed creator lists to Excel."],
    url: "https://github.com/lycos-dev/Influentify",
  },
  {
    id: "docvia", number: "03", title: "DocVia", category: "Web Application / Learning",
    description: "An AI-powered learning project that turns PDFs into structured lessons, with contextual questions and quizzes to support active recall.",
    focus: "Document-based learning and a clear, reusable React interface.",
    technologies: ["React", "TypeScript", "Vite"],
    details: ["The project organizes uploaded PDFs into a learning roadmap and segmented lessons.", "An AI tutor and generated microtasks support questions and active recall around learning materials.", "The linked frontend repository contains the React application foundation, authentication screens, and shared UI components."],
    url: "https://github.com/Waldric/docvia-frontend",
  },
  {
    id: "fitness", number: "04", title: "NEXA", category: "Mobile Application / Fitness",
    description: "A mobile fitness tracker for planning routines, logging workouts, and revisiting exercise history through a consistent, accessible interface.",
    focus: "Reusable mobile components, typed navigation, and local persistence.",
    technologies: ["React Native", "Expo", "TypeScript", "AsyncStorage"],
    details: ["Supports exercise-library management, routine creation, and workout logging.", "Persists workouts, routines, and preferences locally with AsyncStorage.", "Uses reusable interface components and typed navigation across exercise, workout, and profile screens."],
    url: "https://github.com/lycos-dev/final-project-group4",
  },
];
export type Project = typeof projects[number];
export const skillGroups = [
  { title: "Languages", items: ["Python", "TypeScript", "JavaScript", "Java", "C++"] },
  { title: "Web & Mobile", items: ["React", "React Native", "Expo", "HTML & CSS"] },
  { title: "Backend & Data", items: ["Node.js / Express", "PostgreSQL", "Prisma", "Supabase", "MySQL"] },
  { title: "Intelligent Systems", items: ["ESP32", "IoT", "Computer Vision", "Machine Learning"] },
  { title: "Analytics", items: ["Pandas", "R", "tidyverse"] },
  { title: "Development Tools", items: ["Git", "VS Code", "Linux / CLI"] },
];
