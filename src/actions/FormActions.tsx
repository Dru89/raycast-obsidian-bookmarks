import { Action, FileIcon, Icon, showHUD } from "@raycast/api";
import { useMemo } from "react";
import { asFile } from "../helpers/save-to-obsidian";
import { useFileIcon } from "../hooks/use-applications";
import { LinkFormState } from "../hooks/use-link-form";
import { usePreference } from "../hooks/use-preferences";
import { FormActionPreference } from "../types";
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
  const { value: obsidianIcon } = useFileIcon("Obsidian");
  const { value: defaultAction } = usePreference("defaultFormAction");

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
