import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  CheckSquare,
  Folder,
  LogOut,
  StickyNote,
  Plus,
  User,
  Menu,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useProjectStore from "../store/projectStore";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const [opened, setOpened] = useState(false);
  const { user, isAuthenticated, logout, getUserAvatar } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedWorkspace, setSelectedWorkspace] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fix the currentPath logic to correctly identify the active navigation item
  const getCurrentPath = () => {
    const pathParts = location.pathname.split("/");

    // Handle root path
    if (location.pathname === "/") {
      return "projects";
    }

    // Handle project-specific routes like /projects/:projectId/notes or /projects/:projectId/tasks
    if (
      pathParts.length >= 4 &&
      pathParts[1] === "projects" &&
      (pathParts[3] === "notes" || pathParts[3] === "tasks")
    ) {
      return pathParts[3]; // Return "notes" or "tasks"
    }

    // Default case: first path segment or projects
    return pathParts[1] || "projects";
  };

  const currentPath = getCurrentPath();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects().catch(console.error);
    }
  }, [isAuthenticated, fetchProjects]);

  // Set the first project as default when projects are loaded
  useEffect(() => {
    if (
      projects.length > 0 &&
      (selectedWorkspace === "all" || !selectedWorkspace)
    ) {
      // FIX: Add safety check for projects[0].project
      const firstProject = projects[0];
      if (firstProject && firstProject.project && firstProject.project._id) {
        const firstProjectId = firstProject.project._id;

        // Only navigate if we're not already on a project page
        const pathParts = location.pathname.split("/");
        if (pathParts[1] !== "projects" || !pathParts[2]) {
          setSelectedWorkspace(firstProjectId);
          navigate(`/projects/${firstProjectId}`);
        }
      }
    }
  }, [projects, selectedWorkspace, navigate, location.pathname]);

  // Extract project ID from URL if present - only when the URL changes
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (
      pathParts[1] === "projects" &&
      pathParts[2] &&
      pathParts[2] !== selectedWorkspace
    ) {
      setSelectedWorkspace(pathParts[2]);
    }
  }, [location.pathname, selectedWorkspace]);

  // Close mobile navbar when navigating
  useEffect(() => {
    if (isMobile) {
      setOpened(false);
    }
  }, [location.pathname, isMobile]);

  const handleWorkspaceChange = (value) => {
    navigate(`/projects/${value}`);
    setSelectedWorkspace(value);
  };

  const navItems = [
    {
      label: "Tasks",
      value: "tasks",
      path: "/tasks",
      icon: <CheckSquare className="h-[18px] w-[18px]" />,
    },
    {
      label: "Notes",
      value: "notes",
      path: "/notes",
      icon: <StickyNote className="h-[18px] w-[18px]" />,
    },
    {
      label: "Projects",
      value: "projects",
      path: "/projects",
      icon: <Folder className="h-[18px] w-[18px]" />,
    },
  ];

  const handleNavClick = (path) => {
    // For tasks and notes, navigate to the project-specific route if a project is selected
    if (
      (path === "/tasks" || path === "/notes") &&
      selectedWorkspace &&
      selectedWorkspace !== "all"
    ) {
      const routeType = path.substring(1); // Remove the leading slash
      navigate(`/projects/${selectedWorkspace}/${routeType}`);
    } else {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Helper function to normalize project structure
  const getProjectData = (item) => {
    if (item && item.project) {
      return { project: item.project, role: item.role };
    }
    return { project: item, role: item.role };
  };

  // Create workspace options for the dropdown - without "All Projects" option
  const workspaceOptions = projects
    .filter((item) => {
      const { project } = getProjectData(item);
      return project && project._id;
    })
    .map((item) => {
      const { project } = getProjectData(item);
      return {
        value: project._id,
        label: project.name,
      };
    });

  // Navigation component (used in both desktop sidebar and mobile sheet)
  const Navigation = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = currentPath === item.value;

        return (
          <button
            key={item.value}
            onClick={() => handleNavClick(item.path)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <span className={isActive ? "text-blue-600" : "text-gray-500"}>
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}

      {isMobile && projects.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="px-3">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">
              Current Project
            </p>
            <Select
              value={selectedWorkspace}
              onValueChange={handleWorkspaceChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {workspaceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <Sheet open={opened} onOpenChange={setOpened}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-full flex-col">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-blue-600">
                      Project Camp
                    </h2>
                  </div>
                  <div className="flex-1 px-3">
                    <Navigation />
                  </div>
                  <div className="border-t p-4">
                    <p className="text-center text-xs text-gray-500">
                      © {new Date().getFullYear()} Project Camp
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-bold text-blue-600 tracking-tight">
              Project Camp
            </h1>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden xs:flex items-center gap-2">
                {projects.length > 0 ? (
                  <>
                    <Select
                      value={selectedWorkspace}
                      onValueChange={handleWorkspaceChange}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-[150px] md:w-[200px]",
                          isMobile && "text-xs"
                        )}
                      >
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate("/projects")}
                      title="View all projects"
                    >
                      <Folder className="h-[18px] w-[18px]" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/projects")}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getUserAvatar()}
                        alt={user?.fullName || user?.username}
                      />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {(user?.fullName || user?.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">
                      {user?.fullName || user?.username}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className=" mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 flex-col border-r bg-white">
          <div className="flex-1 p-4">
            <Navigation />
          </div>
          <div className="border-t p-4">
            <p className="text-center text-xs text-gray-500">
              © {new Date().getFullYear()} Project Camp
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50">
          <div className="w-full h-full p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
