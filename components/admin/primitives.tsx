"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bike,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  MapPin,
  Package2,
  Phone,
  Search,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/api";
import { cn, formatCurrency, formatDate, getAssetUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type AdminMetricCardProps = {
  label: string;
  value: string | number;
  accent?: "blue" | "green" | "amber" | "cream";
  note?: string;
};

export type OrderRequestRow = {
  _id: string;
  orderId?: string;
  customerName?: string;
  shopName?: string;
  phone?: string;
  shopPhone?: string;
  customerPhone?: string;
  location?: string;
  shopLocation?: string;
  customerLocation?: string;
  orderDate?: string;
  createdAt?: string;
  totalAmount?: number;
  price?: number;
  item?: string;
  status?: string;
};

export type DriverRow = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: {
    url?: string;
  };
  status?: "available" | "busy";
  vehicle?: string;
  completedDeliveries?: number;
  currentOrders?: number;
};

const metricStyles = {
  blue: "bg-[#edf5ff] text-[#4090f7]",
  green: "bg-[#e6f5eb] text-[#00823d]",
  amber: "bg-[#fff5e9] text-[#fe5e13]",
  cream: "bg-[#fff7ef] text-[#fe5e13]",
} as const;

const statusStyles = {
  pending: "bg-[#ffefad] text-[#c48b00]",
  accepted: "bg-[#c9e7d3] text-[#16934b]",
  delivered: "bg-[#c9e7d3] text-[#16934b]",
  completed: "bg-[#c9e7d3] text-[#16934b]",
  available: "bg-transparent text-[#16a34a]",
  busy: "bg-transparent text-[#f97316]",
  rejected: "bg-[#fde7e7] text-[#d92d20]",
  shipped: "bg-[#ddeafe] text-[#2f80ed]",
} as const;

function getStatusTone(status?: string) {
  return statusStyles[(status || "pending").toLowerCase() as keyof typeof statusStyles] || "bg-[#eef2f7] text-slate-600";
}

export function AdminShellHeader() {
  const { data: session } = useSession();
  const { data: profile } = useQuery<{
    name?: string;
    image?: string;
    profileImage?: string;
    avatar?: string;
  }>({
    queryKey: ["admin-profile"],
    queryFn: getProfile,
    enabled: Boolean(session?.accessToken),
    staleTime: 60_000,
  });

  const profileName = profile?.name || session?.user?.name || "Brooklyn Simmons";
  const profileImage = getAssetUrl(profile?.avatar || profile?.image || profile?.profileImage);

  return (
    <header className="flex flex-col gap-4 bg-[#fcf1e2] px-6 py-6 md:flex-row items-center justify-end md:px-8">
      <div className="flex items-center justify-end gap-3">
        <div className="relative size-10 overflow-hidden rounded-full bg-[#7d5f4a]">
          {profileImage ? (
            <Image src={profileImage} alt={profileName} fill sizes="40px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
              {profileName.charAt(0)}
            </div>
          )}
        </div>
        <p className="text-[16px] font-medium text-[#2b2b2b]">{profileName}</p>
      </div>
    </header>
  );
}

export function AdminPageFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-[calc(100vh-120px)] rounded-none bg-white px-6 py-7 md:px-8">
      <div className="mb-8">
        <h1 className="text-[32px] font-semibold leading-[120%] text-[#202124]">{title}</h1>
        <p className="mt-2 text-[16px] font-medium leading-[120%] text-[#313131]">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export function AdminBackHeader({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-7 flex items-start gap-3">
      <Link href={href} className="mt-1 text-[#111111]">
        <ChevronLeft className="size-8" />
      </Link>
      <div>
        <h1 className="text-[32px] font-semibold leading-[120%] text-[#202124]">{title}</h1>
        <p className="mt-2 text-[16px] leading-[120%] text-[#313131]">{subtitle}</p>
      </div>
    </div>
  );
}

