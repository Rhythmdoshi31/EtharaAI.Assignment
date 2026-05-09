import { Response } from "express";
import prisma from "../config/prisma.js";
import { AuthRequest } from "../types/index.js";
import { createTaskSchema, updateTaskStatusSchema } from "../schema/index.js";
import { isTaskOverdue } from "../utils/task.ts";

export const createTask = async (req: AuthRequest, res: Response) => {
  const data = createTaskSchema.parse(req.body);

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const user = await prisma.user.findUnique({
    where: { id: data.assignedTo },
  });

  if (!user) {
    return res.status(404).json({ message: "Assignee not found" });
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: data.projectId,
        userId: data.assignedTo,
      },
    },
  });

  if (!membership) {
    return res.status(400).json({ message: "Assigned user is not a member of the project" });
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: "todo",
      dueDate: new Date(data.dueDate),
      assignedTo: data.assignedTo,
      projectId: data.projectId,
      priority: data.priority as any,
    },
  });

  res.status(201).json({
    ...task,
    isOverdue: isTaskOverdue(task.dueDate, task.status),
  });
};

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  const tasks = await prisma.task.findMany({
    where: {
      assignedTo: req.user!.id,
    },
    include: {
      project: { select: { id: true, title: true } },
    },
  });

  const formattedTasks = tasks.map((task) => ({
    ...task,
    isOverdue: isTaskOverdue(task.dueDate, task.status),
  }));

  res.json(formattedTasks);
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  const taskId = parseInt(req.params.id as string);

  if (isNaN(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: { select: { id: true, title: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json({
    ...task,
    isOverdue: isTaskOverdue(task.dueDate, task.status),
  });
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  const taskId = parseInt(req.params.id as string);

  if (isNaN(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  const data = updateTaskStatusSchema.parse(req.body);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (task.assignedTo !== req.user!.id && req.user!.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Not assigned to this task" });
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: data.status,
    },
  });

  res.json({
    ...updatedTask,
    isOverdue: isTaskOverdue(
      updatedTask.dueDate,
      updatedTask.status
    ),
  });
};
