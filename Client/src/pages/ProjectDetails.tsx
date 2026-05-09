import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Plus, Trash2, Calendar, GripHorizontal, CheckCircle, AlertCircle } from "lucide-react";

interface User { id: number; name: string; email: string; role: string; }
interface Member { id: number; user: User; }
interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignedTo: number;
  isOverdue: boolean;
}
interface ProjectDetail {
  id: number;
  title: string;
  description: string;
  members: Member[];
  tasks: Task[];
  creator: { id: number; name: string };
}

export function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", priority: "medium", assignedTo: "" });
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error("Failed to load project", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/tasks", {
        ...newTask,
        projectId: Number(id),
        assignedTo: Number(newTask.assignedTo)
      });
      setShowTaskForm(false);
      setNewTask({ title: "", description: "", dueDate: "", priority: "medium", assignedTo: "" });
      fetchProject();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await api.post(`/projects/${id}/members`, {
        email: newMemberEmail,
      });

      setShowMemberForm(false);
      setNewMemberEmail("");

      fetchProject();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
        "Failed to add member"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchProject();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to remove member");
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchProject();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-[#1f1633] font-medium animate-pulse">Loading project details...</div>;
  if (!project) return <div className="p-8 text-[#1f1633]">Project not found.</div>;

  const isAdmin = user?.role === "admin";
  const completedTasks = project.tasks.filter(t => t.status === "done").length;
  const overdueTasks = project.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== "done").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#e5e7eb] pb-6 md:flex-row md:items-start md:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#1f1633] tracking-tight">{project.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#71717a] font-ui leading-relaxed">{project.description}</p>
        </div>
        {isAdmin && (
          <div className="flex shrink-0 gap-3">
            <Button variant="ghost-dark" className="text-[#1f1633] bg-white border border-[#e5e7eb] shadow-sm" onClick={() => setShowMemberForm(!showMemberForm)}>Add Member</Button>
            <Button variant="primary" onClick={() => setShowTaskForm(!showTaskForm)}><Plus className="mr-2 h-4 w-4" /> New Task</Button>
          </div>
        )}
      </div>

      {/* Admin Forms */}
      <div className="space-y-4 shrink-0">
        {showMemberForm && isAdmin && (
          <Card
            variant="light"
            className="animate-in slide-in-from-top-4 rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
          >
            <div className="mb-6 flex flex-col gap-1">
              <h3 className="text-[20px] font-display font-bold text-[#1f1633]">
                Add Team Member
              </h3>

              <p className="text-sm leading-relaxed text-[#71717a]">
                Add a teammate to this workspace using their email address.
              </p>
            </div>

            <form
              onSubmit={handleAddMember}
              className="flex flex-col gap-4 md:flex-row md:items-end"
            >
              <div className="flex-1">
                <Input
                  label="Email Address"
                  labelClassName="text-[#1f1633]"
                  type="email"
                  placeholder="teammate@example.com"
                  required
                  value={newMemberEmail}
                  onChange={(e) =>
                    setNewMemberEmail(e.target.value)
                  }
                />
              </div>

              <div className="flex w-full gap-3 md:w-auto">
                <Button
                  type="button"
                  variant="ghost-dark"
                  className="w-full border border-[#e5e7eb] bg-white text-[#1f1633] hover:bg-[#f8f8f8] md:w-auto"
                  onClick={() => setShowMemberForm(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="w-full md:w-auto"
                >
                  Add Member
                </Button>
              </div>
            </form>
          </Card>
        )}


        {showTaskForm && isAdmin && (
          <Card variant="light" className="animate-in slide-in-from-top-4 rounded-2xl border-[#e5e7eb] shadow-md p-6">
            <h3 className="mb-6 text-lg font-bold text-[#1f1633] font-display">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div className=" grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input label="Title" labelClassName="text-[#1f1633]" required value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-[#1f1633]">Assign To</label>
                  <select required className="h-[48px] w-full rounded-xl border border-[#d9d9e3] bg-white px-4 text-sm text-[#1f1633] outline-none transition-all focus:ring-2 focus:ring-[#1f1633]/10" value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                    <option value="">Select Member</option>
                    {project.members.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
                <Input label="Due Date" labelClassName="text-[#1f1633]" type="datetime-local" required value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-[#1f1633]">Priority</label>
                  <select className="h-[48px] w-full rounded-xl border border-[#d9d9e3] bg-white px-4 text-sm text-[#1f1633] outline-none transition-all focus:ring-2 focus:ring-[#1f1633]/10" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-[#1f1633]">Description</label>
                <textarea required className="w-full rounded-xl border border-[#d9d9e3] px-4 py-3 text-[#1f1633] outline-none focus:ring-2 focus:ring-[#1f1633]/10" rows={2} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
              </div>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost-dark" className="text-[#1f1633] bg-white border border-[#e5e7eb] shadow-sm" onClick={() => setShowTaskForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>Create Task</Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-8 flex-1 min-h-0 pb-6">

        {/* Top Info Strip: Members + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">

          {/* Members Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-3">Team Members</h2>
            <div className="flex flex-wrap gap-3">
              {project.members.map((member) => (
                <div key={member.user.id} className="flex items-center gap-3 bg-white rounded-xl py-2 px-3 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#2a1f45] to-[#150f23] text-[10px] font-bold text-white shadow-sm border border-[#1f1633]">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#1f1633] leading-none">{member.user.name}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] uppercase font-bold text-[#71717a] tracking-[0.2px]">{member.user.role}</span>
                      {member.user.id === project.creator.id && (
                        <span className="text-[9px] bg-[#c2ef4e]/20 text-[#5c7a15] px-1.5 rounded uppercase font-bold tracking-wider">Owner</span>
                      )}
                    </div>
                  </div>
                  {isAdmin && member.user.id !== project.creator.id && (
                    <button onClick={() => handleRemoveMember(member.user.id)} className="ml-2 text-[#a1a1aa] hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50" title="Remove Member">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white border border-[#e5e7eb] rounded-xl p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">Completed</span>
                  <span className="text-lg font-display font-bold text-[#1f1633] leading-none mt-0.5">{completedTasks}/{project.tasks.length}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white border border-[#e5e7eb] rounded-xl p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <AlertCircle size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">Overdue</span>
                  <span className="text-lg font-display font-bold text-[#1f1633] leading-none mt-0.5">{overdueTasks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board - Tasks */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#fafafa] rounded-[24px] border border-[#e5e7eb] p-6 shadow-inner">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-lg font-display font-bold text-[#1f1633]">Task Board</h2>
            <div className="flex gap-2">
              <Badge variant="lime-keyword" className="shadow-sm border border-[#e5e7eb] bg-white">{project.tasks.length} Tasks</Badge>
            </div>
          </div>

          <div className="flex-1 flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
            <TaskGroup title="Todo" tasks={project.tasks.filter(t => t.status === "todo")} dotColor="bg-slate-300" members={project.members} user={user} isAdmin={isAdmin} handleUpdateTaskStatus={handleUpdateTaskStatus} />
            <TaskGroup title="In Progress" tasks={project.tasks.filter(t => t.status === "in_progress")} dotColor="bg-blue-500" members={project.members} user={user} isAdmin={isAdmin} handleUpdateTaskStatus={handleUpdateTaskStatus} />
            <TaskGroup title="Done" tasks={project.tasks.filter(t => t.status === "done")} dotColor="bg-emerald-500" members={project.members} user={user} isAdmin={isAdmin} handleUpdateTaskStatus={handleUpdateTaskStatus} />
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents

function TaskGroup({ title, tasks, dotColor, members, user, isAdmin, handleUpdateTaskStatus }: any) {
  return (
    <div className="w-[320px] shrink-0 flex flex-col h-full snap-center">
      <div className="flex items-center gap-2 px-1 mb-4 shrink-0">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h4 className="text-xs font-bold text-[#71717a] uppercase tracking-wider">{title}</h4>
        <span className="text-[10px] font-bold text-[#a1a1aa] ml-auto">{tasks.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4 scrollbar-thin">
        {tasks.map((task: any) => (
          <TaskCard
            key={task.id}
            task={task}
            members={members}
            canUpdate={isAdmin || task.assignedTo === user?.id}
            handleUpdateTaskStatus={handleUpdateTaskStatus}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center p-6 border-2 border-dashed border-[#e5e7eb] rounded-2xl text-[#a1a1aa] text-xs font-medium">
            No tasks in this list
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, members, canUpdate, handleUpdateTaskStatus }: any) {
  const getPriorityColor = (p: string) => {
    switch (p?.toUpperCase()) {
      case "HIGH": return "bg-rose-50 text-rose-700 border-rose-200";
      case "MEDIUM": return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOW": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";
  const assigneeName = members.find((m: any) => m.user.id === task.assignedTo)?.user.name;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl p-5 shadow-sm border border-[#e5e7eb] hover:shadow-md hover:border-[#d4d4d8] transition-all cursor-grab active:cursor-grabbing hover:-translate-y-0.5">

      {/* Drag handle */}
      <div className="absolute top-4 right-4 text-[#d4d4d8] opacity-0 group-hover:opacity-100 transition-opacity">
        <GripHorizontal size={14} />
      </div>

      <div className="flex items-start justify-between mb-3 pr-6">
        <h4 className="font-bold text-sm text-[#1f1633] leading-tight">{task.title}</h4>
      </div>

      {task.description && (
        <p className="text-xs text-[#71717a] line-clamp-2 mb-5 leading-relaxed">{task.description}</p>
      )}

      <div className="mt-auto flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
            {task.priority || "MEDIUM"}
          </span>
          {isOverdue && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              Overdue
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#f4f4f5]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa] font-medium">
            <Calendar size={12} />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-3">
            {canUpdate && (
              <select
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wide cursor-pointer focus:outline-none text-[#1f1633] transition-colors p-0"
                value={task.status}
                onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            )}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#150f23] text-white text-[10px] font-bold shadow-sm" title={assigneeName}>
              {assigneeName?.charAt(0).toUpperCase() || "?"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
