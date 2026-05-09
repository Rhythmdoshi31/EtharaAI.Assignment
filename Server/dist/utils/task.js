export const isTaskOverdue = (dueDate, status) => {
    return dueDate < new Date() && status !== "done";
};
//# sourceMappingURL=task.js.map