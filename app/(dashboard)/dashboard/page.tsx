"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { AdminMetricCard, AdminPageFrame, AssignDriverModal, DriverCard, RequestCard } from "@/components/admin/primitives";
import { AdminSectionCard } from "@/components/admin/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { assignDriverToRequest, getAdminOverview, getDrivers } from "@/lib/api";
import { toast } from "sonner";

type DriverRequestRow = {
  _id: string;
  shopName?: string;
  phone?: string;
  shopPhone?: string;
  customerPhone?: string;
  shopLocation?: string;
  customerLocation?: string;
  customerName?: string;
  location?: string;
  item?: string;
  orderDate?: string;
  createdAt: string;
  totalAmount?: number;
  price?: number;
  status?: string;
  driver?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: {
      url?: string;
    };
  };
  orderId?:
    | string
    | {
        _id?: string;
        orderId?: string;
      };
};

type DriverRow = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: { url?: string };
  status?: "offline" | "available" | "busy";
  rideStatus?: "available" | "busy";
  onlineStatus?: "online" | "offline";
  isOnline?: boolean;
  currentOrders?: number;
  completedDeliveries?: number;
};

type AdminOverview = {
  metrics: {
    totalBookstores: number;
    totalDrivers: number;
    totalDriverRequests: number;
    totalCompleted: number;
  };
  deliveryActivity: {
    label: string;
    value: number;
  }[];
  recentDriverRequests: DriverRequestRow[];
  recentDrivers: DriverRow[];
  recentShops: {
    _id: string;
    name?: string;
  }[];
};

const sampleActivity = [
  { label: "Sun", value: 60 },
  { label: "Mun", value: 50 },
  { label: "Tuw", value: 40 },
  { label: "Wus", value: 70 },
  { label: "Thu", value: 80 },
  { label: "Fri", value: 100 },
  { label: "Sat", value: 75 },
];

