import { LocalStorage } from "@raycast/api";
import { File, unique } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safelyRun<F extends (...args: any[]) => any>(func: F, defaultValue: ReturnType<F>): F {
  return ((...args: Parameters<F>) => {
    try {
      return func(...args);
    } catch (err) {
      console.error(`Could not safely ${func.prototype.name ? `run ${func.prototype.name}` : "handle files"}`, err);
      return defaultValue;
    }
  }) as F;
}

function isFileAttributesLike(v: unknown): v is File["attributes"] {
  if (v == null || typeof v !== "object") return false;
  const attrs = v as File["attributes"];
  return (
    typeof attrs.url === "string" &&
    typeof attrs.title === "string" &&
    typeof attrs.read === "boolean" &&
    (attrs.added instanceof Date || typeof attrs.added === "string") &&
    Array.isArray(attrs.tags) &&
    attrs.tags.every((tag) => typeof tag === "string")
  );
}

function isFileLike(v: unknown): v is File {
  if (v == null || typeof v !== "object") return false;
  const file = v as File;
  return (
    typeof file.fileName === "string" &&
    typeof file.fullPath === "string" &&
    (file.lastModified instanceof Date || typeof file.lastModified === "string") &&
    (file.frontmatter == null || typeof file.frontmatter === "string") &&
    (file.body == null || typeof file.body === "string") &&
    (file.bodyBegin == null || typeof file.bodyBegin === "number") &&
    isFileAttributesLike(file.attributes)
  );
}

function toFileArray(files: unknown): File[] {
  if (files == null || !Array.isArray(files)) {
    throw new Error(`Unexpected format for obsidian files in Local Storage: ${JSON.stringify(files)}`);
  }
  return files.map((file) => {
    if (!isFileLike(file)) {
      throw new Error(`Unexpected format for obsidian file in Local Storage: ${JSON.stringify(file)}`);
    }
    file.attributes.added = new Date(file.attributes.added);
    file.lastModified = new Date(file.lastModified);
    return file;
  });
}

async function getLocalStorageFilesInternal(): Promise<File[]> {
  const stored = await LocalStorage.getItem<string>("obsidian-files");
  if (!stored) return [];
  return toFileArray(JSON.parse(stored));
}

async function replaceLocalStorageFilesInternal(files: File[]): Promise<void> {
  const trimmedFiles: File[] = files.map((file) => ({
    attributes: file.attributes,
    fileName: file.fileName,
    fullPath: file.fullPath,
    frontmatter: file.frontmatter,
    lastModified: file.lastModified,
  }));

  const json = JSON.stringify(trimmedFiles);
  await LocalStorage.setItem("obsidian-files", json);
}

async function addToLocalStorageFilesInternal(files: File[]): Promise<void> {
  const existing = await getLocalStorageFilesInternal();
  const newSet = unique([...existing, ...files]);
  await replaceLocalStorageFilesInternal(newSet);
}

export const getLocalStorageFiles = safelyRun(getLocalStorageFilesInternal, Promise.resolve([]));
export const replaceLocalStorageFiles = safelyRun(replaceLocalStorageFilesInternal, Promise.resolve(undefined));
export const addToLocalStorageFiles = safelyRun(addToLocalStorageFilesInternal, Promise.resolve(undefined));
