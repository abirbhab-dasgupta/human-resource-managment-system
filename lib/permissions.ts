import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  user: [
    "create", "list", "set-role", "ban", "impersonate",
    "delete", "set-password", "set-email", "get", "update",
  ],
  session: ["list", "revoke", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  user: [
    "create", "list", "set-role", "ban", "impersonate",
    "delete", "set-password", "set-email", "get", "update",
  ],
  session: ["list", "revoke", "delete"],
});

export const hrRole = ac.newRole({
  user: ["create", "list", "set-role", "get", "update"],
  session: ["list"],
});

export const employeeRole = ac.newRole({
  user: [],
  session: [],
});