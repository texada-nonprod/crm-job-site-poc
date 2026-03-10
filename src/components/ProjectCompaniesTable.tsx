import { useState } from 'react';
import { ProjectCompany } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ManageCompanyContactsModal } from './ManageCompanyContactsModal';
import { ChevronRight, ChevronDown, Star, Pencil, X, Phone, Mail, Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProjectCompaniesTableProps {
  projectId: number;
  companies: ProjectCompany[];
  onRemoveCompany: (companyName: string) => void;
}

export const ProjectCompaniesTable = ({ projectId, companies, onRemoveCompany }: ProjectCompaniesTableProps) => {
  const { updateProjectCompany, projects } = useData();
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [editingCompany, setEditingCompany] = useState<ProjectCompany | null>(null);
  const [sortColumn, setSortColumn] = useState<'company' | 'role' | 'contacts' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const getAllCompanyContacts = (companyName: string) => {
    const contactsMap = new Map<string, typeof companies[0]['companyContacts'][0]>();
    projects.forEach(project => {
      project.projectCompanies.forEach(company => {
        if (company.companyName === companyName) {
          company.companyContacts.forEach(contact => {
            if (!contactsMap.has(contact.email)) contactsMap.set(contact.email, contact);
          });
        }
      });
    });
    return Array.from(contactsMap.values());
  };

  const toggleExpanded = (companyName: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyName)) newExpanded.delete(companyName);
    else newExpanded.add(companyName);
    setExpandedCompanies(newExpanded);
  };

  const handleSaveContacts = (updatedCompany: ProjectCompany) => {
    if (editingCompany) {
      updateProjectCompany(projectId, editingCompany.companyName, updatedCompany);
      setEditingCompany(null);
    }
  };

  const handleSort = (column: 'company' | 'role' | 'contacts') => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else { setSortDirection(null); setSortColumn(null); }
    } else { setSortColumn(column); setSortDirection('asc'); }
  };

  const SortIcon = ({ column }: { column: 'company' | 'role' | 'contacts' }) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;
    let cmp = 0;
    switch (sortColumn) {
      case 'company': cmp = a.companyName.localeCompare(b.companyName); break;
      case 'role': cmp = (a.roleDescription || '').localeCompare(b.roleDescription || ''); break;
      case 'contacts': cmp = (a.companyContacts?.length || 0) - (b.companyContacts?.length || 0); break;
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  if (companies.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No companies associated with this project yet.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('company')}><div className="flex items-center">Company<SortIcon column="company" /></div></TableHead>
            <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('role')}><div className="flex items-center">Role<SortIcon column="role" /></div></TableHead>
            
            <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('contacts')}><div className="flex items-center">Contacts<SortIcon column="contacts" /></div></TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCompanies.map((company, idx) => {
            const isExpanded = expandedCompanies.has(company.companyName);
            const contacts = company.companyContacts || [];
            const primaryContact = contacts[company.primaryContactIndex || 0];
            const contactCount = contacts.length;
            return (
              <Collapsible key={idx} asChild open={isExpanded} onOpenChange={() => toggleExpanded(company.companyName)}>
                <>
                  <TableRow className={cn(isExpanded && "border-b-0")}>
                    <TableCell className="p-2">
                      <CollapsibleTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button></CollapsibleTrigger>
                    </TableCell>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell><Badge variant={company.roleId === 'GC' ? 'default' : 'secondary'}>{company.roleDescription}</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{contactCount} {contactCount === 1 ? 'person' : 'people'}</span></div></TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCompany(company)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemoveCompany(company.companyName)}><X className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <tr><td colSpan={5} className="p-0">
                      <div className="bg-muted/30 border-b px-6 py-4">
                        <div className="grid gap-3">
                          {contacts.map((contact, contactIdx) => (
                            <div key={contact.id} className={cn("flex items-start justify-between p-3 rounded-lg bg-background border", contactIdx === (company.primaryContactIndex || 0) && "ring-2 ring-primary")}>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {contactIdx === (company.primaryContactIndex || 0) && <Star className="h-4 w-4 text-primary fill-primary" />}
                                  <span className="font-medium">{contact.name}</span>
                                  {contact.title && <span className="text-muted-foreground text-sm">• {contact.title}</span>}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {contact.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /><span>{contact.phone}</span></div>}
                                  <div className="flex items-center gap-1"><Mail className="h-3 w-3" /><a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td></tr>
                  </CollapsibleContent>
                </>
              </Collapsible>
            );
          })}
        </TableBody>
      </Table>
      {editingCompany && (
        <ManageCompanyContactsModal company={editingCompany} allCompanyContacts={getAllCompanyContacts(editingCompany.companyName)} open={!!editingCompany} onOpenChange={(open) => !open && setEditingCompany(null)} onSave={handleSaveContacts} />
      )}
    </>
  );
};
