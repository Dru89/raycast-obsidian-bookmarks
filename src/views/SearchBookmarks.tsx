import { FileIcon, getApplications, List } from "@raycast/api";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import formatDate from "../helpers/format-date";
import useFiles from "../hooks/use-files";
import { File } from "../types";
import FileListItem from "./FileListItem";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export default function SearchBookmarks() {
  const { files, loading } = useFiles();
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [obsidianIcon, setObsidianIcon] = useState<FileIcon>();
  const filesRef = useRef<Fuse.FuseResult<File>[]>([]);

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

  const fuse = useMemo(() => {
    return new Fuse<File>(files, {
      fieldNormWeight: 1,
      keys: [
        { name: "title", weight: 5 },
        { name: "tags", weight: 2 },
        { name: "body", weight: 2 },
        { name: "url", weight: 1 },
      ],
    });
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

  useEffect(() => {
    const filtered = (input: Fuse.FuseResult<File>[]) => {
      switch (filter) {
        case "all": {
          return input;
        }
        case "unread": {
          return input.filter(({ item }) => !item.attributes.read);
        }
        case "read": {
          return input.filter(({ item }) => item.attributes.read);
        }
        case "last1d": {
          const date = new Date(Date.now() - ONE_DAY_IN_MS);
          const formatted = formatDate(date);
          return input.filter(({ item }) => item.attributes.added >= formatted);
        }
        case "last7d": {
          const date = new Date(Date.now() - 7 * ONE_DAY_IN_MS);
          const formatted = formatDate(date);
          return input.filter(({ item }) => item.attributes.added >= formatted);
        }
        case "last30d": {
          const date = new Date(Date.now() - 30 * ONE_DAY_IN_MS);
          const formatted = formatDate(date);
          return input.filter(({ item }) => item.attributes.added >= formatted);
        }
        default: {
          if (!filter.startsWith("tag:")) {
            throw new Error(`Unknown filter: ${filter}`);
          }
          const tag = filter.slice(4);
          return input.filter(({ item }) => item.attributes.tags.includes(tag));
        }
      }
    };

    filesRef.current = filtered(fuse.search(search));
  }, [search, filter, fuse]);

  return (
    <List
      enableFiltering={false}
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
      {filesRef.current.map(({ item: file }) => (
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
