"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdminMetricCard, AdminPageFrame, DriverCard, RequestCard } from "@/components/admin/primitives";
import { AdminSectionCard } from "@/components/admin/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminOverview, getDriverRequests } from "@/lib/api";

type DriverRequestRow = {
  _id: string;
  status?: string;
  orderId?: {
    orderId?: string;
    _id?: string;
  };
  shopName?: string;
  phone?: string;
  customerName?: string;
  location?: string;
  item?: string;
  orderDate?: string;
  createdAt?: string;
  totalAmount?: number;
  price?: number;
};

type Overview = {
  metrics: {
    totalDrivers: number;
    totalCompleted: number;
  };
  recentDrivers: {
    _id: string;
    name?: string;
    phone?: string;
  }[];
};

export default function DriversManagementPage() {
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });
  const requestsQuery = useQuery({
    queryKey: ["admin-driver-requests", "management"],
    queryFn: () => getDriverRequests({ page: 1, limit: 100 }),
  });

  const overview = overviewQuery.data as Overview | undefined;
  const requests = ((requestsQuery.data as { requests: DriverRequestRow[] } | undefined)?.requests || []).filter(
    (row) => row.status === "pending" || row.status === "accepted",
  );

  if (overviewQuery.isLoading || requestsQuery.isLoading) {
    return (
      <AdminPageFrame title="Driver Management" subtitle="See Driver Management">
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[108px] rounded-[14px]" />
          ))}
        </div>
        <Skeleton className="mt-5 h-[720px] rounded-[18px]" />
      </AdminPageFrame>
    );
  }

  const requestLabel = selectedRequestId
    ? requests.find((row) => row._id === selectedRequestId)?.orderId?.orderId || "OI027"
    : "OI027";

  return (
    <AdminPageFrame title="Driver Management" subtitle="See Driver Management">
      <div className="grid gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Total Driver" value={overview?.metrics.totalDrivers || 0} accent="blue" />
        <AdminMetricCard
          label="Total Pending order"
          value={requests.filter((request) => request.status === "pending").length}
          accent="cream"
        />
        <AdminMetricCard label="Total Completed order" value={overview?.metrics.totalCompleted || 0} accent="green" />
      </div>

      <AdminSectionCard className="mt-5">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-[#202124]">Driver</h2>
          </div>
        </div>

        <div className="space-y-4">
          {(overview?.recentDrivers || []).map((driver, index) => (
            <DriverCard
              key={driver._id}
              driver={{
                ...driver,
                status: index % 3 === 1 ? "busy" : "available",
                currentOrders: index % 3 === 1 ? 2 : 0,
              }}
              onView={() => router.push(`/drivers/${driver._id}`)}
              onAssign={() => setSelectedRequestId(requests[0]?._id || null)}
            />
          ))}
        </div>
      </AdminSectionCard>

      {selectedRequestId ? (
        <div className="mt-6 space-y-5">
          {requests.slice(0, 2).map((request) => (
            <RequestCard
              key={request._id}
              request={{
                ...request,
                orderId: request.orderId?.orderId || request.orderId?._id || request._id,
              }}
            />
          ))}
        </div>
      ) : null}
    </AdminPageFrame>
  );
}
