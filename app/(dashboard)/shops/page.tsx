"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminMetricCard, AdminPageFrame, ShopCard } from "@/components/admin/primitives";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminOverview, getOrders, getShops } from "@/lib/api";

type ShopRow = {
  _id: string;
  name?: string;
  address?: string;
  shopStatus?: string;
  totalOrders?: number;
  owner?: {
    _id?: string;
    name?: string;
    phone?: string;
  };
};

type ShopsResponse = {
  shops: ShopRow[];
  pagination: {
    page: number;
    totalPages: number;
  };
};

type OrderRow = {
  _id: string;
  status?: string;
  vendorId?: string;
  vendor?: { _id?: string };
};

type AdminOverview = {
  metrics: {
    totalBookstores: number;
    totalDriverRequests: number;
    totalCompleted: number;
  };
};

function ShopsLoading() {
  return (
    <AdminPageFrame title="Books store Management" subtitle="See Books store Management">
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[120px] rounded-[14px]" />
        ))}
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[420px] rounded-[20px]" />
        ))}
      </div>
    </AdminPageFrame>
  );
}

export default function AdminShopsPage() {
  const [page, setPage] = useState(1);
  const shopsQuery = useQuery({
    queryKey: ["admin-shops-grid", page],
    queryFn: () => getShops({ page, limit: 8 }),
  });
  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });
  const pendingOrdersQuery = useQuery({
    queryKey: ["admin-pending-orders"],
    queryFn: () => getOrders({ page: 1, limit: 1000, status: "pending" }),
  });

  const shops = shopsQuery.data as ShopsResponse | undefined;
  const overview = overviewQuery.data as AdminOverview | undefined;
  const pendingOrders = ((pendingOrdersQuery.data as { orders: OrderRow[] } | undefined)?.orders || []) as OrderRow[];

  const cards = useMemo(
    () =>
      (shops?.shops || []).map((shop) => {
        const vendorId = shop.owner?._id || shop._id;
        const pending = pendingOrders.filter(
          (order) =>
            order.status === "pending" &&
            (order.vendorId === vendorId || order.vendor?._id === vendorId),
        ).length;

        return {
          id: shop._id,
          title: shop.name || "ABC Book House",
          address: shop.address || "23 Mirpur Road, Dhaka 1216",
          phone: shop.owner?.phone || "+880 1812-111222",
          totalOrders: shop.totalOrders || 0,
          pending,
        };
      }),
    [pendingOrders, shops?.shops],
  );

  if (shopsQuery.isLoading) {
    return <ShopsLoading />;
  }

  return (
    <AdminPageFrame title="Books store Management" subtitle="See Books store Management">
      <div className="grid gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Total Bookstores" value={overview?.metrics.totalBookstores || 0} accent="blue" />
        <AdminMetricCard label="Total Driver Request" value={overview?.metrics.totalDriverRequests || 0} accent="amber" />
        <AdminMetricCard label="Total Completed" value={overview?.metrics.totalCompleted || 0} accent="green" />
      </div>

      <div className="mt-8">
        <h2 className="text-[32px] font-semibold text-[#202124]">Books store</h2>
        <p className="mt-2 text-[16px] text-[#666]">Total Books store</p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((shop) => (
          <ShopCard key={shop.id} {...shop} />
        ))}
      </div>

      <div className="mt-6">
        <Pagination page={shops?.pagination.page || page} totalPages={shops?.pagination.totalPages || 1} onPageChange={setPage} />
      </div>
    </AdminPageFrame>
  );
}
