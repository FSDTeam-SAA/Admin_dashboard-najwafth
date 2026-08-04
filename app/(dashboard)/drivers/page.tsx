"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdminMetricCard, AdminPageFrame, DriverCard, type DriverRow } from "@/components/admin/primitives";
import { AdminSectionCard } from "@/components/admin/primitives";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminOverview, getDriverRequests, getDrivers } from "@/lib/api";

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

type DriverRequestsSummary = {
  total?: number;
  metrics?: {
    totalPending?: number;
  };
};

const DRIVERS_PAGE_SIZE = 5;

export default function DriversManagementPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });
  const pendingRequestsQuery = useQuery({
    queryKey: ["admin-driver-requests", "management-pending-count"],
    queryFn: () => getDriverRequests({ page: 1, limit: 1, status: "pending" }),
  });
  const driversQuery = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: getDrivers,
    refetchInterval: 5_000,
  });

  const overview = overviewQuery.data as Overview | undefined;
  const drivers = useMemo(() => (driversQuery.data as DriverRow[] | undefined) || [], [driversQuery.data]);
  const pendingRequestsData = pendingRequestsQuery.data as DriverRequestsSummary | undefined;
  const totalPendingOrders = pendingRequestsData?.metrics?.totalPending ?? pendingRequestsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(drivers.length / DRIVERS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedDrivers = drivers.slice(
    (currentPage - 1) * DRIVERS_PAGE_SIZE,
    currentPage * DRIVERS_PAGE_SIZE,
  );

  if (overviewQuery.isLoading || pendingRequestsQuery.isLoading || driversQuery.isLoading) {
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

  return (
    <AdminPageFrame title="Driver Management" subtitle="See Driver Management">
      <div className="grid gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Total Driver" value={overview?.metrics.totalDrivers || 0} accent="blue" />
        <AdminMetricCard
          label="Total Pending order"
          value={totalPendingOrders}
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
          {paginatedDrivers.map((driver) => (
            <DriverCard
              key={driver._id}
              driver={driver}
              onView={() => router.push(`/drivers/${driver._id}`)}
            />
          ))}
          {drivers.length === 0 ? (
            <div className="rounded-[18px] border border-[#d2dce7] bg-[#f8fbff] px-5 py-10 text-center text-[15px] text-[#667085]">
              No drivers found.
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-[14px] border border-[#e2e8f0] bg-white text-[14px] text-[#5b6371] md:flex-row md:items-center md:justify-between md:pl-5">
          <span className="px-5 pt-4 md:px-0 md:pt-0">
            {drivers.length > 0
              ? `Showing ${(currentPage - 1) * DRIVERS_PAGE_SIZE + 1} to ${Math.min(
                  currentPage * DRIVERS_PAGE_SIZE,
                  drivers.length,
                )} of ${drivers.length} drivers`
              : "Showing 0 drivers"}
          </span>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminSectionCard>
    </AdminPageFrame>
  );
}
