import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectFilterProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onSelectionChange: (values: string[]) => void;
  className?: string;
}

export const MultiSelectFilter = ({ label, options, selected, onSelectionChange, className }: MultiSelectFilterProps) => {
  const [open, setOpen] = useState(false);
  const allSelected = selected.length === 0;

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter(v => v !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  const clearAll = () => onSelectionChange([]);

  const displayText = allSelected
    ? `All ${label}`
    : selected.length === 1
      ? options.find(o => o.value === selected[0])?.label || selected[0]
      : `${selected.length} ${label}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between h-10 text-sm font-normal", className)}
        >
          <span className="truncate">{displayText}</span>
          {!allSelected && (
            <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs rounded-sm">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-2" align="start">
        {!allSelected && (
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs mb-1" onClick={clearAll}>
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
        <div className="max-h-[240px] overflow-y-auto space-y-0.5">
          {options.map(option => (
            <label
              key={option.value}
              className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              <Checkbox
                checked={selected.includes(option.value)}
                onCheckedChange={() => toggleValue(option.value)}
              />
              <span className="truncate">{option.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
