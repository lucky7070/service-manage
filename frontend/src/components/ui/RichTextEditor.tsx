"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Swal from "sweetalert2/dist/sweetalert2.js";

import { getSweetAlertConfig } from "@/helpers/utils";
import { Bold, Code2, Heading2, Heading3, Italic, Link as LinkIcon, ListOrdered, List, Redo2, Undo2, Underline as UnderlineIcon } from "lucide-react";

type Props = {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
};

export default function RichTextEditor({ value, onChange, placeholder = "Write something...", disabled = false }: Props) {
    const [showHtmlSource, setShowHtmlSource] = useState(false);
    const [htmlSource, setHtmlSource] = useState(value || "");
    
    const lastEmittedHtml = useRef<string | null>(null);

    const editor = useEditor({
        editable: !disabled,
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ link: { openOnClick: false, autolink: true, linkOnPaste: true }, underline: {} }),
            Placeholder.configure({ placeholder })
        ],
        content: value || "",
        editorProps: {
            attributes: {
                class: "min-h-[160px] rounded-md border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100"
            }
        },
        onUpdate: ({ editor }) => {
            if (disabled) return;
            const html = editor.getHTML();
            lastEmittedHtml.current = html;
            onChange(html);
        }
    });

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(!disabled);
    }, [editor, disabled]);

    useEffect(() => {
        if (!editor || showHtmlSource) return;

        const next = value ?? "";
        // Same string we just pushed up — parent re-render; do not reset document (breaks typing).
        if (lastEmittedHtml.current === next) return;

        const current = editor.getHTML();
        if (next === current) {
            lastEmittedHtml.current = next;
            return;
        }

        editor.commands.setContent(next, { emitUpdate: false });
        lastEmittedHtml.current = next;
    }, [editor, value, showHtmlSource]);

    const setLink = async () => {
        if (!editor) return;
        const current = editor.getAttributes("link")?.href as string | undefined;
        const result = await Swal.fire(getSweetAlertConfig({
            title: "Insert Link",
            text: "Enter a full URL (https://...).",
            confirmButtonText: "Save",
            input: "text" as const,
            inputLabel: "URL",
            inputValue: current || "",
            showDenyButton: false,
            preConfirm: () => (Swal.getInput()?.value as string | undefined)?.trim() || ""
        }));

        if (!result.isConfirmed) return;
        const href = (result.value as string | undefined)?.trim() || "";

        if (!href) {
            editor.chain().focus().unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    };

    if (!editor) return null;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Bold"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Italic"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Bulleted list"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Numbered list"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={setLink}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Insert link"
                >
                    <LinkIcon className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => editor.chain().focus().undo().run()}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Undo"
                >
                    <Undo2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => editor.chain().focus().redo().run()}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label="Redo"
                >
                    <Redo2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        if (showHtmlSource) {
                            const next = htmlSource || "";
                            editor.commands.setContent(next, { emitUpdate: false });
                            lastEmittedHtml.current = next;
                            onChange(next);
                            setShowHtmlSource(false);
                            return;
                        }

                        setHtmlSource(editor.getHTML());
                        setShowHtmlSource(true);
                    }}
                    className="rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-slate-700 shadow-xs hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100 dark:hover:bg-white/10"
                    aria-label={showHtmlSource ? "Back to visual editor" : "Show HTML source"}
                    title={showHtmlSource ? "Back to visual editor" : "Show HTML source"}
                >
                    <Code2 className="h-4 w-4" />
                </button>
            </div>

            {showHtmlSource ? (
                <textarea
                    value={htmlSource}
                    onChange={(e) => {
                        const v = e.target.value;
                        setHtmlSource(v);
                        lastEmittedHtml.current = v;
                        onChange(v);
                    }}
                    disabled={disabled}
                    className="min-h-[220px] w-full rounded-md border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-100"
                    placeholder="<p>Your HTML...</p>"
                />
            ) : (
                <EditorContent editor={editor} />
            )}
        </div>
    );
}

