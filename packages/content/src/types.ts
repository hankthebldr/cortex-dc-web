// Content management type definitions

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  author: string;
}

export interface KnowledgeBaseNode {
  id: string;
  title: string;
  content: string;
  connections: string[];
  metadata: Record<string, unknown>;
}

export interface ContentLibrary {
  items: ContentItem[];
  categories: string[];
  tags: string[];
}
