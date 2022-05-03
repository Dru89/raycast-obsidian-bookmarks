import { FileIcon, getApplications, List } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import useFiles from "../hooks/use-files";
import FileListItem from "./FileListItem";

export default function SearchBookmarks() {
  const { files, loading } = useFiles();
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [obsidianIcon, setObsidianIcon] = useState<FileIcon>();

  const tagsByPopularity = useMemo(() => {
    const allTags = files.flatMap((file) => file.attributes.tags);
    const ranked = allTags.reduce(
      (memo, tag) => ({
        ...memo,
        [tag]: memo[tag] ?? 1,
      }),
      {} as Record<string, number>
    );

    return Object.entries(ranked).sort((a, b) => b[1] - a[1]);
  }, [files]);

  useEffect(() => {
    const fetch = async () => {
      const apps = await getApplications();
      const path = apps.find((app) => app.name === "Obsidian")?.path;
      if (path) {
        setObsidianIcon({ fileIcon: path });
      }
    };

    fetch();
  }, []);

  return (
    <List
      // TODO: Handle accessory filtering
      // searchBarAccessory={}
      // ---
      // Should use:
      // Unsectioned: All, Unread, Read
      // Unnamed Section: Last 24 Hours, Last Week, Last Month
      // Section("Tags"): Tags (sorted by frequency?)
      // ---

      // TODO: Handle filtering
      // enableFiltering={false}
      searchBarAccessory={
        <List.Dropdown tooltip="Filter Bookmarks" value={filter} onChange={setFilter}>
          <List.Dropdown.Item title="All" value="all" />
          <List.Dropdown.Item title="Unread" value="unread" />
          <List.Dropdown.Item title="Read" value="read" />
          <List.Dropdown.Section>
            <List.Dropdown.Item title="Last 24 Hours" value="last1d" />
            <List.Dropdown.Item title="Last 7 Days" value="last7d" />
            <List.Dropdown.Item title="Last Month" value="last30d" />
          </List.Dropdown.Section>
          {tagsByPopularity.length > 0 && (
            <List.Dropdown.Section title="Tags">
              {tagsByPopularity.map(([tag, count]) => (
                <List.Dropdown.Item title={`${tag} (${count})`} value={`tag:${tag}`} key={tag} />
              ))}
            </List.Dropdown.Section>
          )}
        </List.Dropdown>
      }
      isLoading={loading}
      navigationTitle="Search Bookmarks"
      isShowingDetail={showDetail}
      searchText={search}
      onSearchTextChange={(text) => setSearch(text)}
      throttle
    >
      {files.map((file) => (
        <FileListItem
          file={file}
          loading={loading}
          showDetail={showDetail}
          onShowDetailChange={setShowDetail}
          key={file.fullPath}
          obsidianFileIcon={obsidianIcon}
        />
      ))}
    </List>
  );
}
