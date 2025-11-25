import React from 'react';

interface DropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  helperText?: string;
}

export function Dropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  helperText,
}: DropdownProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p className="text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
