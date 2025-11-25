import React from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email';
  helperText?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  helperText,
}: TextInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
      />
      {helperText && (
        <p className="text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
