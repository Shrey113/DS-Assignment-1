import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, X, ChevronDown } from 'lucide-react';
import GUJARAT_CITIES from '../constants/gujaratCities';
import citySearchHash from '../utils/citySearchHash';

const POPULAR_CITIES = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
  'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Bharuch'
];

export default function CityAutocompleteInput({
  value = '',
  onChange,
  onBlur,
  error,
  placeholder = 'Type or select city (e.g. Ahmedabad, Surat)...'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Sync internal input query when parent value changes externally
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        // If query doesn't match an exact city, keep value intact or trigger onBlur
        if (onBlur) onBlur();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  // Fast O(1) Hash Table search results
  const suggestions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return POPULAR_CITIES;
    }
    const matches = citySearchHash.search(trimmed, 12);
    // If no prefix match in hash, fallback to all cities substring filter
    if (matches.length > 0) return matches;
    return GUJARAT_CITIES.filter((c) =>
      c.toLowerCase().includes(trimmed.toLowerCase())
    ).slice(0, 12);
  }, [query]);

  const handleSelectCity = (cityName) => {
    setQuery(cityName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onChange) onChange(cityName);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(0);
    // If user cleared the input, notify parent
    if (!val) {
      if (onChange) onChange('');
    } else {
      // If exact city match typed
      const exact = GUJARAT_CITIES.find(
        (c) => c.toLowerCase() === val.toLowerCase().trim()
      );
      if (exact && onChange) {
        onChange(exact);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelectCity(suggestions[highlightedIndex]);
      } else if (suggestions.length > 0) {
        handleSelectCity(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery('');
    setIsOpen(false);
    if (onChange) onChange('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div
      ref={wrapperRef}
      className="city-autocomplete-wrapper"
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={`donor-field-input ${error ? 'has-error' : ''}`}
          style={{ paddingRight: query ? '56px' : '36px' }}
        />

        <div
          style={{
            position: 'absolute',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#9CA3AF'
          }}
        >
          {query && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#9CA3AF'
              }}
              title="Clear city"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (!isOpen && inputRef.current) inputRef.current.focus();
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#9CA3AF'
            }}
            title="Toggle city list"
          >
            <ChevronDown
              size={16}
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>
        </div>
      </div>

      {/* Google-Style Suggestions Dropdown */}
      {isOpen && (
        <div className="city-autocomplete-dropdown">
          {suggestions.length === 0 ? (
            <div className="city-autocomplete-empty">
              No Gujarat cities matching "{query}"
            </div>
          ) : (
            suggestions.map((cityName, idx) => {
              const isSelected = cityName.toLowerCase() === (value || '').toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={cityName}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectCity(cityName);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`city-autocomplete-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin
                      size={14}
                      color={isSelected ? '#EF4E4E' : '#9CA3AF'}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: isSelected ? '600' : '500',
                        color: isSelected ? '#EF4E4E' : '#1F2937'
                      }}
                    >
                      {cityName}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      color: isSelected ? '#EF4E4E' : '#9CA3AF'
                    }}
                  >
                    Gujarat Depot
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