export function AdminMetricCard({ label, value, accent = "blue", note }: AdminMetricCardProps) {
  return (
    <Card className={cn("rounded-[14px] border-[#c8c8c8] p-4 shadow-none", metricStyles[accent])}>
      <p className="text-[16px] font-semibold text-[#212121]">{label}</p>
      <div className="mt-5 flex min-h-[64px] flex-col justify-between gap-4">
        <p className="text-[16px] font-medium">{value}</p>
        {note === "" ? null : (
          <p className="text-right text-[13.6px] font-bold leading-6 tracking-normal">{note || "+2,123 today"}</p>
        )}
      </div>
    </Card>
  );
}

export function AdminSectionCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <Card className={cn("rounded-[18px] border-[#d1d1d1] p-5 shadow-none", className)}>{children}</Card>;
}

export function StatusPill({ status, className }: { status?: string; className?: string }) {
  const normalized = (status || "pending").replaceAll("_", " ");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium capitalize",
        getStatusTone(normalized),
        className,
      )}
    >
      {normalized}
    </span>
  );
}

export function SegmentedTabs({
  items,
  value,
  onChange,
}: {
  items: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-[12px] bg-[#e9eef4] p-1">
      {items.map((item) => (
        <button
          key={item.value}
          className={cn(
            "rounded-[9px] px-6 py-2 text-[16px] font-medium text-[#1f1f1f] transition",
            value === item.value ? "bg-[#6d98c0] text-white" : "bg-transparent",
          )}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function ProfileHero({
  name,
  roleLabel,
  image,
  onPickImage,
  uploading,
}: {
  name: string;
  roleLabel: string;
  image?: string | null;
  onPickImage?: (file: File) => void;
  uploading?: boolean;
}) {
  const resolved = getAssetUrl(image);
  return (
    <AdminSectionCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative size-[120px] overflow-hidden rounded-full bg-[#d6c0aa]">
          {resolved ? (
            <Image src={resolved} alt={name} fill sizes="120px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[36px] font-semibold text-white">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-[28px] font-semibold text-[#111827]">{name}</h2>
          <p className="mt-1 text-[16px] text-[#111827]">{roleLabel}</p>
        </div>
      </div>
      {onPickImage ? (
        <label className="inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[10px] bg-[#6d98c0] px-6 text-[16px] font-medium text-white hover:bg-[#5f88ae]">
          {uploading ? "Uploading..." : "Change Photo"}
          <input
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPickImage(file);
              event.target.value = "";
            }}
            type="file"
          />
        </label>
      ) : null}
    </AdminSectionCard>
  );
}

export function ShopCard({
  id,
  title,
  address,
  phone,
  totalOrders,
  pending,
}: {
  id: string;
  title: string;
  address: string;
  phone: string;
  totalOrders: number;
  pending: number;
}) {
  return (
    <Link href={`/shops/${id}`}>
      <Card className="overflow-hidden rounded-[20px] border-[#d6d6d6] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <div className="h-[205px] bg-[linear-gradient(135deg,#b98654_0%,#f1e0bf_45%,#6e573d_100%)]" />
        <div className="space-y-3 p-4">
          <h3 className="text-[24px] font-semibold leading-[120%] text-[#202124]">{title}</h3>
          <div className="space-y-2 text-[#656d7c]">
            <p className="flex items-center gap-2 text-[14px]"><MapPin className="size-4" /> {address}</p>
            <p className="flex items-center gap-2 text-[14px]"><Phone className="size-4" /> {phone}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[10px] bg-[#edf5ff] px-4 py-3 text-[#4090f7]">
              <p className="flex items-center gap-2 text-[14px]"><Package2 className="size-4" /> Total Orders</p>
              <p className="text-[16px] font-semibold text-[#202124]">{totalOrders}</p>
            </div>
            <div className="rounded-[10px] bg-[#fff5e9] px-4 py-3 text-[#fe5e13]">
              <p className="flex items-center gap-2 text-[14px]"><Clock3 className="size-4" /> Pending</p>
              <p className="text-[16px] font-semibold">{pending}</p>
            </div>
          </div>
          <p className="text-[16px] font-medium text-[#4090f7]">View Request</p>
        </div>
      </Card>
    </Link>
  );
}

export function RequestCard({
  request,
  actionLabel,
  onAction,
}: {
  request: OrderRequestRow;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="rounded-[18px] border-[#d2dce7] bg-[#ecf5ff] p-5 shadow-none">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#4090f7]">
            <Package2 className="size-5" />
            <h3 className="text-[18px] font-semibold text-[#202124]">
              Order #{request.orderId || request._id.slice(-5)}
            </h3>
          </div>
          <div className="mt-3">
            <StatusPill status={request.status} />
          </div>
        </div>
        {actionLabel && onAction ? (
          <Button
            className="h-[38px] rounded-[10px] bg-[#6d98c0] px-5 text-[15px] hover:bg-[#5f88ae]"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[12px] bg-white p-5">
          <p className="mb-4 flex items-center gap-2 text-[16px] font-semibold text-[#202124]">
            <Store className="size-5 text-[#4090f7]" />
            Books Store Information
          </p>
          <div className="space-y-3 text-[14px] text-[#6b7280]">
            <p className="flex items-center gap-2"><Clock3 className="size-4" /> Date <span className="font-medium text-[#202124]">{formatDate(request.orderDate || request.createdAt)}</span></p>
            <p className="flex items-center gap-2"><UserRound className="size-4" /> Books Store Name: <span className="font-medium text-[#202124]">{request.shopName || "ABC Book House"}</span></p>
            <p className="flex items-center gap-2"><Phone className="size-4" /> Phone Number: <span className="font-medium text-[#202124]">{request.shopPhone || request.phone || "555-0102"}</span></p>
            <p className="flex items-center gap-2"><MapPin className="size-4" /> Delivery Address <span className="font-medium text-[#202124]">{request.shopLocation || request.location || "456 Oak Ave, Townsburg"}</span></p>
          </div>
        </div>

        <div className="rounded-[12px] bg-white p-5">
          <p className="mb-4 flex items-center gap-2 text-[16px] font-semibold text-[#202124]">
            <UserRound className="size-5 text-[#4090f7]" />
            Customer Information
          </p>
          <div className="space-y-3 text-[14px] text-[#6b7280]">
            <p className="flex items-center gap-2"><UserRound className="size-4" /> Name: <span className="font-medium text-[#202124]">{request.customerName || "Bob Smith"}</span></p>
            <p className="flex items-center gap-2"><Phone className="size-4" /> Phone Number: <span className="font-medium text-[#202124]">{request.customerPhone || request.phone || "555-0102"}</span></p>
            <p className="flex items-center gap-2"><MapPin className="size-4" /> Delivery Address <span className="font-medium text-[#202124]">{request.customerLocation || request.location || "456 Oak Ave, Townsburg"}</span></p>
            <p className="flex items-center gap-2"><Package2 className="size-4" /> Order Items <span className="font-medium text-[#202124]">{request.item || "4 Books"}</span></p>
            <p className="flex items-center gap-2"><Clock3 className="size-4" /> Price <span className="font-medium text-[#202124]">{formatCurrency(request.totalAmount || request.price || 12)}</span></p>
            <p className="flex items-center gap-2"><Package2 className="size-4" /> Order Id <span className="font-medium text-[#202124]">{request.orderId || "xxxxxxx"}</span></p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function DriverCard({
  driver,
  compact,
  onView,
  onAssign,
  selected,
}: {
  driver: DriverRow;
  compact?: boolean;
  onView?: () => void;
  onAssign?: () => void;
  selected?: boolean;
}) {
  const availability = driver.status || (driver.currentOrders ? "busy" : "available");
  const avatarUrl = getAssetUrl(driver.avatar);
  const driverDisplayName = driver.name || driver.email?.split("@")[0] || "Driver";

  return (
    <Card className={cn("rounded-[18px] border-[#d6dee7] p-4 shadow-none", selected ? "border-[#6d98c0] bg-[#f5f9ff]" : "")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-full bg-[#dab38f] text-sm font-semibold text-white">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={driverDisplayName} fill sizes="44px" className="object-cover" />
            ) : (
              driverDisplayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#202124]">{driverDisplayName}</p>
            <p className={cn("mt-1 text-[13px] font-medium capitalize", availability === "busy" ? "text-[#f97316]" : "text-[#16a34a]")}>
              <span className="mr-2 inline-block size-2 rounded-full bg-current" />
              {availability}
            </p>
            <div className="mt-3 space-y-2 text-[13px] text-[#667085]">
              <p className="flex items-center gap-2"><Phone className="size-4" /> {driver.phone || "+880 1712-345678"}</p>
              <p className="flex items-center gap-2"><Package2 className="size-4" /> {driver.completedDeliveries || 234} deliveries</p>
            </div>
            {availability === "busy" ? (
              <div className="mt-4 rounded-[10px] bg-[#fff5e9] px-3 py-2 text-[14px] font-medium text-[#fe5e13]">
                Current Orders: {driver.currentOrders || 2}
              </div>
            ) : null}
            {!compact ? (
              <button className="mt-4 text-[16px] font-medium text-[#4090f7]" onClick={onView} type="button">
                View Request
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function AssignDriverModal({
  open,
  title,
  drivers,
  onClose,
  selectedDriverId,
  assigning,
  onSelectDriver,
  onAssignDriver,
  loading,
}: {
  open: boolean;
  title: string;
  drivers: DriverRow[];
  onClose: () => void;
  selectedDriverId?: string | null;
  assigning?: boolean;
  onSelectDriver?: (driverId: string) => void;
  onAssignDriver?: () => void;
  loading?: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
      <div className="max-h-[90vh] w-full max-w-[820px] overflow-hidden rounded-[16px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-[18px] font-semibold text-[#202124]">{title}</h2>
            <p className="mt-1 text-[16px] text-[#444]">Select an available driver</p>
          </div>
          <button className="text-[#202124]" onClick={onClose} type="button">
            <X className="size-6" />
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="mb-4 flex justify-end">
            <Button
              className="h-10 rounded-[10px] bg-[#6d98c0] px-5 text-[15px] hover:bg-[#5f88ae]"
              disabled={!selectedDriverId || assigning || !onAssignDriver}
              onClick={onAssignDriver}
              type="button"
            >
              <CheckCircle2 className="mr-2 size-4" />
              {!onAssignDriver ? "Assigned" : assigning ? "Assigning..." : "Assign Driver"}
            </Button>
          </div>
          <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
            {loading ? <p className="py-8 text-center text-[14px] text-[#667085]">Loading drivers...</p> : null}
            {!loading && drivers.length === 0 ? <p className="py-8 text-center text-[14px] text-[#667085]">No drivers available.</p> : null}
            {!loading
              ? drivers.map((driver) => (
                  <DriverCard
                    key={driver._id}
                    compact
                    driver={driver}
                    onAssign={onSelectDriver ? () => onSelectDriver(driver._id) : undefined}
                    selected={selectedDriverId === driver._id}
                  />
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcf1e2] px-4 py-12">
      <div className="w-full max-w-[498px]">
        <div className="mb-10 flex flex-col items-center">
          <Image src="/assets/brand-mark.png" alt="Books on wheels" width={160} height={120} className="h-auto w-[160px]" />
          {title ? <h1 className="mt-10 text-center text-[24px] font-semibold text-[#202124]">{title}</h1> : null}
          {subtitle ? <p className="mt-1 text-center text-[16px] text-[#8f8f8f]">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
