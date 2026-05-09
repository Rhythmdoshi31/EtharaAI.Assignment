import { Response } from "express";
import prisma from "../config/prisma.js";
import { AuthRequest } from "../types/index.js";

export const getDashboard = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const currentDate = new Date();

  if (user.role === "admin") {
    const totalProjects = await prisma.project.count();
    const totalUsers = await prisma.user.count();
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({
      where: { status: "done" },
    });
    const overdueTasks = await prisma.task.count({
      where: {
        dueDate: { lt: currentDate },
        status: { not: "done" },
      },
    });

    const groupedTasks = await prisma.task.groupBy({
      by: ['assignedTo'],
      _count: {
        id: true,
      },
    });

    const userIds = groupedTasks.map(g => g.assignedTo);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true }
    });

    const tasksPerUser = groupedTasks.map(g => {
      const u = users.find(u => u.id === g.assignedTo);
      return {
        userId: g.assignedTo,
        name: u?.name || "Unknown",
        taskCount: g._count.id,
      };
    });

    return res.json({
      totalProjects,
      totalUsers,
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksPerUser,
    });
  } else {
    const myTasksCount = await prisma.task.count({
      where: { assignedTo: user.id },
    });
    const completedTasks = await prisma.task.count({
      where: { assignedTo: user.id, status: "done" },
    });
    const pendingTasks = await prisma.task.count({
      where: { assignedTo: user.id, status: { not: "done" } },
    });
    const overdueTasks = await prisma.task.count({
      where: {
        assignedTo: user.id,
        dueDate: { lt: currentDate },
        status: { not: "done" },
      },
    });

    return res.json({
      myTasks: myTasksCount,
      completedTasks,
      pendingTasks,
      overdueTasks,
    });
  }
};
