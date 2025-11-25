import React from 'react';
import { Check } from 'lucide-react';

interface TagSelectorProps {
  label: string;
  tags: string[];
  selectedTags: string[];
  onChange: (selectedTags: string[]) => void;
  helperText?: string;
}

export function TagSelector({
  label,
  tags,
  selectedTags,
  onChange,
  helperText,
}: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-gray-700">{label}</label>
      {helperText && <p className="text-gray-500">{helperText}</p>}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full border-2 transition-all inline-flex items-center gap-2 ${
                isSelected
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-amber-400'
              }`}
            >
              {isSelected && <Check className="w-4 h-4" />}
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
