import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { searchLucknowPlaces, LUCKNOW_LOCATIONS } from '../../services/api';

export default function LocationSearch({ label, value, onSelect, placeholder = 'Search location...' }) {
  const [query, setQuery] = useState(value ? value.name : '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Sync display text when value prop changes (e.g. from preset or map click)
  useEffect(() => {
    if (value && value.name) {
      setQuery(value.name);
    }
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    if (!query || query.trim().length === 0) {
      // Show top presets when input is blank
      setResults(LUCKNOW_LOCATIONS.slice(0, 6).map((l) => ({ ...l, type: 'preset' })));
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const places = await searchLucknowPlaces(query);
      setResults(places);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (item) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelect(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults(LUCKNOW_LOCATIONS.slice(0, 6).map((l) => ({ ...l, type: 'preset' })));
  };

  return (
    <div className="location-search-wrapper" ref={containerRef}>
      <label className="search-label">{label}</label>
      <div className="search-input-box">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onFocus={() => {
            setIsOpen(true);
            if (!query) {
              setResults(LUCKNOW_LOCATIONS.slice(0, 6).map((l) => ({ ...l, type: 'preset' })));
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
        />

        {loading ? (
          <Loader2 size={14} className="spin search-status-icon" />
        ) : query ? (
          <button type="button" className="clear-btn" onClick={handleClear}>
            <X size={14} />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="search-dropdown">
          <div className="dropdown-hint">
            <span>{query.length >= 3 ? 'Search Results in Lucknow' : 'Popular Hotspots & Presets'}</span>
          </div>
          {results.map((item) => (
            <div
              key={item.id}
              className="search-item"
              onClick={() => handleSelect(item)}
            >
              <div className="item-icon-box">
                {item.type === 'preset' ? (
                  <MapPin size={14} className="accent-cyan" />
                ) : (
                  <Navigation size={14} className="accent-emerald" />
                )}
              </div>
              <div className="item-info">
                <span className="item-title">{item.name}</span>
                {item.subName && <span className="item-sub">{item.subName}</span>}
              </div>
              {item.type === 'preset' && <span className="preset-tag">Preset</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}