import { FrontMatterResult } from "front-matter";

export function unique(files: File[]): File[] {
  const record = files.reduce((memo, file) => ({ ...memo, [file.fullPath]: file }), {} as Record<string, File>);
  return Object.values(record);
}

export interface FrontMatter {
  url: string;
  title: string;
  tags: string[];
  added: Date;
  read: boolean;
}

export interface File extends Omit<FrontMatterResult<FrontMatter>, "body" | "bodyBegin"> {
  fileName: string;
  fullPath: string;
  lastModified: Date;
  body?: string;
  bodyBegin?: number;
}
