import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useStatusColors, STATUS_COLORS } from '@/hooks/useStatusColors';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { OpportunityDetailModal } from '@/components/OpportunityDetailModal';
import { AssociateOpportunityModal } from '@/components/AssociateOpportunityModal';
import { CreateOpportunityModal } from '@/components/CreateOpportunityModal';

import { AssociateCompanyModal } from '@/components/AssociateCompanyModal';
import { EditProjectModal } from '@/components/EditProjectModal';

import { ActivityModal } from '@/components/ActivityModal';
import { AssociateActivityModal } from '@/components/AssociateActivityModal';
import { NotesSection } from '@/components/NotesSection';
import { ProjectCompaniesTable } from '@/components/ProjectCompaniesTable';
import { AddCustomerEquipmentModal } from '@/components/AddCustomerEquipmentModal';
import { CreateProspectModal, type ProspectData } from '@/components/CreateProspectModal';
import { Input } from '@/components/ui/input';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, MapPin, User, Phone, Mail, Building2, Plus, Link as LinkIcon, X, Pencil, Calendar, Wrench, Search, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, History, ExternalLink, CornerDownRight, Link2, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Activity, ProjectCompany, CustomerEquipment } from '@/types';

type LocationViewType = 'address' | 'coordinates';

const ProjectDetail = () => {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const { projects, getSalesRepName, getSalesRepNames, getUserName, getUserNames, opportunities, getStageName, getStage, removeProjectCompany, updateProject, deleteActivity, noteTags, addNote, updateNote, deleteNote, addCustomerEquipment, deleteCustomerEquipment, getCompanyById, getLookupLabel, getEquipmentById, addProjectCompany } = useData();
  const { statusColors, getStatusColorClasses } = useStatusColors();
  const { toast } = useToast();
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssociateCompanyModal, setShowAssociateCompanyModal] = useState(false);
  const [showRemoveCompanyDialog, setShowRemoveCompanyDialog] = useState(false);
  const [companyToRemove, setCompanyToRemove] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [locationViewType, setLocationViewType] = useState<LocationViewType>('address');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [activityModalMode, setActivityModalMode] = useState<'create' | 'edit'>('create');
  const [showDeleteActivityDialog, setShowDeleteActivityDialog] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [showAssociateActivityModal, setShowAssociateActivityModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showDeleteEquipmentDialog, setShowDeleteEquipmentDialog] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<number | null>(null);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [showUom, setShowUom] = useState(() => localStorage.getItem('showEquipmentUom') === 'true');
  const [followUpFromActivity, setFollowUpFromActivity] = useState<Activity | undefined>(undefined);
  const [showCreateProspectModal, setShowCreateProspectModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Sort state for Opportunities table
  const [oppSortColumn, setOppSortColumn] = useState<'type' | 'description' | 'division' | 'stage' | 'salesRep' | 'estClose' | 'revenue' | null>('stage');
  const [oppSortDirection, setOppSortDirection] = useState<'asc' | 'desc' | null>('asc');

  // Filter state for Opportunities table
  const [oppFilterStage, setOppFilterStage] = useState<string[]>([]);
  const [oppFilterDivision, setOppFilterDivision] = useState<string[]>([]);
  const [oppFilterType, setOppFilterType] = useState<string[]>([]);
  const [oppFilterSalesRep, setOppFilterSalesRep] = useState<string[]>([]);
  const [oppFilterCompany, setOppFilterCompany] = useState<string[]>([]);
  const [oppShowOpenOnly, setOppShowOpenOnly] = useState(true);

  // Sort state for Activities table
  const [actSortColumn, setActSortColumn] = useState<'assignee' | 'activityType' | 'date' | 'status' | 'description' | null>('date');
  const [actSortDirection, setActSortDirection] = useState<'asc' | 'desc' | null>('desc');

  // Sort state for Equipment table
  const [eqSortColumn, setEqSortColumn] = useState<'type' | 'make' | 'model' | 'year' | 'serial' | 'smu' | 'ownership' | null>(null);
  const [eqSortDirection, setEqSortDirection] = useState<'asc' | 'desc' | null>(null);

  const project = projects.find((p) => p.id === parseInt(id || '0'));

  const hasAddress = project?.address.street && project?.address.city && project?.address.state;
  const hasCoordinates = project?.address.latitude != null && project?.address.longitude != null &&
  !isNaN(project?.address.latitude) && !isNaN(project?.address.longitude);

  const defaultLocationView: LocationViewType = hasAddress ? 'address' : hasCoordinates ? 'coordinates' : 'address';

  useEffect(() => {
    if (project) {
      setLocationViewType(defaultLocationView);
    }
  }, [project?.id, defaultLocationView]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to List</Button>
        </div>
      </div>);

  }

  const handleOpportunityClick = (oppId: number) => {
    const fullOpp = opportunities.find((o) => o.id === oppId);
    if (fullOpp) {
      setSelectedOpportunity(fullOpp);
      setShowOpportunityDetail(true);
    }
  };


  const handleRemoveCompany = () => {
    if (companyToRemove) {
      removeProjectCompany(project.id, companyToRemove);
      toast({
        title: "Success",
        description: "Company removed successfully."
      });
      setCompanyToRemove(null);
      setShowRemoveCompanyDialog(false);
    }
  };

  const initiateRemoveCompany = (companyName: string) => {
    setCompanyToRemove(companyName);
    setShowRemoveCompanyDialog(true);
  };

  const statusOptions = Object.keys(statusColors);

  const handleStatusChange = (newStatus: string) => {
    updateProject(project.id, { statusId: newStatus });
    toast({
      title: "Status updated",
      description: `Project status changed to "${newStatus}".`
    });
  };

  const handleCreateActivity = () => {
    setSelectedActivity(undefined);
    setFollowUpFromActivity(undefined);
    setActivityModalMode('create');
    setShowActivityModal(true);
  };

  const handleFollowUpActivity = (activity: Activity) => {
    setSelectedActivity(undefined);
    setFollowUpFromActivity(activity);
    setActivityModalMode('create');
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setActivityModalMode('edit');
    setShowActivityModal(true);
  };

  const handleDeleteActivity = () => {
    if (activityToDelete !== null) {
      deleteActivity(project.id, activityToDelete);
      toast({
        title: "Success",
        description: "Activity deleted successfully."
      });
      setActivityToDelete(null);
      setShowDeleteActivityDialog(false);
    }
  };

  const initiateDeleteActivity = (activityId: number) => {
    setActivityToDelete(activityId);
    setShowDeleteActivityDialog(true);
  };

  const handleCreateEquipment = () => {
    setShowEquipmentModal(true);
  };

  const handleDeleteEquipment = () => {
    if (equipmentToDelete !== null) {
      deleteCustomerEquipment(project.id, equipmentToDelete);
      toast({ title: "Success", description: "Equipment removed." });
      setEquipmentToDelete(null);
      setShowDeleteEquipmentDialog(false);
    }
  };

  const handleSaveEquipment = (equipmentId: number) => {
    addCustomerEquipment(project.id, equipmentId);
    toast({ title: "Success", description: "Equipment added." });
  };

  const makeSortHandler = <T,>(
  currentCol: T | null, setCol: (c: T | null) => void,
  currentDir: 'asc' | 'desc' | null, setDir: (d: 'asc' | 'desc' | null) => void) =>
  (column: T) => {
    if (currentCol === column) {
      if (currentDir === 'asc') setDir('desc');else
      {setDir(null);setCol(null);}
    } else {setCol(column);setDir('asc');}
  };

  const handleOppSort = makeSortHandler(oppSortColumn, setOppSortColumn as (c: typeof oppSortColumn) => void, oppSortDirection, setOppSortDirection);
  const handleActSort = makeSortHandler(actSortColumn, setActSortColumn as (c: typeof actSortColumn) => void, actSortDirection, setActSortDirection);
  const handleEqSort = makeSortHandler(eqSortColumn, setEqSortColumn as (c: typeof eqSortColumn) => void, eqSortDirection, setEqSortDirection);

  const SortIcon = ({ active, direction }: {active: boolean;direction: 'asc' | 'desc' | null;}) => {
    if (!active) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />;
    if (direction === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const filteredOpportunities = project.associatedOpportunities.filter((opp) => {
    const stage = getStage(opp.stageId);
    if (oppShowOpenOnly && stage && (stage.phaseid === 3 || stage.phaseid === 4)) return false;
    if (oppFilterStage.length > 0 && !oppFilterStage.includes(String(opp.stageId))) return false;
    if (oppFilterType.length > 0 && !oppFilterType.includes(opp.type)) return false;
    const fullOpp = opportunities.find((o) => o.id === opp.id);
    if (oppFilterDivision.length > 0) {
      if (!fullOpp || !oppFilterDivision.includes(fullOpp.divisionId)) return false;
    }
    if (oppFilterSalesRep.length > 0) {
      if (!fullOpp || !oppFilterSalesRep.includes(getSalesRepName(fullOpp.salesRepId))) return false;
    }
    if (oppFilterCompany.length > 0) {
      if (!fullOpp || !oppFilterCompany.includes(fullOpp.customerName)) return false;
    }
    return true;
  });

  const uniqueStages = [...new Map(project.associatedOpportunities.map((o) => [o.stageId, getStageName(o.stageId)] as [number, string])).entries()].sort((a, b) => (a[1] as string).localeCompare(b[1] as string));
  const uniqueTypes = [...new Set(project.associatedOpportunities.map((o) => o.type))].sort();
  const uniqueDivisions = [...new Set(project.associatedOpportunities.map((o) => {
    const full = opportunities.find((f) => f.id === o.id);
    return full?.divisionId || '';
  }).filter(Boolean))].sort();
  const uniqueOppSalesReps = [...new Set(project.associatedOpportunities.map((o) => {
    const full = opportunities.find((f) => f.id === o.id);
    return full ? getSalesRepName(full.salesRepId) : '';
  }).filter(Boolean))].sort();
  const uniqueOppCompanies = [...new Set(project.associatedOpportunities.map((o) => {
    const full = opportunities.find((f) => f.id === o.id);
    return full?.customerName || '';
  }).filter(Boolean))].sort();

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (!oppSortColumn || !oppSortDirection) return 0;
    let cmp = 0;
    const fullA = opportunities.find((o) => o.id === a.id);
    const fullB = opportunities.find((o) => o.id === b.id);
    switch (oppSortColumn) {
      case 'type':cmp = (a.type || '').localeCompare(b.type || '');break;
      case 'description':cmp = (a.description || '').localeCompare(b.description || '');break;
      case 'division':cmp = (fullA?.divisionId || '').localeCompare(fullB?.divisionId || '');break;
      case 'stage':cmp = (getStage(a.stageId)?.displayorder ?? 999) - (getStage(b.stageId)?.displayorder ?? 999);break;
      case 'salesRep':cmp = getSalesRepName(fullA?.salesRepId || 0).localeCompare(getSalesRepName(fullB?.salesRepId || 0));break;
      case 'estClose':{
          const dateA = (fullA?.estimateDeliveryYear || 0) * 100 + (fullA?.estimateDeliveryMonth || 0);
          const dateB = (fullB?.estimateDeliveryYear || 0) * 100 + (fullB?.estimateDeliveryMonth || 0);
          cmp = dateA - dateB;
          break;
        }
      case 'revenue':cmp = (a.revenue || 0) - (b.revenue || 0);break;
    }
    if (cmp === 0) {
      const dateA = (fullA?.estimateDeliveryYear || 0) * 100 + (fullA?.estimateDeliveryMonth || 0);
      const dateB = (fullB?.estimateDeliveryYear || 0) * 100 + (fullB?.estimateDeliveryMonth || 0);
      cmp = dateA - dateB;
    }
    return oppSortDirection === 'asc' ? cmp : -cmp;
  });

  const sortedActivities = [...(project.activities || [])].sort((a, b) => {
    if (!actSortColumn || !actSortDirection) return 0;
    let cmp = 0;
    switch (actSortColumn) {
      case 'assignee':
        cmp = getSalesRepName(a.salesRepId).localeCompare(getSalesRepName(b.salesRepId));
        break;
      case 'activityType':
        cmp = (a.typeId || '').localeCompare(b.typeId || '');
        break;
      case 'date':
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'status':
        // Group Outstanding vs Completed (Completed is statusId === 2)
        cmp = Number(a.statusId === 2) - Number(b.statusId === 2);
        break;
      case 'description':
        cmp = (a.description || '').localeCompare(b.description || '');
        break;
    }
    return actSortDirection === 'asc' ? cmp : -cmp;
  });

  const sortEquipment = (items: CustomerEquipment[]) => {
    if (!eqSortColumn || !eqSortDirection) return items;
    return [...items].sort((a, b) => {
      let cmp = 0;
      switch (eqSortColumn) {
        case 'type':cmp = (a.equipmentType || '').localeCompare(b.equipmentType || '');break;
        case 'make':cmp = (a.make || '').localeCompare(b.make || '');break;
        case 'model':cmp = (a.model || '').localeCompare(b.model || '');break;
        case 'year':cmp = (a.year || 0) - (b.year || 0);break;
        case 'serial':cmp = (a.serialNumber || '').localeCompare(b.serialNumber || '');break;
        case 'smu':cmp = (a.smu || 0) - (b.smu || 0);break;
        case 'ownership':cmp = (a.ownershipStatus || '').localeCompare(b.ownershipStatus || '');break;
      }
      return eqSortDirection === 'asc' ? cmp : -cmp;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Select value={project.statusId} onValueChange={handleStatusChange}>
              <SelectTrigger className={`w-auto h-7 text-xs font-medium rounded-full border-0 ${getStatusColorClasses(project.statusId)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => {
                  const colorId = statusColors[status];
                  const colorConfig = STATUS_COLORS.find((c) => c.id === colorId);
                  return (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${colorConfig?.bg || 'bg-muted'}`} />
                        {status}
                      </div>
                    </SelectItem>);

                })}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">ID: {project.id}</span>
            <Button variant="outline" size="sm" onClick={() => navigate(`/project/${project.id}/changelog`)} className="ml-2">
              <History className="h-4 w-4 mr-1" />
              Change Log
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Project Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}>
                
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Location */}
              <div className="rounded-lg border bg-muted/20 p-4 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">Location</p>
                    {(hasAddress || hasCoordinates) &&
                    <div className="flex rounded-md border border-input overflow-hidden">
                        <Button
                        type="button"
                        variant={locationViewType === 'address' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-none h-7 text-xs"
                        onClick={() => setLocationViewType('address')}
                        disabled={!hasAddress}>
                          Address
                        </Button>
                        <Button
                        type="button"
                        variant={locationViewType === 'coordinates' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-none h-7 text-xs"
                        onClick={() => setLocationViewType('coordinates')}
                        disabled={!hasCoordinates}>
                          Coordinates
                        </Button>
                      </div>
                    }
                  </div>
                  {locationViewType === 'address' ?
                  hasAddress ?
                  <p className="text-sm text-muted-foreground">
                        {project.address.street}<br />
                        {project.address.city}, {project.address.state} {project.address.zipCode}<br />
                        {project.address.country}
                      </p> :
                  <p className="text-sm text-muted-foreground italic">No address available</p> :
                  hasCoordinates ?
                  <p className="text-sm text-muted-foreground">
                        Latitude: {project.address.latitude}<br />
                        Longitude: {project.address.longitude}
                      </p> :
                  <p className="text-sm text-muted-foreground italic">No coordinates available</p>
                  }
                </div>
              </div>

              {/* Column 2: Project Owner */}
              <div className="rounded-lg border bg-muted/20 p-4 flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Project Owner</p>
                  {(() => {
                    const ownerCompany = project.projectOwner?.companyId ? getCompanyById(project.projectOwner.companyId) : undefined;
                    if (!ownerCompany) return <p className="text-sm text-muted-foreground italic">No owner assigned</p>;
                    const selectedContacts = ownerCompany.companyContacts.filter((c) => project.projectOwner.contactIds.includes(c.id));
                    const isExpanded = expandedSections.has('owner');
                    const visibleContacts = isExpanded ? selectedContacts : selectedContacts.slice(0, 2);
                    const hasMore = selectedContacts.length > 2;
                    return (
                      <div>
                        <p className="text-sm font-medium">{ownerCompany.companyName}</p>
                        {selectedContacts.length > 0 ?
                        <div className="mt-2 space-y-2">
                            {visibleContacts.map((contact) =>
                          <div key={contact.id} className="text-sm">
                                <p>{contact.name}{contact.title ? ` — ${contact.title}` : ''}</p>
                                <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                                  {contact.phone &&
                              <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{contact.phone}</span>
                                    </div>
                              }
                                  {contact.email &&
                              <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                                    </div>
                              }
                                </div>
                              </div>
                          )}
                            {hasMore &&
                              <button
                                className="text-primary text-xs cursor-pointer hover:underline"
                                onClick={() => setExpandedSections(prev => {
                                  const next = new Set(prev);
                                  isExpanded ? next.delete('owner') : next.add('owner');
                                  return next;
                                })}>
                                {isExpanded ? 'Show less' : `Show ${selectedContacts.length - 2} more`}
                              </button>
                            }
                          </div> :
                        <p className="text-sm text-muted-foreground italic mt-1">No contacts selected</p>
                        }
                      </div>);
                  })()}
                </div>
              </div>

              {/* Column 3: Assignees + Description stacked */}
              <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">Assignee{project.assigneeIds.length > 1 ? 's' : ''}</p>
                    {(() => {
                      const assigneeText = getUserNames(project.assigneeIds);
                      const isExpanded = expandedSections.has('assignees');
                      const isLong = assigneeText.length > 80;
                      return (
                        <div>
                          <p className={`text-sm text-muted-foreground ${isLong && !isExpanded ? 'line-clamp-2' : ''}`}>
                            {assigneeText}
                          </p>
                          {isLong &&
                            <button
                              className="text-primary text-xs cursor-pointer hover:underline mt-1"
                              onClick={() => setExpandedSections(prev => {
                                const next = new Set(prev);
                                isExpanded ? next.delete('assignees') : next.add('assignees');
                                return next;
                              })}>
                              {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                          }
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                  <p className="font-medium mb-2">Description</p>
                  {(() => {
                    const desc = project.description || '';
                    const isExpanded = expandedSections.has('description');
                    const isLong = desc.length > 120;
                    return (
                      <div>
                        <p className={`text-sm text-muted-foreground ${isLong && !isExpanded ? 'line-clamp-3' : ''}`}>
                          {desc || <span className="italic">No description</span>}
                        </p>
                        {isLong &&
                          <button
                            className="text-primary text-xs cursor-pointer hover:underline mt-1"
                            onClick={() => setExpandedSections(prev => {
                              const next = new Set(prev);
                              isExpanded ? next.delete('description') : next.add('description');
                              return next;
                            })}>
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        }
                      </div>
                    );
                  })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">

              {/* Project Details fields */}
              {(project.valuation || project.primaryStageId || project.primaryProjectTypeId || project.ownershipTypeId || project.bidDate || project.targetStartDate || project.targetCompletionDate) &&
              <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-3">Project Details</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      {project.valuation != null &&
                    <div>
                          <span className="text-muted-foreground">Valuation</span>
                          <p className="font-medium">${Math.round(project.valuation).toLocaleString('en-US')}</p>
                        </div>
                    }
                      {project.ownershipTypeId &&
                    <div>
                          <span className="text-muted-foreground">Ownership Type</span>
                          <p className="font-medium">{getLookupLabel('ownershipType', project.ownershipTypeId)}</p>
                        </div>
                    }
                      {project.primaryStageId &&
                    <div>
                          <span className="text-muted-foreground">Primary Stage</span>
                          <p className="font-medium">{getLookupLabel('primaryStage', project.primaryStageId)}</p>
                        </div>
                    }
                      {project.primaryProjectTypeId &&
                    <div>
                          <span className="text-muted-foreground">Primary Project Type</span>
                          <p className="font-medium">{getLookupLabel('primaryProjectType', project.primaryProjectTypeId)}</p>
                        </div>
                    }
                      {project.bidDate &&
                    <div>
                          <span className="text-muted-foreground">Bid Date</span>
                          <p className="font-medium">{new Date(project.bidDate + 'T00:00:00').toLocaleDateString('en-US')}</p>
                        </div>
                    }
                      {project.targetStartDate &&
                    <div>
                          <span className="text-muted-foreground">Target Start Date</span>
                          <p className="font-medium">{new Date(project.targetStartDate + 'T00:00:00').toLocaleDateString('en-US')}</p>
                        </div>
                    }
                      {project.targetCompletionDate &&
                    <div>
                          <span className="text-muted-foreground">Target Completion Date</span>
                          <p className="font-medium">{new Date(project.targetCompletionDate + 'T00:00:00').toLocaleDateString('en-US')}</p>
                        </div>
                    }
                    </div>
                  </div>
                </>
              }

              {project.externalReference &&
              <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{project.externalReference.source}</p>
                      <a
                      href={project.externalReference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                      
                        {project.externalReference.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </>
              }
              <Separator />

              {(() => {
                const projectOpps = project.associatedOpportunities;
                const openOpps = projectOpps.filter(ao => {
                  const stage = getStage(ao.stageId);
                  return stage && (stage.phaseid === 1 || stage.phaseid === 2);
                });
                const pipelineRevenue = openOpps.reduce((sum, ao) => sum + (ao.revenue || 0), 0);
                const wonRevenue = projectOpps.reduce((sum, ao) => ao.stageId === 16 ? sum + (ao.revenue || 0) : sum, 0);
                return (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Revenue</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-sm mt-1">
                        <div>
                          <span className="text-muted-foreground">Open Leads & Opportunities</span>
                          <p className="font-medium">{openOpps.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Leads & Opportunities</span>
                          <p className="font-medium">{projectOpps.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pipeline Revenue</span>
                          <p className="font-medium">${Math.round(pipelineRevenue).toLocaleString('en-US')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Won Revenue</span>
                          <p className="font-medium">${Math.round(wonRevenue).toLocaleString('en-US')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold">Leads & Opportunities</h2>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAssociateModal(true)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Associate Existing
              </Button>
            </div>
          </div>

          {project.associatedOpportunities.length === 0 ?
          <p className="text-center text-muted-foreground py-8">
              No leads or opportunities associated with this project yet.
            </p> :

          <>
              <div className="flex gap-3 mb-4 flex-wrap">
                <MultiSelectFilter
                label="Stages"
                options={uniqueStages.map(([stageId, stageName]) => ({ value: String(stageId), label: stageName as string }))}
                selected={oppFilterStage}
                onSelectionChange={setOppFilterStage}
                className="w-[160px]" />
              
                <MultiSelectFilter
                label="Divisions"
                options={uniqueDivisions.map((d: string) => ({ value: d, label: d }))}
                selected={oppFilterDivision}
                onSelectionChange={setOppFilterDivision}
                className="w-[160px]" />
              
                <MultiSelectFilter
                label="Types"
                options={uniqueTypes.map((t: string) => ({ value: t, label: t }))}
                selected={oppFilterType}
                onSelectionChange={setOppFilterType}
                className="w-[160px]" />
              
                <MultiSelectFilter
                label="Sales Reps"
                options={uniqueOppSalesReps.map((r: string) => ({ value: r, label: r }))}
                selected={oppFilterSalesRep}
                onSelectionChange={setOppFilterSalesRep}
                className="w-[180px]" />
              
                <MultiSelectFilter
                label="Companies"
                options={uniqueOppCompanies.map((c: string) => ({ value: c, label: c }))}
                selected={oppFilterCompany}
                onSelectionChange={setOppFilterCompany}
                className="w-[180px]" />
              
                <div className="flex items-center space-x-2 ml-auto">
                  <Switch
                  id="oppShowOpenOnly"
                  checked={oppShowOpenOnly}
                  onCheckedChange={setOppShowOpenOnly} />
                
                  <Label htmlFor="oppShowOpenOnly" className="text-sm font-normal cursor-pointer">
                    Show Open Only
                  </Label>
                </div>
              </div>
              <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('type')}>
                      <div className="flex items-center">Type<SortIcon active={oppSortColumn === 'type'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('description')}>
                      <div className="flex items-center">Description<SortIcon active={oppSortColumn === 'description'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50 hidden lg:table-cell" onClick={() => handleOppSort('division')}>
                      <div className="flex items-center">Division<SortIcon active={oppSortColumn === 'division'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('stage')}>
                      <div className="flex items-center">Stage<SortIcon active={oppSortColumn === 'stage'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50 hidden lg:table-cell" onClick={() => handleOppSort('salesRep')}>
                      <div className="flex items-center">Sales Rep<SortIcon active={oppSortColumn === 'salesRep'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('estClose')}>
                      <div className="flex items-center">Est. Close<SortIcon active={oppSortColumn === 'estClose'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('revenue')}>
                      <div className="flex items-center justify-end">Est. Revenue<SortIcon active={oppSortColumn === 'revenue'} direction={oppSortDirection} /></div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOpportunities.map((opp) => {
                  const fullOpp = opportunities.find((o) => o.id === opp.id);
                  return (
                    <TableRow
                      key={opp.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOpportunityClick(opp.id)}>
                      
                        <TableCell>
                          <Badge variant="secondary">{opp.type}</Badge>
                        </TableCell>
                        <TableCell>{opp.description}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary">{fullOpp?.divisionId || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getStageName(opp.stageId)}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{fullOpp ? getSalesRepName(fullOpp.salesRepId) : '-'}</TableCell>
                        <TableCell>
                          {fullOpp?.estimateDeliveryMonth && fullOpp?.estimateDeliveryYear ?
                        `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][fullOpp.estimateDeliveryMonth - 1]} ${fullOpp.estimateDeliveryYear}` :
                        '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${opp.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </TableCell>
                      </TableRow>);

                })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold lg:hidden">Total</TableCell>
                    <TableCell colSpan={6} className="text-right font-bold hidden lg:table-cell">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      ${sortedOpportunities.reduce((sum, o) => sum + (o.revenue || 0), 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              </div>
            </>
          }
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Companies</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateProspectModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAssociateCompanyModal(true)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Associate Existing
              </Button>
            </div>
          </div>
          {project.projectCompanies.filter((c) => c.roleId !== 'OWNER').length === 0 ?
          <p className="text-center text-muted-foreground py-8">
              No companies associated with this project yet.
            </p> :

          <ProjectCompaniesTable
            projectId={project.id}
            companies={project.projectCompanies.filter((c) => c.roleId !== 'OWNER')}
            onRemoveCompany={initiateRemoveCompany} />

          }
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Activities</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssociateActivityModal(true)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Associate Existing
              </Button>
              <Button size="sm" onClick={handleCreateActivity}>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>

          {!project.activities || project.activities.length === 0 ?
          <p className="text-center text-muted-foreground py-8">
              No activities recorded for this project yet.
            </p> :

          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleActSort('assignee')}>
                    <div className="flex items-center">Assignee<SortIcon active={actSortColumn === 'assignee'} direction={actSortDirection} /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleActSort('activityType')}>
                    <div className="flex items-center">Activity Type<SortIcon active={actSortColumn === 'activityType'} direction={actSortDirection} /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleActSort('date')}>
                    <div className="flex items-center">Date<SortIcon active={actSortColumn === 'date'} direction={actSortDirection} /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleActSort('status')}>
                    <div className="flex items-center">Status<SortIcon active={actSortColumn === 'status'} direction={actSortDirection} /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleActSort('description')}>
                    <div className="flex items-center">Description<SortIcon active={actSortColumn === 'description'} direction={actSortDirection} /></div>
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {sortedActivities.map((activity) => {
                const parentActivity = activity.previousRelatedActivityId
                  ? project.activities?.find(a => a.id === activity.previousRelatedActivityId)
                  : undefined;
                return (
                <TableRow key={activity.id}>
                    <TableCell className="font-medium">{getSalesRepName(activity.salesRepId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{({E:'Email',P:'Phone',F:'Face-to-Face',Q:'Quote'} as Record<string,string>)[activity.typeId] || activity.typeId}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(activity.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={activity.statusId === 2
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }
                      >
                        {activity.statusId === 2 ? 'Completed' : 'Outstanding'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1.5">
                        {parentActivity && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Follow-up to: {parentActivity.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {activity.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {activity.statusId === 2 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleFollowUpActivity(activity)}>
                                  <CornerDownRight className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Follow up</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditActivity(activity)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => initiateDeleteActivity(activity.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
          }
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Customer Equipment</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-uom"
                  checked={showUom}
                  onCheckedChange={(checked) => {
                    setShowUom(checked);
                    localStorage.setItem('showEquipmentUom', String(checked));
                  }}
                />
                <Label htmlFor="show-uom" className="text-sm cursor-pointer">Show UOM</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCreateEquipment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
                <Button size="sm" onClick={() => setShowEquipmentModal(true)}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Associate Existing
                </Button>
              </div>
            </div>
          </div>

          {!project.customerEquipment || project.customerEquipment.length === 0 ?
          <p className="text-center text-muted-foreground py-8">
              No customer equipment recorded for this project.
            </p> :
          (() => {
            const resolvedEquipment = project.customerEquipment
              .map(id => getEquipmentById(id))
              .filter((eq): eq is CustomerEquipment => eq !== undefined);

            const searchLower = equipmentSearch.toLowerCase();
            const hasSearch = searchLower.length > 0;

            const filteredEquipment = resolvedEquipment.filter((eq) => {
              if (!hasSearch) return true;
              const companyName = project.projectCompanies.find((c) => c.companyId === eq.companyId)?.companyName || '';
              const searchStr = `${companyName} ${eq.equipmentType} ${eq.make} ${eq.model} ${eq.year || ''} ${eq.serialNumber || ''} ${eq.ownershipStatus}`.toLowerCase();
              return searchStr.includes(searchLower);
            });

            const grouped = filteredEquipment.reduce<Record<string, {companyName: string;items: CustomerEquipment[];}>>((acc, eq) => {
              if (!acc[eq.companyId]) {
                acc[eq.companyId] = {
                  companyName: project.projectCompanies.find((c) => c.companyId === eq.companyId)?.companyName || 'Unknown',
                  items: []
                };
              }
              acc[eq.companyId].items.push(eq);
              return acc;
            }, {});

            const groupEntries = Object.entries(grouped);

            return (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment..."
                    value={equipmentSearch}
                    onChange={(e) => setEquipmentSearch(e.target.value)}
                    className="pl-9" />
                  
                </div>

                {groupEntries.length === 0 ?
                <p className="text-center text-muted-foreground py-8">No equipment matches your search.</p> :

                <div className="space-y-2">
                    {groupEntries.map(([companyId, group]) =>
                  <Collapsible key={`${companyId}-${hasSearch}`} defaultOpen={true}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors [&[data-state=open]_svg.chevron]:rotate-90">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="chevron h-4 w-4 shrink-0 transition-transform duration-200" />
                            <span>{(group as {companyName: string;items: CustomerEquipment[];}).companyName}</span>
                            <Badge variant="secondary" className="ml-1">
                              {(group as {companyName: string;items: CustomerEquipment[];}).items.length} {(group as {companyName: string;items: CustomerEquipment[];}).items.length === 1 ? 'machine' : 'machines'}
                            </Badge>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleEqSort('type')}>
                                  <div className="flex items-center">Type<SortIcon active={eqSortColumn === 'type'} direction={eqSortDirection} /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleEqSort('make')}>
                                  <div className="flex items-center">Make<SortIcon active={eqSortColumn === 'make'} direction={eqSortDirection} /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleEqSort('model')}>
                                  <div className="flex items-center">Model<SortIcon active={eqSortColumn === 'model'} direction={eqSortDirection} /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleEqSort('year')}>
                                  <div className="flex items-center">Year<SortIcon active={eqSortColumn === 'year'} direction={eqSortDirection} /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleEqSort('serial')}>
                                  <div className="flex items-center">Serial #<SortIcon active={eqSortColumn === 'serial'} direction={eqSortDirection} /></div>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleEqSort('smu')}>
                                  <div className="flex items-center justify-end">SMU<SortIcon active={eqSortColumn === 'smu'} direction={eqSortDirection} /></div>
                                </TableHead>
                                {showUom && (
                                  <TableHead>UOM</TableHead>
                                )}
                                <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleEqSort('ownership')}>
                                  <div className="flex items-center">Ownership<SortIcon active={eqSortColumn === 'ownership'} direction={eqSortDirection} /></div>
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortEquipment((group as {companyName: string;items: CustomerEquipment[];}).items).map((eq) =>
                          <TableRow key={eq.id}>
                                  <TableCell>{eq.equipmentType}</TableCell>
                                  <TableCell>{eq.make}</TableCell>
                                  <TableCell>{eq.model}</TableCell>
                                  <TableCell>{eq.year || '—'}</TableCell>
                                  <TableCell className="font-mono text-sm">{eq.serialNumber || '—'}</TableCell>
                                  <TableCell className="text-right">{eq.smu?.toLocaleString() || '—'}</TableCell>
                                  {showUom && (
                                    <TableCell>{eq.uom ? getLookupLabel('uomTypes', eq.uom) : '—'}</TableCell>
                                  )}
                                  <TableCell>
                                    <Badge variant={eq.ownershipStatus === 'owned' ? 'default' : 'secondary'}>
                                      {eq.ownershipStatus === 'owned' ? 'Owned' : 'Rented'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {setEquipmentToDelete(eq.id);setShowDeleteEquipmentDialog(true);}}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                          )}
                            </TableBody>
                          </Table>
                        </CollapsibleContent>
                      </Collapsible>
                  )}
                  </div>
                }
              </>);

          })()}
        </Card>
        <NotesSection
          notes={project.notes || []}
          noteTags={noteTags}
          onAddNote={(noteData) => addNote(project.id, noteData)}
          onUpdateNote={(noteId, noteData) => updateNote(project.id, noteId, noteData)}
          onDeleteNote={(noteId) => deleteNote(project.id, noteId)}
          getSalesRepName={getUserName}
          projectId={project.id} />
        
      </main>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        open={showOpportunityDetail}
        onOpenChange={setShowOpportunityDetail} />
      

      <AssociateOpportunityModal
        projectId={project.id}
        currentOpportunityIds={project.associatedOpportunities.map((o) => o.id)}
        open={showAssociateModal}
        onOpenChange={setShowAssociateModal} />
      

      <CreateOpportunityModal
        projectId={project.id}
        open={showCreateModal}
        onOpenChange={setShowCreateModal} />
      


      <AssociateCompanyModal
        projectId={project.id}
        currentCompanyNames={project.projectCompanies.map((c) => c.companyName)}
        open={showAssociateCompanyModal}
        onOpenChange={setShowAssociateCompanyModal} />
      
      <CreateProspectModal
        open={showCreateProspectModal}
        onOpenChange={setShowCreateProspectModal}
        onSave={(data: ProspectData) => {
          const companyId = `PROSPECT-${Date.now()}`;
          addProjectCompany(project.id, {
            companyId,
            companyName: data.companyName,
            roleId: 'PROSPECT',
            roleDescription: 'Prospect',
            isPrimaryContact: false,
            divisionIds: data.divisionIds,
            companyContacts: [{
              id: 1,
              name: `${data.contact.firstName} ${data.contact.lastName}`,
              title: data.contact.title,
              phone: data.contact.mobilePhone,
              email: data.contact.email,
            }],
          });
        }}
      />


      <AlertDialog open={showRemoveCompanyDialog} onOpenChange={setShowRemoveCompanyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Company?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {companyToRemove} from this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveCompany}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditProjectModal
        project={project}
        open={showEditModal}
        onOpenChange={setShowEditModal} />
      


      <ActivityModal
        open={showActivityModal}
        onOpenChange={setShowActivityModal}
        projectId={project.id}
        activity={selectedActivity}
        mode={activityModalMode}
        followUpFrom={followUpFromActivity} />
      

      <AlertDialog open={showDeleteActivityDialog} onOpenChange={setShowDeleteActivityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActivity}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AssociateActivityModal
        projectId={project.id}
        currentActivityIds={project.activities?.map((a) => a.id) || []}
        open={showAssociateActivityModal}
        onOpenChange={setShowAssociateActivityModal} />
      

      <AddCustomerEquipmentModal
        open={showEquipmentModal}
        onOpenChange={setShowEquipmentModal}
        onSave={handleSaveEquipment}
        projectId={project.id}
        projectCompanies={project.projectCompanies}
        existingEquipmentIds={project.customerEquipment} />
      

      <AlertDialog open={showDeleteEquipmentDialog} onOpenChange={setShowDeleteEquipmentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Equipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the equipment record from this project. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEquipment}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);

};

export default ProjectDetail;