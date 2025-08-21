export interface BrandTheme {
  companyName: string;
  logoUrl: string;
  // Primary/secondary are used for neutral UI elements in PDFs (headers/text)
  primaryColor: string; // e.g., gray-800
  secondaryColor: string; // e.g., gray-700
  // Accent is used sparingly for table headers/lines
  accentColor: string; // e.g., professional red
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

// Default brand. You can replace logoUrl/colors after you share the new logo.
export const brand: BrandTheme = {
  companyName: "مقهى موريسكو",
  logoUrl: "/lovable-uploads/754f3f2a-b792-43bb-a32a-e44c16248177.png",
  // Neutral professional palette (no greens)
  primaryColor: "#1f2937", // gray-800
  secondaryColor: "#374151", // gray-700
  accentColor: "#b91c1c", // red-700 (subtle accent)
  phone: "",
  email: "",
  address: "",
  website: "",
};
