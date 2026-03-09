import { useState } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { KPICard } from '@/components/KPICard';
import { ProjectTable } from '@/components/ProjectTable';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ColumnVisibilitySelector } from '@/components/ColumnVisibilitySelector';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ProjectList = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Projects List</h1>
              <p className="text-sm text-muted-foreground">Manage construction projects and opportunities</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              <ColumnVisibilitySelector />
              <SettingsPanel />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <KPICard />
        <FilterBar />
        <ProjectTable />
      </main>

      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal} />
    </div>
  );
};

export default ProjectList;
