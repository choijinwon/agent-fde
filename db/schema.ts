import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  payloadHash: text("payload_hash").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull().default(""),
  service: text("service").notNull(),
  budget: text("budget").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("접수 완료"),
  consentVersion: text("consent_version").notNull().default("2026-10-11"),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("inquiries_created_at_idx").on(table.createdAt)]);

export const inquiryRateLimits = sqliteTable("inquiry_rate_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(1),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("inquiry_rate_limits_expiry_idx").on(table.expiresAt)]);
