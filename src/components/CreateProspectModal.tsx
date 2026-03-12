import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DIVISIONS } from '@/contexts/DataContext';
import { countries, pinnedCountryCodes, getCountryByCode, type Country } from '@/data/Countries';
import { fetchStatesProvinces, hasStatesProvinces, type StateProvince } from '@/data/StatesProvinces';
import { RoleMultiSelect } from '@/components/RoleMultiSelect';

// TODO: Replace with actual API call
const createCompanyApi = async (data: ProspectData): Promise<string> => {
  console.log('[API STUB] Creating company:', data);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const companyId = `PROSPECT-${Date.now()}`;
  console.log('[API STUB] Company created with ID:', companyId);
  return companyId;
};

interface CreateProspectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProspectData) => void;
}

export interface ProspectData {
  companyName: string;
  phone: string;
  divisionIds: string[];
  roleIds: string[];
  address1: string;
  address2: string;
  address3: string;
  city: string;
  stateCode: string;
  zipCode: string;
  countryCode: string;
  contact: {
    firstName: string;
    lastName: string;
    title: string;
    mobilePhone: string;
    businessPhone: string;
    email: string;
  };
}

// ---- Input mask helpers (shared) ----
import { applyPhoneMask, applyZipMask, validateZip, validatePhone, validateEmail } from '@/utils/phoneValidation';


// ---- Searchable Combobox ----
interface SearchableSelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string; pinned?: boolean }[];
  placeholder: string;
  emptyText?: string;
  disabled?: boolean;
}

