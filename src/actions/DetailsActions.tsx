import { Action, Color, FileIcon, getPreferenceValues, Icon } from "@raycast/api";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { DetailActionPreference, File, Preferences } from "../types";
import * as methods from "./methods";
import { ActionGroup, OrderedActionPanel } from "./order-manager";

const createDetailsActions = (
  file: File,
  showDetail: boolean,
  setShowDetail: Dispatch<SetStateAction<boolean>>
): ActionGroup<DetailActionPreference> => ({
  key: "details",
  useDivider: "unless-first",
  actions: new Map<DetailActionPreference, Action.Props>([
    [
      "showDetails",
      {
        title: showDetail ? "Hide Details" : "Show Details",
        icon: showDetail ? Icon.EyeSlash : Icon.Eye,
        onAction: () => setShowDetail((detail) => !detail),
      },
    ],
    [
      "markAsRead",
      {
        title: file.attributes.read ? "Mark as Unread" : "Mark as Read",
        icon: file.attributes.read ? Icon.Circle : Icon.Checkmark,
        onAction: () => (file.attributes.read ? methods.markAsUnread(file) : methods.markAsRead(file)),
      },
    ],
  ]),
});

const createObsidianActions = (file: File, icon?: FileIcon): ActionGroup<DetailActionPreference> => ({
  key: "obsidian",
  useDivider: "unless-first",
  title: "Obsidian",
  icon,
  actions: new Map<DetailActionPreference, Action.Props>([
    [
      "openObsidian",
      {
        title: "Open Obsidian",
        onAction: () => methods.openObsidianFile(file),
      },
    ],
    [
      "copyObsidianUrl",
      {
        title: "Copy Obsidian Link",
        onAction: () => methods.copyObsidianUri(file),
      },
    ],
    [
      "copyObsidianUrlAsMarkdown",
      {
        title: "Copy Obsidian Link as Markdown",
        onAction: () => methods.copyObsidianUriAsMarkdown(file),
      },
    ],
  ]),
});

const createBrowserActions = (file: File): ActionGroup<DetailActionPreference> => ({
  key: "browser",
  useDivider: "unless-first",
  title: "Browser Actions",
  actions: new Map<DetailActionPreference, Action.Props>([
    [
      "openUrl",
      {
        icon: Icon.Globe,
        title: "Open Link",
        onAction: () => methods.openUrl(file),
      },
    ],
    [
      "copyUrl",
      {
        icon: Icon.Link,
        title: "Copy Link",
        onAction: () => methods.copyUrl(file),
      },
    ],
    [
      "copyUrlAsMarkdown",
      {
        icon: Icon.Link,
        title: "Copy Link as Markdown",
        onAction: () => methods.copyUrlAsMarkdown(file),
      },
    ],
  ]),
});

const createDestructiveActions = (file: File): ActionGroup<DetailActionPreference> => ({
  key: "destructive",
  useDivider: "always",
  actions: new Map([
    [
      "deleteFile",
      {
        title: "Delete Bookmark",
        icon: { source: Icon.Trash, tintColor: Color.Red },
        onAction: () => methods.deleteFile(file),
      },
    ],
  ]),
});

export type DetailsActionsProps = {
  file: File;
  obsidianFileIcon?: FileIcon;
  showDetail: boolean;
  setShowDetail: Dispatch<SetStateAction<boolean>>;
};
export default function DetailsActions({
  file,
  obsidianFileIcon,
  showDetail,
  setShowDetail,
}: DetailsActionsProps): JSX.Element {
  const [defaultAction, setDefaultAction] = useState<DetailActionPreference>("showDetails");

  useEffect(() => {
    const fetchAction = async () => {
      const prefs = await getPreferenceValues<Preferences>();
      setDefaultAction(prefs.defaultFormAction);
    };

    fetchAction();
  }, []);

  const groups = useMemo(() => {
    return [
      createDetailsActions(file, showDetail, setShowDetail),
      createObsidianActions(file, obsidianFileIcon),
      createBrowserActions(file),
      createDestructiveActions(file),
    ];
  }, [file, obsidianFileIcon, showDetail, setShowDetail, obsidianFileIcon]);

  return <OrderedActionPanel groups={groups} defaultAction={defaultAction} />;
}
