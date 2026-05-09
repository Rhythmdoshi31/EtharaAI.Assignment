import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  FolderKanban,
  ListTodo,
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  isOverdue: boolean;
  project: {
    id: number;
    title: string;
    name?: string;
  };
}

export function MyTasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate-asc");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const [updating, setUpdating] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/my");
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (
    taskId: number,
    newStatus: string
  ) => {
    setUpdating(taskId);

    try {
      await api.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
              ...task,
              status: newStatus as any,
            }
            : task
        )
      );
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
        "Failed to update status"
      );
    } finally {
      setUpdating(null);
    }
  };

  const processedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      if (filter !== "all" && task.status !== filter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();

        return (
          task.title.toLowerCase().includes(q) ||
          task.project?.title
            ?.toLowerCase()
            .includes(q)
        );
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === "dueDate-asc") {
        return (
          new Date(a.dueDate).getTime() -
          new Date(b.dueDate).getTime()
        );
      }

      if (sortBy === "dueDate-desc") {
        return (
          new Date(b.dueDate).getTime() -
          new Date(a.dueDate).getTime()
        );
      }

      if (sortBy === "priority-desc") {
        const map: any = {
          high: 3,
          medium: 2,
          low: 1,
        };

        return (
          (map[b.priority] || 0) -
          (map[a.priority] || 0)
        );
      }

      return 0;
    });

    return filtered;
  }, [tasks, filter, searchQuery, sortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-200";

      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm font-medium text-[#71717a]">
        Loading your tasks...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-3 border-b border-[#e5e7eb] pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#1f1633]">
          My Tasks
        </h1>

        <p className="text-sm text-[#71717a]">
          Organize, update, and manage your assigned
          work.
        </p>
      </div>

      {/* CONTROLS */}
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center">
        {/* SEARCH */}
        <div className="relative w-full flex-1 xl:max-w-[520px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1aa]" />

          <input
            type="text"
            placeholder="Search tasks or projects..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="
              h-11 w-full rounded-2xl border border-[#e5e7eb]
              bg-white pl-11 pr-4 text-sm text-[#1f1633]
              shadow-sm outline-none transition-all
              placeholder:text-[#a1a1aa]
              focus:border-[#1f1633]
              focus:ring-4 focus:ring-[#1f1633]/5
            "
          />
        </div>

        {/* FILTER DROPDOWNS */}
        <div className="flex flex-col gap-3 sm:flex-row xl:ml-auto">

          {/* STATUS */}
          <div
            className="relative"
            onMouseEnter={() => setStatusDropdownOpen(true)}
            onMouseLeave={() => setStatusDropdownOpen(false)}
          >
            <div
              className="
        flex h-11 min-w-[190px] items-center gap-2
        rounded-2xl border border-[#e5e7eb]
        bg-white px-4 shadow-sm
      "
            >
              <Filter className="h-4 w-4 text-[#71717a]" />

              <span className="flex-1 text-sm font-medium text-[#1f1633]">
                {filter === "all"
                  ? "All Status"
                  : filter === "todo"
                    ? "To Do"
                    : filter === "in_progress"
                      ? "In Progress"
                      : "Done"}
              </span>

              <span className="text-xs text-[#71717a]">⌄</span>
            </div>

            {statusDropdownOpen && (
              <div
                className="
          absolute left-0 top-[45px] z-50
          w-full rounded-2xl border border-[#e5e7eb]
          bg-white p-2 shadow-xl
        "
              >
                {[
                  { label: "All Status", value: "all" },
                  { label: "To Do", value: "todo" },
                  { label: "In Progress", value: "in_progress" },
                  { label: "Done", value: "done" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    className={`
              w-full rounded-xl px-3 py-2 text-left
              text-sm transition-all
              ${filter === item.value
                        ? "bg-[#f4f4f5] font-semibold text-[#1f1633]"
                        : "text-[#71717a] hover:bg-[#fafafa]"
                      }
            `}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SORT */}
          <div
            className="relative"
            onMouseEnter={() => setDateDropdownOpen(true)}
            onMouseLeave={() => setDateDropdownOpen(false)}
          >
            <div
              className="
        flex h-11 min-w-[230px] items-center gap-2
        rounded-2xl border border-[#e5e7eb]
        bg-white px-4 shadow-sm
      "
            >
              <ArrowUpDown className="h-4 w-4 text-[#71717a]" />

              <span className="flex-1 text-sm font-medium text-[#1f1633]">
                {sortBy === "dueDate-asc"
                  ? "Due Date (Earliest)"
                  : sortBy === "dueDate-desc"
                    ? "Due Date (Latest)"
                    : "Priority"}
              </span>

              <span className="text-xs text-[#71717a]">⌄</span>
            </div>

            {dateDropdownOpen && (
              <div
                className="
          absolute left-0 top-[45px] z-50
          w-full rounded-2xl border border-[#e5e7eb]
          bg-white p-2 shadow-xl
        "
              >
                {[
                  {
                    label: "Due Date (Earliest)",
                    value: "dueDate-asc",
                  },
                  {
                    label: "Due Date (Latest)",
                    value: "dueDate-desc",
                  },
                  {
                    label: "Priority",
                    value: "priority-desc",
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSortBy(item.value)}
                    className={`
              w-full rounded-xl px-3 py-2 text-left
              text-sm transition-all
              ${sortBy === item.value
                        ? "bg-[#f4f4f5] font-semibold text-[#1f1633]"
                        : "text-[#71717a] hover:bg-[#fafafa]"
                      }
            `}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EMPTY */}
      {processedTasks.length === 0 ? (
        <div
          className="
            flex min-h-[320px] w-full flex-col items-center
            justify-center rounded-[28px]
            border border-dashed border-[#e5e7eb]
            bg-white px-6 text-center
          "
        >
          <div className="mb-5 rounded-2xl border border-[#e5e7eb] bg-[#fafafa] p-5">
            <ListTodo className="h-10 w-10 text-[#a1a1aa]" />
          </div>

          <h3 className="text-xl font-bold text-[#1f1633]">
            No tasks found
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#71717a]">
            You currently have no tasks matching your
            selected filters.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-8">
          {processedTasks.map((task) => {
            const isOverdue =
              new Date(task.dueDate) < new Date() &&
              task.status !== "done";

            return (
              <div
                key={task.id}
                className="
                  flex flex-col gap-5 rounded-[28px]
                  border border-[#ececf1]
                  bg-[#fcfcfd]
                  p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]
                "
              >
                {/* TOP */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* LEFT */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`
                          rounded-full border px-3 py-1
                          text-[10px] font-bold uppercase tracking-wider
                          ${getPriorityColor(task.priority)}
                        `}
                      >
                        {task.priority}
                      </span>

                      {isOverdue && (
                        <span
                          className="
                            rounded-full border border-rose-200
                            bg-rose-50 px-3 py-1
                            text-[10px] font-bold uppercase tracking-wider
                            text-rose-700
                          "
                        >
                          Overdue
                        </span>
                      )}
                    </div>

                    <h2
                      className="
                        text-lg font-bold leading-tight
                        text-[#1f1633]
                      "
                    >
                      {task.title}
                    </h2>

                    {task.description && (
                      <p
                        className="
                          mt-3 text-sm leading-7
                          text-[#71717a]
                        "
                      >
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* STATUS */}
                  <div className="w-full lg:w-[180px]">
                    <select
                      disabled={updating === task.id}
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateStatus(
                          task.id,
                          e.target.value
                        )
                      }
                      className="
                        h-11 w-full rounded-2xl border border-[#e5e7eb]
                        bg-white px-4 text-sm font-semibold
                        text-[#1f1633] shadow-sm outline-none
                        transition-all
                        focus:border-[#1f1633]
                        focus:ring-4 focus:ring-[#1f1633]/5
                      "
                    >
                      <option value="todo">
                        To Do
                      </option>

                      <option value="in_progress">
                        In Progress
                      </option>

                      <option value="done">
                        Done
                      </option>
                    </select>
                  </div>
                </div>

                {/* BOTTOM */}
                <div
                  className="
                    flex flex-col gap-3 border-t border-[#f1f1f4]
                    pt-4 sm:flex-row sm:items-center
                    sm:justify-between
                  "
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className="
                        flex items-center gap-2 rounded-xl
                        border border-[#e5e7eb]
                        bg-[#fafafa] px-3 py-2
                        text-xs font-medium text-[#1f1633]
                      "
                    >
                      <FolderKanban className="h-4 w-4 text-[#71717a]" />

                      <span className="max-w-[180px] truncate">
                        {task.project?.title}
                      </span>
                    </div>

                    <div
                      className="
                        flex items-center gap-2 text-xs
                        font-medium text-[#71717a]
                      "
                    >
                      <Calendar className="h-4 w-4" />

                      <span>
                        {new Date(
                          task.dueDate
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-10 w-10 items-center justify-center
                        rounded-2xl bg-[#150f23]
                        text-sm font-bold text-white
                      "
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#1f1633]">
                        {user?.name}
                      </p>

                      <p className="text-xs text-[#71717a]">
                        Assigned User
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}