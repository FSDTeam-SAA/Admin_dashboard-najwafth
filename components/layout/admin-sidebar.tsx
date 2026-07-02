"use client";

import Image from "next/image";
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Settings,
  Store,
  Truck,
  UserRoundCog,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shops", label: "Books store Management", icon: Store },
  { href: "/categories", label: "Categories", icon: LibraryBig },
  { href: "/driver-requests", label: "Driver Requests", icon: Truck },
  { href: "/drivers", label: "Driver Management", icon: UserRoundCog },
  { href: "/profit-overview", label: "Profit Overview", icon: ChartNoAxesCombined },
  { href: "/settings", label: "Settings", icon: Settings },
];

function matchRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#fcf1e2] px-4 py-8 lg:px-6">
      <div className="flex flex-col items-center">
        <Image
          src="/assets/brand-mark.png"
          alt="Books on wheels"
          width={160}
          height={120}
          className="h-auto w-[130px] lg:w-[150px]"
        />
      </div>
      <nav className="mt-10 flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = matchRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-4 py-3 text-[15px] font-medium transition",
                isActive
                  ? "bg-[#6d98c0] text-white [&_svg]:text-white"
                  : "text-[#252525] hover:bg-white/60",
              )}
              onClick={onClose}
            >
              <Icon className="size-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/logout"
        className="mt-4 flex items-center gap-3 rounded-[10px] px-4 py-3 text-[15px] font-medium text-[#252525] transition hover:bg-white/60"
        onClick={onClose}
      >
        <LogOut className="size-5 shrink-0" />
        <span>Log Out</span>
      </Link>
    </div>
  );
}

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile hamburger — only visible on small screens */}
      <button
        aria-label="Open menu"
        className="fixed left-4 top-4 z-40 rounded-[10px] bg-[#6d98c0] p-2.5 text-white shadow-lg lg:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Menu className="size-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 overflow-y-auto xl:w-[312px] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer + backdrop */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Drawer panel */}
          <div
            className="absolute left-0 top-0 h-full w-[280px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 rounded-full bg-white p-1.5 text-[#252525] shadow"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onClose={() => setIsOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
