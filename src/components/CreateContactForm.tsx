import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { CompanyContact } from '@/types';
import { getCountryByCode } from '@/data/Countries';
import { fetchStatesProvinces, hasStatesProvinces, type StateProvince } from '@/data/StatesProvinces';
import { applyPhoneMask, validatePhone, validateEmail, applyZipMask, validateZip } from '@/utils/phoneValidation';
import contactTypesData from '@/data/ContactTypes.json';
import mailCodesData from '@/data/MailCodes.json';
import { X, Check, UserPlus, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface Division {
  code: string;
  name: string;
}

interface CreateContactFormProps {
  availableDivisions: Division[];
  countryCode: string;
  companyId: string;
  onSave: (contact: CompanyContact) => void;
  onCancel: () => void;
}

export const CreateContactForm = ({ availableDivisions, countryCode, companyId, onSave, onCancel }: CreateContactFormProps) => {
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [divisionIds, setDivisionIds] = useState<string[]>([]);
  const [addressType, setAddressType] = useState<'same' | 'different'>('same');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [address3, setAddress3] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [mailCodes, setMailCodes] = useState<string[]>([]);
  const [additionalFieldsOpen, setAdditionalFieldsOpen] = useState(false);
  const [mailCodesPopoverOpen, setMailCodesPopoverOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [availableStates, setAvailableStates] = useState<StateProvince[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);

  const selectedCountry = useMemo(() => getCountryByCode(countryCode), [countryCode]);
  const hasMaskedCountry = ['US', 'CA', 'AU'].includes(countryCode);
  const zipLabel = selectedCountry?.zipLabel || 'ZIP Code';
  const stateLabel = selectedCountry?.stateLabel || 'State';
  const showStateField = hasStatesProvinces(countryCode);

  useEffect(() => {
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

  const handlePhoneChange = (value: string, setter: (v: string) => void) => {
    setter(hasMaskedCountry ? applyPhoneMask(value, countryCode) : value);
  };

  const handleZipChange = (value: string) => {
    setZipCode(hasMaskedCountry ? applyZipMask(value, countryCode) : value);
  };

  const toggleDivision = (code: string) => {
    setDivisionIds(prev => prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]);
  };

  const toggleMailCode = (code: string) => {
    setMailCodes(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const removeMailCode = (code: string) => {
    setMailCodes(prev => prev.filter(c => c !== code));
  };

  const errors = useMemo(() => {
    if (!submitted) return {};
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Required';
    if (!lastName.trim()) e.lastName = 'Required';
    if (!title.trim()) e.title = 'Required';
    if (!mobilePhone.trim()) e.mobilePhone = 'Required';
    else if (hasMaskedCountry && !validatePhone(mobilePhone, countryCode)) e.mobilePhone = 'Invalid format';
    if (!businessPhone.trim()) e.businessPhone = 'Required';
    else if (hasMaskedCountry && !validatePhone(businessPhone, countryCode)) e.businessPhone = 'Invalid format';
    if (!email.trim()) e.email = 'Required';
    else if (!validateEmail(email)) e.email = 'Invalid email';
    if (divisionIds.length === 0) e.division = 'Select at least one division';
    if (phone.trim() && hasMaskedCountry && !validatePhone(phone, countryCode)) e.phone = 'Invalid format';
    if (fax.trim() && hasMaskedCountry && !validatePhone(fax, countryCode)) e.fax = 'Invalid format';
    if (addressType === 'different' && zipCode.trim() && hasMaskedCountry && !validateZip(zipCode, countryCode)) e.zip = 'Invalid format';
    return e;
  }, [submitted, firstName, lastName, title, mobilePhone, businessPhone, email, divisionIds, phone, fax, zipCode, countryCode, hasMaskedCountry, addressType]);

  const handleSubmit = () => {
    setSubmitted(true);
    const hasErrors = !firstName.trim() || !lastName.trim() || !title.trim() ||
      !mobilePhone.trim() || !businessPhone.trim() || !email.trim() || !validateEmail(email) ||
      divisionIds.length === 0 ||
      (hasMaskedCountry && !validatePhone(mobilePhone, countryCode)) ||
      (hasMaskedCountry && !validatePhone(businessPhone, countryCode)) ||
      (phone.trim() && hasMaskedCountry && !validatePhone(phone, countryCode)) ||
      (fax.trim() && hasMaskedCountry && !validatePhone(fax, countryCode)) ||
      (addressType === 'different' && zipCode.trim() && hasMaskedCountry && !validateZip(zipCode, countryCode));

    if (hasErrors) {
      toast({ title: 'Validation Error', description: 'Please fix the highlighted fields.', variant: 'destructive' });
      return;
    }

    const typeDesc = contactTypesData.find(t => t.code === typeCode)?.description;
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const isDifferentAddress = addressType === 'different';

    const newContact: CompanyContact = {
      id: Date.now(),
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      title: title.trim(),
      typeCode: typeCode || undefined,
      typeDescription: typeDesc,
      phone: phone || mobilePhone,
      mobilePhone,
      businessPhone,
      email: email.trim(),
      fax: fax.trim() || undefined,
      address1: isDifferentAddress ? (address1.trim() || undefined) : undefined,
      address2: isDifferentAddress ? (address2.trim() || undefined) : undefined,
      address3: isDifferentAddress ? (address3.trim() || undefined) : undefined,
      city: isDifferentAddress ? (city.trim() || undefined) : undefined,
      state: isDifferentAddress ? (stateCode || undefined) : undefined,
      zipCode: isDifferentAddress ? (zipCode.trim() || undefined) : undefined,
      mainDivision: divisionIds[0],
      divisionIds,
      mailCodes: mailCodes.length > 0 ? mailCodes : undefined,
    };

    console.log('Simulated API payload - Create Contact:', {
      customerId: companyId,
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      name: newContact.name,
      typeCode: newContact.typeCode,
      typeDescription: newContact.typeDescription,
      title: newContact.title,
      phone: newContact.phone,
      mainDivision: newContact.mainDivision,
      divisions: newContact.divisionIds,
      homePhone: newContact.businessPhone,
      mobilePhone: newContact.mobilePhone,
      email: newContact.email,
      fax: newContact.fax || null,
      address1: newContact.address1 || null,
      address2: newContact.address2 || null,
      address3: newContact.address3 || null,
      city: newContact.city || null,
      state: newContact.state || null,
      zipCode: newContact.zipCode || null,
      mailCodes: newContact.mailCodes || [],
    });

    onSave(newContact);
  };

  const FieldError = ({ error }: { error?: string }) =>
    error ? <p className="text-xs text-destructive mt-1">{error}</p> : null;

  const phonePlaceholder = selectedCountry?.phoneMask || 'Phone number';

  return (
    <Card className="p-4 border-dashed">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium">Create New Contact</h4>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">First Name <span className="text-destructive">*</span></Label>
            <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className={`h-8 ${errors.firstName ? 'border-destructive' : ''}`} />
            <FieldError error={errors.firstName} />
          </div>
          <div>
            <Label className="text-xs">Last Name <span className="text-destructive">*</span></Label>
            <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className={`h-8 ${errors.lastName ? 'border-destructive' : ''}`} />
            <FieldError error={errors.lastName} />
          </div>
        </div>

        {/* Title & Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Title <span className="text-destructive">*</span></Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Job title" className={`h-8 ${errors.title ? 'border-destructive' : ''}`} />
            <FieldError error={errors.title} />
          </div>
          <div>
            <Label className="text-xs">Contact Type</Label>
            <Select value={typeCode} onValueChange={setTypeCode}>
              <SelectTrigger className="h-8"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {contactTypesData.map(t => (
                  <SelectItem key={t.code} value={t.code}>{t.description}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Phones */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Mobile Phone <span className="text-destructive">*</span></Label>
            <Input value={mobilePhone} onChange={e => handlePhoneChange(e.target.value, setMobilePhone)} placeholder={phonePlaceholder} className={`h-8 ${errors.mobilePhone ? 'border-destructive' : ''}`} />
            <FieldError error={errors.mobilePhone} />
          </div>
          <div>
            <Label className="text-xs">Business Phone <span className="text-destructive">*</span></Label>
            <Input value={businessPhone} onChange={e => handlePhoneChange(e.target.value, setBusinessPhone)} placeholder={phonePlaceholder} className={`h-8 ${errors.businessPhone ? 'border-destructive' : ''}`} />
            <FieldError error={errors.businessPhone} />
          </div>
        </div>

        {/* Email & Main Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Email <span className="text-destructive">*</span></Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={`h-8 ${errors.email ? 'border-destructive' : ''}`} />
            <FieldError error={errors.email} />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input value={phone} onChange={e => handlePhoneChange(e.target.value, setPhone)} placeholder={phonePlaceholder} className={`h-8 ${errors.phone ? 'border-destructive' : ''}`} />
            <FieldError error={errors.phone} />
          </div>
        </div>

        {/* Fax */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Fax</Label>
            <Input value={fax} onChange={e => handlePhoneChange(e.target.value, setFax)} placeholder={phonePlaceholder} className={`h-8 ${errors.fax ? 'border-destructive' : ''}`} />
            <FieldError error={errors.fax} />
          </div>
        </div>

        {/* Divisions */}
        <div>
          <Label className="text-xs">Division(s) <span className="text-destructive">*</span></Label>
          <div className={`flex gap-1.5 flex-wrap mt-1 ${errors.division ? 'ring-1 ring-destructive rounded p-1' : ''}`}>
            {availableDivisions.map(div => (
              <Badge
                key={div.code}
                variant={divisionIds.includes(div.code) ? "default" : "outline"}
                className="cursor-pointer text-xs px-2 py-0.5 select-none"
                onClick={() => toggleDivision(div.code)}
              >
                {div.code} – {div.name}
              </Badge>
            ))}
          </div>
          <FieldError error={errors.division} />
        </div>

        <Separator />

        {/* Address Toggle */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</h5>
          <div className="flex rounded-md border border-border overflow-hidden w-fit">
            <Button
              type="button"
              size="sm"
              variant={addressType === 'same' ? 'default' : 'ghost'}
              className="rounded-none h-8 text-xs"
              onClick={() => {
                setAddressType('same');
                setAddress1(''); setAddress2(''); setAddress3('');
                setCity(''); setStateCode(''); setZipCode('');
              }}
            >
              Same as Company
            </Button>
            <Button
              type="button"
              size="sm"
              variant={addressType === 'different' ? 'default' : 'ghost'}
              className="rounded-none h-8 text-xs"
              onClick={() => setAddressType('different')}
            >
              Different Address
            </Button>
          </div>

          {addressType === 'different' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Address Line 1</Label>
                <Input value={address1} onChange={e => setAddress1(e.target.value)} placeholder="Street address" className="h-8" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Address Line 2</Label>
                  <Input value={address2} onChange={e => setAddress2(e.target.value)} placeholder="Suite, unit, etc." className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Address Line 3</Label>
                  <Input value={address3} onChange={e => setAddress3(e.target.value)} placeholder="Additional info" className="h-8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">City</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="h-8" />
                </div>
                {showStateField ? (
                  <div>
                    <Label className="text-xs">{stateLabel}</Label>
                    <Select value={stateCode} onValueChange={setStateCode} disabled={statesLoading}>
                      <SelectTrigger className="h-8"><SelectValue placeholder={`Select ${stateLabel.toLowerCase()}`} /></SelectTrigger>
                      <SelectContent>
                        {availableStates.map(s => (
                          <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs">{stateLabel}</Label>
                    <Input value={stateCode} onChange={e => setStateCode(e.target.value)} placeholder={stateLabel} className="h-8" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{zipLabel}</Label>
                  <Input value={zipCode} onChange={e => handleZipChange(e.target.value)} placeholder={selectedCountry?.zipMask || zipLabel} className={`h-8 ${errors.zip ? 'border-destructive' : ''}`} />
                  <FieldError error={errors.zip} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Fields (collapsible) */}
        <Collapsible open={additionalFieldsOpen} onOpenChange={setAdditionalFieldsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground px-0">
              {additionalFieldsOpen ? <ChevronDown className="h-3.5 w-3.5 mr-1.5" /> : <ChevronRight className="h-3.5 w-3.5 mr-1.5" />}
              Additional Fields
              {mailCodes.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{mailCodes.length}</Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Mail Codes</Label>
              <Popover open={mailCodesPopoverOpen} onOpenChange={setMailCodesPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs font-normal mt-1">
                    {mailCodes.length === 0 ? 'Select mail codes...' : `${mailCodes.length} selected`}
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search mail codes..." className="h-8" />
                    <CommandList>
                      <CommandEmpty>No mail codes found.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {mailCodesData.map(mc => (
                          <CommandItem
                            key={mc.code}
                            value={`${mc.code} ${mc.description}`}
                            onSelect={() => toggleMailCode(mc.code)}
                            className="text-xs"
                          >
                            <Checkbox
                              checked={mailCodes.includes(mc.code)}
                              className="mr-2 h-3.5 w-3.5"
                            />
                            <span className="font-mono font-medium mr-2">{mc.code}</span>
                            <span className="text-muted-foreground truncate">{mc.description}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {mailCodes.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {mailCodes.map(code => {
                    const mc = mailCodesData.find(m => m.code === code);
                    return (
                      <Badge key={code} variant="secondary" className="text-[10px] px-1.5 py-0.5 gap-1">
                        <span className="font-mono">{code}</span>
                        <button onClick={() => removeMailCode(code)} className="ml-0.5 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            <Check className="h-4 w-4 mr-1" /> Create Contact
          </Button>
        </div>
      </div>
    </Card>
  );
};
