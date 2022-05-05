export type FormActionPreference =
  | "openObsidian"
  | "copyObsidianUrl"
  | "copyObsidianUrlAsMarkdown"
  | "openUrl"
  | "copyUrl"
  | "copyUrlAsMarkdown";

export type DetailActionPreference = FormActionPreference | "showDetails" | "markAsRead" | "deleteFile";

export interface Preferences {
  vaultName: string;
  vaultPath: string;
  bookmarksPath: string;
  defaultFormAction: FormActionPreference;
  defaultItemAction: DetailActionPreference;
}
