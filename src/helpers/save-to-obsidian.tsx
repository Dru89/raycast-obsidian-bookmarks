import * as fs from "node:fs/promises";
import * as path from "node:path";

import { getPreferenceValues } from "@raycast/api";
import dedent from "ts-dedent";

import { LinkFormState } from "../hooks/use-link-form";
import { Preferences } from "../types";
import slugify from "./slugify";
import { addToLocalStorageTags } from "./localstorage-tags";
import formatDate from "./format-date";

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
  const filename = `${fileSlug}.md`;

  const file = await getFileName(filename);
  await Promise.all([fs.writeFile(file, template, { encoding: "utf-8" }), addToLocalStorageTags(tags)]);
  return path.basename(file);
}
