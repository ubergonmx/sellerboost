import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginFormInput = z.input<typeof loginSchema>;
export type LoginFormOutput = z.output<typeof loginSchema>;

export const signUpSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignUpFormInput = z.input<typeof signUpSchema>;
export type SignUpFormOutput = z.output<typeof signUpSchema>;
