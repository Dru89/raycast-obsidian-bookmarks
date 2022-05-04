import { getPreferenceValues } from "@raycast/api";
import frontMatter from "front-matter";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import dedent from "ts-dedent";
import { LinkFormState } from "../hooks/use-link-form";
import { Preferences } from "../types";
import { addToLocalStorageFiles } from "./localstorage-files";
import { addToLocalStorageTags } from "./localstorage-tags";
import slugify from "./slugify";

function formatDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function exists(filename: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filename);
    return Boolean(stat);
  } catch (err) {
    return false;
  }
}

async function getFileName(filename: string): Promise<string> {
  const prefs = getPreferenceValues<Preferences>();
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let file = path.join(prefs.vaultPath, prefs.bookmarksPath, filename);
  let index = 1;
  while (await exists(file)) {
    const newFilename = `${base}-${index++}.md`;
    file = path.join(prefs.vaultPath, prefs.bookmarksPath, newFilename);
  }
  return file;
}

export default async function saveToObsidian(link: LinkFormState["values"]): Promise<string> {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const tags = link.tags.map((t) => slugify(t));

  const template = dedent`
    ---
    url: ${JSON.stringify(link.url)}
    title: ${JSON.stringify(link.title)}
    tags: ${JSON.stringify(tags)}
    added: ${formatDate(now)}
    read: no
    ---

    # [${link.title.replace(/\[\]/g, "")}](${link.url})

    ${link.description}
  `;

  const fileSlug = `${formatDate(now)}-${slugify(link.title)}`.slice(0, 150);
  const fileName = `${fileSlug}.md`;

  const fullPath = await getFileName(fileName);
  addToLocalStorageFiles([
    {
      ...frontMatter(template),
      fullPath,
      fileName,
    },
  ]);
  await Promise.all([fs.writeFile(fullPath, template, { encoding: "utf-8" }), addToLocalStorageTags(tags)]);
  return path.basename(fullPath);
}
