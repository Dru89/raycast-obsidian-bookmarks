import { Action, ActionPanel, Form, popToRoot, showHUD, showToast, Toast } from "@raycast/api";
import { useEffect, useRef } from "react";
import openObsidianFile from "../helpers/open-obsidian-file";
import saveToObsidian from "../helpers/save-to-obsidian";
import useLinkForm from "../hooks/use-link-form";
import useTags from "../hooks/use-tags";

export default function LinkForm() {
  const { values, onChange, loading: linkLoading } = useLinkForm();
  const { tags, loading: tagsLoading } = useTags();
  const toastRef = useRef<Toast>();
  const loadingRef = useRef(linkLoading);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingRef.current) {
        showToast({
          title: "Fetching link details",
          style: Toast.Style.Animated,
        }).then((toast) => {
          toastRef.current = toast;
        });
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    loadingRef.current = linkLoading;
    if (!linkLoading) {
      toastRef.current?.hide();
    }
  }, [linkLoading]);

  const handleSubmit = async (openObsidian: boolean) => {
    const toastPromise = showToast({
      style: Toast.Style.Animated,
      title: "Saving Bookmark",
    });
    const savePromise = saveToObsidian(values);
    const [toast, saved] = await Promise.allSettled([toastPromise, savePromise]);
    if (toast.status === "rejected") {
      throw new Error("Unexpected: Toast failed to display.");
    }

    if (saved.status === "rejected") {
      toast.value.style = Toast.Style.Failure;
      toast.value.message = String(saved.reason);
    } else {
      toast.value.hide();
      if (openObsidian) {
        openObsidianFile(saved.value);
      }
      await showHUD("Bookmark saved");
      popToRoot();
    }
  };

  return (
    <Form
      navigationTitle="Save Bookmark"
      isLoading={tagsLoading || linkLoading}
      actions={
        <ActionPanel>
          <Action title="Save Bookmark" onAction={() => handleSubmit(false)} />
          <Action title="Save & Open Obsidian" onAction={() => handleSubmit(true)} />
        </ActionPanel>
      }
    >
      <Form.TextField id="url" title="URL" value={values.url} onChange={onChange("url")} />
      <Form.TextField id="title" title="Title" value={values.title} onChange={onChange("title")} />
      <Form.TagPicker id="tags" title="Tags" value={values.tags} onChange={onChange("tags")}>
        {tags.map((tag) => (
          <Form.TagPicker.Item title={tag} value={tag} key={tag} />
        ))}
      </Form.TagPicker>
      <Form.TextArea id="notes" title="Notes" value={values.description} onChange={onChange("description")} />
    </Form>
  );
}
