/*
<ai_context>
Defines the database schema for participants.
</ai_context>
*/

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { billsTable } from "./bills-schema"

export const participantsTable = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  billId: uuid("bill_id")
    .references(() => billsTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertParticipant = typeof participantsTable.$inferInsert
export type SelectParticipant = typeof participantsTable.$inferSelect
