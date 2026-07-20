"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminMetricCard, AdminPageFrame, StatusPill } from "@/components/admin/primitives";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrders } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type OrderRow = {
  _id: string;
  orderId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  vendor?: {
    name?: string;
    phone?: string;
  };
};

type OrdersResponse = {
  orders: OrderRow[];
  pagination: {
    totalPages: number;
    page: number;
  };
};

export default function ProfitOverviewPage() {
  const [page, setPage] = useState(1);
  const ordersQuery = useQuery({
    queryKey: ["profit-overview-orders", page],
    queryFn: () => getOrders({ page, limit: 6 }),
  });

  const orders = ordersQuery.data as OrdersResponse | undefined;
  const rowsData = orders?.orders;
  const rows = rowsData || [];
  const totalCommission = rows.reduce((sum, row) => sum + row.totalAmount * 0.15, 0);
  const adminProfit = Number((totalCommission * 0.166).toFixed(2));

  if (ordersQuery.isLoading) {
    return (
      <AdminPageFrame title="Profit Overview" subtitle="Analysis your Profit Overview">
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[108px] rounded-[14px]" />
          ))}
        </div>
        <Skeleton className="mt-6 h-[620px] rounded-[18px]" />
      </AdminPageFrame>
    );
  }

  return (
    <AdminPageFrame title="Profit Overview" subtitle="Analysis your Profit Overview">
      <div className="grid gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Total Orders" value={rows.length} accent="green" note="2 today" />
        <AdminMetricCard label="Total Commission" value={formatCurrency(totalCommission)} accent="blue" />
        <AdminMetricCard label="Admin Total Profit" value={formatCurrency(adminProfit)} accent="cream" />
      </div>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-[#d6d6d6] bg-white">
        <div className="overflow-x-auto px-4 py-4">
          <table className="min-w-full border-separate border-spacing-y-0 text-left">
            <thead>
              <tr className="text-[16px] font-semibold text-[#202124]">
                <th className="border-b border-[#dedede] px-4 py-5">Order ID</th>
                <th className="border-b border-[#dedede] px-4 py-5">Store Name</th>
                <th className="border-b border-[#dedede] px-4 py-5">Phone Number</th>
                <th className="border-b border-[#dedede] px-4 py-5">Item Price</th>
                <th className="border-b border-[#dedede] px-4 py-5">Admin Commission</th>
                <th className="border-b border-[#dedede] px-4 py-5">Date</th>
                <th className="border-b border-[#dedede] px-4 py-5">Status</th>
                <th className="border-b border-[#dedede] px-4 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order._id} className="text-[16px] text-[#202124]">
                  <td className="border-b border-[#ececec] px-4 py-6">{order.orderId}</td>
                  <td className="border-b border-[#ececec] px-4 py-6">{order.vendor?.name || "ABC Store"}</td>
                  <td className="border-b border-[#ececec] px-4 py-6">{order.vendor?.phone || "(207) 555-0119"}</td>
                  <td className="border-b border-[#ececec] px-4 py-6">{formatCurrency(order.totalAmount)}</td>
                  <td className="border-b border-[#ececec] px-4 py-6">15%</td>
                  <td className="border-b border-[#ececec] px-4 py-6">
                    <div>{formatDate(order.createdAt)}</div>
                    <div className="mt-1 text-[13px] text-[#7d7d7d]">09:29 AM</div>
                  </td>
                  <td className="border-b border-[#ececec] px-4 py-6">
                    <StatusPill status={order.status === "pending" ? "pending" : "delivered"} />
                  </td>
                  <td className="border-b border-[#ececec] px-4 py-6 text-right text-[#f04438]">
                    <Trash2 className="ml-auto size-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4 border-t border-[#ececec] px-4 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[16px] text-[#666]">Showing 1 to {rows.length} of 20 results</p>
          <Pagination page={page} totalPages={orders?.pagination.totalPages || 1} onPageChange={setPage} />
        </div>
      </div>
    </AdminPageFrame>
  );
}
