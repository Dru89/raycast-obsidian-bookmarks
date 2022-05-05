import { Action, FileIcon, getApplications, getPreferenceValues, Icon } from "@raycast/api";
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
        onAction: () => saveFile(values).then((file) => methods.openObsidianFile(file)),
      },
    ],
    [
      "copyObsidianUrl",
      {
        title: "Copy Obsidian Link",
        onAction: () => saveFile(values).then((file) => methods.copyObsidianUri(file)),
      },
    ],
    [
      "copyObsidianUrlAsMarkdown",
      {
        title: "Copy Obsidian Link as Markdown",
        onAction: () => saveFile(values).then((file) => methods.copyObsidianUriAsMarkdown(file)),
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
        icon: Icon.Globe,
        title: "Open Link",
        onAction: () => saveFile(values).then((file) => methods.openUrl(file)),
      },
    ],
    [
      "copyUrl",
      {
        icon: Icon.Link,
        title: "Copy Link",
        onAction: () => saveFile(values).then((file) => methods.copyUrl(file)),
      },
    ],
    [
      "copyUrlAsMarkdown",
      {
        icon: Icon.Link,
        title: "Copy Link as Markdown",
        onAction: () => saveFile(values).then((file) => methods.copyUrlAsMarkdown(file)),
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
