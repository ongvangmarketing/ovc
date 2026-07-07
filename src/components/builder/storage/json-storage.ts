import type { Editor } from "grapesjs";

export function setupJsonStorage(editor: Editor, pageId: string) {
  editor.Storage.add("json-storage", {
    async load() {
      // Data loading is now handled manually in EditorClient.tsx via loadProjectData
      return {};
    },

    async store(data: any) {
      // data.components is a JSON object representing the page structure
      try {
        const response = await fetch(`/api/builder/page/${pageId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: editor.getProjectData(), // Use clean project data instead of prefixed string flat object
            html: editor.getHtml(),
            css: editor.getCss(),
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save page data");
        }
        console.log("Page saved successfully!");
      } catch (err) {
        console.error("Failed to store page data:", err);
      }
    },
  });
}
