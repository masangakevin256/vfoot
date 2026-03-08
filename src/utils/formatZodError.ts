import { ZodError } from "zod";

export const formatZodError = (error: ZodError): string => {
    const issue = error.issues[0];
    const field = issue.path.join(".");
    return `Invalid input: ${field ? field + " - " : ""}${issue.message}`;
};
