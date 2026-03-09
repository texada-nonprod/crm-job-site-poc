import { useState } from 'react';
import { KPICard } from '@/components/KPICard';
import { ProjectTable } from '@/components/ProjectTable';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ColumnVisibilityProvider } from '@/contexts/ColumnVisibilityContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ProjectList = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <ColumnVisibilityProvider>
      <div className="h-screen flex flex-col bg-background">
        <header className="border-b bg-card shrink-0">
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
                <SettingsPanel />
              </div>
            </div>
          </div>
        </header>

        <div className="shrink-0 container mx-auto px-6 pt-6">
          <KPICard />
        </div>

        <main className="flex-1 min-h-0 container mx-auto px-6 py-4">
          <ProjectTable />
        </main>

        <CreateProjectModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal} />
      </div>
    </ColumnVisibilityProvider>
  );
};

export default ProjectList;