function DashboardLoading() {
  return (
    <AdminPageFrame title="Dashboard" subtitle="Manage Bookstores & Drivers">
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[108px] rounded-[14px]" />
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Skeleton className="h-[420px] rounded-[18px]" />
        <Skeleton className="h-[420px] rounded-[18px]" />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Skeleton className="h-[540px] rounded-[18px]" />
        <Skeleton className="h-[540px] rounded-[18px]" />
      </div>
    </AdminPageFrame>
  );
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
    refetchInterval: 2_000,
    refetchOnWindowFocus: true,
  });
  const [assigningRequestId, setAssigningRequestId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const driversQuery = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: getDrivers,
    enabled: Boolean(assigningRequestId),
    refetchInterval: assigningRequestId ? 2_000 : false,
    refetchOnWindowFocus: true,
  });

  const assignMutation = useMutation({
    mutationFn: ({ requestId, driverId }: { requestId: string; driverId: string }) =>
      assignDriverToRequest(requestId, driverId),
    onSuccess: () => {
      toast.success("Driver assigned successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-driver-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      setAssigningRequestId(null);
      setSelectedDriverId(null);
    },
  });

  const overview = data as AdminOverview | undefined;
  const deliveryActivity = overview?.deliveryActivity?.length ? overview.deliveryActivity : sampleActivity;
  const maxValue = Math.max(...deliveryActivity.map((item) => item.value), 100);

  const requestRows = useMemo(
    () =>
      (overview?.recentDriverRequests || []).map((request) => {
        const raw = request.orderId;
        const resolvedOrderId =
          typeof raw === "string" ? raw : raw?.orderId || raw?._id || request._id;
        return {
          ...request,
          orderId: resolvedOrderId,
        };
      }),
    [overview],
  );
  const selectedRequest = requestRows.find(
    (request) => request._id === assigningRequestId,
  );
  const selectedOrderLabel = selectedRequest?.orderId || "Request";
  const drivers = (driversQuery.data as DriverRow[] | undefined) || [];

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <AdminPageFrame title="Dashboard" subtitle="Manage Bookstores & Drivers">
      <div className="grid gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Total Bookstores" value={overview?.metrics.totalBookstores ?? 0} accent="blue" note="" />
        <AdminMetricCard label="Total Drivers" value={overview?.metrics.totalDrivers ?? 0} accent="blue" note="" />
        <AdminMetricCard label="Total Driver Request" value={overview?.metrics.totalDriverRequests ?? 0} accent="blue" note="" />
        <AdminMetricCard label="Total Completed" value={overview?.metrics.totalCompleted ?? 0} accent="blue" note="" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <AdminSectionCard>
          <h2 className="text-[22px] font-semibold text-[#202124]">Driver Delivery Activity</h2>
          <div className="mt-7 h-[330px] rounded-[16px] border border-[#e5e7eb] p-6">
            <div className="relative flex h-full items-end gap-5">
              {deliveryActivity.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex flex-1 flex-col items-center gap-3">
                  <div className="relative flex h-[260px] w-full items-end rounded-[8px] bg-[linear-gradient(180deg,rgba(64,144,247,0.12),rgba(64,144,247,0.03))] px-2 pb-0">
                    <div
                      className="w-full rounded-t-[6px] bg-[linear-gradient(180deg,#63a5e5_0%,#4f99df_100%)]"
                      style={{ height: `${Math.max((item.value / maxValue) * 100, 2)}%` }}
                    />
                  </div>
                  <span className="text-[13px] text-[#6b7280]">{item.label}</span>
                </div>
              ))}
              <svg
                className="pointer-events-none absolute inset-x-0 top-0 h-[260px] w-full"
                preserveAspectRatio="none"
                viewBox={`0 0 ${Math.max(deliveryActivity.length - 1, 1) * 100} 100`}
              >
                <polyline
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="1"
                  points={deliveryActivity
                    .map((item, index) => `${index * 100},${100 - Math.max((item.value / maxValue) * 100, 2)}`)
                    .join(" ")}
                />
                {deliveryActivity.map((item, index) => (
                  <circle
                    key={`pt-${index}`}
                    cx={index * 100}
                    cy={100 - Math.max((item.value / maxValue) * 100, 2)}
                    r="2"
                    fill="#fff"
                    stroke="#f87171"
                    strokeWidth="1"
                  />
                ))}
              </svg>
            </div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard>
          <h2 className="text-[22px] font-semibold text-[#202124]">Top 3 Books Stores</h2>
          <div className="mt-10 flex justify-center">
            <div className="relative flex size-[248px] items-center justify-center rounded-full bg-[conic-gradient(#5b97ca_0_54%,#3e90e7_54%_79%,#8fc0ff_79%_100%)]">
              <div className="size-[154px] rounded-full bg-white" />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[14px] text-[#202124]">
            {(overview?.recentShops || [
              { _id: "1", name: "ABC Book House" },
              { _id: "2", name: "Knowledge Corner" },
              { _id: "3", name: "BookMart" },
            ]).slice(0, 3).map((shop, index) => (
              <div key={shop._id} className="flex items-center gap-2">
                <span className={`size-3 rounded-full ${index === 0 ? "bg-[#3e90e7]" : index === 1 ? "bg-[#5b97ca]" : "bg-[#8fc0ff]"}`} />
                {shop.name}
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <AdminSectionCard>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-[20px] font-semibold text-[#202124]">Recent Driver Orders Request</h2>
            <Link href="/driver-requests" className="text-[16px] font-medium text-[#4090f7]">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {requestRows.slice(0, 2).map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                actionLabel={
                  request.status === "accepted"
                    ? "Driver Accepted"
                    : request.driver?._id
                      ? "Change Driver"
                      : "Assign Driver"
                }
                actionDisabled={request.status !== "pending"}
                onAction={() => {
                  if (request.status !== "pending") return;
                  setAssigningRequestId(request._id);
                  setSelectedDriverId(null);
                }}
              />
            ))}
          </div>
        </AdminSectionCard>

        <AdminSectionCard>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-[20px] font-semibold text-[#202124]">Available Drivers</h2>
            <Link href="/drivers" className="text-[16px] font-medium text-[#4090f7]">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {(overview?.recentDrivers || []).map((driver) => (
              <DriverCard
                key={driver._id}
                driver={driver}
                compact
                onView={() => undefined}
              />
            ))}
          </div>
        </AdminSectionCard>
      </div>

      {assigningRequestId ? (
        <AssignDriverModal
          open={Boolean(assigningRequestId)}
          title={`Assign Driver to Order #${selectedOrderLabel}`}
          drivers={drivers}
          loading={driversQuery.isLoading}
          selectedDriverId={selectedDriverId}
          assigning={assignMutation.isPending}
          onSelectDriver={setSelectedDriverId}
          onAssignDriver={() => {
            if (!assigningRequestId || !selectedDriverId) {
              toast.error("Select an available driver first.");
              return;
            }

            assignMutation.mutate({
              requestId: assigningRequestId,
              driverId: selectedDriverId,
            });
          }}
          onClose={() => {
            setAssigningRequestId(null);
            setSelectedDriverId(null);
          }}
        />
      ) : null}
    </AdminPageFrame>
  );
}
