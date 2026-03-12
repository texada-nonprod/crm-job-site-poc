import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar as CalendarIcon, Check, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProjectCompany, CustomerEquipment } from '@/types';

// ── API Stubs ──

interface LookupOption {
  value: string;
  description: string;
}

interface FPCOption {
  value: string;
  text: string;
  oems: string[];
}

const fetchMakes = async (): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching makes');
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: 'AA', description: 'Caterpillar' },
    { value: 'YD', description: 'Volvo CE' },
    { value: 'AM', description: 'Case Construction' },
  ];
};

const ALL_FPCS: FPCOption[] = [
  { value: 'Q', text: 'ADT(ARTICULATED DUMP) & MINING TRUCKS', oems: ['YD', 'AA'] },
  { value: 'O', text: 'BACKHOE LOADERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'F', text: 'EXCAVATORS, SHOVELS AND DRAGLINE', oems: ['YD', 'AA', 'AM'] },
  { value: '9', text: 'MANTSINEN MATERIAL HANDLER', oems: ['YD', 'AA'] },
  { value: '8', text: 'MISC PRODUCT TYPE', oems: ['YD', 'AA', 'AM'] },
  { value: 'H', text: 'MOTOR GRADERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'J', text: 'OFF-HIGHWAY TRUCKS', oems: ['YD', 'AA', 'AM'] },
  { value: 'P', text: 'PAVERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'N', text: 'PROFILERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'R', text: 'ROLLERS', oems: ['YD', 'AA', 'AM'] },
  { value: '6', text: 'SURFACE MINING PRODUCTS', oems: ['YD', 'AA'] },
  { value: 'Y', text: 'TELESCOPIC HANDLERS', oems: ['YD', 'AA'] },
  { value: 'C', text: 'TRACK TYPE LOADERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'A', text: 'TRACK TYPE TRACTORS', oems: ['YD', 'AA', 'AM'] },
  { value: 'T', text: 'TRAILERS', oems: ['YD', 'AA'] },
  { value: '7', text: 'UNDERGROUND MINING PRODUCTS', oems: ['YD', 'AA', 'AM'] },
  { value: 'E', text: 'WHEEL DOZERS AND COMPACTORS', oems: ['YD', 'AA', 'AM'] },
  { value: '2', text: 'WHEEL HYD EXCAVATORS', oems: ['YD', 'AA', 'AM'] },
  { value: 'G', text: 'WHEEL SCRAPERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'K', text: 'WHEEL SKIDDERS & FOREST PRODUCTS', oems: ['YD', 'AA', 'AM'] },
  { value: 'D', text: 'WHEEL TYPE LOADERS', oems: ['YD', 'AA', 'AM'] },
];

const fetchFPCs = async (makeId: string): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching FPCs for make:', makeId);
  await new Promise(r => setTimeout(r, 100));
  return ALL_FPCS
    .filter(f => f.oems.includes(makeId))
    .map(f => ({ value: f.value, description: f.text }));
};

const fetchCompatibilityCodes = async (fpcId: string): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching compatibility codes for FPC:', fpcId);
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: '0V2319', description: '0V2319' },
    { value: '414', description: '414' },
    { value: '415', description: '415' },
    { value: '416', description: '416' },
    { value: '420', description: '420' },
    { value: '422', description: '422' },
    { value: '424', description: '424' },
    { value: '426', description: '426' },
    { value: '427', description: '427' },
    { value: '428', description: '428' },
    { value: '430', description: '430' },
    { value: '432', description: '432' },
    { value: '434', description: '434' },
    { value: '436', description: '436' },
    { value: '438', description: '438' },
    { value: '440', description: '440' },
    { value: '442', description: '442' },
    { value: '444', description: '444' },
    { value: '446', description: '446' },
    { value: '450', description: '450' },
    { value: '7155', description: '7155' },
    { value: 'C11', description: 'C11' },
    { value: 'C13', description: 'C13' },
    { value: 'C7', description: 'C7' },
    { value: 'CSG6491', description: 'CSG6491' },
    { value: 'CX31P600', description: 'CX31P600' },
    { value: 'FORKLIFT', description: 'FORKLIFT' },
    { value: 'INDFAN', description: 'INDFAN' },
    { value: 'OEM SOL', description: 'OEM SOL' },
    { value: 'PSDBULK', description: 'PSDBULK' },
    { value: 'PSDMISC', description: 'PSDMISC' },
    { value: 'PVALVE', description: 'PVALVE' },
    { value: 'SPILL BERM', description: 'SPILL BERM' },
  ];
};

