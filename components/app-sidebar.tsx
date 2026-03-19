"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Ticket,
  FileText,
  Shield,
  User,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useRole } from "@/components/role-provider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "operator"] as const,
  },
  {
    title: "Venues",
    href: "/venues",
    icon: Building2,
    roles: ["admin"] as const,
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: Ticket,
    roles: ["admin", "operator"] as const,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
    roles: ["admin", "operator"] as const,
  },
  {
    title: "Logs",
    href: "/logs",
    icon: FileText,
    roles: ["admin"] as const,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { role, toggleRole, isAdmin } = useRole()

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(role)
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-mono text-sm font-bold">
            M
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              MetroMatrix
            </span>
            <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">
              Municipal Coordination
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <button
          onClick={toggleRole}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
            "hover:bg-sidebar-accent",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          )}
        >
          {isAdmin ? (
            <Shield className="h-4 w-4 shrink-0 text-sidebar-primary" />
          ) : (
            <User className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <span className="text-sidebar-foreground/80">
              {isAdmin ? "Admin" : "Operator"}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0",
                isAdmin
                  ? "border-sidebar-primary/40 text-sidebar-primary"
                  : "border-emerald-400/40 text-emerald-400"
              )}
            >
              Switch
            </Badge>
          </div>
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
