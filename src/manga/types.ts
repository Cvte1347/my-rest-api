// MangaDex API types
export interface MangaDexRelationship {
  id: string;
  type: string;
  attributes?: {
    fileName?: string;
    [key: string]: unknown;
  };
}

export interface MangaDexTitle {
  en?: string;
  ja?: string;
  [key: string]: string | undefined;
}

export interface MangaDexAttributes {
  title: MangaDexTitle;
  status?: string;
  [key: string]: unknown;
}

export interface MangaDexManga {
  id: string;
  type: string;
  attributes: MangaDexAttributes;
  relationships?: MangaDexRelationship[];
}

export interface MangaDexResponse {
  result: string;
  response: string;
  data: MangaDexManga | MangaDexManga[];
}

export interface MangaDexListResponse {
  result: string;
  response: string;
  data: MangaDexManga[];
}

export interface SavedMangaResult {
  id?: number;
  mangadexId: string;
  title: string;
  coverUrl: string | null;
  status: string | null;
  created?: boolean;
  updated?: boolean;
}

export type CoverSize = 'original' | '256' | '512';

export interface CoverResult {
  mangaId: string;
  coverUrl: string;
  size: CoverSize;
}