const SearchableSelect = ({ value, onValueChange, options, placeholder, emptyText = 'No results.', disabled }: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled}
          className="w-full justify-between font-normal h-10">
          <span className={cn(!selectedLabel && 'text-muted-foreground')}>
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option, idx) => (
                <span key={option.value}>
                  {option.pinned && idx > 0 && !options[idx - 1]?.pinned && <Separator className="my-1" />}
                  {!option.pinned && idx > 0 && options[idx - 1]?.pinned && <Separator className="my-1" />}
                  <CommandItem value={option.label} onSelect={() => { onValueChange(option.value); setOpen(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                </span>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ---- Main component ----

export const CreateProspectModal = ({ open, onOpenChange, onSave }: CreateProspectModalProps) => {
  const { toast } = useToast();

  // Company
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [divisionIds, setDivisionIds] = useState<string[]>([]);
  const [divisionOpen, setDivisionOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [rolesOpen, setRolesOpen] = useState(false);

  // Address
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [address3, setAddress3] = useState('');
  const [city, setCity] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Contact
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [email, setEmail] = useState('');

  // States for selected country
  const [statesLoading, setStatesLoading] = useState(false);
  const [availableStates, setAvailableStates] = useState<StateProvince[]>([]);

  // Validation
  const [submitted, setSubmitted] = useState(false);

  const selectedCountry = useMemo(() => getCountryByCode(countryCode), [countryCode]);
  const hasMaskedCountry = ['US', 'CA', 'AU'].includes(countryCode);
  const zipLabel = selectedCountry?.zipLabel || 'ZIP Code';
  const stateLabel = selectedCountry?.stateLabel || 'State';
  const isStateRequired = selectedCountry?.stateRequired ?? false;
  const showStateField = hasStatesProvinces(countryCode);

  // Load states when country changes
  useEffect(() => {
    setStateCode('');
    if (hasStatesProvinces(countryCode)) {
      setStatesLoading(true);
      fetchStatesProvinces(countryCode).then(states => {
        setAvailableStates(states);
        setStatesLoading(false);
      });
    } else {
      setAvailableStates([]);
    }
  }, [countryCode]);

  // Re-apply masks when country changes
  useEffect(() => {
    if (hasMaskedCountry) {
      setPhone(prev => applyPhoneMask(prev, countryCode));
      setMobilePhone(prev => applyPhoneMask(prev, countryCode));
      setBusinessPhone(prev => prev ? applyPhoneMask(prev, countryCode) : '');
      setZipCode(prev => applyZipMask(prev, countryCode));
    }
  }, [countryCode, hasMaskedCountry]);

  const countryOptions = useMemo(() =>
    countries.map(c => ({
      value: c.code,
      label: c.name,
      pinned: pinnedCountryCodes.includes(c.code),
    })), []);

  const stateOptions = useMemo(() =>
    availableStates.map(s => ({ value: s.code, label: s.name })), [availableStates]);

  const handlePhoneChange = (value: string, setter: (v: string) => void) => {
    setter(hasMaskedCountry ? applyPhoneMask(value, countryCode) : value);
  };

  const handleZipChange = (value: string) => {
    setZipCode(hasMaskedCountry ? applyZipMask(value, countryCode) : value);
  };

  // Validation checks
  const addressValid = !!(address1.trim() || address2.trim() || address3.trim());
  const errors = useMemo(() => {
    if (!submitted) return {};
    const e: Record<string, string> = {};
    if (!companyName.trim()) e.companyName = 'Required';
    if (divisionIds.length === 0) e.division = 'Select at least one division';
    if (!phone.trim()) e.phone = 'Required';
    else if (hasMaskedCountry && !validatePhone(phone, countryCode)) e.phone = 'Invalid format';
    if (!addressValid) e.address = 'At least one address line is required';
    if (!city.trim()) e.city = 'Required';
    if (!countryCode) e.country = 'Required';
    if (isStateRequired && !stateCode) e.state = 'Required';
    if (!zipCode.trim()) e.zip = 'Required';
    else if (hasMaskedCountry && !validateZip(zipCode, countryCode)) e.zip = 'Invalid format';
    if (!firstName.trim()) e.firstName = 'Required';
    if (!lastName.trim()) e.lastName = 'Required';
    if (!title.trim()) e.title = 'Required';
    if (!mobilePhone.trim()) e.mobilePhone = 'Required';
    else if (hasMaskedCountry && !validatePhone(mobilePhone, countryCode)) e.mobilePhone = 'Invalid format';
    if (!email.trim()) e.email = 'Required';
    else if (!validateEmail(email)) e.email = 'Invalid email';
    if (businessPhone.trim() && hasMaskedCountry && !validatePhone(businessPhone, countryCode)) e.businessPhone = 'Invalid format';
    return e;
  }, [submitted, companyName, divisionIds, phone, addressValid, city, countryCode, stateCode, zipCode, firstName, lastName, title, mobilePhone, email, businessPhone, hasMaskedCountry, isStateRequired]);

  const toggleRole = useCallback((roleId: string) => {
    setSelectedRoles(prev => prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]);
  }, []);

  const removeRole = useCallback((roleId: string) => {
    setSelectedRoles(prev => prev.filter(r => r !== roleId));
  }, []);

  const resetForm = useCallback(() => {
    setCompanyName(''); setPhone(''); setDivisionIds([]); setSelectedRoles([]);
    setAddress1(''); setAddress2(''); setAddress3('');
    setCity(''); setCountryCode(''); setStateCode(''); setZipCode('');
    setFirstName(''); setLastName(''); setTitle('');
    setMobilePhone(''); setBusinessPhone(''); setEmail('');
    setSubmitted(false);
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    // Check required fields
    const hasErrors = !companyName.trim() || divisionIds.length === 0 || !phone.trim() || !addressValid || !city.trim() || !countryCode ||
      (isStateRequired && !stateCode) || !zipCode.trim() || !firstName.trim() || !lastName.trim() ||
      !title.trim() || !mobilePhone.trim() || !email.trim() || !validateEmail(email) ||
      (hasMaskedCountry && !validatePhone(phone, countryCode)) ||
      (hasMaskedCountry && !validateZip(zipCode, countryCode)) ||
      (hasMaskedCountry && !validatePhone(mobilePhone, countryCode)) ||
      (businessPhone.trim() && hasMaskedCountry && !validatePhone(businessPhone, countryCode));

    if (hasErrors) {
      toast({ title: 'Validation Error', description: 'Please fix the highlighted fields.', variant: 'destructive' });
      return;
    }

    const companyData: ProspectData = {
      companyName: companyName.trim(),
      phone,
      divisionIds,
      roleIds: selectedRoles,
      address1: address1.trim(),
      address2: address2.trim(),
      address3: address3.trim(),
      city: city.trim(),
      stateCode,
      zipCode,
      countryCode,
      contact: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        title: title.trim(),
        mobilePhone,
        businessPhone,
        email: email.trim(),
      },
    };

    // Call API stub to create company in backend
    createCompanyApi(companyData).then((companyId) => {
      console.log('[API STUB] Company persisted, proceeding with local state update. ID:', companyId);
    });

    onSave(companyData);
    resetForm();
    onOpenChange(false);
    toast({ title: 'Success', description: 'Prospect created successfully.' });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const FieldError = ({ error }: { error?: string }) =>
    error ? <p className="text-xs text-destructive mt-1">{error}</p> : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Prospect</DialogTitle>
          <DialogDescription>Add a new prospect company with a primary contact.</DialogDescription>
        </DialogHeader>

        {/* Company Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Company Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Company Name <span className="text-destructive">*</span></Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" className={errors.companyName ? 'border-destructive' : ''} />
              <FieldError error={errors.companyName} />
            </div>
            <div>
              <Label>Division(s) <span className="text-destructive">*</span></Label>
              <Popover open={divisionOpen} onOpenChange={setDivisionOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-between font-normal h-10", errors.division && "border-destructive")}>
                    <span className={cn(divisionIds.length === 0 && "text-muted-foreground")}>
                      {divisionIds.length === 0
                        ? "Select divisions"
                        : divisionIds.length <= 3
                          ? divisionIds.join(', ')
                          : `${divisionIds.length} selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                  <div className="space-y-0.5">
                    {DIVISIONS.map(div => (
                      <label key={div.code} className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground">
                        <Checkbox
                          checked={divisionIds.includes(div.code)}
                          onCheckedChange={(checked) => {
                            setDivisionIds(prev =>
                              checked ? [...prev, div.code] : prev.filter(c => c !== div.code)
                            );
                          }}
                        />
                        <span>{div.code} - {div.name}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <FieldError error={errors.division} />
            </div>
            <div>
              <Label>Role(s)</Label>
              <Popover open={rolesOpen} onOpenChange={setRolesOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal h-10">
                    <span className={cn(selectedRoles.length === 0 && "text-muted-foreground")}>
                      {selectedRoles.length === 0 ? "Select roles (optional)" : `${selectedRoles.length} selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                  {selectedRoles.map(roleId => {
                    const role = ROLE_OPTIONS.find(r => r.id === roleId);
                    return (
                      <Badge key={roleId} variant={roleId === 'GC' ? 'default' : 'secondary'} className="text-xs gap-1">
                        {role?.label || roleId}
                        <button type="button" onClick={() => removeRole(roleId)} className="ml-0.5 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <Label>Phone Number <span className="text-destructive">*</span></Label>
              <Input value={phone} onChange={e => handlePhoneChange(e.target.value, setPhone)}
                placeholder={selectedCountry?.phoneMask || 'Phone number'}
                className={errors.phone ? 'border-destructive' : ''} />
              <FieldError error={errors.phone} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Address</h3>
          {submitted && errors.address && (
            <p className="text-xs text-destructive">{errors.address}</p>
          )}
          <div className="space-y-3">
            <div>
              <Label>Address Line 1</Label>
              <Input value={address1} onChange={e => setAddress1(e.target.value)} placeholder="Street address"
                className={submitted && errors.address && !address1.trim() && !address2.trim() && !address3.trim() ? 'border-destructive' : ''} />
            </div>
            <div>
              <Label>Address Line 2</Label>
              <Input value={address2} onChange={e => setAddress2(e.target.value)} placeholder="Suite, unit, etc." />
            </div>
            <div>
              <Label>Address Line 3</Label>
              <Input value={address3} onChange={e => setAddress3(e.target.value)} placeholder="Additional address info" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Country <span className="text-destructive">*</span></Label>
              <SearchableSelect value={countryCode} onValueChange={setCountryCode}
                options={countryOptions} placeholder="Select country" emptyText="No countries found." />
              <FieldError error={errors.country} />
            </div>
            {showStateField && (
              <div>
                <Label>{stateLabel} {isStateRequired && <span className="text-destructive">*</span>}</Label>
                <SearchableSelect value={stateCode} onValueChange={setStateCode}
                  options={stateOptions} placeholder={`Select ${stateLabel.toLowerCase()}`}
                  disabled={statesLoading} emptyText={`No ${stateLabel.toLowerCase()}s found.`} />
                <FieldError error={errors.state} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>City <span className="text-destructive">*</span></Label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City"
                className={errors.city ? 'border-destructive' : ''} />
              <FieldError error={errors.city} />
            </div>
            <div>
              <Label>{zipLabel} <span className="text-destructive">*</span></Label>
              <Input value={zipCode} onChange={e => handleZipChange(e.target.value)}
                placeholder={selectedCountry?.zipMask || 'ZIP / Postal code'}
                className={errors.zip ? 'border-destructive' : ''} />
              <FieldError error={errors.zip} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Primary Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>First Name <span className="text-destructive">*</span></Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name"
                className={errors.firstName ? 'border-destructive' : ''} />
              <FieldError error={errors.firstName} />
            </div>
            <div>
              <Label>Last Name <span className="text-destructive">*</span></Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name"
                className={errors.lastName ? 'border-destructive' : ''} />
              <FieldError error={errors.lastName} />
            </div>
          </div>
          <div>
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Job title"
              className={errors.title ? 'border-destructive' : ''} />
            <FieldError error={errors.title} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Mobile Phone <span className="text-destructive">*</span></Label>
              <Input value={mobilePhone} onChange={e => handlePhoneChange(e.target.value, setMobilePhone)}
                placeholder={selectedCountry?.phoneMask || 'Mobile phone'}
                className={errors.mobilePhone ? 'border-destructive' : ''} />
              <FieldError error={errors.mobilePhone} />
            </div>
            <div>
              <Label>Business Phone</Label>
              <Input value={businessPhone} onChange={e => handlePhoneChange(e.target.value, setBusinessPhone)}
                placeholder={selectedCountry?.phoneMask || 'Business phone (optional)'}
                className={errors.businessPhone ? 'border-destructive' : ''} />
              <FieldError error={errors.businessPhone} />
            </div>
          </div>
          <div>
            <Label>Email <span className="text-destructive">*</span></Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
              className={errors.email ? 'border-destructive' : ''} />
            <FieldError error={errors.email} />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Prospect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
