import { relations } from "drizzle-orm";
import { pgTable, pgEnum, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "hr", "employee"]);

export const company = pgTable("company", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  role: roleEnum("role").notNull().default("employee"),
  companyId: text("company_id").references(() => company.id, { onDelete: "cascade" }),
  employeeCode: text("employee_code").unique(),
  joinYear: integer("join_year"),
  mustResetPassword: boolean("must_reset_password").default(false).notNull(),
  phone: text("phone"),

  // Required by better-auth's `admin` plugin
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
}, (table) => [index("user_company_idx").on(table.companyId)]);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("session_userId_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [index("account_userId_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "leave"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "rejected"]);
export const wageTypeEnum = pgEnum("wage_type", ["fixed"]);

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  companyId: text("company_id").notNull().references(() => company.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: attendanceStatusEnum("status").notNull().default("present"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("attendance_user_date_idx").on(table.userId, table.date)]);

export const leaveRequest = pgTable("leave_request", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  companyId: text("company_id").notNull().references(() => company.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("Leave"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  reason: text("reason"),
  status: leaveStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("leave_user_idx").on(table.userId)]);

export const profileDetails = pgTable("profile_details", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  jobPosition: text("job_position"),
  department: text("department"),
  manager: text("manager"),
  location: text("location"),
  dob: text("dob"),
  residingAddress: text("residing_address"),
  nationality: text("nationality"),
  personalEmail: text("personal_email"),
  gender: text("gender"),
  maritalStatus: text("marital_status"),
  bankAccountNumber: text("bank_account_number"),
  bankName: text("bank_name"),
  ifscCode: text("ifsc_code"),
  panNo: text("pan_no"),
  uanNo: text("uan_no"),
  about: text("about"),
  hobbies: text("hobbies"),
  skills: text("skills"),
  certifications: text("certifications"),
  leaveEntitlement: integer("leave_entitlement").notNull().default(18),
});

export const passwordResetStatusEnum = pgEnum("password_reset_status", ["pending", "resolved"]);

export const passwordResetRequest = pgTable("password_reset_request", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  companyId: text("company_id").notNull().references(() => company.id, { onDelete: "cascade" }),
  status: passwordResetStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
}, (table) => [index("password_reset_user_idx").on(table.userId)]);

export const salaryInfo = pgTable("salary_info", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  wageType: wageTypeEnum("wage_type").notNull().default("fixed"),
  monthlyWage: integer("monthly_wage").notNull().default(0),
  workingDaysPerWeek: integer("working_days_per_week").notNull().default(5),
  breakTimeHours: integer("break_time_hours").notNull().default(1),
  pfEmployeePct: integer("pf_employee_pct").notNull().default(12),
  pfEmployerPct: integer("pf_employer_pct").notNull().default(12),
  professionalTax: integer("professional_tax").notNull().default(200),
});

export const companyRelations = relations(company, ({ many }) => ({
  employees: many(user),
}));


export const userRelations = relations(user, ({ one, many }) => ({
  company: one(company, { fields: [user.companyId], references: [company.id] }),
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));