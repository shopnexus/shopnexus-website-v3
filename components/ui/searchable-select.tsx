"use client"

import { useState, useMemo, useCallback } from "react"
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchableSelectOption {
	id: string
	label: string
	description?: string
}

interface SearchableSelectProps<T extends SearchableSelectOption> {
	/** Current selected value (single select) */
	value?: string | null
	/** Current selected values (multi select) */
	values?: string[]
	/** Callback when value changes (single select) */
	onChange?: (value: string | null) => void
	/** Callback when values change (multi select) */
	onValuesChange?: (values: string[]) => void
	/** Options to display */
	options: T[]
	/** Whether the options are loading */
	isLoading?: boolean
	/** Search query state */
	searchQuery: string
	/** Callback when search query changes */
	onSearchChange: (query: string) => void
	/** Placeholder text */
	placeholder?: string
	/** Empty state message */
	emptyMessage?: string
	/** Whether to allow multiple selections */
	multiple?: boolean
	/** Whether the select is disabled */
	disabled?: boolean
	/** Optional className for the trigger button */
	className?: string
	/** Maximum items to show in multi-select badge display */
	maxDisplayItems?: number
}

export function SearchableSelect<T extends SearchableSelectOption>({
	value,
	values = [],
	onChange,
	onValuesChange,
	options,
	isLoading = false,
	searchQuery,
	onSearchChange,
	placeholder = "Select...",
	emptyMessage = "No results found.",
	multiple = false,
	disabled = false,
	className,
	maxDisplayItems = 3,
}: SearchableSelectProps<T>) {
	const [open, setOpen] = useState(false)

	// Find selected option(s) for display
	const selectedOption = useMemo(() => {
		if (!value) return null
		return options.find((opt) => opt.id === value) || null
	}, [value, options])

	const selectedOptions = useMemo(() => {
		return options.filter((opt) => values.includes(opt.id))
	}, [values, options])

	const handleSelect = useCallback(
		(optionId: string) => {
			if (multiple) {
				const newValues = values.includes(optionId)
					? values.filter((v) => v !== optionId)
					: [...values, optionId]
				onValuesChange?.(newValues)
			} else {
				onChange?.(optionId === value ? null : optionId)
				setOpen(false)
			}
		},
		[multiple, values, value, onChange, onValuesChange]
	)

	const handleRemove = useCallback(
		(optionId: string, e: React.MouseEvent) => {
			e.stopPropagation()
			if (multiple) {
				onValuesChange?.(values.filter((v) => v !== optionId))
			} else {
				onChange?.(null)
			}
		},
		[multiple, values, onChange, onValuesChange]
	)

	const handleClear = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			if (multiple) {
				onValuesChange?.([])
			} else {
				onChange?.(null)
			}
		},
		[multiple, onChange, onValuesChange]
	)

	// Display text for the trigger button
	const displayContent = useMemo(() => {
		if (multiple) {
			if (selectedOptions.length === 0) {
				return <span className="text-muted-foreground">{placeholder}</span>
			}
			return (
				<div className="flex flex-wrap gap-1">
					{selectedOptions.slice(0, maxDisplayItems).map((opt) => (
						<Badge
							key={opt.id}
							variant="secondary"
							className="text-xs px-1.5 py-0 h-5"
						>
							{opt.label}
							<button
								type="button"
								className="ml-1 hover:text-destructive"
								onClick={(e) => handleRemove(opt.id, e)}
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
					{selectedOptions.length > maxDisplayItems && (
						<Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
							+{selectedOptions.length - maxDisplayItems} more
						</Badge>
					)}
				</div>
			)
		}

		if (selectedOption) {
			return <span>{selectedOption.label}</span>
		}

		return <span className="text-muted-foreground">{placeholder}</span>
	}, [
		multiple,
		selectedOption,
		selectedOptions,
		placeholder,
		maxDisplayItems,
		handleRemove,
	])

	const hasValue = multiple ? values.length > 0 : !!value

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"w-full justify-between font-normal",
						!hasValue && "text-muted-foreground",
						className
					)}
				>
					<div className="flex-1 text-left truncate">{displayContent}</div>
					<div className="flex items-center gap-1 ml-2 shrink-0">
						{hasValue && (
							<button
								type="button"
								className="h-4 w-4 rounded-sm hover:bg-muted flex items-center justify-center"
								onClick={handleClear}
							>
								<X className="h-3 w-3" />
							</button>
						)}
						<ChevronsUpDown className="h-4 w-4 opacity-50" />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
				<Command shouldFilter={false}>
					<div className="flex items-center border-b px-3">
						<Search className="h-4 w-4 shrink-0 opacity-50" />
						<CommandInput
							placeholder={`Search ${placeholder.toLowerCase()}...`}
							value={searchQuery}
							onValueChange={onSearchChange}
							className="border-0 focus:ring-0"
						/>
						{isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
					</div>
					<CommandList>
						<CommandEmpty>
							{isLoading ? "Loading..." : emptyMessage}
						</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = multiple
									? values.includes(option.id)
									: value === option.id

								return (
									<CommandItem
										key={option.id}
										value={option.id}
										onSelect={() => handleSelect(option.id)}
										className="cursor-pointer"
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible"
											)}
										>
											<Check className="h-3 w-3" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="truncate">{option.label}</div>
											{option.description && (
												<div className="text-xs text-muted-foreground truncate">
													{option.description}
												</div>
											)}
										</div>
									</CommandItem>
								)
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
