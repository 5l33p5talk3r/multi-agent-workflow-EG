import { pgTable, text, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  niche: text("niche").default("AI & Tech Tools"),
  brandVoice: text("brand_voice").default("Deep-dive, authoritative, actionable, slightly cheeky"),
  apiKeys: text("api_keys"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  avatar: text("avatar").notNull(), // Emoji or icon code
  color: text("color").default("indigo"),
  model: text("model").default("Claude 3.5 Sonnet"),
  temperature: real("temperature").default(0.7),
  systemPrompt: text("system_prompt").notNull(),
  tools: text("tools").default("[]"), // JSON array
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflows = pgTable("workflows", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  nicheCategory: text("niche_category").default("General Niche"),
  isTemplate: boolean("is_template").default(false),
  nodes: text("nodes").notNull(), // JSON array of workflow steps/nodes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const executions = pgTable("executions", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").references(() => workflows.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  targetNiche: text("target_niche").default("Tech & AI"),
  targetPlatforms: text("target_platforms").default("[]"), // JSON string array
  status: text("status").notNull().default("queued"), // queued, running, waiting_approval, completed, failed
  currentStepIndex: integer("current_step_index").default(0),
  scratchpad: text("scratchpad").default("{}"), // JSON object
  logs: text("logs").default("[]"), // JSON array of logs
  finalOutputs: text("final_outputs").default("{}"), // JSON object
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const contentItems = pgTable("content_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  executionId: text("execution_id"),
  title: text("title").notNull(),
  niche: text("niche").default("Tech"),
  platform: text("platform").notNull(), // twitter, youtube, substack, linkedin, instagram, blog
  status: text("status").notNull().default("draft"), // draft, scheduled, published
  content: text("content").notNull(),
  metadata: text("metadata").default("{}"), // JSON string for hooks, tags, scheduledTime
  engagementMetrics: text("engagement_metrics").default("{}"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const nicheTrends = pgTable("niche_trends", {
  id: text("id").primaryKey(),
  niche: text("niche").notNull(),
  topic: text("topic").notNull(),
  summary: text("summary").notNull(),
  score: integer("score").default(85),
  sources: text("sources").default("[]"), // JSON array
  suggestedHooks: text("suggested_hooks").default("[]"), // JSON array
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