const fetchPrincipalWorkCodes = async (): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching principal work codes');
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: '105', description: 'SPECIALTY CROPS' },
    { value: '110', description: 'CROP PRODUCTION' },
    { value: '120', description: 'LAND IMPROVEMENT' },
    { value: '128', description: 'LIVESTOCK PRODUCTION' },
    { value: '130', description: 'LIVESTOCK/CROP PRODUCTION' },
    { value: '131', description: 'DAIRY FARMS' },
    { value: '132', description: 'DAIRY FARMS/CROP PRODUCTION' },
    { value: '140', description: 'CUSTOM OPERATORS' },
    { value: '150', description: 'NURSERIES' },
    { value: '155', description: 'LANDSCAPING' },
    { value: '160', description: 'HOBBY FARMING' },
    { value: 'K63', description: 'HYDRAULIC POWER UNITS' },
    { value: 'K64', description: 'LAWN AND GARDEN' },
    { value: 'K65', description: 'LIGHT PLANTS/TOWERS' },
    { value: 'K66', description: 'REFRIGERATION/AC' },
    { value: 'K67', description: 'SCRUBBERS/SWEEPERS' },
    { value: 'K68', description: 'WELDERS' },
    { value: 'K69', description: 'OTHER GENERAL INDUSTRIAL' },
    { value: 'L11', description: 'LOCOMOTIVE' },
    { value: 'L12', description: 'RAIL WAY HEAD END POWER' },
    { value: 'L13', description: 'RAIL MAINTENANCE EQUIPMENT' },
    { value: 'L14', description: 'DIESEL MULTIPLE UNITS/ RAILCARS' },
  ];
};

const fetchApplicationCodes = async (): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching application codes');
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: '1', description: 'Light' },
    { value: '2', description: 'Medium' },
    { value: '3', description: 'Heavy' },
  ];
};

const fetchEngineMakes = async (): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching engine makes');
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: 'AA', description: 'Caterpillar' },
    { value: '2C', description: 'Doosan' },
    { value: 'DW', description: 'Daewoo' },
  ];
};

const fetchIndustryGroups = async (): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching industry groups');
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: '199', description: 'Agriculture' },
    { value: '388', description: 'Automotive/Truck Services' },
    { value: '305', description: 'Commercial Services' },
    { value: '392', description: 'Electric Power' },
    { value: '207', description: 'Equipment Services' },
    { value: '203', description: 'Forestry' },
    { value: '257', description: 'Government' },
    { value: '202', description: 'Industrial' },
    { value: '391', description: 'Industrial Engines' },
    { value: '198', description: 'Large Contractor (Heavy Const)' },
    { value: '200', description: 'Local Contractor (General Con)' },
    { value: '306', description: 'Marine' },
    { value: '204', description: 'Mining' },
    { value: '307', description: 'Oil & Gas' },
    { value: '262', description: 'Pipeline' },
    { value: '205', description: 'Quarry & Aggregates' },
    { value: '308', description: 'Transportation' },
    { value: '206', description: 'Waste' },
  ];
};

const fetchIndustryCodes = async (groupId: string): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching industry codes for group:', groupId);
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: 'LG40', description: 'ASPHALT PRODUCTION' },
    { value: 'LG25', description: 'BRIDGE & ELEVATED HIGHWAY CONSTRUCT' },
    { value: 'LG35', description: 'COMMERCIAL CONTRACTORS' },
    { value: 'LG50', description: 'EXPLORATION & DRILLING CONTRACTORS' },
    { value: 'LG30', description: 'GENERAL EXCAVATION - LARGE CONTRACTR' },
    { value: 'LG15', description: 'LANDSCAPING - LARGE CONTRACTOR' },
    { value: 'LG95', description: 'MANUFACTURER OF SPECIALTY EQUIPMENT' },
    { value: 'LG45', description: 'PAVING/RESURFACING -HIGHWAY & STREET' },
    { value: 'LG20', description: 'ROAD CONSTRUCTION - LARGE CONTRACTOR' },
    { value: 'LG10', description: 'SITE DEVELOPMENT' },
    { value: 'LG70', description: 'UTILITIES CONTRACTORS' },
  ];
};

const createEquipmentApi = async (data: Record<string, unknown>): Promise<number> => {
  console.log('[API STUB] Creating equipment:', data);
  await new Promise(r => setTimeout(r, 300));
  return Math.floor(Math.random() * 10000) + 5000;
};

