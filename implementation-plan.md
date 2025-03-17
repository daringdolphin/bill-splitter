# Implementation Plan
## Database Schema
- [ ] Step 1: Create bills schema
  - **Task**: Define the billsTable schema to store bill metadata, including a unique session ID for access control, as per the technical specification.
  - **Files**:
    - `db/schema/bills-schema.ts`: Define billsTable with fields: id (uuid, primary key), session_id (text, unique, not null), restaurant_name (text), host_name (text, not null), total (numeric, not null), tax (numeric, not null, default 0), tip (numeric, not null, default 0), created_at (timestamp, default now), updated_at (timestamp, default now, on update).
    - `db/schema/index.ts`: Export billsTable.
    - `db/db.ts`: Add bills to the schema object.
  - **Step Dependencies**: None
  - **User Instructions**: Ensure DATABASE_URL is set in .env.local for Supabase Postgres connection.
- [ ] Step 2: Create bill_items schema
  - **Task**: Define the billItemsTable schema for bill items, linked to bills via foreign key, supporting shared item tracking.
  - **Files**:
    - `db/schema/bill-items-schema.ts`: Define billItemsTable with fields: id (uuid, primary key), bill_id (uuid, references bills(id), on delete cascade, not null), name (text, not null), price (numeric, not null), quantity (integer, not null, default 1), shared (boolean, not null, default false), created_at (timestamp, default now), updated_at (timestamp, default now, on update).
    - `db/schema/index.ts`: Export billItemsTable.
    - `db/db.ts`: Add billItems to the schema.
  - **Step Dependencies**: Step 1
  - **User Instructions**: None
- [ ] Step 3: Create participants schema
  - **Task**: Define the participantsTable schema to track participants per bill, linked to bills via foreign key.
  - **Files**:
    - `db/schema/participants-schema.ts`: Define participantsTable with fields: id (uuid, primary key), bill_id (uuid, references bills(id), on delete cascade, not null), name (text, not null), created_at (timestamp, default now), updated_at (timestamp, default now, on update).
    - `db/schema/index.ts`: Export participantsTable.
    - `db/db.ts`: Add participants to the schema.
  - **Step Dependencies**: Step 1
  - **User Instructions**: None
- [ ] Step 4: Create item_selections schema
  - **Task**: Define the itemSelectionsTable schema to record item selections by participants, linking participants and bill items.
  - **Files**:
    - `db/schema/item-selections-schema.ts`: Define itemSelectionsTable with fields: id (uuid, primary key), participant_id (uuid, references participants(id), on delete cascade, not null), bill_item_id (uuid, references bill_items(id), on delete cascade, not null), created_at (timestamp, default now), updated_at (timestamp, default now, on update).
    - `db/schema/index.ts`: Export itemSelectionsTable.
    - `db/db.ts`: Add itemSelections to the schema.
  - **Step Dependencies**: Step 2, Step 3
  - **User Instructions**: None

## Server Actions
- [ ] Step 5: Implement createBillAction
  - **Task**: Create a server action to insert a new bill, its items, and the host as the first participant, generating a unique session ID.
  - **Files**:
    - `actions/db/bills-actions.ts`: Implement createBillAction to generate a UUID for session_id, insert into bills and bill_items, add host to participants, and return the bill data with session ID.
  - **Step Dependencies**: Step 1, Step 2, Step 3
  - **User Instructions**: Ensure uuid library is installed (npm install uuid).
- [ ] Step 6: Implement getBillBySessionIdAction
  - **Task**: Create a server action to retrieve bill data, including items and participant selections, by session ID.
  - **Files**:
    - `actions/db/bills-actions.ts`: Implement getBillBySessionIdAction to query bills with joins to bill_items, participants, and item_selections.
  - **Step Dependencies**: Step 1, Step 2, Step 3, Step 4
  - **User Instructions**: None
