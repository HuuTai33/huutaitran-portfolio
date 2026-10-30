export interface Photo {
  id: string;
  src: string;
  thumbSrc?: string;
  filename: string;
  title: string;
  seriesId: 'tokyo-nights' | 'street-chronicles' | 'urban-geometry' | 'quiet-transitions';
  seriesTitle: string;
  category: 'nights' | 'street' | 'architecture' | 'atmosphere';
  categoryLabel: string;
  location: string;
  district?: string;
  aspectRatio: 'vertical' | 'horizontal' | 'square';
  featured?: boolean;
  year: number;
  camera?: string;
  lens?: string;
  description?: string;
}

export interface PhotoSeries {
  id: 'tokyo-nights' | 'street-chronicles' | 'urban-geometry' | 'quiet-transitions';
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  photoCount: number;
  year: string;
  location: string;
}

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}
