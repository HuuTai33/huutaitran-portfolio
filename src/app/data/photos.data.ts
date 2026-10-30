import { Photo, PhotoSeries } from "../models/photo.model";

export const PHOTO_SERIES: PhotoSeries[] = [
  {
    id: "tokyo-nights",
    title: "Tokyo After Dark",
    subtitle: "Nuits électriques, néons et ruelles de Tokyo",
    description: "Une immersion au cœur des nuits tokyoïtes, où la pluie sublime les néons de Shinjuku, Shibuya et Kabukicho dans une atmosphère cinématographique.",
    coverImage: "/images/converted_webp/huutaitran - 0.webp",
    photoCount: 10,
    year: "2024",
    location: "Shinjuku & Shibuya, Tokyo"
  },
  {
    id: "street-chronicles",
    title: "Street Chronicles",
    subtitle: "Instants volés et silhouettes de la mégapole",
    description: "La pulsation quotidienne d’une métropole en perpétuel mouvement. Les regards, les croisements et la solitude poétique au milieu de la foule.",
    coverImage: "/images/converted_webp/huutaitran - 1.webp",
    photoCount: 9,
    year: "2024",
    location: "Tokyo, Japon"
  },
  {
    id: "urban-geometry",
    title: "Géométrie Urbaine",
    subtitle: "Lignes pures, verre, acier et jeux d’ombres",
    description: "Une exploration architecturale rigoureuse mettant en valeur les perspectives vertigineuses, le brutalisme moderne et les reflets infinis des gratte-ciels.",
    coverImage: "/images/converted_webp/huutaitran - 2.webp",
    photoCount: 9,
    year: "2024",
    location: "Ginza, Marunouchi & Roppongi"
  },
  {
    id: "quiet-transitions",
    title: "Poésie & Atmosphère",
    subtitle: "Brume, sanctuaires et douceurs insoupçonnées",
    description: "Des instants de calme suspendu entre modernité effrénée et traditions séculaires, des temples aux ruelles discrètes de Yanaka et Asakusa.",
    coverImage: "/images/converted_webp/huutaitran - 3.webp",
    photoCount: 9,
    year: "2024",
    location: "Yanaka & Asakusa, Tokyo"
  }
];

const SERIES_CONFIG: Array<{
  seriesId: 'tokyo-nights' | 'street-chronicles' | 'urban-geometry' | 'quiet-transitions';
  seriesTitle: string;
  category: 'nights' | 'street' | 'architecture' | 'atmosphere';
  categoryLabel: string;
  districts: string[];
  titles: string[];
}> = [
  {
    seriesId: "tokyo-nights",
    seriesTitle: "Tokyo After Dark",
    category: "nights",
    categoryLabel: "Nuits & Néons",
    districts: ["Shinjuku", "Kabukicho", "Shibuya", "Akihabara", "Roppongi"],
    titles: [
      "Neon Illumination",
      "Rainy Echoes",
      "Midnight Crossroad",
      "Cybernetic Glow",
      "Lantern Alley",
      "Electric Horizon",
      "Night Drift",
      "After Hours",
      "Velvet Shadow",
      "Tokyo Luminescence"
    ]
  },
  {
    seriesId: "street-chronicles",
    seriesTitle: "Street Chronicles",
    category: "street",
    categoryLabel: "Scènes de Vie",
    districts: ["Shibuya", "Harajuku", "Ueno", "Ikebukuro", "Shimokitazawa"],
    titles: [
      "Morning Commute",
      "Pedestrian Flow",
      "Transient Moment",
      "Subway Pulse",
      "Umbrella Symphony",
      "Urban Solitude",
      "Crosswalk Rhythm",
      "City Passerby",
      "Metro Velocity",
      "Street Geometry"
    ]
  },
  {
    seriesId: "urban-geometry",
    seriesTitle: "Géométrie Urbaine",
    category: "architecture",
    categoryLabel: "Architecture",
    districts: ["Ginza", "Marunouchi", "Roppongi Hills", "Odaiba", "Shiodome"],
    titles: [
      "Concrete & Sky",
      "Vertical Symmetry",
      "Glass Reflections",
      "Monolithic Tower",
      "Prism of Light",
      "Steel Angles",
      "Architectural Rhythm",
      "Urban Monolith",
      "Structural Harmony",
      "Minimalist Facade"
    ]
  },
  {
    seriesId: "quiet-transitions",
    seriesTitle: "Poésie & Atmosphère",
    category: "atmosphere",
    categoryLabel: "Atmosphère",
    districts: ["Yanaka", "Asakusa", "Nakameguro", "Kagurazaka", "Nezu"],
    titles: [
      "Alleyway Whispers",
      "Sanctuary Mist",
      "Quiet Dusk",
      "Silent Lantern",
      "Hidden Courtyard",
      "Morning Stillness",
      "Temple Shadows",
      "Paper Screens",
      "Suspended Time",
      "Zenith Breeze"
    ]
  }
];

const TOTAL_WEBP_IMAGES = 37;

export const BASE_PHOTOS: Array<Omit<Photo, 'id'>> = Array.from({ length: TOTAL_WEBP_IMAGES }, (_, i) => {
  const seriesIndex = i % SERIES_CONFIG.length;
  const config = SERIES_CONFIG[seriesIndex];
  const itemIndex = Math.floor(i / SERIES_CONFIG.length);
  const district = config.districts[itemIndex % config.districts.length];
  const title = config.titles[itemIndex % config.titles.length] || `Tokyo Frame #${i + 1}`;
  const filename = `huutaitran - ${i}.webp`;
  const imagePath = `/images/converted_webp/${filename}`;

  return {
    src: imagePath,
    thumbSrc: imagePath,
    filename: filename,
    title: title,
    seriesId: config.seriesId,
    seriesTitle: config.seriesTitle,
    category: config.category,
    categoryLabel: config.categoryLabel,
    location: "Tokyo, Japon",
    district: district,
    aspectRatio: i % 3 === 0 ? "vertical" : "horizontal",
    featured: i % 4 === 0,
    year: 2024,
    camera: "Fujifilm X-T5",
    lens: i % 2 === 0 ? "XF 33mm f/1.4 R LM WR" : "XF 23mm f/1.4 R LM WR",
    description: `Photographie issue de la collection Tokyo par HuuTai Tran. Cliché capturé à ${district} avec boîtier Fujifilm X-T5.`
  };
});

export const ALL_PHOTOS: Photo[] = Array.from({ length: TOTAL_WEBP_IMAGES }, (_, i) => {
  const base = BASE_PHOTOS[i];
  return {
    ...base,
    id: `tokyo-${i + 1}`
  };
});
