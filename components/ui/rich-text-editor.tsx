"use client"

import {
	forwardRef,
	useEffect,
	useLayoutEffect,
	useRef,
	useImperativeHandle,
} from "react"
import Quill from "quill"
import type { Delta, Range } from "quill"
import "quill/dist/quill.snow.css"
import { cn } from "@/lib/utils"

export interface RichTextEditorProps {
	defaultValue?: Delta | string
	value?: string
	onChange?: (html: string, delta: Delta, source: string) => void
	onSelectionChange?: (range: Range | null) => void
	readOnly?: boolean
	placeholder?: string
	className?: string
	toolbarOptions?: "minimal" | "standard" | "full"
}

export interface RichTextEditorRef {
	getEditor: () => Quill | null
	getHTML: () => string
	getText: () => string
	getContents: () => Delta | undefined
	setContents: (delta: Delta) => void
	setHTML: (html: string) => void
}

const TOOLBAR_CONFIGS = {
	minimal: [
		["bold", "italic", "underline"],
		[{ list: "ordered" }, { list: "bullet" }],
		["link"],
		["clean"],
	],
	standard: [
		[{ header: [1, 2, 3, false] }],
		["bold", "italic", "underline", "strike"],
		[{ color: [] }, { background: [] }],
		[{ list: "ordered" }, { list: "bullet" }],
		[{ align: [] }],
		["link", "image"],
		["clean"],
	],
	full: [
		[{ font: [] }, { size: [] }],
		[{ header: [1, 2, 3, 4, 5, 6, false] }],
		["bold", "italic", "underline", "strike"],
		[{ color: [] }, { background: [] }],
		[{ script: "sub" }, { script: "super" }],
		[{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
		[{ direction: "rtl" }, { align: [] }],
		["link", "image", "video", "blockquote", "code-block"],
		["clean"],
	],
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
	(
		{
			defaultValue,
			value,
			onChange,
			onSelectionChange,
			readOnly = false,
			placeholder = "Write something...",
			className,
			toolbarOptions = "standard",
		},
		ref
	) => {
		const containerRef = useRef<HTMLDivElement>(null)
		const quillRef = useRef<Quill | null>(null)
		const onChangeRef = useRef(onChange)
		const onSelectionChangeRef = useRef(onSelectionChange)
		const isInitializedRef = useRef(false)

		// Keep callbacks up to date
		useLayoutEffect(() => {
			onChangeRef.current = onChange
			onSelectionChangeRef.current = onSelectionChange
		})

		// Expose methods via ref
		useImperativeHandle(ref, () => ({
			getEditor: () => quillRef.current,
			getHTML: () => quillRef.current?.root.innerHTML ?? "",
			getText: () => quillRef.current?.getText() ?? "",
			getContents: () => quillRef.current?.getContents(),
			setContents: (delta: Delta) => {
				quillRef.current?.setContents(delta)
			},
			setHTML: (html: string) => {
				if (quillRef.current) {
					quillRef.current.root.innerHTML = html
				}
			},
		}))

		// Handle readOnly changes
		useEffect(() => {
			quillRef.current?.enable(!readOnly)
		}, [readOnly])

		// Initialize Quill
		useEffect(() => {
			if (!containerRef.current || isInitializedRef.current) return

			const container = containerRef.current
			const editorContainer = container.appendChild(
				container.ownerDocument.createElement("div")
			)

			const quill = new Quill(editorContainer, {
				theme: "snow",
				placeholder,
				readOnly,
				modules: {
					toolbar: TOOLBAR_CONFIGS[toolbarOptions],
				},
			})

			quillRef.current = quill
			isInitializedRef.current = true

			// Set initial content
			if (defaultValue) {
				if (typeof defaultValue === "string") {
					quill.root.innerHTML = defaultValue
				} else {
					quill.setContents(defaultValue)
				}
			} else if (value) {
				quill.root.innerHTML = value
			}

			// Listen for text changes
			quill.on("text-change", (delta, oldDelta, source) => {
				const html = quill.root.innerHTML
				onChangeRef.current?.(html, delta as Delta, source)
			})

			// Listen for selection changes
			quill.on("selection-change", (range) => {
				onSelectionChangeRef.current?.(range)
			})

			return () => {
				quillRef.current = null
				isInitializedRef.current = false
				container.innerHTML = ""
			}
		}, []) // eslint-disable-line react-hooks/exhaustive-deps

		return (
			<div
				ref={containerRef}
				className={cn(
					"rich-text-editor rounded-md border border-input bg-background [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-input [&_.ql-toolbar]:bg-muted/50 [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:border-0 [&_.ql-container]:rounded-b-md [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-sm [&_.ql-editor.ql-blank::before]:text-muted-foreground [&_.ql-editor.ql-blank::before]:not-italic",
					className
				)}
			/>
		)
	}
)

RichTextEditor.displayName = "RichTextEditor"

export { RichTextEditor }
