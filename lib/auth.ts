import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { ac, adminRole, hrRole, employeeRole } from "@/lib/permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "employee", input: false },
      companyId: { type: "string", required: false, input: false },
      employeeCode: { type: "string", required: false, input: false },
      mustResetPassword: { type: "boolean", defaultValue: false, input: false },
      phone: { type: "string", required: false },
    },
  },
  plugins: [
    admin({
      defaultRole: "employee",
      adminRoles: ["admin", "hr"],
      ac,
      roles: {
        admin: adminRole,
        hr: hrRole,
        employee: employeeRole,
      },
    }),
  ],
});