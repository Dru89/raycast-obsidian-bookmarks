import { Action, ActionPanel, FileIcon, Icon, popToRoot, showHUD } from "@raycast/api";
import openObsidianFile from "../helpers/open-obsidian-file";
import { File } from "../types";

type Props = {
  file: File;
  obsidianFileIcon?: FileIcon;
  showDetail: boolean;
  onShowDetailChange: (value: boolean) => void;
};
export default function FileItemActionPanel({
  file,
  obsidianFileIcon,
  showDetail,
  onShowDetailChange,
}: Props): JSX.Element {
  return (
    <ActionPanel title="Bookmark">
      <Action.OpenInBrowser url={file.attributes.url} />
      <Action
        title="Open in Obsidian"
        icon={obsidianFileIcon}
        onAction={async () => {
          openObsidianFile(file.fileName);
          await showHUD("Opening file");
          popToRoot();
        }}
      />
      <Action
        icon={Icon.TextDocument}
        title={showDetail ? "Hide Details" : "Show Details"}
        onAction={() => onShowDetailChange(!showDetail)}
      />
      <ActionPanel.Section>
        {/*
        <Action
          // TODO: implement this method.
          title="Mark as Read"
          icon={Icon.Checkmark}
          onAction={async () => {
            const toast = await showToast({
              style: Toast.Style.Failure,
              title: "Not Implemented",
              message: "This feature hasn't been implemented yet.",
            });

            setTimeout(() => toast.hide(), 2000);
          }}
        />
        */}
        <Action.Trash title="Delete Bookmark" paths={file.fullPath} />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
