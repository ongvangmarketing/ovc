"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Heading1, Heading2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const toggleBtnClass = "p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors";
  const activeClass = "bg-indigo-50 text-indigo-600 hover:bg-indigo-100";

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(toggleBtnClass, editor.isActive("bold") && activeClass)}
        title="In đậm (Cmd+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(toggleBtnClass, editor.isActive("italic") && activeClass)}
        title="In nghiêng (Cmd+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(toggleBtnClass, editor.isActive("strike") && activeClass)}
        title="Gạch ngang (Cmd+Shift+X)"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(toggleBtnClass, editor.isActive("heading", { level: 1 }) && activeClass)}
        title="Tiêu đề 1 (Cmd+Alt+1)"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(toggleBtnClass, editor.isActive("heading", { level: 2 }) && activeClass)}
        title="Tiêu đề 2 (Cmd+Alt+2)"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(toggleBtnClass, editor.isActive("bulletList") && activeClass)}
        title="Danh sách gạch đầu dòng"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(toggleBtnClass, editor.isActive("orderedList") && activeClass)}
        title="Danh sách đánh số"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(toggleBtnClass, editor.isActive("blockquote") && activeClass)}
        title="Trích dẫn"
      >
        <Quote className="w-4 h-4" />
      </button>
    </div>
  );
};

export function TiptapEditor({ 
  value, 
  onChange,
  placeholder = "Nhập nội dung ở đây...",
  name,
  defaultValue,
}: { 
  value?: string; 
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  defaultValue?: string;
}) {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value ?? defaultValue ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[150px] p-4 text-slate-700",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setInternalValue(html);
      onChange?.(html);
    },
  });

  // Update content when value changes from outside (e.g. form reset or loading existing data)
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col border border-slate-200 rounded-xl bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-sm">
      {name && <input type="hidden" name={name} value={value ?? internalValue} />}
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="cursor-text" onClick={() => editor?.commands.focus()} />
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap ul,
        .tiptap ol {
          margin: 0.5rem 0 0.5rem 1.25rem;
          padding-left: 1rem;
        }
        .tiptap ul {
          list-style-type: disc;
        }
        .tiptap ol {
          list-style-type: decimal;
        }
        .tiptap li {
          margin: 0.25rem 0;
          padding-left: 0.125rem;
        }
        .tiptap li p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
