import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, ExternalLink, X, Loader2 } from 'lucide-react';
import { useExternalReferenceSearch, ExternalReferenceResult } from '@/hooks/useExternalReferenceSearch';
import { cn } from '@/lib/utils';

interface ExternalReferenceSearchProps {
  value?: { source: string; name: string; url: string };
  onChange: (value: { source: string; name: string; url: string } | undefined) => void;
}

export const ExternalReferenceSearch = ({ value, onChange }: ExternalReferenceSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { results, isLoading } = useExternalReferenceSearch(searchQuery);

  const handleSelect = (result: ExternalReferenceResult) => {
    onChange(result);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleRemove = () => {
    onChange(undefined);
    setSearchQuery('');
  };

  // If a value is selected, show the selected card
  if (value) {
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {value.source}
              </Badge>
            </div>
            <a
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline inline-flex items-center gap-1 text-primary break-words"
            >
              {value.name}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="shrink-0"
          >
            Remove
          </Button>
        </div>
      </Card>
    );
  }

  // Otherwise, show the search input
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => {
            // Delay to allow clicking on results
            setTimeout(() => setShowResults(false), 200);
          }}
          placeholder="Search for external project..."
          className="pl-9 pr-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>
      
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-xs text-muted-foreground mt-1 ml-1">
          Type at least 2 characters to search
        </p>
      )}

      {/* Results dropdown */}
      {showResults && searchQuery.length >= 2 && !isLoading && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-md">
          <div className="max-h-[300px] overflow-y-auto p-1">
            {results.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full text-left px-3 py-2.5 rounded-sm hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm mb-0.5">{result.name}</div>
                <div className="text-xs text-muted-foreground">{result.source}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && searchQuery.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-md p-4">
          <p className="text-sm text-muted-foreground text-center">No results found</p>
        </div>
      )}
    </div>
  );
};
