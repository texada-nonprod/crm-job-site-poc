import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ROLE_OPTIONS = [
  { id: 'GC', label: 'General Contractor' },
  { id: 'SUB-EXC', label: 'Subcontractor - Excavation' },
  { id: 'SUB-PAV', label: 'Subcontractor - Paving' },
  { id: 'SUB-ELEC', label: 'Subcontractor - Electrical' },
  { id: 'SUB-MECH', label: 'Subcontractor - Mechanical' },
  { id: 'SUB-SPEC', label: 'Subcontractor - Specialized' },
  { id: 'SUB-STEEL', label: 'Subcontractor - Steel' },
];

/** Get a role label by ID, falling back to the ID itself. */
export const getRoleLabel = (roleId: string): string =>
  ROLE_OPTIONS.find(r => r.id === roleId)?.label || roleId;

interface RoleMultiSelectProps {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

export const RoleMultiSelect = ({
  selectedRoles,
  onRolesChange,
  placeholder = 'Select role(s)...',
  required = false,
}: RoleMultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const toggleRole = useCallback((roleId: string) => {
    onRolesChange(
      selectedRoles.includes(roleId)
        ? selectedRoles.filter(r => r !== roleId)
        : [...selectedRoles, roleId]
    );
  }, [selectedRoles, onRolesChange]);

  const removeRole = useCallback((roleId: string) => {
    onRolesChange(selectedRoles.filter(r => r !== roleId));
  }, [selectedRoles, onRolesChange]);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal h-10">
            <span className={cn(selectedRoles.length === 0 && 'text-muted-foreground')}>
              {selectedRoles.length === 0
                ? placeholder
                : `${selectedRoles.length} role${selectedRoles.length > 1 ? 's' : ''} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50" align="start">
          <Command>
            <CommandInput placeholder="Search roles..." />
            <CommandList>
              <CommandEmpty>No role found.</CommandEmpty>
              <CommandGroup>
                {ROLE_OPTIONS.map((role) => (
                  <CommandItem key={role.id} value={role.label} onSelect={() => toggleRole(role.id)}>
                    <Check className={cn("mr-2 h-4 w-4", selectedRoles.includes(role.id) ? "opacity-100" : "opacity-0")} />
                    {role.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedRoles.map(roleId => (
            <Badge key={roleId} variant={roleId === 'GC' ? 'default' : 'secondary'} className="text-xs gap-1">
              {getRoleLabel(roleId)}
              <button type="button" onClick={() => removeRole(roleId)} className="ml-0.5 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
