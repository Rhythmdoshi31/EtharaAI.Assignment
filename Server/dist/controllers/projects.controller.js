import prisma from "../config/prisma.js";
import { createProjectSchema, addMemberSchema } from "../schema/index.js";
import { isTaskOverdue } from "../utils/task.js";
export const createProject = async (req, res) => {
    const data = createProjectSchema.parse(req.body);
    const project = await prisma.project.create({
        data: {
            title: data.title,
            description: data.description,
            createdBy: req.user.id,
            // Create will create the member in the ProjectMember table as well
            members: {
                create: {
                    userId: req.user.id,
                },
            },
        },
    });
    res.status(201).json(project);
};
export const getProjects = async (req, res) => {
    const projects = await prisma.project.findMany({
        where: {
            members: {
                some: {
                    userId: req.user.id,
                },
            },
        },
        include: {
            creator: { select: { id: true, name: true, email: true } },
        },
    });
    res.json(projects);
};
export const getProjectById = async (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
    }
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            members: {
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                },
            },
            tasks: true,
            creator: { select: { id: true, name: true, email: true } },
        },
    });
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    const isMember = project.members.some((m) => m.userId === req.user.id);
    if (!isMember && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Not a project member" });
    }
    res.json({
        ...project,
        tasks: project.tasks.map(task => ({
            ...task,
            isOverdue: isTaskOverdue(task.dueDate, task.status)
        }))
    });
};
export const addMember = async (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
        return res.status(400).json({
            message: "Invalid project ID",
        });
    }
    const data = addMemberSchema.parse(req.body);
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        return res.status(404).json({
            message: "Project not found",
        });
    }
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }
    const existingMember = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: user.id,
            },
        },
    });
    if (existingMember) {
        return res.status(400).json({
            message: "User is already a member of this project",
        });
    }
    const member = await prisma.projectMember.create({
        data: {
            projectId,
            userId: user.id,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    res.status(201).json(member);
};
export const removeMember = async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const userId = parseInt(req.params.userId);
    if (isNaN(projectId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid project ID or user ID" });
    }
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (project.createdBy === userId) {
        return res.status(400).json({ message: "Cannot remove the project creator" });
    }
    const existingMember = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
    });
    if (!existingMember) {
        return res.status(404).json({ message: "User is not a member of this project" });
    }
    await prisma.projectMember.delete({
        where: { id: existingMember.id },
    });
    res.json({ message: "Member removed successfully" });
};
//# sourceMappingURL=projects.controller.js.map