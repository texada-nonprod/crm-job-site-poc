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

interface CreateProspectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProspectData) => void;
}

export interface ProspectData {
  companyName: string;
  phone: string;
  divisionId: string;
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

// ---- Input mask helpers ----

const applyPhoneMask = (value: string, country: string): string => {
  const digits = value.replace(/\D/g, '');
  if (country === 'US' || country === 'CA') {
    const d = digits.slice(0, 10);
    if (d.length <= 3) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (country === 'AU') {
    const d = digits.slice(0, 10);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return value;
};

const applyZipMask = (value: string, country: string): string => {
  if (country === 'US') {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  if (country === 'CA') {
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    // Pattern: A9A 9A9
    if (clean.length <= 3) return clean;
    return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  }
  if (country === 'AU') {
    return value.replace(/\D/g, '').slice(0, 4);
  }
  return value;
};

const validateZip = (value: string, country: string): boolean => {
  if (!value.trim()) return false;
  if (country === 'US') return /^\d{5}(-\d{4})?$/.test(value);
  if (country === 'CA') return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(value.toUpperCase());
  if (country === 'AU') return /^\d{4}$/.test(value);
  return value.trim().length > 0;
};

const validatePhone = (value: string, country: string): boolean => {
  const digits = value.replace(/\D/g, '');
  if (country === 'US' || country === 'CA') return digits.length === 10;
  if (country === 'AU') return digits.length === 10;
  return digits.length >= 7;
};

const validateEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

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
  const [divisionId, setDivisionId] = useState('');

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
    if (!divisionId) e.division = 'Required';
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
  }, [submitted, companyName, divisionId, phone, addressValid, city, countryCode, stateCode, zipCode, firstName, lastName, title, mobilePhone, email, businessPhone, hasMaskedCountry, isStateRequired]);

  const resetForm = useCallback(() => {
    setCompanyName(''); setPhone(''); setDivisionId('');
    setAddress1(''); setAddress2(''); setAddress3('');
    setCity(''); setCountryCode(''); setStateCode(''); setZipCode('');
    setFirstName(''); setLastName(''); setTitle('');
    setMobilePhone(''); setBusinessPhone(''); setEmail('');
    setSubmitted(false);
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    // Check required fields
    const hasErrors = !companyName.trim() || !divisionId || !phone.trim() || !addressValid || !city.trim() || !countryCode ||
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

    onSave({
      companyName: companyName.trim(),
      phone,
      divisionId,
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
    });
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
              <Label>Division <span className="text-destructive">*</span></Label>
              <Select value={divisionId} onValueChange={setDivisionId}>
                <SelectTrigger className={errors.division ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a division" />
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map(div => (
                    <SelectItem key={div.code} value={div.code}>{div.code} - {div.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError error={errors.division} />
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
