/*
<ai_context>
Initializes the database connection and schema for the app.
</ai_context>
*/

import {
  billItemsTable,
  billsTable,
  itemSelectionsTable,
  participantsTable,
  profilesTable,
  todosTable
} from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

const schema = {
  profiles: profilesTable,
  todos: todosTable,
  bills: billsTable,
  billItems: billItemsTable,
  participants: participantsTable,
  itemSelections: itemSelectionsTable
}

const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