const associateEquipmentToProjectApi = async (projectId: number, equipmentId: number): Promise<void> => {
  console.log('[API STUB] Associating equipment', equipmentId, 'to project', projectId);
  await new Promise(r => setTimeout(r, 200));
};

// ── Searchable Combobox ──

interface SearchableSelectProps {
  options: LookupOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabledPlaceholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  formatLabel?: (opt: LookupOption) => string;
}

function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  disabledPlaceholder,
  disabled = false,
  hasError = false,
  formatLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const getLabel = (opt: LookupOption) =>
    formatLabel ? formatLabel(opt) : `${opt.value} - ${opt.description}`;

  const selectedOption = options.find(o => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            hasError && 'border-destructive',
          )}
        >
          <span className="truncate">
            {selectedOption ? getLabel(selectedOption) : (disabled && disabledPlaceholder ? disabledPlaceholder : placeholder)}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(opt => (
                <CommandItem
                  key={opt.value}
                  value={`${opt.value} ${opt.description}`}
                  onSelect={() => {
                    onValueChange(opt.value === value ? '' : opt.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === opt.value ? 'opacity-100' : 'opacity-0')} />
                  {getLabel(opt)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Component ──

interface CreateEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equipmentId: number) => void;
  projectId: number;
  projectCompanies: ProjectCompany[];
}

export function CreateEquipmentModal({ open, onOpenChange, onSave, projectId, projectCompanies }: CreateEquipmentModalProps) {
  // Company (first required field)
  const [companyId, setCompanyId] = useState('');

  // Required fields
  const [make, setMake] = useState('');
  const [fpc, setFpc] = useState('');
  const [compatibilityCode, setCompatibilityCode] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [yearOfManufacture, setYearOfManufacture] = useState('');
  const [territory, setTerritory] = useState('in');

  // Additional fields
  const [equipmentNumber, setEquipmentNumber] = useState('');
  const [smu, setSmu] = useState('');
  const [smuDate, setSmuDate] = useState<Date | undefined>();
  const [smuDateOpen, setSmuDateOpen] = useState(false);
  const [industryGroup, setIndustryGroup] = useState('');
  const [industryCode, setIndustryCode] = useState('');
  const [principalWorkCode, setPrincipalWorkCode] = useState('');
  const [applicationCode, setApplicationCode] = useState('');
  const [annualUseHours, setAnnualUseHours] = useState('');
  const [engineMake, setEngineMake] = useState('');
  const [engineModel, setEngineModel] = useState('');
  const [engineSerialNumber, setEngineSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>();
  const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);

  // Lookup data
  const [makes, setMakes] = useState<LookupOption[]>([]);
  const [fpcs, setFpcs] = useState<LookupOption[]>([]);
  const [compCodes, setCompCodes] = useState<LookupOption[]>([]);
  const [principalWorkCodes, setPrincipalWorkCodes] = useState<LookupOption[]>([]);
  const [applicationCodes, setApplicationCodes] = useState<LookupOption[]>([]);
  const [engineMakes, setEngineMakes] = useState<LookupOption[]>([]);
  const [industryGroups, setIndustryGroups] = useState<LookupOption[]>([]);
  const [industryCodes, setIndustryCodes] = useState<LookupOption[]>([]);

  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Company options from project companies
  const companyOptions: LookupOption[] = useMemo(
    () => (projectCompanies || []).map(c => ({ value: c.companyId, description: c.companyName })),
    [projectCompanies],
  );

  // Load static lookups on open
  useEffect(() => {
    if (open) {
      Promise.all([
        fetchMakes(),
        fetchPrincipalWorkCodes(),
        fetchApplicationCodes(),
        fetchEngineMakes(),
        fetchIndustryGroups(),
      ]).then(([m, pwc, ac, em, ig]) => {
        setMakes(m);
        setPrincipalWorkCodes(pwc);
        setApplicationCodes(ac);
        setEngineMakes(em);
        setIndustryGroups(ig);
      });
    }
  }, [open]);

  // Cascade: Make → FPC
  useEffect(() => {
    if (make) {
      fetchFPCs(make).then(setFpcs);
    } else {
      setFpcs([]);
    }
    setFpc('');
    setCompatibilityCode('');
    setCompCodes([]);
  }, [make]);

  // Cascade: FPC → Compatibility Code
  useEffect(() => {
    if (fpc) {
      fetchCompatibilityCodes(fpc).then(setCompCodes);
    } else {
      setCompCodes([]);
    }
    setCompatibilityCode('');
  }, [fpc]);

  // Cascade: Industry Group → Industry Code
  useEffect(() => {
    if (industryGroup) {
      fetchIndustryCodes(industryGroup).then(setIndustryCodes);
    } else {
      setIndustryCodes([]);
    }
    setIndustryCode('');
  }, [industryGroup]);

  const resetForm = () => {
    setCompanyId(''); setMake(''); setFpc(''); setCompatibilityCode(''); setModel('');
    setSerialNumber(''); setYearOfManufacture(''); setTerritory('in');
    setEquipmentNumber(''); setSmu(''); setSmuDate(undefined);
    setIndustryGroup(''); setIndustryCode(''); setPrincipalWorkCode('');
    setApplicationCode(''); setAnnualUseHours(''); setEngineMake('');
    setEngineModel(''); setEngineSerialNumber(''); setPurchaseDate(undefined);
    setAdditionalOpen(false); setErrors({});
    setFpcs([]); setCompCodes([]); setIndustryCodes([]);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!companyId) newErrors.companyId = true;
    if (!make) newErrors.make = true;
    if (!fpc) newErrors.fpc = true;
    if (!compatibilityCode) newErrors.compatibilityCode = true;
    if (!model.trim()) newErrors.model = true;
    if (!serialNumber.trim()) newErrors.serialNumber = true;
    if (!yearOfManufacture.trim()) newErrors.yearOfManufacture = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        companyId, make, fpc, compatibilityCode, model, serialNumber,
        yearOfManufacture: parseInt(yearOfManufacture),
        territory: territory === 'in' ? 'In Territory' : 'Out of Territory',
        ...(equipmentNumber && { equipmentNumber }),
        ...(smu && { smu: parseFloat(smu) }),
        ...(smuDate && { smuDate: format(smuDate, 'yyyy-MM-dd') }),
        ...(industryGroup && { industryGroup }),
        ...(industryCode && { industryCode }),
        ...(principalWorkCode && { principalWorkCode }),
        ...(applicationCode && { applicationCode }),
        ...(annualUseHours && { annualUseHours: parseInt(annualUseHours) }),
        ...(engineMake && { engineMake }),
        ...(engineModel && { engineModel }),
        ...(engineSerialNumber && { engineSerialNumber }),
        ...(purchaseDate && { purchaseDate: format(purchaseDate, 'yyyy-MM-dd') }),
      };

      const newId = await createEquipmentApi(payload);
      await associateEquipmentToProjectApi(projectId, newId);
      onSave(newId);
      handleClose(false);
    } finally {
      setSubmitting(false);
    }
  };

  const DatePickerField = ({ label, date, onSelect, open: isOpen, onOpenChange: setOpen }: {
    label: string;
    date: Date | undefined;
    onSelect: (d: Date | undefined) => void;
    open: boolean;
    onOpenChange: (o: boolean) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'MMM d, yyyy') : 'Select date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => { onSelect(d); setOpen(false); }} />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Equipment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Company — first required field, full width */}
          <div className="space-y-2">
            <Label>Company <span className="text-destructive">*</span></Label>
            <SearchableSelect
              options={companyOptions}
              value={companyId}
              onValueChange={setCompanyId}
              placeholder="Select company"
              hasError={errors.companyId}
              formatLabel={(opt) => opt.description}
            />
          </div>

          {/* Required Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Make */}
            <div className="space-y-2">
              <Label>Make <span className="text-destructive">*</span></Label>
              <SearchableSelect
                options={makes}
                value={make}
                onValueChange={setMake}
                placeholder="Select make"
                hasError={errors.make}
              />
            </div>

            {/* FPC */}
            <div className="space-y-2">
              <Label>Family Product Code <span className="text-destructive">*</span></Label>
              <SearchableSelect
                options={fpcs}
                value={fpc}
                onValueChange={setFpc}
                placeholder="Select FPC"
                disabledPlaceholder="Select make first"
                disabled={!make}
                hasError={errors.fpc}
              />
            </div>

            {/* Compatibility Code */}
            <div className="space-y-2">
              <Label>Compatibility Code <span className="text-destructive">*</span></Label>
              <SearchableSelect
                options={compCodes}
                value={compatibilityCode}
                onValueChange={setCompatibilityCode}
                placeholder="Select code"
                disabledPlaceholder="Select FPC first"
                disabled={!fpc}
                hasError={errors.compatibilityCode}
              />
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label>Model <span className="text-destructive">*</span></Label>
              <Input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="Enter model"
                className={cn(errors.model && 'border-destructive')}
              />
            </div>

            {/* Serial Number */}
            <div className="space-y-2">
              <Label>Serial Number <span className="text-destructive">*</span></Label>
              <Input
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                placeholder="Enter serial number"
                className={cn(errors.serialNumber && 'border-destructive')}
              />
            </div>

            {/* Year of Manufacture */}
            <div className="space-y-2">
              <Label>Year of Manufacture <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                value={yearOfManufacture}
                onChange={e => setYearOfManufacture(e.target.value)}
                placeholder="e.g. 2024"
                className={cn(errors.yearOfManufacture && 'border-destructive')}
              />
            </div>
          </div>

          {/* Territory */}
          <div className="space-y-2">
            <Label>Territory <span className="text-destructive">*</span></Label>
            <ToggleGroup type="single" value={territory} onValueChange={(v) => v && setTerritory(v)} className="justify-start">
              <ToggleGroupItem value="in" className="px-4">In Territory</ToggleGroupItem>
              <ToggleGroupItem value="out" className="px-4">Out of Territory</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Additional Fields */}
          <Collapsible open={additionalOpen} onOpenChange={setAdditionalOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
                <span className="text-sm font-medium">Additional Fields</span>
                {additionalOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Equipment Number */}
                <div className="space-y-2">
                  <Label>Equipment Number</Label>
                  <Input value={equipmentNumber} onChange={e => setEquipmentNumber(e.target.value)} placeholder="Enter equipment number" />
                </div>

                {/* SMU */}
                <div className="space-y-2">
                  <Label>SMU</Label>
                  <Input type="number" value={smu} onChange={e => setSmu(e.target.value)} placeholder="Enter SMU" />
                </div>

                {/* SMU Date */}
                <DatePickerField label="SMU Date" date={smuDate} onSelect={setSmuDate} open={smuDateOpen} onOpenChange={setSmuDateOpen} />

                {/* Industry Group */}
                <div className="space-y-2">
                  <Label>Industry Group</Label>
                  <SearchableSelect
                    options={industryGroups}
                    value={industryGroup}
                    onValueChange={setIndustryGroup}
                    placeholder="Select industry group"
                    formatLabel={(opt) => opt.description}
                  />
                </div>

                {/* Industry Code */}
                <div className="space-y-2">
                  <Label>Industry Code</Label>
                  <SearchableSelect
                    options={industryCodes}
                    value={industryCode}
                    onValueChange={setIndustryCode}
                    placeholder="Select industry code"
                    disabledPlaceholder="Select group first"
                    disabled={!industryGroup}
                  />
                </div>

                {/* Principal Work Code */}
                <div className="space-y-2">
                  <Label>Principal Work Code</Label>
                  <SearchableSelect
                    options={principalWorkCodes}
                    value={principalWorkCode}
                    onValueChange={setPrincipalWorkCode}
                    placeholder="Select work code"
                  />
                </div>

                {/* Application Code */}
                <div className="space-y-2">
                  <Label>Application Code</Label>
                  <SearchableSelect
                    options={applicationCodes}
                    value={applicationCode}
                    onValueChange={setApplicationCode}
                    placeholder="Select application"
                    formatLabel={(opt) => opt.description}
                  />
                </div>

                {/* Annual Use Hours */}
                <div className="space-y-2">
                  <Label>Annual Use Hours</Label>
                  <Input type="number" value={annualUseHours} onChange={e => setAnnualUseHours(e.target.value)} placeholder="Enter hours" />
                </div>

                {/* Engine Make */}
                <div className="space-y-2">
                  <Label>Engine Make</Label>
                  <SearchableSelect
                    options={engineMakes}
                    value={engineMake}
                    onValueChange={setEngineMake}
                    placeholder="Select engine make"
                  />
                </div>

                {/* Engine Model */}
                <div className="space-y-2">
                  <Label>Engine Model</Label>
                  <Input value={engineModel} onChange={e => setEngineModel(e.target.value)} placeholder="Enter engine model" />
                </div>

                {/* Engine Serial Number */}
                <div className="space-y-2">
                  <Label>Engine Serial Number</Label>
                  <Input value={engineSerialNumber} onChange={e => setEngineSerialNumber(e.target.value)} placeholder="Enter engine serial" />
                </div>

                {/* Purchase Date */}
                <DatePickerField label="Purchase Date" date={purchaseDate} onSelect={setPurchaseDate} open={purchaseDateOpen} onOpenChange={setPurchaseDateOpen} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Equipment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
