import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { DodgeMapping } from '@/types';

const DodgeMappings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { primaryStages, primaryProjectTypes, ownershipTypes, dodgeMappings, setDodgeMappings } = useData();

  const [newExternalValue, setNewExternalValue] = useState('');
  const [newInternalId, setNewInternalId] = useState('');

  const tabs = [
    { key: 'primaryStage', label: 'Primary Stage', options: primaryStages },
    { key: 'primaryProjectType', label: 'Primary Project Type', options: primaryProjectTypes },
    { key: 'ownershipType', label: 'Ownership Type', options: ownershipTypes },
  ];

  const handleAdd = (type: string) => {
    if (!newExternalValue.trim() || !newInternalId) {
      toast({ title: 'Error', description: 'Both fields are required.', variant: 'destructive' });
      return;
    }
    const existing = dodgeMappings[type] || [];
    if (existing.some(m => m.externalValue.toLowerCase() === newExternalValue.trim().toLowerCase())) {
      toast({ title: 'Duplicate', description: 'This external value already has a mapping.', variant: 'destructive' });
      return;
    }
    setDodgeMappings(type, [...existing, { externalValue: newExternalValue.trim(), internalId: newInternalId }]);
    setNewExternalValue('');
    setNewInternalId('');
    toast({ title: 'Mapping added' });
  };

  const handleDelete = (type: string, externalValue: string) => {
    const existing = dodgeMappings[type] || [];
    setDodgeMappings(type, existing.filter(m => m.externalValue !== externalValue));
    toast({ title: 'Mapping removed' });
  };

  const handleUpdateInternal = (type: string, externalValue: string, newId: string) => {
    const existing = dodgeMappings[type] || [];
    setDodgeMappings(type, existing.map(m => m.externalValue === externalValue ? { ...m, internalId: newId } : m));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Dodge Project Mappings</h1>
              <p className="text-sm text-muted-foreground">Map external Dodge Project values to internal lookup values</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="primaryStage">
              <TabsList className="mb-6">
                {tabs.map(tab => (
                  <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
                ))}
              </TabsList>

              {tabs.map(tab => {
                const mappings: DodgeMapping[] = dodgeMappings[tab.key] || [];
                return (
                  <TabsContent key={tab.key} value={tab.key}>
                    <div className="mb-4 p-4 border rounded-md bg-muted/50">
                      <h4 className="font-medium mb-3">Add Mapping</h4>
                      <div className="flex gap-3 items-end">
                        <div className="flex-1 space-y-1">
                          <p className="text-xs text-muted-foreground">Dodge External Value</p>
                          <Input value={newExternalValue} onChange={e => setNewExternalValue(e.target.value)} placeholder="e.g. Under Development" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs text-muted-foreground">Maps To</p>
                          <Select value={newInternalId} onValueChange={setNewInternalId}>
                            <SelectTrigger><SelectValue placeholder="Select internal value..." /></SelectTrigger>
                            <SelectContent>
                              {tab.options.sort((a, b) => a.displayOrder - b.displayOrder).map(o => (
                                <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={() => handleAdd(tab.key)}>
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dodge External Value</TableHead>
                          <TableHead>Maps To (Internal)</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mappings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">No mappings configured</TableCell>
                          </TableRow>
                        ) : (
                          mappings.map(m => (
                            <TableRow key={m.externalValue}>
                              <TableCell>{m.externalValue}</TableCell>
                              <TableCell>
                                <Select value={m.internalId} onValueChange={(val) => handleUpdateInternal(tab.key, m.externalValue, val)}>
                                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {tab.options.sort((a, b) => a.displayOrder - b.displayOrder).map(o => (
                                      <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(tab.key, m.externalValue)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DodgeMappings;
