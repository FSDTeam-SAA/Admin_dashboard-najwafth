"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AdminBackHeader,
  AdminMetricCard,
  AdminSectionCard,
  RequestCard,
  SegmentedTabs,
} from "@/components/admin/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrders, getShopById } from "@/lib/api";

type ShopData = {
  _id: string;
  name?: string;
  address?: string;
  totalOrders?: number;
  owner?: {
    _id?: string;
    name?: string;
    phone?: string;
  };
};

type OrderRow = {
  _id: string;
  createdAt?: string;
  totalAmount?: number;
  status?: string;
  orderId?: string;
  address?: string;
  customer?: {
    name?: string;
    phone?: string;
  };
  items?: {
    quantity?: number;
    product?: {
      title?: string;
    };
  }[];
};

export default function ShopDetailsPage() {
  const params = useParams<{ id: string }>();
  const [tab, setTab] = useState("all");

  const shopQuery = useQuery({
    queryKey: ["admin-shop", params.id],
    queryFn: () => getShopById(params.id),
    enabled: Boolean(params.id),
  });
  const shop = shopQuery.data as ShopData | undefined;
  const vendorId = shop?.owner?._id || shop?._id;

  const ordersQuery = useQuery({
    queryKey: ["admin-shop-orders", vendorId],
    queryFn: () => getOrders({ page: 1, limit: 100, vendorId }),
    enabled: Boolean(vendorId),
  });

  const orders = ((ordersQuery.data as { orders: OrderRow[] } | undefined)?.orders || []) as OrderRow[];

  const filteredOrders = useMemo(() => {
    if (tab === "all") {
      return orders;
    }

    if (tab === "completed") {
      return orders.filter((order) => order.status === "delivered");
    }

    return orders.filter((order) => order.status === tab);
  }, [orders, tab]);

  if (shopQuery.isLoading || ordersQuery.isLoading) {
    return (
      <section className="bg-white px-6 py-7 md:px-8">
        <Skeleton className="h-[52px] w-[320px] rounded-[12px]" />
        <Skeleton className="mt-6 h-[586px] rounded-[20px]" />
      </section>
    );
  }

  return (
    <section className="bg-white px-6 py-7 md:px-8">
      <AdminBackHeader href="/shops" title="Books store" subtitle="See Books store Management" />

      <AdminSectionCard className="overflow-hidden p-3">
        <div className="h-[390px] rounded-[18px] bg-[linear-gradient(135deg,#c99d6d_0%,#f0e6d7_42%,#856342_100%)]" />
        <div className="px-4 pb-3 pt-4">
          <h2 className="text-[28px] font-semibold text-[#202124]">{shop?.name || "ABC Book House"}</h2>
          <div className="mt-2 space-y-2 text-[14px] text-[#6b7280]">
            <p>{shop?.address || "23 Mirpur Road, Dhaka 1216"}</p>
            <p>{shop?.owner?.phone || "+880 1812-111222"}</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <AdminMetricCard label="Total Orders" value={shop?.totalOrders || 0} accent="blue" note="" />
            <AdminMetricCard
              label="Pending"
              value={orders.filter((order) => order.status === "pending").length}
              accent="cream"
              note=""
            />
          </div>
        </div>
      </AdminSectionCard>

      <div className="mt-8">
        <h3 className="text-[24px] font-semibold text-[#202124]">Orders from this Store</h3>
        <p className="mt-1 text-[16px] text-[#777]">See Orders from this Store</p>
      </div>

      <div className="mt-4">
        <SegmentedTabs
          items={[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Completed", value: "completed" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-6 space-y-5">
        {filteredOrders.map((order) => (
          <RequestCard
            key={order._id}
            request={{
              _id: order._id,
              orderId: order.orderId || order._id,
              createdAt: order.createdAt,
              totalAmount: order.totalAmount,
              status: order.status,
              customerName: order.customer?.name || "Customer",
              customerPhone: order.customer?.phone || "",
              customerLocation: order.address || "",
              shopName: shop?.name || "Books store",
              shopPhone: shop?.owner?.phone || "",
              shopLocation: shop?.address || "",
              item:
                order.items && order.items.length > 0
                  ? `${order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)} Books`
                  : "0 Books",
            }}
          />
        ))}
        {filteredOrders.length === 0 ? (
          <div className="rounded-[18px] border border-[#d2dce7] bg-[#f8fbff] px-6 py-10 text-center text-[15px] text-[#667085]">
            No orders found for this store.
          </div>
        ) : null}
      </div>
    </section>
  );
}
