/*
<ai_context>
Defines the database schema for bill items.
</ai_context>
*/

import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { billsTable } from "./bills-schema"

export const billItemsTable = pgTable("bill_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  billId: uuid("bill_id")
    .references(() => billsTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  price: numeric("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  shared: boolean("shared").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertBillItem = typeof billItemsTable.$inferInsert
export type SelectBillItem = typeof billItemsTable.$inferSelect
