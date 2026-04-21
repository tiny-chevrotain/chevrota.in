export type MediaType =
  | { kind: 'photo'; src: string; alt: string }
  | { kind: 'carousel'; photos: Array<{ src: string; alt: string }> }
  | { kind: 'video'; src: string; poster?: string };

export interface PortfolioItem {
  id: string;
  title: string;
  date: string;        // format: "YYYY-MM" e.g. "2024-03"
  description: string;
  tags?: string[];
  media?: MediaType;
}

export interface HomePhoto {
  src: string;
  alt: string;
  rotate: number;  // degrees, e.g. -4 to 4
  top: string;     // CSS value, e.g. "12%"
  left: string;    // CSS value, e.g. "5%"
  width: string;   // CSS value, e.g. "220px"
}

export interface HomeData {
  name: string;
  tagline: string;
  bio: string[];   // array of paragraph strings
  photos: HomePhoto[];
}
