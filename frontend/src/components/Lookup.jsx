import { useState, useEffect, useRef } from 'react';
import styles from './Lookup.module.css';
import { apiClient } from '../api/client';

const Lookup = ({
  apiEndpoint,
  searchParam = 'search',
  displayField,
  placeholder = 'Search...',
  value,
  onChange,
  disabled = false,
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

  // Format display text based on displayField prop
  const getDisplayText = (item) => {
    if (!item) return '';
    if (typeof displayField === 'function') {
      return displayField(item);
    }
    return item[displayField] || '';
  };

  // Handle search with debouncing
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsOpen(false);
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
        
        const response = await apiClient.get(`${apiEndpoint}?${params.toString()}`);
        setResults(response.data || []);
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
  }, [searchTerm, apiEndpoint, searchParam, onError]);

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
              {searchTerm ? 'No results found' : 'Start typing to search...'}
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
