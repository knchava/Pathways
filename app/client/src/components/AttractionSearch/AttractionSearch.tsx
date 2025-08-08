import React, { useState, useMemo } from 'react';

export interface AttractionSearchProps {
  suggestions: string[];
  onSelect: (name: string) => void;
  placeholder?: string;
}

export default function AttractionSearch({
  suggestions,
  onSelect,
  placeholder = 'Search or type an attraction',
}: AttractionSearchProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => suggestions.filter(a =>
      a.toLowerCase().includes(query.toLowerCase())
    ),
    [query, suggestions]
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        className="w-full p-2 border rounded"
        value={query}
        placeholder={placeholder}
        onChange={e => setQuery(e.target.value)}
      />

      {filtered.length > 0 && (
        <ul className="border rounded max-h-40 overflow-auto bg-white">
          {filtered.map(name => (
            <li
              key={name}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect(name)}
            >
              {name}
            </li>
          ))}
        </ul>
      )}

      {query.trim() !== '' && !suggestions.includes(query) && (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => onSelect(query)}
        >
          Use "{query}"
        </button>
      )}
    </div>
  );
}
