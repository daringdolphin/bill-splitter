/*
<ai_context>
Defines the database schema for item selections.
</ai_context>
*/

import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { billItemsTable } from "./bill-items-schema"
import { participantsTable } from "./participants-schema"

export const itemSelectionsTable = pgTable("item_selections", {
  id: uuid("id").defaultRandom().primaryKey(),
  participantId: uuid("participant_id")
    .references(() => participantsTable.id, { onDelete: "cascade" })
    .notNull(),
  billItemId: uuid("bill_item_id")
    .references(() => billItemsTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertItemSelection = typeof itemSelectionsTable.$inferInsert
export type SelectItemSelection = typeof itemSelectionsTable.$inferSelect
