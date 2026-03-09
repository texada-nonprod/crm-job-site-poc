import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Project, SalesRep, User, Opportunity, OpportunityStage, OpportunityType, Filters, Activity, Note, NoteTag, ProjectCompany, CompanyContact, CustomerEquipment, ChangeLogEntry, LookupOption, DodgeMapping } from '@/types';
import projectsData from '@/data/Project.json';
import salesRepsData from '@/data/SalesReps.json';
import usersData from '@/data/Users.json';
import opportunitiesData from '@/data/Opportunity.json';
import opportunityStagesData from '@/data/OpportunityStages.json';
import opportunityTypesData from '@/data/OpportunityTypes.json';
import lookupsData from '@/data/Lookups.json';
import companyEquipmentData from '@/data/CompanyEquipment.json';

// Division constants
export const DIVISIONS = [
  { code: 'G', name: 'General Line' },
  { code: 'C', name: 'Compact' },
  { code: 'P', name: 'Paving' },
  { code: 'R', name: 'Heavy Rents' },
  { code: 'S', name: 'Power Systems' },
  { code: 'V', name: 'Rental Services' },
  { code: 'X', name: 'Power Rental' },
] as const;

export const getDivisionName = (code: string): string => {
  const division = DIVISIONS.find(d => d.code === code);
  return division ? division.name : code;
};

