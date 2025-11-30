ORDER MANAGEMENT SCHEMA SPECIFICATION
=====================================
For Django API implementation

CONVENTIONS:
- All monetary values are stored as integers in CENTS (e.g., 10000 = ₱100.00)
- Primary keys: integer, auto-increment
- External IDs (uid): UUID v4, exposed to clients/UI (use for API endpoints)
- Internal IDs (id): integer, used only for DB relations (never expose in API)
- Timestamps: timezone-aware (use Django's DateTimeField with timezone support)
- Default currency: PHP
- Table names: snake_case, plural

MULTI-TENANT NOTE:
- All tables have business_id for tenant isolation
- Every query MUST filter by business_id
- The "businesses" table is owned by the Next.js app (auth/team management)
- Django should receive business_id via API auth (JWT claim or header)

================================================================================
TABLES TO IMPLEMENT IN DJANGO
================================================================================

1. customers
------------
Purpose: Business customers (can be linked to Facebook users or standalone)

| Column          | Type         | Constraints                          | Notes                           |
|-----------------|--------------|--------------------------------------|---------------------------------|
| id              | integer      | PK, auto-increment                   | Internal only                   |
| uid             | uuid         | NOT NULL, UNIQUE, default=uuid4      | Expose in API                   |
| business_id     | integer      | NOT NULL, FK → businesses.id CASCADE | Tenant isolation                |
| user_profile_id | integer      | FK → user_profiles.id SET NULL       | Link to FB profile (optional)   |
| first_name      | text         | NOT NULL                             |                                 |
| last_name       | text         | nullable                             |                                 |
| email           | text         | nullable                             |                                 |
| phone           | text         | nullable                             |                                 |
| notes           | text         | nullable                             | Internal notes about customer   |
| tags            | jsonb        | nullable                             | Array of strings: ["vip","wholesale"] |
| created_at      | timestamptz  | NOT NULL, default=now                |                                 |
| updated_at      | timestamptz  | NOT NULL, default=now                |                                 |

Indexes:
- business_id
- user_profile_id
- (business_id, phone)


2. addresses
------------
Purpose: Customer shipping/billing addresses

| Column         | Type         | Constraints                        | Notes                              |
|----------------|--------------|------------------------------------|------------------------------------|
| id             | integer      | PK, auto-increment                 | Internal only                      |
| uid            | uuid         | NOT NULL, UNIQUE, default=uuid4    | Expose in API                      |
| customer_id    | integer      | NOT NULL, FK → customers.id CASCADE|                                    |
| label          | text         | NOT NULL                           | 'home'|'work'|'shipping'|'billing'|'other' |
| recipient_name | text         | nullable                           | If different from customer         |
| phone          | text         | nullable                           | Delivery contact number            |
| line1          | text         | NOT NULL                           | Street address                     |
| line2          | text         | nullable                           | Unit/apt/floor/building            |
| city           | text         | NOT NULL                           |                                    |
| province       | text         | NOT NULL                           |                                    |
| postal_code    | text         | nullable                           |                                    |
| country        | text         | default='PH'                       | ISO country code                   |
| is_default     | boolean      | default=false                      | Default shipping address           |
| created_at     | timestamptz  | NOT NULL, default=now              |                                    |
| updated_at     | timestamptz  | NOT NULL, default=now              |                                    |

Indexes:
- customer_id


3. orders
---------
Purpose: Main order records

| Column              | Type         | Constraints                          | Notes                              |
|---------------------|--------------|--------------------------------------|------------------------------------|
| id                  | integer      | PK, auto-increment                   | Internal only                      |
| uid                 | uuid         | NOT NULL, UNIQUE, default=uuid4      | Expose in API                      |
| business_id         | integer      | NOT NULL, FK → businesses.id CASCADE |                                    |
| customer_id         | integer      | FK → customers.id SET NULL           |                                    |
| conversation_id     | integer      | nullable                             | FK to Next.js conversations table  |
| shipping_address_id | integer      | FK → addresses.id SET NULL           |                                    |
| order_number        | text         | NOT NULL, UNIQUE                     | Human-readable: "ORD-2025-0001"    |
| status              | text         | NOT NULL, default='draft'            | See status enum below              |
| subtotal            | integer      | NOT NULL                             | In cents                           |
| discount_amount     | integer      | default=0                            | In cents                           |
| discount_reason     | text         | nullable                             | e.g., "Loyal customer 10% off"     |
| shipping_fee        | integer      | default=0                            | In cents                           |
| tax_amount          | integer      | default=0                            | In cents                           |
| grand_total         | integer      | NOT NULL                             | In cents                           |
| currency            | text         | default='PHP'                        |                                    |
| customer_notes      | text         | nullable                             | Notes from customer                |
| internal_notes      | text         | nullable                             | Staff-only notes                   |
| shipping_method     | text         | nullable                             | 'LBC'|'J&T'|'Grab'|'Lalamove'|'Pickup' |
| tracking_number     | text         | nullable                             |                                    |
| confirmed_at        | timestamptz  | nullable                             |                                    |
| shipped_at          | timestamptz  | nullable                             |                                    |
| delivered_at        | timestamptz  | nullable                             |                                    |
| cancelled_at        | timestamptz  | nullable                             |                                    |
| created_at          | timestamptz  | NOT NULL, default=now                |                                    |
| updated_at          | timestamptz  | NOT NULL, default=now                |                                    |

Order Status Enum:
- draft        → Order being created, not yet submitted
- pending      → Submitted, awaiting confirmation
- confirmed    → Confirmed by seller
- processing   → Being prepared/packed
- shipped      → Handed to courier
- delivered    → Received by customer
- cancelled    → Cancelled (by customer or seller)
- refunded     → Payment returned

Indexes:
- (business_id, created_at)
- customer_id
- conversation_id
- order_number (unique)
- status


4. order_items
--------------
Purpose: Line items within an order

| Column      | Type         | Constraints                       | Notes                              |
|-------------|--------------|-----------------------------------|------------------------------------|
| id          | integer      | PK, auto-increment                | Internal only (no uid needed)      |
| order_id    | integer      | NOT NULL, FK → orders.id CASCADE  |                                    |
| type        | text         | NOT NULL                          | 'product'|'shipping'|'fee'|'discount' |
| description | text         | NOT NULL                          | Item name/description              |
| sku         | text         | nullable                          | For future inventory integration   |
| quantity    | integer      | NOT NULL, default=1               |                                    |
| unit_price  | integer      | NOT NULL                          | In cents                           |
| total_price | integer      | NOT NULL                          | qty × unit_price, in cents         |
| metadata    | jsonb        | nullable                          | See metadata schema below          |
| sort_order  | integer      | default=0                         | Display ordering                   |
| created_at  | timestamptz  | NOT NULL, default=now             |                                    |

Metadata Schema:
{
  "image_url": "https://...",
  "variant": "Red / Large",
  "original_price": 15000,  // in cents, if discounted
  ...
}

Indexes:
- order_id

Note: Shipping fee CAN be an order_item with type='shipping' OR use the orders.shipping_fee column.
      Using order_items is more flexible (multiple shipping charges, itemized fees).


5. invoices
-----------
Purpose: Billing documents (can exist without order, e.g., service invoices)

| Column          | Type         | Constraints                          | Notes                              |
|-----------------|--------------|--------------------------------------|------------------------------------|
| id              | integer      | PK, auto-increment                   | Internal only                      |
| uid             | uuid         | NOT NULL, UNIQUE, default=uuid4      | Expose in API                      |
| business_id     | integer      | NOT NULL, FK → businesses.id CASCADE |                                    |
| order_id        | integer      | FK → orders.id SET NULL              | Link to order (optional)           |
| customer_id     | integer      | FK → customers.id SET NULL           |                                    |
| conversation_id | integer      | nullable                             | FK to Next.js conversations table  |
| invoice_number  | text         | NOT NULL, UNIQUE                     | Human-readable: "INV-2025-0001"    |
| status          | text         | NOT NULL, default='draft'            | See status enum below              |
| issue_date      | timestamptz  | NOT NULL, default=now                |                                    |
| due_date        | timestamptz  | nullable                             |                                    |
| subtotal        | integer      | NOT NULL                             | In cents                           |
| discount_amount | integer      | default=0                            | In cents                           |
| tax_amount      | integer      | default=0                            | In cents                           |
| total_amount    | integer      | NOT NULL                             | In cents                           |
| amount_paid     | integer      | default=0                            | Sum of completed payments          |
| amount_due      | integer      | NOT NULL                             | total_amount - amount_paid         |
| currency        | text         | default='PHP'                        |                                    |
| notes           | text         | nullable                             | Invoice terms/notes                |
| paid_at         | timestamptz  | nullable                             | When fully paid                    |
| voided_at       | timestamptz  | nullable                             | When voided                        |
| created_at      | timestamptz  | NOT NULL, default=now                |                                    |
| updated_at      | timestamptz  | NOT NULL, default=now                |                                    |

Invoice Status Enum:
- draft          → Being created
- open           → Sent to customer, awaiting payment
- partially_paid → Has payments but amount_due > 0
- paid           → Fully paid (amount_due = 0)
- overdue        → Past due_date and not fully paid
- void           → Cancelled/voided

Indexes:
- (business_id, created_at)
- order_id
- customer_id
- invoice_number (unique)
- status


6. payments
-----------
Purpose: Individual payment records (supports partial payments)

| Column           | Type         | Constraints                           | Notes                              |
|------------------|--------------|---------------------------------------|------------------------------------|
| id               | integer      | PK, auto-increment                    | Internal only                      |
| uid              | uuid         | NOT NULL, UNIQUE, default=uuid4       | Expose in API                      |
| business_id      | integer      | NOT NULL, FK → businesses.id CASCADE  |                                    |
| invoice_id       | integer      | NOT NULL, FK → invoices.id CASCADE    |                                    |
| order_id         | integer      | FK → orders.id SET NULL               | Denormalized for quick lookup      |
| amount           | integer      | NOT NULL                              | In cents                           |
| currency         | text         | default='PHP'                         |                                    |
| method           | text         | NOT NULL                              | See method enum below              |
| channel          | text         | nullable                              | 'online'|'walk_in'|'delivery'      |
| status           | text         | NOT NULL, default='pending'           | See status enum below              |
| reference_number | text         | nullable                              | Bank ref, GCash ref, etc.          |
| notes            | text         | nullable                              |                                    |
| received_by      | integer      | nullable                              | FK to users.id (staff who received)|
| completed_at     | timestamptz  | nullable                              |                                    |
| created_at       | timestamptz  | NOT NULL, default=now                 |                                    |
| updated_at       | timestamptz  | NOT NULL, default=now                 |                                    |

Payment Method Enum:
- cash
- bank_transfer
- gcash
- maya
- credit_card
- cod           → Cash on Delivery
- cop           → Cash on Pickup (LBC)
- layaway       → Installment/reservation
- other

Payment Channel Enum:
- online    → Paid via website/link
- walk_in   → Paid at physical store
- delivery  → Paid upon delivery (COD/COP)

Payment Status Enum:
- pending    → Awaiting confirmation
- completed  → Payment received/verified
- failed     → Payment failed
- refunded   → Payment returned

Indexes:
- (business_id, created_at)
- invoice_id
- order_id
- status


================================================================================
BUSINESS LOGIC NOTES
================================================================================

1. ORDER NUMBER GENERATION
   - Format: ORD-{YEAR}-{SEQUENCE} e.g., ORD-2025-0001
   - Sequence should reset per year OR be global (your choice)
   - Must be unique per business (add business_id to uniqueness if needed)

2. INVOICE NUMBER GENERATION
   - Format: INV-{YEAR}-{SEQUENCE} e.g., INV-2025-0001
   - Same logic as order numbers

3. AMOUNT CALCULATIONS
   - grand_total = subtotal - discount_amount + shipping_fee + tax_amount
   - amount_due = total_amount - amount_paid
   - Update invoice.amount_paid when payment.status → 'completed'
   - Update invoice.status based on amount_due (0 = paid, >0 & has payments = partially_paid)

4. PAYMENT FLOW
   - Create payment with status='pending'
   - On confirmation: status='completed', update invoice.amount_paid
   - If invoice.amount_due becomes 0: invoice.status='paid', invoice.paid_at=now

5. CONVERSATION_ID
   - This references the Next.js app's conversations table
   - Store as integer but don't create FK in Django
   - Used to link orders/invoices back to chat threads

6. USER_PROFILE_ID (in customers)
   - References Next.js user_profiles table (Facebook users)
   - Store as integer, no FK constraint in Django
   - Allows linking a customer to their Facebook profile

7. RECEIVED_BY (in payments)
   - References Next.js users table (staff members)
   - Store as integer, no FK constraint in Django
   - Track which staff member recorded the payment

================================================================================
API ENDPOINTS SUGGESTION
================================================================================

Customers:
  GET    /api/customers/                 (list, filter by business)
  POST   /api/customers/                 (create)
  GET    /api/customers/{uid}/           (retrieve by uid)
  PATCH  /api/customers/{uid}/           (update)
  DELETE /api/customers/{uid}/           (soft delete?)
  GET    /api/customers/{uid}/addresses/ (list addresses)
  POST   /api/customers/{uid}/addresses/ (add address)

Orders:
  GET    /api/orders/                    (list, filter by business, status)
  POST   /api/orders/                    (create with items)
  GET    /api/orders/{uid}/              (retrieve with items)
  PATCH  /api/orders/{uid}/              (update)
  POST   /api/orders/{uid}/confirm/      (status → confirmed)
  POST   /api/orders/{uid}/ship/         (status → shipped, set tracking)
  POST   /api/orders/{uid}/deliver/      (status → delivered)
  POST   /api/orders/{uid}/cancel/       (status → cancelled)

Invoices:
  GET    /api/invoices/                  (list)
  POST   /api/invoices/                  (create, optionally from order)
  GET    /api/invoices/{uid}/            (retrieve)
  PATCH  /api/invoices/{uid}/            (update)
  POST   /api/invoices/{uid}/void/       (status → void)
  GET    /api/invoices/{uid}/payments/   (list payments)
  POST   /api/invoices/{uid}/payments/   (record payment)

Payments:
  GET    /api/payments/{uid}/            (retrieve)
  PATCH  /api/payments/{uid}/            (update status)
  POST   /api/payments/{uid}/complete/   (mark as completed)
  POST   /api/payments/{uid}/refund/     (mark as refunded)