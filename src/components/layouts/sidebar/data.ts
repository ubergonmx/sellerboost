import {
  Inbox,
  ShoppingCart,
  Users,
  FileText,
  CreditCard,
} from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon: typeof Inbox
}

export const navItems: NavItem[] = [
  {
    title: "Inbox",
    url: "/app",
    icon: Inbox,
  },
  {
    title: "Orders",
    url: "/app/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    url: "/app/customers",
    icon: Users,
  },
  {
    title: "Invoices",
    url: "/app/invoices",
    icon: FileText,
  },
  {
    title: "Payments",
    url: "/app/payments",
    icon: CreditCard,
  },
]