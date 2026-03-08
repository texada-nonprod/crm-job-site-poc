import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import { useState } from "react";
import ProjectList from "./pages/ProjectList";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectChangeLog from "./pages/ProjectChangeLog";
import ManageDropdowns from "./pages/ManageDropdowns";
import NotFound from "./pages/NotFound";
import DodgeMappings from "./pages/DodgeMappings";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ProjectList />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/project/:id/changelog" element={<ProjectChangeLog />} />
              <Route path="/settings/dropdowns" element={<ManageDropdowns />} />
              <Route path="/settings/dodge-mappings" element={<DodgeMappings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
