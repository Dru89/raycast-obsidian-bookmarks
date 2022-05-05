import { getPreferenceValues } from "@raycast/api";
import frontMatter from "front-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { File, FrontMatter, Preferences } from "../types";
import { replaceLocalStorageFiles } from "./localstorage-files";

function isFulfilledPromise<T>(v: PromiseSettledResult<T>): v is PromiseFulfilledResult<T> {
  return v.status === "fulfilled";
}

export default async function getObsidianFiles(): Promise<Array<File>> {
  const prefs = getPreferenceValues<Preferences>();
  const dir = path.join(prefs.vaultPath, prefs.bookmarksPath);

  const files = await fs.readdir(dir);
  const markdown = files.filter((file) => file.endsWith(".md"));
  const promises = markdown.map(async (fileName): Promise<File> => {
    const fullPath = path.join(dir, fileName);
    const [stat, text] = await Promise.all([fs.stat(fullPath), fs.readFile(fullPath, { encoding: "utf-8" })]);
    return {
      ...frontMatter<FrontMatter>(text),
      fileName,
      fullPath,
      lastModified: stat.mtime,
    };
  });

  const results = await Promise.allSettled(promises);
  const fileResults = await results.filter(isFulfilledPromise).map((result) => result.value);
  await replaceLocalStorageFiles(fileResults);

  return fileResults;
}
