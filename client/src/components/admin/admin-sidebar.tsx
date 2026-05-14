import { Link, useLocation as useRouterLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Dumbbell,
  CreditCard,
  Users,
  MessageSquare,
  Mail,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocation } from "@/contexts/location-context"

const ROLE_COLOURS: Record<string, string> = {
  "Super Admin": "bg-violet-100 text-violet-700",
  "Club Admin":  "bg-sky-100 text-sky-700",
  "Staff":       "bg-emerald-100 text-emerald-700",
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}

const navSections: NavSection[] = [
  {
    title: "Operations",
    items: [
      { icon: Calendar, label: "Calendar", href: "/", active: true },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: CreditCard, label: "Payments", href: "/payments" },
      { icon: Users, label: "Customers", href: "/customers" },
    ],
  },
  {
    title: "Communication",
    items: [
      { icon: MessageSquare, label: "Chats", href: "/chats" },
      { icon: Mail, label: "Notifications", href: "/notifications" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { icon: BarChart3, label: "Reports", href: "/reports" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: Settings, label: "Admin Settings", href: "/setup" },
    ],
  },
]

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = useRouterLocation().pathname
  const { currentUser: CURRENT_USER } = useLocation()
  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
          collapsed ? "w-16" : "w-52"
        )}
      >
        {/* Header with collapse toggle */}
        <div className={cn(
          "flex items-center border-b border-sidebar-border h-14 px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <span className="text-base font-bold text-sidebar-primary tracking-tight">
              Open<span className="text-sidebar-foreground">Court</span>
            </span>
          )}
          <button
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col py-3 overflow-y-auto">
          {navSections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className={cn(
                collapsed ? "px-2" : "px-3",
                section.title === "System" && "mt-auto pt-3"
              )}
            >

              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  collapsed ? (
                    <Tooltip key={item.label}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex h-10 w-full items-center justify-center rounded-md transition-colors",
                            pathname === item.href
                              ? "bg-sidebar-accent text-sidebar-primary"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                        pathname === item.href
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile footer */}
        <div className={cn(
          "border-t border-sidebar-border",
          collapsed ? "p-2" : "p-3"
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex h-10 w-full items-center justify-center rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-bold text-sidebar-primary-foreground">
                    {CURRENT_USER.initials}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p className="font-medium">{CURRENT_USER.name}</p>
                <p className="text-muted-foreground">{CURRENT_USER.role}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2.5 rounded-lg bg-sidebar-accent/50 px-2.5 py-2 hover:bg-sidebar-accent transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">
                    {CURRENT_USER.initials}
                  </div>
                  <div className="flex flex-1 flex-col items-start leading-none min-w-0">
                    <span className="text-xs font-semibold text-sidebar-foreground truncate max-w-full">{CURRENT_USER.name}</span>
                    <span className={cn(
                      "mt-0.5 rounded-full px-1.5 py-px text-[9px] font-semibold",
                      ROLE_COLOURS[CURRENT_USER.role] ?? "bg-muted text-muted-foreground"
                    )}>
                      {CURRENT_USER.role}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-sidebar-foreground/60 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-44">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-foreground">{CURRENT_USER.name}</p>
                  <p className="text-[11px] text-muted-foreground">{CURRENT_USER.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-destructive focus:text-destructive gap-2">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
