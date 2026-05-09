import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Plus, Users, Calendar, AlertCircle, CheckCircle, Clock, FolderKanban, MoreHorizontal } from "lucide-react";

interface User { id: number; name: string; email: string; role: string; }
interface Member { id: number; user: User; }
interface Task {
  id: number;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  isOverdue: boolean;
}
interface ProjectDetail {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  members: Member[];
  tasks: Task[];
  creator: { id: number; name: string };
}

export function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");

      // Fetch full details for each project to get member count, tasks, progress
      const detailedProjects = await Promise.all(
        res.data.map(async (p: any) => {
          try {
            const detailRes = await api.get(`/projects/${p.id}`);
            return detailRes.data;
          } catch (e) {
            return { ...p, members: [], tasks: [] };
          }
        })
      );

      setProjects(detailedProjects);
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/projects", newProject);
      setNewProject({ title: "", description: "" });
      setShowCreate(false);
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-[#1f1633] font-medium animate-pulse">Loading workspaces...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col gap-4 border-b border-[#e5e7eb] pb-6 md:flex-row md:items-end md:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#1f1633] tracking-tight">Projects</h1>
          <p className="mt-2 text-[#71717a] font-ui text-sm">Manage workspaces and team assignments</p>
        </div>
        {user?.role === "admin" && (
          <Button variant="primary" onClick={() => setShowCreate(!showCreate)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {showCreate && user?.role === "admin" && (
        <Card variant="light" className="mb-8 border-[#e5e7eb] animate-in slide-in-from-top-4 rounded-3xl shadow-md p-6 shrink-0">
          <h3 className="mb-6 text-lg font-display font-bold text-[#1f1633]">Create New Workspace</h3>
          <form onSubmit={handleCreate} className="space-y-5">
            <Input
              label="Project Title"
              required
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            />
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-[#1f1633]">Description</label>
              <textarea
                required
                className="w-full rounded-xl border border-[#d9d9e3] px-4 py-3 text-base text-[#1f1633] outline-none focus:ring-2 focus:ring-[#1f1633]/10 transition-colors"
                rows={3}
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost-dark" className="text-[#1f1633] bg-white border border-[#e5e7eb] shadow-sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={creating}>Create Workspace</Button>
            </div>
          </form>
        </Card>
      )}

      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#e5e7eb] p-12 text-center bg-[#fafafa]/50">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-[#e5e7eb]">
            <FolderKanban className="h-8 w-8 text-[#a1a1aa]" />
          </div>
          <h3 className="text-xl font-display font-bold text-[#1f1633]">No projects yet</h3>
          <p className="mt-2 text-[#71717a]">You haven't been added to any projects or none exist. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 pb-8">
          {projects.map((project) => {
            const tasks = project.tasks || [];
            const completed = tasks.filter(t => t.status === "done").length;
            const overdue = tasks.filter(t => {
              return new Date(t.dueDate) < new Date() && t.status !== "done";
            }).length;

            const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
            const recentTasks = [...tasks].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).slice(0, 3);

            return (
              <Link key={project.id} to={`/projects/${project.id}`} className="group h-full">
                <Card variant="light" className="h-full flex flex-col rounded-[24px] p-6 shadow-sm border border-[#e5e7eb] hover:shadow-lg hover:border-[#d4d4d8] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">

                  {/* Background Decoration */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.03] bg-[#1f1633] transition-transform duration-500 group-hover:scale-150" />

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <h3 className="text-xl font-display font-bold text-[#1f1633] truncate pr-4">{project.title}</h3>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f4f4f5] text-[#71717a] group-hover:bg-[#1f1633] group-hover:text-white transition-colors shrink-0">
                      <FolderKanban size={14} />
                    </div>
                  </div>

                  <p className="text-[#71717a] text-sm mb-6 line-clamp-2 h-10 leading-relaxed">{project.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-6 relative z-10">
                    <div className="flex justify-between text-xs font-bold text-[#1f1633] mb-2 uppercase tracking-wide">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#f4f4f5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#c2ef4e] transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                    <div className="flex flex-col items-center justify-center bg-[#fdfdfd] border border-[#e5e7eb] rounded-xl py-3 px-2 shadow-sm">
                      <Users size={16} className="text-[#a1a1aa] mb-1" />
                      <span className="text-lg font-bold text-[#1f1633]">{project.members?.length || 0}</span>
                      <span className="text-[9px] uppercase font-bold text-[#71717a] tracking-wider">Members</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-[#fdfdfd] border border-[#e5e7eb] rounded-xl py-3 px-2 shadow-sm">
                      <CheckCircle size={16} className="text-emerald-500 mb-1" />
                      <span className="text-lg font-bold text-[#1f1633]">{completed}/{tasks.length}</span>
                      <span className="text-[9px] uppercase font-bold text-[#71717a] tracking-wider">Tasks</span>
                    </div>
                    <div className={`flex flex-col items-center justify-center border rounded-xl py-3 px-2 shadow-sm transition-colors ${overdue > 0 ? "bg-rose-50 border-rose-100" : "bg-[#fdfdfd] border-[#e5e7eb]"}`}>
                      <AlertCircle size={16} className={overdue > 0 ? "text-rose-500 mb-1" : "text-[#a1a1aa] mb-1"} />
                      <span className={`text-lg font-bold ${overdue > 0 ? "text-rose-700" : "text-[#1f1633]"}`}>{overdue}</span>
                      <span className={`text-[9px] uppercase font-bold tracking-wider ${overdue > 0 ? "text-rose-600" : "text-[#71717a]"}`}>Overdue</span>
                    </div>
                  </div>

                  {/* Recent Tasks preview */}
                  <div className="flex-1 mb-6 relative z-10">
                    <h4 className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-3">Recent Tasks</h4>
                    <div className="space-y-2">
                      {recentTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 text-sm">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                          <span className="text-[#52525b] truncate flex-1">{task.title}</span>
                        </div>
                      ))}
                      {recentTasks.length === 0 && (
                        <div className="text-xs text-[#a1a1aa] italic">No tasks created yet</div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-[#f4f4f5] flex items-center justify-between text-[11px] font-bold text-[#71717a] uppercase tracking-wide relative z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#150f23] text-white flex items-center justify-center text-[9px] shadow-sm">
                        {project.creator?.name?.charAt(0).toUpperCase()}
                      </span>
                      <span>Owner</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
