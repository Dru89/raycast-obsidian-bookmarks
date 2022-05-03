import path from "node:path";
import { URLSearchParams } from "node:url";

import { getPreferenceValues, open } from "@raycast/api";
import { Preferences } from "../types";

export default function openObsidianFile(file: string, inBookmarks = true): Promise<void> {
  const prefs = getPreferenceValues<Preferences>();
  const filePath = inBookmarks ? path.join(prefs.bookmarksPath, file) : file;

  const params = new URLSearchParams();
  params.set("vault", prefs.vaultName);
  params.set("file", filePath);
  // obsidian://open?vault=Personal&file=Resources%2FSaved%20Links%2F2022-04-02-working-with-tags-obsidian-help
  return open(`obsidian://open?${params.toString().replaceAll("+", "%20")}`);
}
