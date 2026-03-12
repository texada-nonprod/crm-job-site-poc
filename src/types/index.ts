// Type definitions for CRM data structures

export interface CustomerEquipment {
  id: number;
  companyId: string;
  equipmentType: string;
  make: string;
  model: string;
  year?: number;
  serialNumber?: string;
  smu?: number;
  uom?: string;
  ownershipStatus: 'owned' | 'rented';
}

export interface Activity {
  id: number;
  statusId: number;
  salesRepId: number;
  typeId: string;
  date: string;
  description: string;
  contactName: string;
  notes: string;
  campaignId?: number;
  issueId?: number;
  customerId?: string;
  division?: string;
  opportunityId?: number;
  previousRelatedActivityId?: number;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface NoteModification {
  modifiedAt: string;
  modifiedById: number;
  summary: string;
  previousContent?: string;
  previousTagIds?: string[];
}

export interface Note {
  id: number;
  content: string;
  createdAt: string;
  createdById: number;
  tagIds: string[];
  attachments: Attachment[];
  lastModifiedAt?: string;
  lastModifiedById?: number;
  modificationHistory?: NoteModification[];
}

export interface NoteTag {
  id: string;
  label: string;
  displayOrder: number;
  color: string;
}

export interface CompanyContact {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  typeCode?: string;
  typeDescription?: string;
  phone: string;
  mobilePhone?: string;
  businessPhone?: string;
  email: string;
  fax?: string;
  spouse?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  mainDivision?: string;
  divisionIds?: string[];
  mailCodes?: string[];
}

export interface ProjectCompany {
  companyId: string;
  companyName: string;
  roleId: string;
  roleDescription: string;
  isPrimaryContact: boolean;
  companyContacts: CompanyContact[];
  divisionIds?: string[];
  primaryContactIndex?: number;
  // Legacy field - will be migrated
  companyContact?: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
}

export interface LookupOption {
  id: string;
  label: string;
  displayOrder: number;
}

export interface DodgeMapping {
  externalValue: string;
  internalId: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  statusId: string;
  assigneeIds: number[];
  projectOwner: {
    companyId: string;
    contactIds: number[];
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  projectCompanies: ProjectCompany[];
  associatedOpportunities: Array<{
    id: number;
    type: string;
    description: string;
    stageId: number;
    revenue: number;
  }>;
  notes: Note[];
  activities: Activity[];
  customerEquipment: number[];
  valuation?: number;
  primaryStageId?: string;
  primaryProjectTypeId?: string;
  ownershipTypeId?: string;
  bidDate?: string;
  targetStartDate?: string;
  targetCompletionDate?: string;
  externalReference?: {
    source: string;
    url: string;
    name: string;
  };
}

export interface SalesRep {
  salesrepid: number;
  firstname: string;
  lastname: string;
  email: string | null;
}

export interface Opportunity {
  id: number;
  estimateDeliveryMonth?: number;
  isUrgent: boolean;
  typeId: number;
  probabilityOfClosingId: string | number;
  estimateDeliveryYear?: number;
  stageId: number;
  phaseId: number;
  stageIdEnteredAt: number;
  projectId: number;
  salesRepId: number;
  ownerUserId: number;
  originatorUserId: number;
  sourceId: number;
  campaignId: number;
  classificationId: string;
  cmCaseId: string;
  estimateRevenue: number;
  enterDate: string;
  changeDate: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerZipCode: string;
  customerState: string;
  principalWorkCodeId: string;
  externalReferenceNumber: string;
  branchId: number;
  olgaOpportunityId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  industryCodeId: string;
  workOrderId: string;
  customerCountry: string;
  divisionId: string;
  PSETypeId: number;
  additionalSourceIds: number[];
  productGroups?: Array<{
    statusId: number;
    id: number;
    order: number;
    products: Array<{
      partCategoryId: number;
      rentDurationTypeId: number;
      isPrimary: boolean;
      quantity: number;
      id: number;
      rentDuration: number;
      familyId: number;
      age: number;
      hours: number;
      unitPrice: number;
      description: string;
      makeId: string;
      baseModelId: string;
      stockNumber: string;
    }>;
  }>;
}

export interface OpportunityStage {
  stageid: number;
  stagename: string;
  languageid: number;
  phaseid: number;
  displayorder: number;
  psopportunitydisplayorder: number;
  DisplayStageName: string;
  phase: string;
  marketingprobability: number | null;
  salesprobability: number | null;
  oppitemtypeid: number;
  readonlyind: number;
}

export interface OpportunityType {
  opptypeid: number;
  opptypecode: string;
  opptypedesc: string;
  displayorder: number;
  multiproductitemind: number;
  allprimaryproductitemind: number;
  languageid: number;
}

export interface Filters {
  assigneeIds: string[];
  divisions: string[];
  generalContractor: string;
  statuses: string[];
  hideCompleted: boolean;
}

export interface ChangeLogEntry {
  id: number;
  projectId: number;
  timestamp: string;
  action: string;
  category: 'Project' | 'Opportunity' | 'Company' | 'Activity' | 'Note' | 'Equipment';
  summary: string;
  changedById: number;
  details?: Record<string, any>;
}
