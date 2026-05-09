import { ZodError } from "zod";
export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation Error",
            errors: err.issues.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            })),
        });
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({ message });
};
//# sourceMappingURL=error.js.map