import { useState } from 'react';
import { Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';

export const SettingsPanel = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { users, currentUserId, setCurrentUserId, getUserName } = useData();

  const handleManageDropdowns = () => {
    setOpen(false);
    navigate('/settings/dropdowns');
  };

  const handleDodgeMappings = () => {
    setOpen(false);
    navigate('/settings/dodge-mappings');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="text-sm font-medium text-muted-foreground px-2 py-1.5">
          Settings
        </div>
        <div className="px-2 py-2">
          <label className="text-xs text-muted-foreground mb-1 block">Current User</label>
          <Select value={String(currentUserId)} onValueChange={(v) => setCurrentUserId(Number(v))}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.lastName}, {user.firstName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={handleManageDropdowns}
        >
          Manage dropdowns
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={handleDodgeMappings}
        >
          Dodge project mappings
          <ChevronRight className="h-4 w-4" />
        </Button>
      </PopoverContent>
    </Popover>
  );
};