- [ ] Step 7: Implement updateBillItemsAction
  - **Task**: Create a server action to update multiple bill items (e.g., name, price, quantity, shared status) during review.
  - **Files**:
    - `actions/db/bills-actions.ts`: Implement updateBillItemsAction to accept an array of updated items and update bill_items.
  - **Step Dependencies**: Step 2
  - **User Instructions**: None
- [ ] Step 8: Implement addParticipantAction
  - **Task**: Create a server action to add a new participant to a bill, ensuring unique names within the bill context.
  - **Files**:
    - `actions/db/participants-actions.ts`: Implement addParticipantAction to insert into participants with bill_id and name.
  - **Step Dependencies**: Step 3
  - **User Instructions**: None
- [ ] Step 9: Implement updateParticipantSelectionsAction
  - **Task**: Create a server action to update a participant's item selections by deleting old selections and inserting new ones.
  - **Files**:
    - `actions/db/participants-actions.ts`: Implement updateParticipantSelectionsAction to handle participant_id and an array of bill_item_ids.
  - **Step Dependencies**: Step 4
  - **User Instructions**: None

## Utility Functions
- [ ] Step 10: Implement calculateShares utility
  - **Task**: Implement a utility function to calculate each participant's share, splitting shared items among selectors and taxes/tips equally.
  - **Files**:
    - `lib/bill-calculations.ts`: Update calculateShares to process bill data, handle shared and individual items, and return participant shares and unclaimed items.
  - **Step Dependencies**: None
  - **User Instructions**: None

## Frontend Pages
### Create Bill Page
- [ ] Step 11: Implement Create Bill Page form
  - **Task**: Create a client component with a responsive form for host name, restaurant name, dynamic item list, tax, and tip inputs, styled with Tailwind and Shadcn.
  - **Files**:
    - `app/create-bill/page.tsx`: Update to a "use client" component with form inputs and a dynamic item list using useState.
  - **Step Dependencies**: None
  - **User Instructions**: None
- [ ] Step 12: Implement submit logic for Create Bill Page
  - **Task**: Add form submission logic to call createBillAction, handle errors, and redirect to the review page with the session ID.
  - **Files**:
    - `app/create-bill/page.tsx`: Add a submit handler to call createBillAction and redirect on success.
  - **Step Dependencies**: Step 5, Step 11
  - **User Instructions**: None

### Review Bill Page
- [ ] Step 13: Implement Review Bill Page server component
  - **Task**: Create a server component to fetch bill data using getBillBySessionIdAction and pass it to a client component, with Suspense for loading states.
  - **Files**:
    - `app/review-bill/[sessionId]/page.tsx`: Create a "use server" component with Suspense and a fetcher function.
  - **Step Dependencies**: Step 6
  - **User Instructions**: None
- [ ] Step 14: Implement Review Bill Client component
  - **Task**: Create a client component to display and edit bill items, mark shared items, and allow host item selection, with save and continue functionality.
  - **Files**:
    - `app/review-bill/[sessionId]/_components/review-bill-client.tsx`: Create a "use client" component using BillTable with editing and selection controls.
  - **Step Dependencies**: Step 7, Step 9, Step 19
  - **User Instructions**: None

### Share Page
- [ ] Step 15: Implement Share Page
  - **Task**: Create a server component to display a shareable link based on the session ID, with copy and share options, ensuring mobile-friendliness.
  - **Files**:
    - `app/share/[sessionId]/page.tsx`: Update to a "use server" component displaying the URL and client-side copy/share buttons.
  - **Step Dependencies**: None
  - **User Instructions**: None

### Join Page
- [ ] Step 16: Implement Join Page server component
  - **Task**: Create a server component to fetch bill data and pass it to a client component for participant interaction, with Suspense.
  - **Files**:
    - `app/join/[sessionId]/page.tsx`: Create a "use server" component with Suspense and a fetcher function.
  - **Step Dependencies**: Step 6
  - **User Instructions**: None
- [ ] Step 17: Implement Join Bill Client component
  - **Task**: Create a client component for participants to enter their name (handling duplicates), select items, and save selections, using ItemSelector.
  - **Files**:
    - `app/join/[sessionId]/_components/join-bill-client.tsx`: Create a "use client" component with name input and item selection logic.
  - **Step Dependencies**: Step 8, Step 9, Step 20
  - **User Instructions**: None

