import { boolean, integer, jsonb, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { PoseMetrics, PosePoint, View } from "@/lib/types";

export const athletes = pgTable("athletes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(),
  sport: text("sport").notNull().default("General"),
  height: real("height").notNull(),
  weight: real("weight").notNull(),
  demo: boolean("demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const evaluations = pgTable("evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  type: text("type").$type<"postural" | "rutina">().notNull(),
  view: text("view").$type<View>().notNull().default("Frontal"),
  demo: boolean("demo").notNull().default(false),
  score: real("score"),
  landmarks: jsonb("landmarks").$type<PosePoint[]>().notNull(),
  metrics: jsonb("metrics").$type<PoseMetrics | null>(),
  landmarkNotes: jsonb("landmark_notes").$type<Record<string, string>>().notNull().default({}),
  notes: text("notes").notNull().default(""),
  snapshot: text("snapshot"),
  exercise: text("exercise"),
  repetitions: integer("repetitions").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const measurements = pgTable("measurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  values: jsonb("values").$type<Record<string, number>>().notNull(),
  notes: text("notes").notNull().default(""),
  demo: boolean("demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