interface DataContextType {
  projects: Project[];
  salesReps: SalesRep[];
  users: User[];
  opportunities: Opportunity[];
  opportunityStages: OpportunityStage[];
  noteTags: NoteTag[];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  currentUserId: number;
  setCurrentUserId: (id: number) => void;
  getChangeLog: (projectId: number) => ChangeLogEntry[];
  addOpportunityToProject: (projectId: number, opportunityId: number) => void;
  createNewOpportunity: (opportunity: Opportunity) => void;
  updateOpportunity: (opportunityId: number, updates: Partial<Opportunity>) => void;
  createProject: (project: Omit<Project, 'id'>) => void;
  addProjectCompany: (projectId: number, company: Omit<ProjectCompany, 'companyContacts' | 'primaryContactIndex'> & { companyContacts?: CompanyContact[], companyContact?: { name: string; title: string; phone: string; email: string } }) => void;
  removeProjectCompany: (projectId: number, companyName: string) => void;
  updateProjectCompany: (projectId: number, oldCompanyName: string, updatedCompany: ProjectCompany) => void;
  updateProject: (projectId: number, updates: Partial<Project>) => void;
  addActivity: (projectId: number, activity: Omit<Activity, 'id'>) => void;
  updateActivity: (projectId: number, activityId: number, updates: Partial<Activity>) => void;
  deleteActivity: (projectId: number, activityId: number) => void;
  addNote: (projectId: number, noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>) => void;
  updateNote: (projectId: number, noteId: number, updates: Partial<Note>) => void;
  deleteNote: (projectId: number, noteId: number) => void;
  companyEquipment: CustomerEquipment[];
  getEquipmentById: (id: number) => CustomerEquipment | undefined;
  getCompanyEquipment: (companyId: string) => CustomerEquipment[];
  getEquipmentProjectAssignment: (equipmentId: number, excludeProjectId?: number) => { projectId: number; projectName: string } | null;
  addCustomerEquipment: (projectId: number, equipmentId: number) => void;
  deleteCustomerEquipment: (projectId: number, equipmentId: number) => void;
  setNoteTags: (tags: NoteTag[]) => void;
  getSalesRepName: (id: number) => string;
  getSalesRepNames: (ids: number[]) => string;
  getUserName: (id: number) => string;
  getUserNames: (ids: number[]) => string;
  getStageName: (id: number) => string;
  getStage: (id: number) => OpportunityStage | undefined;
  getTypeName: (typeId: number) => string;
  calculateProjectRevenue: (project: Project) => number;
  getFilteredProjects: () => Project[];
  getTotalPipelineRevenue: () => number;
  getRevenueByType: () => { typeId: number; typeName: string; revenue: number }[];
  getCompanyById: (companyId: string) => ProjectCompany | undefined;
  getAllKnownCompanies: () => ProjectCompany[];
  // Lookups
  primaryStages: LookupOption[];
  setPrimaryStages: (items: LookupOption[]) => void;
  primaryProjectTypes: LookupOption[];
  setPrimaryProjectTypes: (items: LookupOption[]) => void;
  ownershipTypes: LookupOption[];
  setOwnershipTypes: (items: LookupOption[]) => void;
  getLookupLabel: (type: 'primaryStage' | 'primaryProjectType' | 'ownershipType', id: string) => string;
  // Dodge Mappings
  dodgeMappings: Record<string, DodgeMapping[]>;
  setDodgeMappings: (type: string, mappings: DodgeMapping[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const FILTERS_STORAGE_KEY = 'crm-filters';
const NOTE_TAGS_STORAGE_KEY = 'crm-note-tags';
const LOOKUPS_STORAGE_KEY = 'crm-lookups';
const DODGE_MAPPINGS_STORAGE_KEY = 'crm-dodge-mappings';

// Default note tags
const defaultNoteTags: NoteTag[] = [
  { id: 'SAFETY', label: 'Safety', displayOrder: 1, color: 'red' },
  { id: 'SECURITY', label: 'Security', displayOrder: 2, color: 'amber' },
  { id: 'COMPLIANCE', label: 'Compliance', displayOrder: 3, color: 'sky' },
  { id: 'GENERAL', label: 'General', displayOrder: 4, color: 'slate' },
];

// Helper to migrate old string notes to new Note structure
const migrateNotes = (notes: any[]): Note[] => {
  if (!notes || notes.length === 0) return [];
  
  return notes.map((note, index) => {
    if (typeof note === 'object' && note.content) {
      return note as Note;
    }
    return {
      id: index + 1,
      content: String(note),
      createdAt: new Date().toISOString(),
      createdById: 313,
      tagIds: [],
      attachments: [],
    };
  });
};

// Helper to migrate single companyContact to companyContacts array
const migrateProjectCompanies = (companies: any[]): ProjectCompany[] => {
  if (!companies || companies.length === 0) return [];
  
  return companies.map(company => {
    if (company.companyContacts && Array.isArray(company.companyContacts)) {
      return company as ProjectCompany;
    }
    
    const contacts: CompanyContact[] = [];
    if (company.companyContact) {
      contacts.push({
        id: 1,
        name: company.companyContact.name,
        title: company.companyContact.title || undefined,
        phone: company.companyContact.phone || '',
        email: company.companyContact.email || '',
      });
    }
    
    return {
      companyId: company.companyId,
      companyName: company.companyName,
      roleId: company.roleId,
      roleDescription: company.roleDescription,
      isPrimaryContact: company.isPrimaryContact,
      companyContacts: contacts,
      primaryContactIndex: 0,
    } as ProjectCompany;
  });
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [users] = useState<User[]>(usersData.content as User[]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunityStages, setOpportunityStages] = useState<OpportunityStage[]>([]);
  const [opportunityTypes] = useState<OpportunityType[]>(opportunityTypesData.content as OpportunityType[]);
  const [noteTags, setNoteTagsState] = useState<NoteTag[]>([]);
  const [filters, setFilters] = useState<Filters>({
    assigneeIds: [],
    divisions: [],
    generalContractor: '',
    statuses: [],
    hideCompleted: true,
  });

  // Lookups state
  const [primaryStages, setPrimaryStagesState] = useState<LookupOption[]>(lookupsData.primaryStages);
  const [primaryProjectTypes, setPrimaryProjectTypesState] = useState<LookupOption[]>(lookupsData.primaryProjectTypes);
  const [ownershipTypes, setOwnershipTypesState] = useState<LookupOption[]>(lookupsData.ownershipTypes);
  const [dodgeMappings, setDodgeMappingsState] = useState<Record<string, DodgeMapping[]>>({});

  // Current user and change log
  const [currentUserId, setCurrentUserId] = useState<number>(313);

  // Seed example change log entries
  const seedChangeLog: ChangeLogEntry[] = [
    { id: 1, projectId: 500101, timestamp: '2025-11-02T09:15:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project "Highway 50 Expansion" created', changedById: 313 },
    { id: 2, projectId: 500101, timestamp: '2025-11-03T14:22:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Walsh Construction" added as General Contractor', changedById: 313 },
    { id: 3, projectId: 500101, timestamp: '2025-11-05T10:45:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "D6 Dozer rental for clearing phase" created', changedById: 260 },
    { id: 4, projectId: 500101, timestamp: '2025-11-08T16:30:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "Caterpillar 320F" added', changedById: 260 },
    { id: 5, projectId: 500101, timestamp: '2025-11-12T08:10:00Z', action: 'NOTE_ADDED', category: 'Note', summary: 'Note added', changedById: 313 },
    { id: 6, projectId: 500101, timestamp: '2025-11-15T11:05:00Z', action: 'PROJECT_UPDATED', category: 'Project', summary: 'Project details updated (statusId)', changedById: 292, details: { field: 'statusId', from: 'Planning', to: 'Active' } },
    { id: 7, projectId: 500101, timestamp: '2025-11-18T13:40:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Site Visit" added', changedById: 260 },
    { id: 8, projectId: 500101, timestamp: '2025-11-22T09:55:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Rosendin Electric" added as Subcontractor - Electrical', changedById: 313 },
    { id: 9, projectId: 500101, timestamp: '2025-12-01T15:20:00Z', action: 'OPPORTUNITY_UPDATED', category: 'Opportunity', summary: 'Opportunity "D6 Dozer rental for clearing phase" updated (stageId, estimateRevenue)', changedById: 292, details: { stageId: { from: 2, to: 4 }, estimateRevenue: { from: 45000, to: 52000 } } },
    { id: 10, projectId: 500101, timestamp: '2025-12-05T10:30:00Z', action: 'EQUIPMENT_DELETED', category: 'Equipment', summary: 'Equipment "Komatsu PC210" removed', changedById: 260 },
    { id: 11, projectId: 500101, timestamp: '2025-12-10T14:15:00Z', action: 'COMPANY_REMOVED', category: 'Company', summary: 'Company "Rosendin Electric" disassociated', changedById: 313 },
    { id: 12, projectId: 500101, timestamp: '2025-12-15T08:45:00Z', action: 'NOTE_UPDATED', category: 'Note', summary: 'Note updated', changedById: 292 },
    { id: 13, projectId: 500102, timestamp: '2025-10-20T09:00:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project "Metro Line Extension" created', changedById: 262 },
    { id: 14, projectId: 500102, timestamp: '2025-10-25T11:30:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Turner Construction" added as Subcontractor - Steel', changedById: 262 },
    { id: 15, projectId: 500102, timestamp: '2025-11-01T14:00:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Excavator fleet for foundation work" created', changedById: 303 },
    { id: 16, projectId: 500102, timestamp: '2025-11-10T16:20:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Phone Call" added', changedById: 262 },
    { id: 17, projectId: 500102, timestamp: '2025-11-20T10:10:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "Volvo EC220E" added', changedById: 303 },
    { id: 18, projectId: 500102, timestamp: '2025-12-02T13:45:00Z', action: 'PROJECT_UPDATED', category: 'Project', summary: 'Project details updated (description)', changedById: 262 },
    { id: 19, projectId: 500103, timestamp: '2025-09-15T08:30:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project "Riverside Commercial Park" created', changedById: 304 },
    { id: 20, projectId: 500103, timestamp: '2025-09-20T12:00:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Paving equipment package" created', changedById: 304 },
    { id: 21, projectId: 500103, timestamp: '2025-10-05T09:15:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Curran Contracting" added as Subcontractor - Paving', changedById: 305 },
    { id: 22, projectId: 500103, timestamp: '2025-10-15T15:30:00Z', action: 'NOTE_ADDED', category: 'Note', summary: 'Note added', changedById: 304 },
    { id: 23, projectId: 500103, timestamp: '2025-11-01T10:45:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "Case SV340B" added', changedById: 305 },
    { id: 24, projectId: 500103, timestamp: '2025-11-20T14:00:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Email" added', changedById: 304 },
    { id: 25, projectId: 500104, timestamp: '2025-10-01T08:00:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project created', changedById: 292 },
    { id: 26, projectId: 500104, timestamp: '2025-10-10T11:20:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Generator rental for temp power" created', changedById: 292 },
    { id: 27, projectId: 500104, timestamp: '2025-10-18T14:30:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company added as General Contractor', changedById: 292 },
    { id: 28, projectId: 500104, timestamp: '2025-11-05T09:00:00Z', action: 'PROJECT_UPDATED', category: 'Project', summary: 'Project details updated (statusId)', changedById: 313, details: { field: 'statusId', from: 'Planning', to: 'Active' } },
    { id: 29, projectId: 500105, timestamp: '2025-08-20T10:00:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project created', changedById: 305 },
    { id: 30, projectId: 500105, timestamp: '2025-09-01T13:15:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Rosendin Electric" added as Subcontractor - Electrical', changedById: 305 },
    { id: 31, projectId: 500105, timestamp: '2025-09-15T16:45:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Boom lift rental" created', changedById: 262 },
    { id: 32, projectId: 500105, timestamp: '2025-10-01T08:30:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "JLG 800S" added', changedById: 305 },
    { id: 33, projectId: 500105, timestamp: '2025-10-20T11:00:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Site Inspection" added', changedById: 262 },
    { id: 34, projectId: 500105, timestamp: '2025-11-10T14:30:00Z', action: 'NOTE_ADDED', category: 'Note', summary: 'Note added', changedById: 305 },
  ];

  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>(seedChangeLog);
  const nextLogId = useRef(seedChangeLog.length + 1);
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

  const logChange = useCallback((
    projectId: number,
    action: string,
    category: ChangeLogEntry['category'],
    summary: string,
    details?: Record<string, any>
  ) => {
    const entry: ChangeLogEntry = {
      id: nextLogId.current++,
      projectId,
      timestamp: new Date().toISOString(),
      action,
      category,
      summary,
      changedById: currentUserIdRef.current,
      details,
    };
    setChangeLog(prev => [...prev, entry]);
  }, []);

  const getChangeLog = useCallback((projectId: number): ChangeLogEntry[] => {
    return changeLog.filter(e => e.projectId === projectId);
  }, [changeLog]);

  // Load data on mount
  useEffect(() => {
    const projectsWithMigratedData = projectsData.content.map(p => ({
      ...p,
      assigneeIds: (p as any).assigneeIds || (p as any).salesRepIds || [],
      projectOwner: (p as any).projectOwner || { companyId: '', contactIds: [] },
      activities: (p as any).activities || [],
      notes: migrateNotes((p as any).notes || []),
      projectCompanies: migrateProjectCompanies((p as any).siteCompanies || (p as any).projectCompanies || []),
      customerEquipment: ((p as any).customerEquipment || []).map((e: any) => typeof e === 'number' ? e : e.id) as number[],
    })) as Project[];
    
    setProjects(projectsWithMigratedData);
    setSalesReps(salesRepsData.content);
    setOpportunities(opportunitiesData.content.map((o: any) => ({
      ...o,
      projectId: o.projectId ?? o.jobSiteId,
    })) as Opportunity[]);
    setOpportunityStages(opportunityStagesData.content);

    const savedNoteTags = localStorage.getItem(NOTE_TAGS_STORAGE_KEY);
    if (savedNoteTags) {
      try {
        setNoteTagsState(JSON.parse(savedNoteTags));
      } catch (e) {
        setNoteTagsState(defaultNoteTags);
      }
    } else {
      setNoteTagsState(defaultNoteTags);
    }

    // Load lookups from localStorage or defaults
    const savedLookups = localStorage.getItem(LOOKUPS_STORAGE_KEY);
    if (savedLookups) {
      try {
        const parsed = JSON.parse(savedLookups);
        if (parsed.primaryStages) setPrimaryStagesState(parsed.primaryStages);
        if (parsed.primaryProjectTypes) setPrimaryProjectTypesState(parsed.primaryProjectTypes);
        if (parsed.ownershipTypes) setOwnershipTypesState(parsed.ownershipTypes);
      } catch (e) {
        console.error('Failed to parse saved lookups', e);
      }
    }

    // Load dodge mappings
    const savedDodge = localStorage.getItem(DODGE_MAPPINGS_STORAGE_KEY);
    if (savedDodge) {
      try {
        setDodgeMappingsState(JSON.parse(savedDodge));
      } catch (e) {
        console.error('Failed to parse saved dodge mappings', e);
      }
    }

    const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        if ('assigneeId' in parsed && !('assigneeIds' in parsed)) {
          parsed.assigneeIds = parsed.assigneeId ? [parsed.assigneeId] : [];
          delete parsed.assigneeId;
        }
        if ('salesRepId' in parsed) {
          parsed.assigneeIds = parsed.salesRepId ? [String(parsed.salesRepId)] : [];
          delete parsed.salesRepId;
        }
        if ('division' in parsed && !('divisions' in parsed)) {
          parsed.divisions = parsed.division ? [parsed.division] : [];
          delete parsed.division;
        }
        if ('status' in parsed && !('statuses' in parsed)) {
          parsed.statuses = parsed.status ? [parsed.status] : [];
          delete parsed.status;
        }
        setFilters(parsed);
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const setNoteTags = (tags: NoteTag[]) => {
    setNoteTagsState(tags);
    localStorage.setItem(NOTE_TAGS_STORAGE_KEY, JSON.stringify(tags));
  };

  // Lookup setters with persistence
  const persistLookups = (stages: LookupOption[], types: LookupOption[], ownership: LookupOption[]) => {
    localStorage.setItem(LOOKUPS_STORAGE_KEY, JSON.stringify({
      primaryStages: stages,
      primaryProjectTypes: types,
      ownershipTypes: ownership,
    }));
  };

  const setPrimaryStages = (items: LookupOption[]) => {
    setPrimaryStagesState(items);
    persistLookups(items, primaryProjectTypes, ownershipTypes);
  };

  const setPrimaryProjectTypes = (items: LookupOption[]) => {
    setPrimaryProjectTypesState(items);
    persistLookups(primaryStages, items, ownershipTypes);
  };

  const setOwnershipTypes = (items: LookupOption[]) => {
    setOwnershipTypesState(items);
    persistLookups(primaryStages, primaryProjectTypes, items);
  };

  const setDodgeMappings = (type: string, mappings: DodgeMapping[]) => {
    setDodgeMappingsState(prev => {
      const updated = { ...prev, [type]: mappings };
      localStorage.setItem(DODGE_MAPPINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getLookupLabel = (type: 'primaryStage' | 'primaryProjectType' | 'ownershipType', id: string): string => {
    const list = type === 'primaryStage' ? primaryStages : type === 'primaryProjectType' ? primaryProjectTypes : ownershipTypes;
    return list.find(item => item.id === id)?.label || id;
  };

  const getSalesRepName = (id: number): string => {
    const rep = salesReps.find(r => r.salesrepid === id);
    return rep ? `${rep.lastname}, ${rep.firstname}` : 'Unknown';
  };

  const getSalesRepNames = (ids: number[]): string => {
    return ids.map(id => getSalesRepName(id)).join('; ');
  };

  const getUserName = (id: number): string => {
    const user = users.find(u => u.id === id);
    return user ? `${user.lastName}, ${user.firstName}` : 'Unknown';
  };

  const getUserNames = (ids: number[]): string => {
    return ids.map(id => getUserName(id)).join('; ');
  };

  const getStageName = (id: number): string => {
    const stage = opportunityStages.find(s => s.stageid === id);
    return stage ? stage.stagename : 'Unknown';
  };

  const getStage = (id: number): OpportunityStage | undefined => {
    return opportunityStages.find(s => s.stageid === id);
  };

  const getTypeName = (typeId: number): string => {
    const type = opportunityTypes.find(t => t.opptypeid === typeId);
    return type ? type.opptypedesc : 'Unknown';
  };

  const calculateProjectRevenue = (project: Project): number => {
    return project.associatedOpportunities.reduce((sum, opp) => sum + opp.revenue, 0);
  };

  const getCompanyById = (companyId: string): ProjectCompany | undefined => {
    for (const project of projects) {
      const company = project.projectCompanies.find(c => c.companyId === companyId);
      if (company) return company;
    }
    return undefined;
  };

  const getAllKnownCompanies = (): ProjectCompany[] => {
    const seen = new Set<string>();
    const result: ProjectCompany[] = [];
    for (const project of projects) {
      for (const company of project.projectCompanies) {
        const key = company.companyId;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(company);
        }
      }
    }
    return result.sort((a, b) => a.companyName.localeCompare(b.companyName));
  };

  const getFilteredProjects = (): Project[] => {
    return projects.filter(project => {
      if (filters.hideCompleted && project.statusId === 'Completed') return false;
      if (filters.assigneeIds.length > 0 && !project.assigneeIds.some(id => filters.assigneeIds.includes(id.toString()))) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(project.statusId)) return false;
      if (filters.divisions.length > 0) {
        const projectOpps = project.associatedOpportunities
          .map(ao => opportunities.find(o => o.id === ao.id))
          .filter(Boolean) as Opportunity[];
        const division = projectOpps.length > 0 ? projectOpps[0].divisionId : 'E';
        if (!filters.divisions.includes(division)) return false;
      }
      if (filters.generalContractor) {
        const hasMatchingGC = project.projectCompanies.some(
          company => company.roleId === 'GC' && company.companyName.toLowerCase().includes(filters.generalContractor.toLowerCase())
        );
        if (!hasMatchingGC) return false;
      }
      return true;
    });
  };

  const getTotalPipelineRevenue = (): number => {
    const filteredProjects = getFilteredProjects();
    return filteredProjects.reduce((total, project) => total + calculateProjectRevenue(project), 0);
  };

  const getRevenueByType = (): { typeId: number; typeName: string; revenue: number }[] => {
    const filteredProjects = getFilteredProjects();
    const revenueMap = new Map<number, number>();
    filteredProjects.forEach(project => {
      project.associatedOpportunities.forEach(ao => {
        const opp = opportunities.find(o => o.id === ao.id);
        if (opp) revenueMap.set(opp.typeId, (revenueMap.get(opp.typeId) || 0) + ao.revenue);
      });
    });
    return Array.from(revenueMap.entries())
      .filter(([, revenue]) => revenue > 0)
      .map(([typeId, revenue]) => {
        const type = opportunityTypes.find(t => t.opptypeid === typeId);
        return { typeId, typeName: type ? type.opptypedesc : 'Unknown', revenue, displayOrder: type ? type.displayorder : 999 };
      })
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
      .map(({ typeId, typeName, revenue }) => ({ typeId, typeName, revenue }));
  };

  const addOpportunityToProject = (projectId: number, opportunityId: number) => {
    const opp = opportunities.find(o => o.id === opportunityId);
    setProjects(prev => 
      prev.map(project => {
        if (project.id === projectId) {
          if (opp && !project.associatedOpportunities.find(ao => ao.id === opportunityId)) {
            return {
              ...project,
              associatedOpportunities: [
                ...project.associatedOpportunities,
                { id: opp.id, type: opp.typeId === 1 ? 'Sale' : 'Rental', description: opp.description, stageId: opp.stageId, revenue: opp.estimateRevenue }
              ]
            };
          }
        }
        return project;
      })
    );
    if (opp) logChange(projectId, 'OPPORTUNITY_ASSOCIATED', 'Opportunity', `Opportunity "${opp.description}" associated`);
  };

  const createNewOpportunity = (opportunity: Opportunity) => {
    setOpportunities(prev => [...prev, opportunity]);
    setProjects(prev => 
      prev.map(project => {
        if (project.id === opportunity.projectId) {
          return {
            ...project,
            associatedOpportunities: [
              ...project.associatedOpportunities,
              { id: opportunity.id, type: opportunity.typeId === 1 ? 'Sale' : 'Rental', description: opportunity.description, stageId: opportunity.stageId, revenue: opportunity.estimateRevenue }
            ]
          };
        }
        return project;
      })
    );
    logChange(opportunity.projectId, 'OPPORTUNITY_CREATED', 'Opportunity', `Opportunity "${opportunity.description}" created`);
  };

  const updateOpportunity = (opportunityId: number, updates: Partial<Opportunity>) => {
    const existing = opportunities.find(o => o.id === opportunityId);
    setOpportunities(prev => prev.map(opp => opp.id === opportunityId ? { ...opp, ...updates } : opp));
    if (existing) {
      const changedFields = Object.keys(updates).filter(k => (updates as any)[k] !== (existing as any)[k]);
      logChange(existing.projectId, 'OPPORTUNITY_UPDATED', 'Opportunity', `Opportunity "${existing.description}" updated (${changedFields.join(', ')})`);
    }
  };

  const addProjectCompany = (projectId: number, company: any) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          return { ...project, projectCompanies: [...project.projectCompanies, company] };
        }
        return project;
      })
    );
    logChange(projectId, 'COMPANY_ADDED', 'Company', `Company "${company.companyName}" added as ${company.roleDescription || company.roleId}`);
  };

  const removeProjectCompany = (projectId: number, companyName: string) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          return { ...project, projectCompanies: project.projectCompanies.filter(c => c.companyName !== companyName) };
        }
        return project;
      })
    );
    logChange(projectId, 'COMPANY_REMOVED', 'Company', `Company "${companyName}" disassociated`);
  };

  const updateProjectCompany = (projectId: number, oldCompanyName: string, updatedCompany: any) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          return { ...project, projectCompanies: project.projectCompanies.map(c => c.companyName === oldCompanyName ? updatedCompany : c) };
        }
        return project;
      })
    );
    logChange(projectId, 'COMPANY_UPDATED', 'Company', `Company "${updatedCompany.companyName}" updated`);
  };

  const updateProject = (projectId: number, updates: Partial<Project>) => {
    setProjects(prev => {
      const existing = prev.find(p => p.id === projectId);
      if (existing) {
        const changedFields = Object.keys(updates).filter(k => JSON.stringify((updates as any)[k]) !== JSON.stringify((existing as any)[k]));
        if (changedFields.length > 0) {
          logChange(projectId, 'PROJECT_UPDATED', 'Project', `Project details updated (${changedFields.join(', ')})`);
        }
      }
      return prev.map(project => project.id === projectId ? { ...project, ...updates } : project);
    });
  };

  const createProject = (project: Omit<Project, 'id'>) => {
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    const newProject: Project = { ...project, id: newId };
    setProjects(prev => [...prev, newProject]);
    logChange(newId, 'PROJECT_CREATED', 'Project', `Project "${project.name}" created`);
  };

  const addActivity = (projectId: number, activity: Omit<Activity, 'id'>) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          const maxActivityId = Math.max(...project.activities.map(a => a.id), 0);
          const newActivity: Activity = { ...activity, id: maxActivityId + 1 };
          return { ...project, activities: [...project.activities, newActivity] };
        }
        return project;
      })
    );
    logChange(projectId, 'ACTIVITY_ADDED', 'Activity', `Activity "${activity.typeId}" added`);
  };

  const updateActivity = (projectId: number, activityId: number, updates: Partial<Activity>) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          return { ...project, activities: project.activities.map(a => a.id === activityId ? { ...a, ...updates } : a) };
        }
        return project;
      })
    );
    logChange(projectId, 'ACTIVITY_UPDATED', 'Activity', `Activity updated`);
  };

  const deleteActivity = (projectId: number, activityId: number) => {
    let desc = '';
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          const act = project.activities.find(a => a.id === activityId);
          if (act) desc = act.typeId;
          return { ...project, activities: project.activities.filter(a => a.id !== activityId) };
        }
        return project;
      })
    );
    logChange(projectId, 'ACTIVITY_DELETED', 'Activity', `Activity "${desc}" deleted`);
  };

  const addNote = (projectId: number, noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          const maxNoteId = Math.max(...(project.notes || []).map(n => n.id), 0);
          const newNote: Note = {
            ...noteData,
            id: maxNoteId + 1,
            createdAt: new Date().toISOString(),
            createdById: currentUserIdRef.current,
          };
          return { ...project, notes: [...(project.notes || []), newNote] };
        }
        return project;
      })
    );
    logChange(projectId, 'NOTE_ADDED', 'Note', `Note added`);
  };

  const updateNote = (projectId: number, noteId: number, updates: Partial<Note>) => {
    const now = new Date().toISOString();
    const userId = currentUserIdRef.current;

    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            notes: (project.notes || []).map(note => {
              if (note.id !== noteId) return note;

              const changes: string[] = [];
              if (updates.content !== undefined && updates.content !== note.content) changes.push('Content updated');
              if (updates.tagIds !== undefined && JSON.stringify(updates.tagIds) !== JSON.stringify(note.tagIds)) changes.push('Tags changed');
              if (updates.attachments !== undefined && JSON.stringify(updates.attachments) !== JSON.stringify(note.attachments)) changes.push('Attachments changed');
              const summary = changes.length > 0 ? changes.join(', ') : 'Note updated';

              const modification: any = { modifiedAt: now, modifiedById: userId, summary };
              if (updates.content !== undefined && updates.content !== note.content) {
                modification.previousContent = note.content;
              }
              if (updates.tagIds !== undefined && JSON.stringify(updates.tagIds) !== JSON.stringify(note.tagIds)) {
                modification.previousTagIds = note.tagIds;
              }
              const history = [...(note.modificationHistory || []), modification];

              return {
                ...note,
                ...updates,
                lastModifiedAt: now,
                lastModifiedById: userId,
                modificationHistory: history,
              };
            }),
          };
        }
        return project;
      })
    );
    logChange(projectId, 'NOTE_UPDATED', 'Note', `Note updated`);
  };

  const deleteNote = (projectId: number, noteId: number) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          return { ...project, notes: (project.notes || []).filter(note => note.id !== noteId) };
        }
        return project;
      })
    );
    logChange(projectId, 'NOTE_DELETED', 'Note', `Note deleted`);
  };

  const masterEquipment = companyEquipmentData as CustomerEquipment[];

  const getEquipmentById = useCallback((id: number): CustomerEquipment | undefined => {
    return masterEquipment.find(e => e.id === id);
  }, [masterEquipment]);

  const getCompanyEquipment = useCallback((companyId: string): CustomerEquipment[] => {
    return masterEquipment.filter(e => e.companyId === companyId);
  }, [masterEquipment]);

  const getEquipmentProjectAssignment = useCallback((equipmentId: number, excludeProjectId?: number): { projectId: number; projectName: string } | null => {
    for (const p of projects) {
      if (excludeProjectId !== undefined && p.id === excludeProjectId) continue;
      if (p.customerEquipment.includes(equipmentId)) {
        return { projectId: p.id, projectName: p.name };
      }
    }
    return null;
  }, [projects]);

  const addCustomerEquipment = (projectId: number, equipmentId: number) => {
    const eq = getEquipmentById(equipmentId);
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          if (project.customerEquipment.includes(equipmentId)) return project;
          return { ...project, customerEquipment: [...project.customerEquipment, equipmentId] };
        }
        return project;
      })
    );
    logChange(projectId, 'EQUIPMENT_ADDED', 'Equipment', `Equipment "${eq ? `${eq.make} ${eq.model}` : equipmentId}" added`);
  };

  const deleteCustomerEquipment = (projectId: number, equipmentId: number) => {
    const eq = getEquipmentById(equipmentId);
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          return { ...project, customerEquipment: project.customerEquipment.filter(id => id !== equipmentId) };
        }
        return project;
      })
    );
    logChange(projectId, 'EQUIPMENT_DELETED', 'Equipment', `Equipment "${eq ? `${eq.make} ${eq.model}` : equipmentId}" removed`);
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        salesReps,
        users,
        opportunities,
        opportunityStages,
        noteTags,
        filters,
        setFilters,
        currentUserId,
        setCurrentUserId,
        getChangeLog,
        addOpportunityToProject,
        createNewOpportunity,
        updateOpportunity,
        createProject,
        addProjectCompany,
        removeProjectCompany,
        updateProjectCompany,
        updateProject,
        addActivity,
        updateActivity,
        deleteActivity,
        addNote,
        updateNote,
        deleteNote,
        companyEquipment: masterEquipment,
        getEquipmentById,
        getCompanyEquipment,
        getEquipmentProjectAssignment,
        addCustomerEquipment,
        deleteCustomerEquipment,
        setNoteTags,
        getSalesRepName,
        getSalesRepNames,
        getUserName,
        getUserNames,
        getStageName,
        getStage,
        getTypeName,
        calculateProjectRevenue,
        getFilteredProjects,
        getTotalPipelineRevenue,
        getRevenueByType,
        getCompanyById,
        getAllKnownCompanies,
        primaryStages,
        setPrimaryStages,
        primaryProjectTypes,
        setPrimaryProjectTypes,
        ownershipTypes,
        setOwnershipTypes,
        getLookupLabel,
        dodgeMappings,
        setDodgeMappings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