### Summary Page
- [ ] Step 18: Implement Summary Page
  - **Task**: Create a server component to fetch bill data, calculate shares, and display the payment summary with unclaimed items, using PaymentSummary.
  - **Files**:
    - `app/summary/[sessionId]/page.tsx`: Update to a "use server" component with data fetching and share calculation.
  - **Step Dependencies**: Step 6, Step 10, Step 21
  - **User Instructions**: None

## Shared Components
- [ ] Step 19: Implement BillTable component
  - **Task**: Create a reusable client component for displaying and editing bill items, with columns for name, quantity, price, shared toggle, and host selection checkbox.
  - **Files**:
    - `components/bill-table.tsx`: Create a "use client" component using Shadcn Table, Input, Switch, and Checkbox.
  - **Step Dependencies**: None
  - **User Instructions**: None
- [ ] Step 20: Implement ItemSelector component
  - **Task**: Create a reusable client component for participants to select items, pre-selecting shared items, with checkboxes for intuitive selection.
  - **Files**:
    - `components/item-selector.tsx`: Create a "use client" component using Shadcn Table and Checkbox.
  - **Step Dependencies**: None
  - **User Instructions**: None
- [ ] Step 21: Implement PaymentSummary component
  - **Task**: Create a reusable client component to display participant shares and unclaimed items in a responsive table format.
  - **Files**:
    - `components/payment-summary.tsx`: Create a "use client" component using Shadcn Table.
  - **Step Dependencies**: None
  - **User Instructions**: None

## AI Extraction
- [ ] Step 22: Implement receipt extraction with Gemini  
  - **Task**: Update the receipt extraction function to leverage the Gemini model **gemini-2.0-flash** and return structured output. The function should:
    - Upload the receipt image using `GoogleAIFileManager`.
    - Start a Gemini chat session with a prompt that asks for extracted bill info. Refer to bills-schema.
    - Use the `responseSchema` within the generation configuration to enforce a structured JSON output. This schema should be designed to align with the database types (e.g., `billsTable` for restaurant details and `billItemsTable` for ordered items and pricing).
  - **Files**:
    - `lib/receipt-extraction.ts`: Modify `extractReceiptData` to:
      - Upload the image file via a helper function (e.g., `uploadToGemini`).
      - Initiate a Gemini chat session with a configured `generationConfig` that includes the structured `responseSchema`.
      - Parse the JSON response and return the structured receipt data.
  - **Step Dependencies**: None  
  - **User Instructions**: Ensure `GEMINI_API_KEY` is set in your environment variables. Follow the example code to integrate structured outputs using the `responseSchema` method, and adjust the schema to match your database types.


## Additional Features
- [ ] Step 23: Implement image upload (optional)
  - **Task**: Add image upload functionality using Supabase Storage, integrating with extractReceiptData for real AI processing later.
  - **Files**:
    - `actions/storage/receipt-storage-actions.ts`: Implement uploadReceiptStorage action.
    - `app/create-bill/page.tsx`: Add ReceiptUploader component and upload logic.
    - `lib/receipt-extraction.ts`: Update to handle uploaded image paths.
    - `components/receipt-uploader.tsx`: Create a "use client" component for file input.
  - **Step Dependencies**: Step 12, Step 22
  - **User Instructions**: Create a receipts bucket in Supabase Storage and set RLS policies (e.g., public for simplicity or signed URLs).
- [ ] Step 24: Implement data deletion
  - **Task**: Add a server action and UI option to delete bill data after settlement for privacy compliance.
  - **Files**:
    - `actions/db/bills-actions.ts`: Implement deleteBillAction to delete from bills with cascading deletes.
    - `app/summary/[sessionId]/page.tsx`: Add a delete button calling deleteBillAction.
  - **Step Dependencies**: Step 1, Step 18
  - **User Instructions**: None