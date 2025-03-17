/*
<ai_context>
Defines the database schema for bills.
</ai_context>
*/

import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const billsTable = pgTable("bills", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  restaurantName: text("restaurant_name"),
  hostName: text("host_name").notNull(),
  total: numeric("total").notNull(),
  tax: numeric("tax").notNull().default("0"),
  tip: numeric("tip").notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertBill = typeof billsTable.$inferInsert
export type SelectBill = typeof billsTable.$inferSelect
