import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './Lookup.module.css';
import api from '../api/client';

const Lookup = ({
  apiEndpoint,
  searchParam = 'search',
  displayField,
  placeholder = 'Search...',
  value,
  onChange,
  disabled = false,
  additionalFilters = {},
  excludeIds = [],
  onError
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [error, setError] = useState(null);
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Memoize additionalFilters to prevent infinite loops
  const stableFilters = useMemo(() => additionalFilters, [JSON.stringify(additionalFilters)]);

  // Format display text based on displayField prop
  const getDisplayText = (item) => {
    if (!item) return '';
    if (typeof displayField === 'function') {
      return displayField(item);
    }
    return item[displayField] || '';
  };

  // Fetch initial results when filters are present (e.g., account_id)
  useEffect(() => {
    const hasFilters = Object.keys(stableFilters).length > 0;
    if (hasFilters && !searchTerm && !results.length) {
      // Fetch filtered results without search term
      const fetchInitialResults = async () => {
        setIsLoading(true);
        try {
          const params = new URLSearchParams();
          Object.entries(stableFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              params.append(key, value);
            }
          });
          const response = await api.get(`${apiEndpoint}?${params.toString()}`);
          const filteredResults = (response.data || []).filter(
            item => !excludeIds.includes(item.id)
          );
          setResults(filteredResults);
        } catch (err) {
          console.error('Lookup initial fetch error:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialResults();
    }
  }, [stableFilters, apiEndpoint, excludeIds.join(',')]);

  // Handle search with debouncing
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Don't clear results if we have filters (keep showing filtered list)
      const hasFilters = Object.keys(stableFilters).length > 0;
      if (!hasFilters) {
        setResults([]);
        setIsOpen(false);
      }
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        params.append(searchParam, searchTerm);
        
        // Add additional filters to the query
        Object.entries(stableFilters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
          }
        });
        
        const response = await api.get(`${apiEndpoint}?${params.toString()}`);
        const filteredResults = (response.data || []).filter(
          item => !excludeIds.includes(item.id)
        );
        setResults(filteredResults);
        setIsOpen(true);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error('Lookup search error:', err);
        setError(err.message || 'Failed to fetch results');
        setResults([]);
        if (onError) {
          onError(err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, apiEndpoint, searchParam, stableFilters, onError]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = async () => {
    // Show dropdown with results when focusing
    if (results.length > 0) {
      setIsOpen(true);
      return;
    }
    
    // If we have filters (like _load_all), fetch results on focus
    const hasFilters = Object.keys(stableFilters).length > 0;
    if (hasFilters && !searchTerm) {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(stableFilters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
          }
        });
        const response = await api.get(`${apiEndpoint}?${params.toString()}`);
        const filteredResults = (response.data || []).filter(
          item => !excludeIds.includes(item.id)
        );
        setResults(filteredResults);
        setIsOpen(true);
      } catch (err) {
        console.error('Lookup focus fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelect = (item) => {
    onChange(item);
    setSearchTerm('');
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.lookupWrapper} ref={wrapperRef}>
      {value ? (
        <div className={styles.selectedChip}>
          <span className={styles.chipText}>{getDisplayText(value)}</span>
          {!disabled && (
            <button
              type="button"
              className={styles.chipRemove}
              onClick={handleClear}
              aria-label="Clear selection"
            >
              ×
            </button>
          )}
        </div>
      ) : (
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete="off"
          />
          {isLoading && <span className={styles.loadingSpinner}>⏳</span>}
        </div>
      )}

      {isOpen && !value && (
        <div className={styles.dropdown}>
          {error && (
            <div className={styles.dropdownMessage}>
              Error: {error}
            </div>
          )}
          {!error && results.length === 0 && !isLoading && (
            <div className={styles.dropdownMessage}>
              {searchTerm ? 'No results found' : Object.keys(stableFilters).length > 0 ? 'No items found' : 'Start typing to search...'}
            </div>
          )}
          {!error && results.length > 0 && (
            <ul className={styles.resultsList}>
              {results.map((item, index) => (
                <li
                  key={item.id}
                  className={`${styles.resultItem} ${
                    index === highlightedIndex ? styles.highlighted : ''
                  }`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {getDisplayText(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Lookup;
