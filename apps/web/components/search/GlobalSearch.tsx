'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, FileText, Users, Target, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface SearchResult {
  id: string;
  type: 'pov' | 'trr' | 'user' | 'project';
  title: string;
  description?: string;
  metadata?: any;
  score: number;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        // Call search API
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            types: ['pov', 'trr', 'user', 'project'],
            limit: 10
          })
        });

        if (response.ok) {
          const searchResults = await response.json();
          setResults(searchResults.results || []);
          setShowResults(true);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setQuery('');
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = async (result: SearchResult) => {
    // Track interaction
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          action: 'search_click',
          entityType: result.type,
          entityId: result.id,
          metadata: { query, score: result.score }
        })
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }

    // Navigate to result
    const routes: Record<string, string> = {
      pov: `/pov/${result.id}`,
      trr: `/trr/${result.id}`,
      user: `/users/${result.id}`,
      project: `/projects/${result.id}`
    };

    if (routes[result.type]) {
      router.push(routes[result.type]);
      setShowResults(false);
      setQuery('');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pov':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'trr':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'user':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'project':
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pov':
        return 'POV';
      case 'trr':
        return 'TRR';
      case 'user':
        return 'User';
      case 'project':
        return 'Project';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          placeholder="Search POVs, TRRs, users..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
        />
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          <div className="py-2">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                  index === selectedIndex ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                    {result.metadata && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        {result.metadata.status && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.metadata.status}
                          </span>
                        )}
                        {result.metadata.createdAt && (
                          <span>
                            {new Date(result.metadata.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && query.trim().length >= 2 && results.length === 0 && !isSearching && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500 text-center">
            No results found for &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
