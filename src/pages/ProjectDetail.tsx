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
import { AddGCModal } from '@/components/AddGCModal';
import { AssociateCompanyModal } from '@/components/AssociateCompanyModal';
import { EditProjectModal } from '@/components/EditProjectModal';
import { EditGCModal } from '@/components/EditGCModal';
import { ActivityModal } from '@/components/ActivityModal';
import { AssociateActivityModal } from '@/components/AssociateActivityModal';
import { NotesSection } from '@/components/NotesSection';
import { ProjectCompaniesTable } from '@/components/ProjectCompaniesTable';
import { AddCustomerEquipmentModal } from '@/components/AddCustomerEquipmentModal';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ArrowLeft, MapPin, User, Phone, Mail, Building2, Plus, Link as LinkIcon, X, Pencil, Calendar, Wrench, Search, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Activity, ProjectCompany, CustomerEquipment } from '@/types';

type LocationViewType = 'address' | 'coordinates';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, getSalesRepName, getSalesRepNames, opportunities, getStageName, getStage, removeProjectCompany, updateProject, deleteActivity, noteTags, addNote, updateNote, deleteNote, addCustomerEquipment, updateCustomerEquipment, deleteCustomerEquipment } = useData();
  const { statusColors, getStatusColorClasses } = useStatusColors();
  const { toast } = useToast();
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddGCModal, setShowAddGCModal] = useState(false);
  const [showRemoveGCDialog, setShowRemoveGCDialog] = useState(false);
  const [showAssociateCompanyModal, setShowAssociateCompanyModal] = useState(false);
  const [showRemoveCompanyDialog, setShowRemoveCompanyDialog] = useState(false);
  const [companyToRemove, setCompanyToRemove] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditGCModal, setShowEditGCModal] = useState(false);
  const [locationViewType, setLocationViewType] = useState<LocationViewType>('address');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [activityModalMode, setActivityModalMode] = useState<'create' | 'edit'>('create');
  const [showDeleteActivityDialog, setShowDeleteActivityDialog] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [showAssociateActivityModal, setShowAssociateActivityModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<CustomerEquipment | undefined>(undefined);
  const [equipmentModalMode, setEquipmentModalMode] = useState<'create' | 'edit'>('create');
  const [showDeleteEquipmentDialog, setShowDeleteEquipmentDialog] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<number | null>(null);
  const [equipmentSearch, setEquipmentSearch] = useState('');

  // Sort state for Opportunities table
  const [oppSortColumn, setOppSortColumn] = useState<'type' | 'description' | 'division' | 'stage' | 'salesRep' | 'estClose' | 'revenue' | null>('stage');
  const [oppSortDirection, setOppSortDirection] = useState<'asc' | 'desc' | null>('asc');

  // Filter state for Opportunities table
  const [oppFilterStage, setOppFilterStage] = useState('all');
  const [oppFilterDivision, setOppFilterDivision] = useState('all');
  const [oppFilterType, setOppFilterType] = useState('all');
  const [oppFilterSalesRep, setOppFilterSalesRep] = useState('all');
  const [oppFilterCompany, setOppFilterCompany] = useState('all');
  const [oppShowOpenOnly, setOppShowOpenOnly] = useState(true);

  // Sort state for Activities table
  const [actSortColumn, setActSortColumn] = useState<'assignee' | 'activityType' | 'date' | 'description' | null>('date');
  const [actSortDirection, setActSortDirection] = useState<'asc' | 'desc' | null>('desc');

  // Sort state for Equipment table
  const [eqSortColumn, setEqSortColumn] = useState<'type' | 'make' | 'model' | 'year' | 'serial' | 'hours' | null>(null);
  const [eqSortDirection, setEqSortDirection] = useState<'asc' | 'desc' | null>(null);

  const project = projects.find(p => p.id === parseInt(id || '0'));

  const hasAddress = project?.address.street && project?.address.city && project?.address.state;
  const hasCoordinates = project?.address.latitude != null && project?.address.longitude != null && 
    !isNaN(project?.address.latitude) && !isNaN(project?.address.longitude);
  
  const defaultLocationView: LocationViewType = hasAddress ? 'address' : (hasCoordinates ? 'coordinates' : 'address');
  
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
      </div>
    );
  }

  const handleOpportunityClick = (oppId: number) => {
    const fullOpp = opportunities.find(o => o.id === oppId);
    if (fullOpp) {
      setSelectedOpportunity(fullOpp);
      setShowOpportunityDetail(true);
    }
  };

  const primaryGC = project.projectCompanies.find(c => c.roleId === 'GC' && c.isPrimaryContact);

  const handleRemoveGC = () => {
    if (primaryGC) {
      removeProjectCompany(project.id, primaryGC.companyName);
      toast({
        title: "Success",
        description: "General Contractor removed successfully."
      });
      setShowRemoveGCDialog(false);
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
    setSelectedEquipment(undefined);
    setEquipmentModalMode('create');
    setShowEquipmentModal(true);
  };

  const handleEditEquipment = (eq: CustomerEquipment) => {
    setSelectedEquipment(eq);
    setEquipmentModalMode('edit');
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

  const handleSaveEquipment = (data: Omit<CustomerEquipment, 'id'>) => {
    if (equipmentModalMode === 'edit' && selectedEquipment) {
      updateCustomerEquipment(project.id, selectedEquipment.id, data);
      toast({ title: "Success", description: "Equipment updated." });
    } else {
      addCustomerEquipment(project.id, data);
      toast({ title: "Success", description: "Equipment added." });
    }
  };

  const makeSortHandler = <T,>(
    currentCol: T | null, setCol: (c: T | null) => void,
    currentDir: 'asc' | 'desc' | null, setDir: (d: 'asc' | 'desc' | null) => void
  ) => (column: T) => {
    if (currentCol === column) {
      if (currentDir === 'asc') setDir('desc');
      else { setDir(null); setCol(null); }
    } else { setCol(column); setDir('asc'); }
  };

  const handleOppSort = makeSortHandler(oppSortColumn, setOppSortColumn as (c: typeof oppSortColumn) => void, oppSortDirection, setOppSortDirection);
  const handleActSort = makeSortHandler(actSortColumn, setActSortColumn as (c: typeof actSortColumn) => void, actSortDirection, setActSortDirection);
  const handleEqSort = makeSortHandler(eqSortColumn, setEqSortColumn as (c: typeof eqSortColumn) => void, eqSortDirection, setEqSortDirection);

  const SortIcon = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' | null }) => {
    if (!active) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />;
    if (direction === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const filteredOpportunities = project.associatedOpportunities.filter(opp => {
    const stage = getStage(opp.stageId);
    if (oppShowOpenOnly && stage && (stage.phaseid === 3 || stage.phaseid === 4)) return false;
    if (oppFilterStage !== 'all' && opp.stageId !== Number(oppFilterStage)) return false;
    if (oppFilterType !== 'all' && opp.type !== oppFilterType) return false;
    const fullOpp = opportunities.find(o => o.id === opp.id);
    if (oppFilterDivision !== 'all') {
      if (fullOpp?.divisionId !== oppFilterDivision) return false;
    }
    if (oppFilterSalesRep !== 'all') {
      if (!fullOpp || getSalesRepName(fullOpp.salesRepId) !== oppFilterSalesRep) return false;
    }
    if (oppFilterCompany !== 'all') {
      if (!fullOpp || fullOpp.customerName !== oppFilterCompany) return false;
    }
    return true;
  });

  const uniqueStages = [...new Map(project.associatedOpportunities.map(o => [o.stageId, getStageName(o.stageId)] as [number, string])).entries()].sort((a, b) => (a[1] as string).localeCompare(b[1] as string));
  const uniqueTypes = [...new Set(project.associatedOpportunities.map(o => o.type))].sort();
  const uniqueDivisions = [...new Set(project.associatedOpportunities.map(o => {
    const full = opportunities.find(f => f.id === o.id);
    return full?.divisionId || '';
  }).filter(Boolean))].sort();
  const uniqueOppSalesReps = [...new Set(project.associatedOpportunities.map(o => {
    const full = opportunities.find(f => f.id === o.id);
    return full ? getSalesRepName(full.salesRepId) : '';
  }).filter(Boolean))].sort();
  const uniqueOppCompanies = [...new Set(project.associatedOpportunities.map(o => {
    const full = opportunities.find(f => f.id === o.id);
    return full?.customerName || '';
  }).filter(Boolean))].sort();

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (!oppSortColumn || !oppSortDirection) return 0;
    let cmp = 0;
    const fullA = opportunities.find(o => o.id === a.id);
    const fullB = opportunities.find(o => o.id === b.id);
    switch (oppSortColumn) {
      case 'type': cmp = (a.type || '').localeCompare(b.type || ''); break;
      case 'description': cmp = (a.description || '').localeCompare(b.description || ''); break;
      case 'division': cmp = (fullA?.divisionId || '').localeCompare(fullB?.divisionId || ''); break;
      case 'stage': cmp = (getStage(a.stageId)?.displayorder ?? 999) - (getStage(b.stageId)?.displayorder ?? 999); break;
      case 'salesRep': cmp = getSalesRepName(fullA?.salesRepId || 0).localeCompare(getSalesRepName(fullB?.salesRepId || 0)); break;
      case 'estClose': {
        const dateA = (fullA?.estimateDeliveryYear || 0) * 100 + (fullA?.estimateDeliveryMonth || 0);
        const dateB = (fullB?.estimateDeliveryYear || 0) * 100 + (fullB?.estimateDeliveryMonth || 0);
        cmp = dateA - dateB;
        break;
      }
      case 'revenue': cmp = (a.revenue || 0) - (b.revenue || 0); break;
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
      case 'assignee': cmp = getSalesRepName(a.assigneeId).localeCompare(getSalesRepName(b.assigneeId)); break;
      case 'activityType': cmp = (a.activityType || '').localeCompare(b.activityType || ''); break;
      case 'date': cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
      case 'description': cmp = (a.description || '').localeCompare(b.description || ''); break;
    }
    return actSortDirection === 'asc' ? cmp : -cmp;
  });

  const sortEquipment = (items: CustomerEquipment[]) => {
    if (!eqSortColumn || !eqSortDirection) return items;
    return [...items].sort((a, b) => {
      let cmp = 0;
      switch (eqSortColumn) {
        case 'type': cmp = (a.equipmentType || '').localeCompare(b.equipmentType || ''); break;
        case 'make': cmp = (a.make || '').localeCompare(b.make || ''); break;
        case 'model': cmp = (a.model || '').localeCompare(b.model || ''); break;
        case 'year': cmp = (a.year || 0) - (b.year || 0); break;
        case 'serial': cmp = (a.serialNumber || '').localeCompare(b.serialNumber || ''); break;
        case 'hours': cmp = (a.hours || 0) - (b.hours || 0); break;
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
                {statusOptions.map(status => {
                  const colorId = statusColors[status];
                  const colorConfig = STATUS_COLORS.find(c => c.id === colorId);
                  return (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${colorConfig?.bg || 'bg-muted'}`} />
                        {status}
                      </div>
                    </SelectItem>
                  );
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Project Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">Location</p>
                    {(hasAddress || hasCoordinates) && (
                      <div className="flex rounded-md border border-input overflow-hidden">
                        <Button
                          type="button"
                          variant={locationViewType === 'address' ? 'default' : 'ghost'}
                          size="sm"
                          className="rounded-none h-7 text-xs"
                          onClick={() => setLocationViewType('address')}
                          disabled={!hasAddress}
                        >
                          Address
                        </Button>
                        <Button
                          type="button"
                          variant={locationViewType === 'coordinates' ? 'default' : 'ghost'}
                          size="sm"
                          className="rounded-none h-7 text-xs"
                          onClick={() => setLocationViewType('coordinates')}
                          disabled={!hasCoordinates}
                        >
                          Coordinates
                        </Button>
                      </div>
                    )}
                  </div>
                  {locationViewType === 'address' ? (
                    hasAddress ? (
                      <p className="text-sm text-muted-foreground">
                        {project.address.street}<br />
                        {project.address.city}, {project.address.state} {project.address.zipCode}<br />
                        {project.address.country}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No address available</p>
                    )
                  ) : (
                    hasCoordinates ? (
                      <p className="text-sm text-muted-foreground">
                        Latitude: {project.address.latitude}<br />
                        Longitude: {project.address.longitude}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No coordinates available</p>
                    )
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Primary Contact</p>
                  <p className="text-sm">{project.projectPrimaryContact.name}</p>
                  <p className="text-sm text-muted-foreground">{project.projectPrimaryContact.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{project.projectPrimaryContact.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${project.projectPrimaryContact.email}`} className="text-primary hover:underline">
                        {project.projectPrimaryContact.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Sales Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                <span className="text-muted-foreground">Sales Rep{project.salesRepIds.length > 1 ? 's' : ''}</span>
                  <p className="font-medium">{getSalesRepNames(project.salesRepIds)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Planned Annual Rate</span>
                  <p className="font-medium">{project.plannedAnnualRate} sales activities/year</p>
                </div>
                <div>
                  <span className="text-muted-foreground">PAR Start Date</span>
                  <p className="font-medium">{project.parStartDate ? new Date(project.parStartDate).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Opportunities</span>
                  <p className="font-medium">{project.associatedOpportunities.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <h3 className="font-semibold">General Contractor</h3>
                </div>
                {primaryGC && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowEditGCModal(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowRemoveGCDialog(true)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {primaryGC ? (
                (() => {
                  const gcPrimaryContact = primaryGC.companyContacts?.[primaryGC.primaryContactIndex || 0];
                  const gcContactCount = primaryGC.companyContacts?.length || 0;
                  return (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{primaryGC.companyName}</p>
                      {gcPrimaryContact && (
                        <>
                          <p className="text-muted-foreground">{gcPrimaryContact.name}</p>
                          {gcPrimaryContact.title && <p className="text-muted-foreground">{gcPrimaryContact.title}</p>}
                          <div className="pt-2 space-y-1">
                            {gcPrimaryContact.phone && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{gcPrimaryContact.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${gcPrimaryContact.email}`} className="text-primary hover:underline">
                                {gcPrimaryContact.email}
                              </a>
                            </div>
                          </div>
                          {gcContactCount > 1 && (
                            <p className="text-xs text-muted-foreground pt-1">
                              + {gcContactCount - 1} more contact{gcContactCount > 2 ? 's' : ''}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No general contractor assigned</p>
                  <Button size="sm" onClick={() => setShowAddGCModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add GC
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Opportunities</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAssociateModal(true)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Associate Existing
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>

          {project.associatedOpportunities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No opportunities associated with this project yet.
            </p>
          ) : (
            <>
              <div className="flex gap-3 mb-4 flex-wrap">
                <Select value={oppFilterStage} onValueChange={setOppFilterStage}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {uniqueStages.map(([stageId, stageName]) => (
                      <SelectItem key={stageId as number} value={String(stageId)}>{stageName as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={oppFilterDivision} onValueChange={setOppFilterDivision}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {uniqueDivisions.map((d: string) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={oppFilterType} onValueChange={setOppFilterType}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map((t: string) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
                <Select value={oppFilterSalesRep} onValueChange={setOppFilterSalesRep}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sales Rep" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sales Reps</SelectItem>
                    {uniqueOppSalesReps.map((r: string) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={oppFilterCompany} onValueChange={setOppFilterCompany}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {uniqueOppCompanies.map((c: string) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2 ml-auto">
                  <Switch
                    id="oppShowOpenOnly"
                    checked={oppShowOpenOnly}
                    onCheckedChange={setOppShowOpenOnly}
                  />
                  <Label htmlFor="oppShowOpenOnly" className="text-sm font-normal cursor-pointer">
                    Show Open Only
                  </Label>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('type')}>
                      <div className="flex items-center">Type<SortIcon active={oppSortColumn === 'type'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('description')}>
                      <div className="flex items-center">Description<SortIcon active={oppSortColumn === 'description'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('division')}>
                      <div className="flex items-center">Division<SortIcon active={oppSortColumn === 'division'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('stage')}>
                      <div className="flex items-center">Stage<SortIcon active={oppSortColumn === 'stage'} direction={oppSortDirection} /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleOppSort('salesRep')}>
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
                  {sortedOpportunities.map(opp => {
                    const fullOpp = opportunities.find(o => o.id === opp.id);
                    return (
                      <TableRow 
                        key={opp.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleOpportunityClick(opp.id)}
                      >
                        <TableCell>
                          <Badge variant="secondary">{opp.type}</Badge>
                        </TableCell>
                        <TableCell>{opp.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{fullOpp?.divisionId || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getStageName(opp.stageId)}</Badge>
                        </TableCell>
                        <TableCell>{fullOpp ? getSalesRepName(fullOpp.salesRepId) : '-'}</TableCell>
                        <TableCell>
                          {fullOpp?.estimateDeliveryMonth && fullOpp?.estimateDeliveryYear
                            ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][fullOpp.estimateDeliveryMonth - 1]} ${fullOpp.estimateDeliveryYear}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${opp.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      ${sortedOpportunities.reduce((sum, o) => sum + (o.revenue || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Subcontractors & Companies</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAssociateCompanyModal(true)}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Associate Existing
            </Button>
          </div>
          {project.projectCompanies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No companies associated with this project yet.
            </p>
          ) : (
            <ProjectCompaniesTable
              projectId={project.id}
              companies={project.projectCompanies}
              onRemoveCompany={initiateRemoveCompany}
            />
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Activities</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAssociateActivityModal(true)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Associate Existing
              </Button>
              <Button size="sm" onClick={handleCreateActivity}>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>

          {(!project.activities || project.activities.length === 0) ? (
            <p className="text-center text-muted-foreground py-8">
              No activities recorded for this project yet.
            </p>
          ) : (
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
                  <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleActSort('description')}>
                    <div className="flex items-center">Description<SortIcon active={actSortColumn === 'description'} direction={actSortDirection} /></div>
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedActivities.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{getSalesRepName(activity.assigneeId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.activityType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(activity.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">{activity.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditActivity(activity)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => initiateDeleteActivity(activity.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Customer Equipment</h2>
            <Button size="sm" onClick={handleCreateEquipment}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>

          {(!project.customerEquipment || project.customerEquipment.length === 0) ? (
            <p className="text-center text-muted-foreground py-8">
              No customer equipment recorded for this project.
            </p>
          ) : (() => {
            const searchLower = equipmentSearch.toLowerCase();
            const hasSearch = searchLower.length > 0;

            const filteredEquipment = project.customerEquipment.filter(eq => {
              if (!hasSearch) return true;
              const companyName = project.projectCompanies.find(c => c.companyId === eq.companyId)?.companyName || '';
              const searchStr = `${companyName} ${eq.equipmentType} ${eq.make} ${eq.model} ${eq.year || ''} ${eq.serialNumber || ''}`.toLowerCase();
              return searchStr.includes(searchLower);
            });

            const grouped = filteredEquipment.reduce<Record<string, { companyName: string; items: CustomerEquipment[] }>>((acc, eq) => {
              if (!acc[eq.companyId]) {
                acc[eq.companyId] = {
                  companyName: project.projectCompanies.find(c => c.companyId === eq.companyId)?.companyName || 'Unknown',
                  items: [],
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
                    onChange={e => setEquipmentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {groupEntries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No equipment matches your search.</p>
                ) : (
                  <div className="space-y-2">
                    {groupEntries.map(([companyId, group]) => (
                      <Collapsible key={`${companyId}-${hasSearch}`} defaultOpen={true}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors [&[data-state=open]_svg.chevron]:rotate-90">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="chevron h-4 w-4 shrink-0 transition-transform duration-200" />
                            <span>{(group as { companyName: string; items: CustomerEquipment[] }).companyName}</span>
                            <Badge variant="secondary" className="ml-1">
                              {(group as { companyName: string; items: CustomerEquipment[] }).items.length} {(group as { companyName: string; items: CustomerEquipment[] }).items.length === 1 ? 'machine' : 'machines'}
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
                                <TableHead className="text-right cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleEqSort('hours')}>
                                  <div className="flex items-center justify-end">Hours<SortIcon active={eqSortColumn === 'hours'} direction={eqSortDirection} /></div>
                                </TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortEquipment((group as { companyName: string; items: CustomerEquipment[] }).items).map(eq => (
                                <TableRow key={eq.id}>
                                  <TableCell>{eq.equipmentType}</TableCell>
                                  <TableCell>{eq.make}</TableCell>
                                  <TableCell>{eq.model}</TableCell>
                                  <TableCell>{eq.year || '—'}</TableCell>
                                  <TableCell className="font-mono text-sm">{eq.serialNumber || '—'}</TableCell>
                                  <TableCell className="text-right">{eq.hours?.toLocaleString() || '—'}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEquipment(eq)}>
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEquipmentToDelete(eq.id); setShowDeleteEquipmentDialog(true); }}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </Card>
        <NotesSection
          notes={project.notes || []}
          noteTags={noteTags}
          onAddNote={(noteData) => addNote(project.id, noteData)}
          onUpdateNote={(noteId, noteData) => updateNote(project.id, noteId, noteData)}
          onDeleteNote={(noteId) => deleteNote(project.id, noteId)}
          getSalesRepName={getSalesRepName}
          projectId={project.id}
        />
      </main>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        open={showOpportunityDetail}
        onOpenChange={setShowOpportunityDetail}
      />

      <AssociateOpportunityModal
        projectId={project.id}
        currentOpportunityIds={project.associatedOpportunities.map(o => o.id)}
        open={showAssociateModal}
        onOpenChange={setShowAssociateModal}
      />

      <CreateOpportunityModal
        projectId={project.id}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <AddGCModal
        projectId={project.id}
        open={showAddGCModal}
        onOpenChange={setShowAddGCModal}
      />

      <AssociateCompanyModal
        projectId={project.id}
        currentCompanyNames={project.projectCompanies.map(c => c.companyName)}
        open={showAssociateCompanyModal}
        onOpenChange={setShowAssociateCompanyModal}
      />

      <AlertDialog open={showRemoveGCDialog} onOpenChange={setShowRemoveGCDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove General Contractor?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {primaryGC?.companyName} as the general contractor for this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveGC}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        onOpenChange={setShowEditModal}
      />

      {primaryGC && (
        <EditGCModal
          projectId={project.id}
          currentGC={primaryGC}
          open={showEditGCModal}
          onOpenChange={setShowEditGCModal}
        />
      )}

      <ActivityModal
        open={showActivityModal}
        onOpenChange={setShowActivityModal}
        projectId={project.id}
        activity={selectedActivity}
        mode={activityModalMode}
      />

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
        currentActivityIds={project.activities?.map(a => a.id) || []}
        open={showAssociateActivityModal}
        onOpenChange={setShowAssociateActivityModal}
      />

      <AddCustomerEquipmentModal
        open={showEquipmentModal}
        onOpenChange={setShowEquipmentModal}
        onSave={handleSaveEquipment}
        equipment={selectedEquipment}
        mode={equipmentModalMode}
        projectCompanies={project.projectCompanies}
      />

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
    </div>
  );
};

export default ProjectDetail;
