import * as React from "react";
import { ChevronsUpDown, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProjectStore from "@/store/projectStore";
import { useEffect } from "react";

export function TeamSwitcher({ teams }) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);
  const [activeProject, setActiveProject] = React.useState(null);

  const { projects, fetchProjects, deleteProject, error } = useProjectStore();

  useEffect(() => {
    // Fetch projects on component mount
    fetchProjects().catch(console.error);
  }, [fetchProjects]);

  // Set the first project as active when projects are loaded
  useEffect(() => {
    if (projects && projects.length > 0 && !activeProject) {
      // Access the project object correctly based on Zustand store structure
      const firstProject = projects[0].project || projects[0];
      setActiveProject(firstProject);
    }
  }, [projects, activeProject]);

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation(); // Prevent dropdown from closing

    try {
      // Update UI optimistically before API call
      const remainingProjects = projects.filter((item) => {
        const project = item.project || item;
        return project._id !== projectId;
      });

      // If deleted project was active, set first available project or null
      if (activeProject?._id === projectId) {
        if (remainingProjects.length > 0) {
          const nextProject =
            remainingProjects[0].project || remainingProjects[0];
          setActiveProject(nextProject);
        } else {
          setActiveProject(null);
        }
      }

      await deleteProject(projectId);
    } catch (error) {
      console.error("Failed to delete project:", error);
      // Refetch projects to restore state if delete failed
      fetchProjects().catch(console.error);
    }
  };

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeProject?.name || "No Project"}
                </span>
                <span className="truncate text-xs">
                  {activeProject?.description || "Select a project"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Projects
            </DropdownMenuLabel>
            {projects &&
              projects.map((item, index) => {
                // Handle both structures: {project: {...}, role: ...} OR direct project object
                const project = item.project || item;

                return (
                  <DropdownMenuItem
                    key={project._id || `project-${index}`}
                    onClick={() => setActiveProject(project)}
                    className="gap-2 p-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <activeTeam.logo className="size-3.5 shrink-0" />
                      </div>
                      {project.name}
                    </div>
                    <button
                      onClick={(e) => handleDeleteProject(e, project._id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete project"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </button>
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
