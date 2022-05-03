import { List, Icon, FileIcon } from "@raycast/api";
import { File } from "../types";
import FileItemActionPanel from "./FileItemActionPanel";
import FileItemDetail from "./FileItemDetail";

type Props = {
  file: File;
  loading: boolean;
  obsidianFileIcon?: FileIcon;
  showDetail: boolean;
  onShowDetailChange: (newShowDetail: boolean) => void;
};
export default function FileListItem({
  file,
  loading,
  obsidianFileIcon,
  showDetail,
  onShowDetailChange,
}: Props): JSX.Element {
  return (
    <List.Item
      id={file.fullPath}
      title={file.attributes.title}
      subtitle={file.attributes.url}
      accessories={file.attributes.tags.map((tag) => ({ text: tag }))}
      icon={Icon.Link}
      actions={
        <FileItemActionPanel
          file={file}
          obsidianFileIcon={obsidianFileIcon}
          showDetail={showDetail}
          onShowDetailChange={onShowDetailChange}
        />
      }
      detail={<FileItemDetail file={file} loading={loading} />}
    />
  );
}
