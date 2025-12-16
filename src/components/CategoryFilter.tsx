"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface CategoryFilterProps {
    tags: string[];
    activeTags: string[];
    onToggleTag: (tag: string) => void;
}

export default function CategoryFilter({ tags, activeTags, onToggleTag }: CategoryFilterProps) {
    const isAllSelected = activeTags.length === 0;

    const handleAllClick = () => {
        // Clear all selections (empty array = show all)
        if (!isAllSelected) {
            // Reset to empty array which means "All"
            activeTags.forEach(tag => onToggleTag(tag));
        }
    };

    return (
        <div className="px-4 sm:px-0">
            {/* Multi-row flex wrap layout */}
            <div className="flex flex-wrap gap-1.5 md:gap-2">
                <button
                    onClick={handleAllClick}
                    className={cn(
                        "px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition-all active:scale-95",
                        isAllSelected
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                >
                    全部
                </button>

                {tags.filter(t => t !== 'All').map((tag) => {
                    const isActive = activeTags.includes(tag);
                    return (
                        <button
                            key={tag}
                            onClick={() => onToggleTag(tag)}
                            className={cn(
                                "px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition-all active:scale-95",
                                isActive
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            {tag}
                        </button>
                    );
                })}

                {/* Custom tag button */}
                <button
                    className="px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium bg-white text-gray-500 border border-dashed border-gray-300 hover:border-gray-400 transition-all active:scale-95 flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" />
                    自訂
                </button>
            </div>
        </div>
    );
}
