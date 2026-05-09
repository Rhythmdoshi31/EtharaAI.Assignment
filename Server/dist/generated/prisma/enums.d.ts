export declare const Role: {
    readonly admin: "admin";
    readonly member: "member";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const TaskStatus: {
    readonly todo: "todo";
    readonly in_progress: "in_progress";
    readonly done: "done";
};
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export declare const Priority: {
    readonly low: "low";
    readonly medium: "medium";
    readonly high: "high";
};
export type Priority = (typeof Priority)[keyof typeof Priority];
//# sourceMappingURL=enums.d.ts.map