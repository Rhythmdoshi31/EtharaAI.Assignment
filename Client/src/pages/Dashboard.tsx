import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Briefcase, CheckCircle, AlertCircle, ListTodo, GripHorizontal, Calendar, Clock, MoreHorizontal } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalProjects?: number;
  totalUsers?: number;
  totalTasks?: number;
  completedTasks: number;
  overdueTasks: number;
  myTasks?: number;
  pendingTasks?: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Base dashboard stats
        const statsRes = await api.get("/dashboard");
        setStats(statsRes.data);

        // Get projects
        const projectsRes = await api.get("/projects");

        // Fetch detailed project data with tasks
        const detailedProjects = await Promise.all(
          projectsRes.data.map(async (project: any) => {
            try {
              const res = await api.get(`/projects/${project.id}`);

              return {
                ...project,
                ...res.data,
                tasks: (res.data.tasks || []).slice(0, 10),
              };
            } catch (err) {
              console.error(
                `Failed to fetch project ${project.id}`,
                err
              );

              return {
                ...project,
                tasks: [],
              };
            }
          })
        );

        setProjects(detailedProjects);

        const tasksRes = await api.get("/tasks/my");
        setTasks(tasksRes.data);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center text-[#1f1633] font-medium animate-pulse">Loading workspace...</div>;
  if (!stats) return null;

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-end justify-between shrink-0 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#1f1633] tracking-tight">Workspace</h1>
          <p className="mt-2 text-[#71717a] font-ui text-sm">Welcome back, {user?.name}</p>
        </div>
        <Badge variant="lime-keyword" className="hidden sm:inline-flex shadow-sm">{isAdmin ? "Admin View" : "Member View"}</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 shrink-0 mb-10">
        {isAdmin ? (
          <>
            <StatCard title="Total Projects" value={stats.totalProjects} icon={Briefcase} colorClass="bg-[#f8fafc] text-slate-600 border border-slate-200" />
            <StatCard title="Total Tasks" value={stats.totalTasks} icon={ListTodo} colorClass="bg-[#f0f9ff] text-sky-600 border border-sky-200" />
            <StatCard title="Completed" value={stats.completedTasks} icon={CheckCircle} colorClass="bg-[#f0fdf4] text-emerald-600 border border-emerald-200" />
            <StatCard title="Overdue" value={stats.overdueTasks} icon={AlertCircle} colorClass="bg-[#fff1f2] text-rose-600 border border-rose-200" badge="overdue" />
          </>
        ) : (
          <>
            <StatCard title="My Tasks" value={stats.myTasks} icon={ListTodo} colorClass="bg-[#f0f9ff] text-sky-600 border border-sky-200" />
            <StatCard title="Pending" value={stats.pendingTasks} icon={Clock} colorClass="bg-[#fffbeb] text-amber-600 border border-amber-200" />
            <StatCard title="Completed" value={stats.completedTasks} icon={CheckCircle} colorClass="bg-[#f0fdf4] text-emerald-600 border border-emerald-200" />
            <StatCard title="Overdue" value={stats.overdueTasks} icon={AlertCircle} colorClass="bg-[#fff1f2] text-rose-600 border border-rose-200" badge="overdue" />
          </>
        )}
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-lg font-bold text-[#1f1633] mb-4 shrink-0 font-display">Project Task Boards</h2>

        <div className="flex-1 flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-thin">
          {projects.length === 0 && (
            <div className="w-full flex items-center justify-center border-2 border-dashed border-[#e5e7eb] rounded-2xl text-[#a1a1aa] font-medium">
              No projects found. Create one to get started!
            </div>
          )}

          {projects.map((project) => {
            const projectTasks = project.tasks || [];
            const todoTasks = projectTasks.filter(t => t.status === "todo");
            const inProgressTasks = projectTasks.filter(t => t.status === "in_progress");
            const doneTasks = projectTasks.filter(t => t.status === "done");

            return (
              <div key={project.id} className="w-[340px] shrink-0 flex flex-col bg-[#fafafa] border border-[#e5e7eb] rounded-[20px] p-4 snap-center shadow-sm">
                <div className="flex items-center justify-between mb-5 px-1 shrink-0">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex-1 truncate pr-4 text-left font-bold text-[#1f1633] text-sm uppercase tracking-wider transition-colors hover:text-[#4f46e5]"
                  >
                    {project.title}
                  </button>
                  <span className="text-[11px] font-bold text-[#71717a] bg-white px-2.5 py-1 rounded-md shadow-sm border border-[#e5e7eb]">{projectTasks.length} tasks</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
                  {projectTasks.length === 0 ? (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-[#e5e7eb] rounded-xl text-[#a1a1aa] text-xs font-medium">
                      No tasks yet
                    </div>
                  ) : (
                    <>
                      <TaskGroup title="Todo" tasks={todoTasks} dotColor="bg-slate-300" />
                      <TaskGroup title="In Progress" tasks={inProgressTasks} dotColor="bg-blue-500" />
                      <TaskGroup title="Done" tasks={doneTasks} dotColor="bg-emerald-500" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Subcomponents

function StatCard({ title, value, icon: Icon, colorClass, badge }: any) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-sm border border-[#e5e7eb] group hover:shadow-md hover:border-[#d4d4d8] transition-all duration-300 hover:-translate-y-0.5">
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#71717a] mb-2">{title}</p>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-display font-bold text-[#1f1633]">{value || 0}</h3>
            {badge === "overdue" && value > 0 && <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-wider">Action Needed</span>}
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${colorClass}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

function TaskGroup({ title, tasks, dotColor }: { title: string, tasks: any[], dotColor: string }) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h4 className="text-xs font-bold text-[#71717a] uppercase tracking-wider">{title}</h4>
        <span className="text-[10px] font-bold text-[#a1a1aa] ml-auto">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            projectId={task.projectId}
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, projectId }: { task: any; projectId: number }) {
  const navigate = useNavigate();
  const getPriorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
      case "high": return "bg-rose-50 text-rose-700 border-rose-200";
      case "medium": return "bg-amber-50 text-amber-700 border-amber-200";
      case "low": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <button
      onClick={() => navigate(`/projects/${projectId}`)}
      className="group relative flex flex-col bg-white rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-[#e5e7eb] hover:shadow-md hover:border-[#d4d4d8] transition-all text-left"
    >
      <div className="flex items-start justify-between mb-2 pr-4">
        <h4 className="font-bold text-sm text-[#1f1633] leading-tight">{task.title}</h4>
        <button className="text-[#a1a1aa] hover:text-[#1f1633] transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-[#71717a] line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
            {task.priority || "MEDIUM"}
          </span>
          {isOverdue && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Overdue
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#f4f4f5]">
          <div className="flex items-center gap-1.5 text-[10px] text-[#a1a1aa] font-medium uppercase tracking-wider">
            <Calendar size={12} />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1f1633] text-white text-[9px] font-bold shadow-sm">
            {task.assignedTo ? "A" : "U"}
          </div>
        </div>
      </div>
    </button>
  );
}
