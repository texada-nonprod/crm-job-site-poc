import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useStatusColors, STATUS_COLORS } from '@/hooks/useStatusColors';
import { useData } from '@/contexts/DataContext';
import { LookupOption } from '@/types';

type DropdownType = 'projectStatus' | 'subcontractorRole' | 'noteTags' | 'primaryStage' | 'primaryProjectType' | 'ownershipType';

interface DropdownOption {
  id: string;
  label: string;
  displayOrder: number;
  color?: string; // Only used for projectStatus
}

const initialDropdowns: Record<DropdownType, DropdownOption[]> = {
  projectStatus: [{
    id: 'Active', label: 'Active', displayOrder: 1, color: 'emerald'
  }, {
    id: 'Planning', label: 'Planning', displayOrder: 2, color: 'sky'
  }, {
    id: 'On Hold', label: 'On Hold', displayOrder: 3, color: 'amber'
  }, {
    id: 'Completed', label: 'Completed', displayOrder: 99, color: 'slate'
  }],
  subcontractorRole: [
    { id: 'GC', label: 'General Contractor', displayOrder: 1 },
    { id: 'SUB-EXC', label: 'Subcontractor - Excavation', displayOrder: 2 },
    { id: 'SUB-PAV', label: 'Subcontractor - Paving', displayOrder: 3 },
    { id: 'SUB-ELEC', label: 'Subcontractor - Electrical', displayOrder: 4 },
    { id: 'SUB-MECH', label: 'Subcontractor - Mechanical', displayOrder: 5 },
    { id: 'SUB-SPEC', label: 'Subcontractor - Specialized', displayOrder: 6 },
    { id: 'SUB-STEEL', label: 'Subcontractor - Steel', displayOrder: 7 },
  ],
  noteTags: [
    { id: 'SAFETY', label: 'Safety', displayOrder: 1, color: 'red' },
    { id: 'SECURITY', label: 'Security', displayOrder: 2, color: 'amber' },
    { id: 'COMPLIANCE', label: 'Compliance', displayOrder: 3, color: 'sky' },
    { id: 'GENERAL', label: 'General', displayOrder: 4, color: 'slate' },
  ],
  primaryStage: [
    { id: 'PRE_CONSTRUCTION', label: 'Pre-Construction', displayOrder: 1 },
    { id: 'BIDDING', label: 'Bidding', displayOrder: 2 },
    { id: 'AWARDED', label: 'Awarded', displayOrder: 3 },
    { id: 'UNDER_CONSTRUCTION', label: 'Under Construction', displayOrder: 4 },
    { id: 'COMPLETED', label: 'Completed', displayOrder: 5 },
  ],
  primaryProjectType: [
    { id: 'COMMERCIAL', label: 'Commercial', displayOrder: 1 },
    { id: 'RESIDENTIAL', label: 'Residential', displayOrder: 2 },
    { id: 'INDUSTRIAL', label: 'Industrial', displayOrder: 3 },
    { id: 'INFRASTRUCTURE', label: 'Infrastructure', displayOrder: 4 },
    { id: 'INSTITUTIONAL', label: 'Institutional', displayOrder: 5 },
  ],
  ownershipType: [
    { id: 'GOVERNMENTAL', label: 'Governmental', displayOrder: 1 },
    { id: 'PRIVATE', label: 'Private', displayOrder: 2 },
  ],
};
const ManageDropdowns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { statusColors, updateAllStatusColors } = useStatusColors();
  const { noteTags, setNoteTags, primaryStages, setPrimaryStages, primaryProjectTypes, setPrimaryProjectTypes, ownershipTypes, setOwnershipTypes } = useData();
  const [selectedDropdown, setSelectedDropdown] = useState<DropdownType | null>(null);
  const [dropdowns, setDropdowns] = useState<Record<DropdownType, DropdownOption[]>>(() => {
    // Initialize project status with saved colors from localStorage
    const projectStatusWithColors = initialDropdowns.projectStatus.map(status => ({
      ...status,
      color: statusColors[status.id] || status.color
    }));
    // Initialize noteTags from context
    const noteTagsFromContext = noteTags.map(tag => ({
      id: tag.id,
      label: tag.label,
      displayOrder: tag.displayOrder,
      color: tag.color
    }));
    return {
      ...initialDropdowns,
      projectStatus: projectStatusWithColors,
      noteTags: noteTagsFromContext.length > 0 ? noteTagsFromContext : initialDropdowns.noteTags,
      primaryStage: primaryStages.map(s => ({ id: s.id, label: s.label, displayOrder: s.displayOrder })),
      primaryProjectType: primaryProjectTypes.map(t => ({ id: t.id, label: t.label, displayOrder: t.displayOrder })),
      ownershipType: ownershipTypes.map(o => ({ id: o.id, label: o.label, displayOrder: o.displayOrder })),
    };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<DropdownOption[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    item: DropdownOption | null;
  }>({
    open: false,
    item: null
  });
  const [newItem, setNewItem] = useState<{
    label: string;
    displayOrder: string;
    color: string;
  }>({
    label: '',
    displayOrder: '',
    color: 'emerald'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const dropdownOptions: {
    key: DropdownType;
    label: string;
  }[] = [{
    key: 'projectStatus',
    label: 'Project Status'
  }, {
    key: 'subcontractorRole',
    label: 'Subcontractor Role'
  }, {
    key: 'noteTags',
    label: 'Note Tags'
  }, {
    key: 'primaryStage',
    label: 'Primary Stage'
  }, {
    key: 'primaryProjectType',
    label: 'Primary Project Type'
  }, {
    key: 'ownershipType',
    label: 'Ownership Type'
  }];
  const sortByDisplayOrder = (items: DropdownOption[]) => {
    return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
  };
  const handleSelectDropdown = (key: DropdownType) => {
    setSelectedDropdown(key);
    setIsEditing(false);
    setShowAddForm(false);
  };
  const handleStartEdit = () => {
    if (selectedDropdown) {
      setEditedValues(sortByDisplayOrder([...dropdowns[selectedDropdown]]));
      setIsEditing(true);
    }
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedValues([]);
  };
  const handleSaveEdit = () => {
    if (selectedDropdown) {
      setDropdowns(prev => ({
        ...prev,
        [selectedDropdown]: editedValues
      }));
      
      // If editing project status, sync colors to the shared hook
      if (selectedDropdown === 'projectStatus') {
        const colorMap: Record<string, string> = {};
        editedValues.forEach(item => {
          if (item.color) {
            colorMap[item.id] = item.color;
          }
        });
        updateAllStatusColors(colorMap);
      }

      // If editing note tags, sync to context
      if (selectedDropdown === 'noteTags') {
        setNoteTags(editedValues.map(item => ({
          id: item.id,
          label: item.label,
          displayOrder: item.displayOrder,
          color: item.color || 'slate'
        })));
      }

      // Sync lookup types to context
      if (selectedDropdown === 'primaryStage') {
        setPrimaryStages(editedValues.map(item => ({ id: item.id, label: item.label, displayOrder: item.displayOrder })));
      }
      if (selectedDropdown === 'primaryProjectType') {
        setPrimaryProjectTypes(editedValues.map(item => ({ id: item.id, label: item.label, displayOrder: item.displayOrder })));
      }
      if (selectedDropdown === 'ownershipType') {
        setOwnershipTypes(editedValues.map(item => ({ id: item.id, label: item.label, displayOrder: item.displayOrder })));
      }
      
      setIsEditing(false);
      toast({
        title: 'Changes saved',
        description: 'Dropdown values have been updated.'
      });
    }
  };
  const handleEditValue = (index: number, field: keyof DropdownOption, value: string | number) => {
    setEditedValues(prev => {
      const updated = [...prev];
      if (field === 'displayOrder') {
        updated[index] = {
          ...updated[index],
          [field]: parseInt(value as string) || 0
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return updated;
    });
  };
  const handleDeleteClick = (item: DropdownOption) => {
    setDeleteConfirm({
      open: true,
      item
    });
  };
  const handleConfirmDelete = () => {
    if (deleteConfirm.item && selectedDropdown) {
      // Prevent deletion of protected General Contractor role
      if (selectedDropdown === 'subcontractorRole' && deleteConfirm.item.id === 'GC') {
        toast({ title: 'Protected item', description: 'The General Contractor role cannot be deleted.', variant: 'destructive' });
        setDeleteConfirm({ open: false, item: null });
        return;
      }
      if (isEditing) {
        setEditedValues(prev => prev.filter(v => v.id !== deleteConfirm.item!.id));
      } else {
        setDropdowns(prev => ({
          ...prev,
          [selectedDropdown]: prev[selectedDropdown].filter(v => v.id !== deleteConfirm.item!.id)
        }));
      }
      toast({
        title: 'Item deleted',
        description: `"${deleteConfirm.item.label}" has been removed.`
      });
    }
    setDeleteConfirm({
      open: false,
      item: null
    });
  };
  const generateId = (label: string) => {
    return label.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
  };
  const handleAddItem = () => {
    if (!newItem.label) {
      toast({
        title: 'Missing fields',
        description: 'Label is required.',
        variant: 'destructive'
      });
      return;
    }
    if (selectedDropdown) {
      const currentValues = isEditing ? editedValues : dropdowns[selectedDropdown];
      const generatedId = generateId(newItem.label);
      if (currentValues.some(v => v.id === generatedId)) {
        toast({
          title: 'Duplicate entry',
          description: 'An item with this label already exists.',
          variant: 'destructive'
        });
        return;
      }
      const maxOrder = Math.max(0, ...currentValues.map(v => v.displayOrder));
      const newOption: DropdownOption = {
        id: generatedId,
        label: newItem.label,
        displayOrder: newItem.displayOrder ? parseInt(newItem.displayOrder) : maxOrder + 1,
        ...((selectedDropdown === 'projectStatus' || selectedDropdown === 'noteTags') && { color: newItem.color })
      };
      if (isEditing) {
        setEditedValues(prev => [...prev, newOption]);
      } else {
        setDropdowns(prev => ({
          ...prev,
          [selectedDropdown]: [...prev[selectedDropdown], newOption]
        }));
        
        // If adding project status, sync color to the shared hook
        if (selectedDropdown === 'projectStatus' && newOption.color) {
          const currentDropdown = dropdowns[selectedDropdown];
          const colorMap: Record<string, string> = {};
          currentDropdown.forEach(item => {
            if (item.color) {
              colorMap[item.id] = item.color;
            }
          });
          colorMap[newOption.id] = newOption.color;
          updateAllStatusColors(colorMap);
        }

        // If adding note tag, sync to context
        if (selectedDropdown === 'noteTags') {
          const updatedTags = [...dropdowns.noteTags, newOption];
          setNoteTags(updatedTags.map(item => ({
            id: item.id,
            label: item.label,
            displayOrder: item.displayOrder,
            color: item.color || 'slate'
          })));
        }

        // Sync lookup additions
        if (selectedDropdown === 'primaryStage') {
          setPrimaryStages([...dropdowns.primaryStage, newOption].map(i => ({ id: i.id, label: i.label, displayOrder: i.displayOrder })));
        }
        if (selectedDropdown === 'primaryProjectType') {
          setPrimaryProjectTypes([...dropdowns.primaryProjectType, newOption].map(i => ({ id: i.id, label: i.label, displayOrder: i.displayOrder })));
        }
        if (selectedDropdown === 'ownershipType') {
          setOwnershipTypes([...dropdowns.ownershipType, newOption].map(i => ({ id: i.id, label: i.label, displayOrder: i.displayOrder })));
        }
      }
      setNewItem({
        label: '',
        displayOrder: '',
        color: 'emerald'
      });
      setShowAddForm(false);
      toast({
        title: 'Item added',
        description: `"${newItem.label}" has been added.`
      });
    }
  };
  const currentValues = selectedDropdown ? sortByDisplayOrder(isEditing ? editedValues : dropdowns[selectedDropdown]) : [];
  return <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Manage Dropdowns</h1>
              <p className="text-sm text-muted-foreground">Configure dropdown values used in Job Site pages </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Dropdown Selection */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Dropdowns</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {dropdownOptions.map(option => <Button key={option.key} variant={selectedDropdown === option.key ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => handleSelectDropdown(option.key)}>
                    {option.label}
                  </Button>)}
              </div>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <Card className="md:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {selectedDropdown ? dropdownOptions.find(o => o.key === selectedDropdown)?.label + ' Values' : 'Select a Dropdown'}
              </CardTitle>
              {selectedDropdown && <div className="flex gap-2">
                  {isEditing ? <>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </> : <>
                      <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleStartEdit}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </>}
                </div>}
            </CardHeader>
            <CardContent>
              {selectedDropdown ? <>
                  {showAddForm && !isEditing && <div className="mb-4 p-4 border rounded-md bg-muted/50">
                      <h4 className="font-medium mb-3">Add New Item</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Label" value={newItem.label} onChange={e => setNewItem(prev => ({
                    ...prev,
                    label: e.target.value
                  }))} />
                        <Input placeholder="Display Order (optional)" type="number" value={newItem.displayOrder} onChange={e => setNewItem(prev => ({
                    ...prev,
                    displayOrder: e.target.value
                  }))} />
                      </div>
                      {(selectedDropdown === 'projectStatus' || selectedDropdown === 'noteTags') && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Color</p>
                          <div className="flex gap-2 flex-wrap">
                            {STATUS_COLORS.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setNewItem(prev => ({ ...prev, color: c.id }))}
                                className={`w-8 h-8 rounded-full ${c.bg} border-2 ${newItem.color === c.id ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                                title={c.label}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={handleAddItem}>
                          Add
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                    setShowAddForm(false);
                    setNewItem({
                      label: '',
                      displayOrder: '',
                      color: 'emerald'
                    });
                  }}>
                          Cancel
                        </Button>
                      </div>
                    </div>}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        {(selectedDropdown === 'projectStatus' || selectedDropdown === 'noteTags') && <TableHead className="w-[120px]">Color</TableHead>}
                        <TableHead className="w-[120px]">Display Order</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentValues.map((item, index) => {
                        const editIndex = isEditing ? editedValues.findIndex(e => e.id === item.id) : index;
                        const colorConfig = STATUS_COLORS.find(c => c.id === item.color) || STATUS_COLORS[0];
                        const isProtectedGC = selectedDropdown === 'subcontractorRole' && item.id === 'GC';
                        return <TableRow key={item.id}>
                          <TableCell>
                            {isEditing ? <Input value={editedValues[editIndex]?.label || ''} onChange={e => handleEditValue(editIndex, 'label', e.target.value)} className="h-8" readOnly={isProtectedGC} disabled={isProtectedGC} /> : item.label}
                          </TableCell>
                          {(selectedDropdown === 'projectStatus' || selectedDropdown === 'noteTags') && (
                            <TableCell>
                              {isEditing ? (
                                <div className="flex gap-1 flex-wrap">
                                  {STATUS_COLORS.map(c => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => handleEditValue(editIndex, 'color', c.id)}
                                      className={`w-6 h-6 rounded-full ${c.bg} border-2 ${editedValues[editIndex]?.color === c.id ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                                      title={c.label}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colorConfig.bg} ${colorConfig.text}`}>
                                  {colorConfig.label}
                                </span>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            {isEditing ? <Input type="number" value={editedValues[editIndex]?.displayOrder || 0} onChange={e => handleEditValue(editIndex, 'displayOrder', e.target.value)} className="h-8 w-20" /> : item.displayOrder}
                          </TableCell>
                          <TableCell>
                            {!isProtectedGC && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(item)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>;
                      })}
                      {currentValues.length === 0 && <TableRow>
                        <TableCell colSpan={(selectedDropdown === 'projectStatus' || selectedDropdown === 'noteTags') ? 4 : 3} className="text-center text-muted-foreground">
                          No values configured
                        </TableCell>
                      </TableRow>}
                    </TableBody>
                  </Table>
                  {isEditing && <div className="mt-4 p-4 border rounded-md bg-muted/50">
                      <h4 className="font-medium mb-3">Add New Item</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Label" value={newItem.label} onChange={e => setNewItem(prev => ({
                    ...prev,
                    label: e.target.value
                  }))} />
                        <Input placeholder="Display Order (optional)" type="number" value={newItem.displayOrder} onChange={e => setNewItem(prev => ({
                    ...prev,
                    displayOrder: e.target.value
                  }))} />
                      </div>
                      {(selectedDropdown === 'projectStatus' || selectedDropdown === 'noteTags') && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Color</p>
                          <div className="flex gap-2 flex-wrap">
                            {STATUS_COLORS.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setNewItem(prev => ({ ...prev, color: c.id }))}
                                className={`w-8 h-8 rounded-full ${c.bg} border-2 ${newItem.color === c.id ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                                title={c.label}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={handleAddItem}>
                          Add
                        </Button>
                      </div>
                    </div>}
                </> : <div className="text-center py-8 text-muted-foreground">
                  Select a dropdown from the list to view and edit its values
                </div>}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={open => setDeleteConfirm({
      open,
      item: null
    })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm.item?.label}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default ManageDropdowns;