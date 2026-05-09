import { z } from "zod";
export declare const signupSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        admin: "admin";
        member: "member";
    }>>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const createProjectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
}, z.core.$strip>;
export declare const addMemberSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    assignedTo: z.ZodNumber;
    projectId: z.ZodNumber;
    dueDate: z.ZodString;
    priority: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>>>;
}, z.core.$strip>;
export declare const updateTaskStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        todo: "todo";
        in_progress: "in_progress";
        done: "done";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=index.d.ts.map