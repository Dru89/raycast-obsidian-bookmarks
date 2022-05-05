import { Action, FileIcon, getApplications, getPreferenceValues, Icon, showHUD } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { asFile } from "../helpers/save-to-obsidian";
import { LinkFormState } from "../hooks/use-link-form";
import { FormActionPreference, Preferences } from "../types";
import * as methods from "./methods";
import { ActionGroup, OrderedActionPanel } from "./order-manager";

const saveFile = (values: LinkFormState["values"]) => asFile(values).then((f) => methods.saveFile(f));

const createObsidianActions = (
  values: LinkFormState["values"],
  icon?: FileIcon
): ActionGroup<FormActionPreference> => ({
  key: "obsidian",
  useDivider: "unless-first",
  title: "Obsidian",
  icon,
  actions: new Map<FormActionPreference, Action.Props>([
    [
      "openObsidian",
      {
        title: "Open Obsidian",
        shortcut: { modifiers: ["cmd", "shift"], key: "o" },
        onAction: async () => {
          const file = await saveFile(values);
          return Promise.allSettled([methods.openObsidianFile(file), showHUD("Opening Obsidian…")]);
        },
      },
    ],
    [
      "copyObsidianUrl",
      {
        title: "Copy Obsidian Link",
        shortcut: { modifiers: ["cmd", "shift"], key: "c" },
        onAction: async () => {
          const file = await saveFile(values);
          return Promise.allSettled([methods.copyObsidianUri(file), showHUD("Link copied")]);
        },
      },
    ],
    [
      "copyObsidianUrlAsMarkdown",
      {
        title: "Copy Obsidian Link as Markdown",
        shortcut: { modifiers: ["cmd", "shift"], key: "l" },
        onAction: async () => {
          const file = await saveFile(values);
          return Promise.allSettled([methods.copyObsidianUriAsMarkdown(file), showHUD("Link copied")]);
        },
      },
    ],
  ]),
});

const createBrowserActions = (values: LinkFormState["values"]): ActionGroup<FormActionPreference> => ({
  key: "browser",
  useDivider: "unless-first",
  title: "Browser Actions",
  actions: new Map<FormActionPreference, Action.Props>([
    [
      "openUrl",
      {
        title: "Open Link",
        icon: Icon.Globe,
        shortcut: { modifiers: ["cmd", "ctrl"], key: "o" },
        onAction: async () => {
          const file = await saveFile(values);
          return Promise.allSettled([methods.openUrl(file), showHUD("Opening link…")]);
        },
      },
    ],
    [
      "copyUrl",
      {
        icon: Icon.Link,
        title: "Copy Link",
        shortcut: { modifiers: ["cmd", "ctrl"], key: "c" },
        onAction: async () => {
          const file = await saveFile(values);
          return Promise.allSettled([methods.copyUrl(file), showHUD("Link copied")]);
        },
      },
    ],
    [
      "copyUrlAsMarkdown",
      {
        icon: Icon.Link,
        title: "Copy Link as Markdown",
        shortcut: { modifiers: ["cmd", "ctrl"], key: "l" },
        onAction: async () => {
          const file = await saveFile(values);
          return Promise.allSettled([methods.copyUrlAsMarkdown(file), showHUD("Link copied")]);
        },
      },
    ],
  ]),
});

export type FormActionsProps = { values: LinkFormState["values"] };
export default function FormActions({ values }: FormActionsProps): JSX.Element {
  const [obsidianIcon, setObsidianIcon] = useState<FileIcon>();
  const [defaultAction, setDefaultAction] = useState<FormActionPreference>("openObsidian");

  useEffect(() => {
    const fetchIcon = async () => {
      const apps = await getApplications();
      const path = apps.find((app) => app.name === "Obsidian")?.path;
      if (path) {
        setObsidianIcon({ fileIcon: path });
      }
    };

    const fetchAction = async () => {
      const prefs = await getPreferenceValues<Preferences>();
      setDefaultAction(prefs.defaultFormAction);
    };

    fetchIcon();
    fetchAction();
  }, []);

  const obsidianActions = useMemo(() => createObsidianActions(values, obsidianIcon), [values, obsidianIcon]);
  const browserActions = useMemo(() => createBrowserActions(values), [values]);

  return (
    <OrderedActionPanel
      title="Save Bookmark and…"
      groups={[obsidianActions, browserActions]}
      defaultAction={defaultAction}
    />
  );
}
