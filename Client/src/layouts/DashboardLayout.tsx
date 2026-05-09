import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Briefcase,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import api from "../api";

export function DashboardLayout() {
  const { user, logout } = useAuth();

  const location = useLocation();

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const [isProjectsExpanded, setProjectsExpanded] = useState(true);
  const [isTasksExpanded, setTasksExpanded] = useState(true);

  // Close sidebar on mobile after route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks/my"),
        ]);

        setProjects(projRes.data.slice(0, 10));
        setTasks(tasksRes.data.slice(0, 10));
      } catch (error) {
        console.error("Failed to load layout data", error);
      }
    };

    fetchData();
  }, [location.pathname]);

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);

    const breadcrumbs = [
      {
        name: "Home",
        path: "/dashboard",
      },
    ];

    let currentPath = "";

    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;

      let name =
        paths[i].charAt(0).toUpperCase() + paths[i].slice(1);

      if (paths[0] === "projects" && i === 1) {
        const project = projects.find(
          (p) =>
            p.id === Number(paths[i]) ||
            p.id === paths[i]
        );

        if (project) {
          name = project.title || project.name;
        } else {
          name = `Project #${paths[i]}`;
        }
      }

      breadcrumbs.push({
        name,
        path: currentPath,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex min-h-screen bg-[#fafafa] font-ui text-[#1f1633]">
      {/* TOP NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-[60] flex h-[72px] items-center border-b border-[#e5e7eb] bg-white shadow-sm">
        {/* LOGO AREA */}
        <div className="hidden h-full w-[280px] items-center border-r border-[#e5e7eb] px-6 md:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f1633] to-[#362d59] shadow-md">
              <Briefcase className="h-4 w-4 text-[#c2ef4e]" />
            </div>

            <div className="flex flex-col">
              <span className="font-display text-[15px] font-bold leading-none tracking-tight text-[#1f1633]">
                Team Task Manager
              </span>

              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#71717a]">
                Workspace
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT NAVBAR */}
        <div className="flex h-full flex-1 items-center justify-between bg-[#fafafa]/50 px-5 backdrop-blur-sm lg:px-8">
          {/* LEFT */}
          <div className="flex items-center">
            <button
              className="mr-4 text-[#1f1633] md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* BREADCRUMBS */}
            <nav className="hidden items-center text-sm font-medium md:flex">
              {breadcrumbs.map((crumb, index) => (
                <div
                  key={crumb.path}
                  className="flex items-center"
                >
                  <Link
                    to={crumb.path}
                    className={cn(
                      "max-w-[180px] truncate transition-colors",
                      index === breadcrumbs.length - 1
                        ? "font-bold text-[#150f23]"
                        : "text-[#71717a] hover:text-[#150f23]"
                    )}
                  >
                    {crumb.name}
                  </Link>

                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight
                      size={14}
                      className="mx-2 text-[#d4d4d8]"
                    />
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <Link
              to="/tasks"
              className="hidden rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#1f1633] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex"
            >
              My Tasks
            </Link>

            {user?.role === "admin" && (
              <Link
                to="/projects"
                className="rounded-xl border border-[#a3d936] bg-[#c2ef4e] px-4 py-2 text-sm font-bold text-[#1f1633] shadow-[0_2px_12px_rgba(194,239,78,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_18px_rgba(194,239,78,0.45)]"
              >
                New Project
              </Link>
            )}
            {user?.role === "member" && (
              <Link
                to="/projects"
                className="rounded-xl border border-[#a3d936] bg-[#c2ef4e] px-4 py-2 text-sm font-bold text-[#1f1633] shadow-[0_2px_12px_rgba(194,239,78,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_18px_rgba(194,239,78,0.45)]"
              >
                My Projects
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* PAGE BODY */}
      <div className="relative mt-[72px] flex min-h-[calc(100vh-72px)] w-full">
        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={cn(
            "fixed left-0 top-[72px] z-50 flex h-[calc(100vh-72px)] w-[280px] flex-col border-r border-[#e5e7eb] bg-white transition-transform duration-300",
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* CLOSE BUTTON */}
          <button
            className="absolute right-4 top-4 text-[#71717a] md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>

          {/* SIDEBAR CONTENT */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-8">
              {/* DASHBOARD */}
              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  className={cn(
                    "flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                    location.pathname === "/dashboard"
                      ? "bg-[#f4f4f5] text-[#150f23]"
                      : "text-[#52525b] hover:bg-[#f4f4f5]"
                  )}
                >
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  Dashboard
                </Link>
              </div>

              {/* PROJECTS */}
              <div>
                <button
                  onClick={() =>
                    setProjectsExpanded(!isProjectsExpanded)
                  }
                  className="flex w-full items-center px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#a1a1aa]"
                >
                  <FolderKanban className="mr-3 h-4 w-4" />

                  Projects

                  {isProjectsExpanded ? (
                    <ChevronDown
                      size={14}
                      className="ml-auto"
                    />
                  ) : (
                    <ChevronRight
                      size={14}
                      className="ml-auto"
                    />
                  )}
                </button>

                {isProjectsExpanded && (
                  <div className="ml-2 mt-2 space-y-1 border-l-2 border-[#f4f4f5] pl-3">
                    <Link
                      to="/projects"
                      className="flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-[#71717a] transition-all hover:bg-[#f4f4f5]"
                    >
                      All Projects
                    </Link>

                    {projects.map((p) => (
                      <Link
                        key={p.id}
                        to={`/projects/${p.id}`}
                        className={cn(
                          "group flex items-center rounded-xl border px-3 py-2 text-[13px] transition-all",
                          location.pathname ===
                            `/projects/${p.id}`
                            ? "border-[#e5e7eb] bg-white text-[#150f23] shadow-sm"
                            : "border-transparent text-[#71717a] hover:bg-[#f4f4f5]"
                        )}
                      >
                        <span className="mr-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c2ef4e]" />

                        <span className="truncate">
                          {p.title || p.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* TASKS */}
              <div>
                <button
                  onClick={() =>
                    setTasksExpanded(!isTasksExpanded)
                  }
                  className="flex w-full items-center px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#a1a1aa]"
                >
                  <CheckSquare className="mr-3 h-4 w-4" />

                  My Tasks

                  {isTasksExpanded ? (
                    <ChevronDown
                      size={14}
                      className="ml-auto"
                    />
                  ) : (
                    <ChevronRight
                      size={14}
                      className="ml-auto"
                    />
                  )}
                </button>

                {isTasksExpanded && (
                  <div className="ml-2 mt-2 space-y-1 border-l-2 border-[#f4f4f5] pl-3">
                    <Link
                      to="/tasks"
                      className="flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-[#71717a] transition-all hover:bg-[#f4f4f5]"
                    >
                      All Tasks
                    </Link>

                    {tasks.map((t) => (
                      <Link
                        key={t.id}
                        to="/tasks"
                        className="flex items-center rounded-xl border border-transparent px-3 py-2 text-[13px] text-[#71717a] transition-all hover:bg-[#f4f4f5]"
                      >
                        <span
                          className={cn(
                            "mr-3 h-1.5 w-1.5 shrink-0 rounded-full",
                            t.status === "done"
                              ? "bg-emerald-500"
                              : t.status === "in_progress"
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          )}
                        />

                        <span className="truncate">
                          {t.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* USER FOOTER */}
          <div className="shrink-0 border-t border-[#e5e7eb] bg-[#fafafa] p-4">
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#150f23] text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold text-[#1f1633]">
                  {user?.name}
                </p>

                <p className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-[#71717a]">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center rounded-xl border border-transparent bg-white px-3 py-2.5 text-[13px] font-bold text-rose-600 shadow-sm transition-all hover:border-rose-100 hover:bg-rose-50"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-x-hidden bg-[#fafafa] md:ml-[280px]">
          <div className="flex w-full min-w-0 flex-col p-6 lg:px-10 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}