/***
 * Sample data for development/testing only
 * This will be deleted once the real data is implemented
 */

// Types
export type Mail = {
  id: string
  name: string
  email: string
  subject: string
  date: string
  teaser: string
  body: string
  read: boolean
}

export type Order = {
  id: string
  customer: string
  email: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  date: string
  items: number
}

export type Customer = {
  id: string
  name: string
  email: string
  company: string
  status: "active" | "inactive"
  totalOrders: number
  totalSpent: number
}

export type Invoice = {
  id: string
  customer: string
  email: string
  amount: number
  status: "draft" | "pending" | "paid" | "overdue"
  dueDate: string
  issuedDate: string
}

export type Payment = {
  id: string
  customer: string
  email: string
  amount: number
  method: "card" | "bank" | "paypal"
  status: "completed" | "pending" | "failed" | "refunded"
  date: string
}

// Mail data
export const mails: Mail[] = [
  {
    id: "mail-1",
    name: "William Smith",
    email: "williamsmith@example.com",
    subject: "Meeting Tomorrow",
    date: "09:34 AM",
    teaser:
      "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    body: `Hi team,

Just a reminder about our meeting tomorrow at 10 AM in the main conference room.

Please come prepared with your project updates and any blockers you're facing. We'll be discussing:

1. Q4 goals and progress
2. Resource allocation for the upcoming sprint
3. New client onboarding process

Looking forward to seeing everyone there!

Best regards,
William`,
    read: false,
  },
  {
    id: "mail-2",
    name: "Alice Smith",
    email: "alicesmith@example.com",
    subject: "Re: Project Update",
    date: "Yesterday",
    teaser:
      "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    body: `Thanks for the update. The progress looks great so far!

I've reviewed the mockups and I think we're on the right track. A few notes:

- The dashboard layout looks clean and intuitive
- Love the color scheme choices
- The navigation flow makes sense

Let's schedule a call to discuss the next steps. How does Thursday at 2 PM work for you?

Best,
Alice`,
    read: true,
  },
  {
    id: "mail-3",
    name: "Bob Johnson",
    email: "bobjohnson@example.com",
    subject: "Weekend Plans",
    date: "2 days ago",
    teaser:
      "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    body: `Hey everyone!

I'm thinking of organizing a team outing this weekend to celebrate our recent project launch.

Here are two options I'm considering:

Option A: Hiking at Mountain Trail Park
- Beautiful scenery
- Moderate difficulty (about 5 miles)
- We could have a picnic at the summit

Option B: Beach Day at Sunset Beach
- Relaxing atmosphere
- Beach volleyball and swimming
- BBQ lunch by the shore

Please let me know your preference by Friday!

Cheers,
Bob`,
    read: false,
  },
  {
    id: "mail-4",
    name: "Emily Davis",
    email: "emilydavis@example.com",
    subject: "Re: Question about Budget",
    date: "2 days ago",
    teaser:
      "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    body: `Hi,

I've reviewed the budget numbers you sent over, and I have some thoughts.

The overall allocation looks reasonable, but I noticed a few areas where we might want to make adjustments:

1. Marketing spend seems high for Q1 - can we shift some to Q2?
2. The development tools budget might need to increase given our growth plans
3. Training budget looks good

Can we set up a quick call to discuss these potential adjustments? I'm free tomorrow afternoon or Wednesday morning.

Thanks,
Emily`,
    read: true,
  },
  {
    id: "mail-5",
    name: "Michael Wilson",
    email: "michaelwilson@example.com",
    subject: "Important Announcement",
    date: "1 week ago",
    teaser:
      "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    body: `Dear Team,

Please join us for an all-hands meeting this Friday at 3 PM in the main auditorium.

We have some exciting news to share about the company's future direction. This will be an important meeting, so please make every effort to attend.

Agenda:
- Company performance review
- New strategic initiatives
- Q&A session

Remote team members can join via the usual video conference link.

See you there!

Best,
Michael
CEO`,
    read: true,
  },
  {
    id: "mail-6",
    name: "Sarah Brown",
    email: "sarahbrown@example.com",
    subject: "Re: Feedback on Proposal",
    date: "1 week ago",
    teaser:
      "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    body: `Thank you for sending over the proposal. I've reviewed it thoroughly and have some thoughts.

Overall Impression:
The proposal is well-structured and addresses most of our key requirements. I particularly liked the phased approach you've outlined.

Areas for Discussion:
1. Timeline - The 6-month timeline seems aggressive. Can we discuss buffer periods?
2. Resource allocation - I'd like to understand the team composition better
3. Risk mitigation - Would like to see more detail here

Could we schedule a meeting to discuss my feedback in detail? I'm available next Tuesday or Wednesday.

Regards,
Sarah`,
    read: false,
  },
  {
    id: "mail-7",
    name: "David Lee",
    email: "davidlee@example.com",
    subject: "New Project Idea",
    date: "1 week ago",
    teaser:
      "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    body: `Hi!

I've been brainstorming and came up with an interesting project concept that I think could benefit our team significantly.

Project: Automated Workflow Assistant

The idea is to create an internal tool that:
- Automates repetitive tasks
- Integrates with our existing tools (Slack, Jira, GitHub)
- Provides smart notifications and reminders
- Generates weekly reports automatically

I estimate it would take about 2-3 months to build an MVP, and could save each team member 3-5 hours per week.

Do you have time this week to discuss its potential impact and feasibility?

Best,
David`,
    read: true,
  },
  {
    id: "mail-8",
    name: "Olivia Wilson",
    email: "oliviawilson@example.com",
    subject: "Vacation Plans",
    date: "1 week ago",
    teaser:
      "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    body: `Hi,

Just a heads up that I'll be taking a two-week vacation from March 15-29.

Before I leave, I will:
- Complete all pending code reviews
- Document ongoing projects
- Hand off urgent tasks to team members
- Set up auto-responders

I'll make sure all my projects are up to date before I leave. Please let me know if there's anything specific you'd like me to prioritize before then.

Thanks for understanding!

Olivia`,
    read: true,
  },
  {
    id: "mail-9",
    name: "James Martin",
    email: "jamesmartin@example.com",
    subject: "Re: Conference Registration",
    date: "1 week ago",
    teaser:
      "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    body: `Hi,

I've completed the registration for the upcoming tech conference (TechSummit 2024).

Registration Details:
- Conference: TechSummit 2024
- Dates: April 10-12
- Location: San Francisco Convention Center
- Registered attendees: You, me, and Sarah

I've also booked:
- Hotel rooms at the Marriott nearby
- Flight tickets (departing April 9, returning April 13)

Let me know if you need any additional information from my end or if you'd like me to adjust any of the bookings.

Best,
James`,
    read: false,
  },
  {
    id: "mail-10",
    name: "Sophia White",
    email: "sophiawhite@example.com",
    subject: "Team Dinner",
    date: "1 week ago",
    teaser:
      "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    body: `Hi everyone!

To celebrate our recent project success, I'd like to organize a team dinner next Friday evening.

I'm considering a few restaurant options:

1. The Italian Place - Great pasta and wine selection
2. Sakura Japanese - Excellent sushi and private dining room
3. The Steakhouse - Classic American cuisine

Please let me know:
- Your availability for next Friday (7 PM)
- Any dietary restrictions
- Your restaurant preference

I'll make the reservation once I hear back from everyone.

Looking forward to celebrating together!

Sophia`,
    read: false,
  },
]

// Orders data
export const orders: Order[] = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john.doe@example.com",
    status: "delivered",
    total: 249.99,
    date: "Today",
    items: 3,
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    email: "jane.smith@example.com",
    status: "shipped",
    total: 129.50,
    date: "Yesterday",
    items: 2,
  },
  {
    id: "ORD-003",
    customer: "Robert Johnson",
    email: "robert.j@example.com",
    status: "processing",
    total: 549.00,
    date: "2 days ago",
    items: 5,
  },
  {
    id: "ORD-004",
    customer: "Emily Brown",
    email: "emily.b@example.com",
    status: "pending",
    total: 89.99,
    date: "3 days ago",
    items: 1,
  },
  {
    id: "ORD-005",
    customer: "Michael Davis",
    email: "m.davis@example.com",
    status: "cancelled",
    total: 199.00,
    date: "1 week ago",
    items: 2,
  },
  {
    id: "ORD-006",
    customer: "Sarah Wilson",
    email: "sarah.w@example.com",
    status: "delivered",
    total: 349.99,
    date: "1 week ago",
    items: 4,
  },
  {
    id: "ORD-007",
    customer: "David Lee",
    email: "david.lee@example.com",
    status: "shipped",
    total: 79.99,
    date: "1 week ago",
    items: 1,
  },
  {
    id: "ORD-008",
    customer: "Lisa Anderson",
    email: "lisa.a@example.com",
    status: "processing",
    total: 429.00,
    date: "2 weeks ago",
    items: 3,
  },
]

// Customers data
export const customers: Customer[] = [
  {
    id: "CUS-001",
    name: "Acme Corporation",
    email: "contact@acme.com",
    company: "Acme Corp",
    status: "active",
    totalOrders: 24,
    totalSpent: 12500.00,
  },
  {
    id: "CUS-002",
    name: "TechStart Inc",
    email: "hello@techstart.io",
    company: "TechStart",
    status: "active",
    totalOrders: 18,
    totalSpent: 8900.00,
  },
  {
    id: "CUS-003",
    name: "Global Solutions",
    email: "info@globalsol.com",
    company: "Global Solutions Ltd",
    status: "active",
    totalOrders: 42,
    totalSpent: 25000.00,
  },
  {
    id: "CUS-004",
    name: "StartupXYZ",
    email: "team@startupxyz.com",
    company: "StartupXYZ",
    status: "inactive",
    totalOrders: 5,
    totalSpent: 1200.00,
  },
  {
    id: "CUS-005",
    name: "Enterprise Co",
    email: "sales@enterprise.co",
    company: "Enterprise Company",
    status: "active",
    totalOrders: 67,
    totalSpent: 45000.00,
  },
  {
    id: "CUS-006",
    name: "Small Biz LLC",
    email: "owner@smallbiz.com",
    company: "Small Biz LLC",
    status: "active",
    totalOrders: 12,
    totalSpent: 3400.00,
  },
  {
    id: "CUS-007",
    name: "Digital Agency",
    email: "hello@digitalagency.com",
    company: "Digital Agency Inc",
    status: "inactive",
    totalOrders: 8,
    totalSpent: 2100.00,
  },
]

// Invoices data
export const invoices: Invoice[] = [
  {
    id: "INV-001",
    customer: "Acme Corporation",
    email: "billing@acme.com",
    amount: 2500.00,
    status: "paid",
    dueDate: "2024-01-15",
    issuedDate: "2024-01-01",
  },
  {
    id: "INV-002",
    customer: "TechStart Inc",
    email: "finance@techstart.io",
    amount: 1800.00,
    status: "pending",
    dueDate: "2024-02-01",
    issuedDate: "2024-01-15",
  },
  {
    id: "INV-003",
    customer: "Global Solutions",
    email: "ap@globalsol.com",
    amount: 5200.00,
    status: "overdue",
    dueDate: "2024-01-10",
    issuedDate: "2023-12-27",
  },
  {
    id: "INV-004",
    customer: "Enterprise Co",
    email: "invoices@enterprise.co",
    amount: 8500.00,
    status: "paid",
    dueDate: "2024-01-20",
    issuedDate: "2024-01-05",
  },
  {
    id: "INV-005",
    customer: "Small Biz LLC",
    email: "owner@smallbiz.com",
    amount: 450.00,
    status: "draft",
    dueDate: "2024-02-15",
    issuedDate: "2024-01-25",
  },
  {
    id: "INV-006",
    customer: "Digital Agency",
    email: "billing@digitalagency.com",
    amount: 1200.00,
    status: "pending",
    dueDate: "2024-02-10",
    issuedDate: "2024-01-20",
  },
  {
    id: "INV-007",
    customer: "StartupXYZ",
    email: "cfo@startupxyz.com",
    amount: 750.00,
    status: "paid",
    dueDate: "2024-01-08",
    issuedDate: "2023-12-25",
  },
]

// Payments data
export const payments: Payment[] = [
  {
    id: "PAY-001",
    customer: "Acme Corporation",
    email: "billing@acme.com",
    amount: 2500.00,
    method: "card",
    status: "completed",
    date: "Today",
  },
  {
    id: "PAY-002",
    customer: "Enterprise Co",
    email: "invoices@enterprise.co",
    amount: 8500.00,
    method: "bank",
    status: "completed",
    date: "Yesterday",
  },
  {
    id: "PAY-003",
    customer: "TechStart Inc",
    email: "finance@techstart.io",
    amount: 1800.00,
    method: "card",
    status: "pending",
    date: "2 days ago",
  },
  {
    id: "PAY-004",
    customer: "StartupXYZ",
    email: "cfo@startupxyz.com",
    amount: 750.00,
    method: "paypal",
    status: "completed",
    date: "1 week ago",
  },
  {
    id: "PAY-005",
    customer: "Global Solutions",
    email: "ap@globalsol.com",
    amount: 5200.00,
    method: "bank",
    status: "failed",
    date: "1 week ago",
  },
  {
    id: "PAY-006",
    customer: "Small Biz LLC",
    email: "owner@smallbiz.com",
    amount: 450.00,
    method: "card",
    status: "refunded",
    date: "2 weeks ago",
  },
  {
    id: "PAY-007",
    customer: "Digital Agency",
    email: "billing@digitalagency.com",
    amount: 1200.00,
    method: "paypal",
    status: "pending",
    date: "2 weeks ago",
  },
]

