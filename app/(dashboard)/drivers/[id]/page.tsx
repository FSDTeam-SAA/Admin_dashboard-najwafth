"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AdminBackHeader,
  AdminMetricCard,
  AdminSectionCard,
  AssignDriverModal,
  RequestCard,
  SegmentedTabs,
} from "@/components/admin/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminOverview, getDriverRequestsByDriver } from "@/lib/api";

type DriverRequestRow = {
  _id: string;
  status?: string;
  orderId?: {
    orderId?: string;
    _id?: string;
  };
  shopId?: {
    name?: string;
  };
  customerName?: string;
  location?: string;
  item?: string;
  phone?: string;
  orderDate?: string;
  createdAt?: string;
  totalAmount?: number;
  price?: number;
};

type Overview = {
  recentDrivers: {
    _id: string;
    name?: string;
    phone?: string;
  }[];
};

export default function DriverProfilePage() {
  const params = useParams<{ id: string }>();
  const [tab, setTab] = useState("all");
  const [assignOpen, setAssignOpen] = useState(false);

  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });
  const requestsQuery = useQuery({
    queryKey: ["driver-profile-requests", params.id],
    queryFn: () => getDriverRequestsByDriver(params.id),
    enabled: Boolean(params.id),
  });

  const overview = overviewQuery.data as Overview | undefined;
  const requestsData = requestsQuery.data as DriverRequestRow[] | undefined;
  const requests = requestsData || [];
  const driver = overview?.recentDrivers.find((row) => row._id === params.id) || overview?.recentDrivers[0];

  const scopedRequests = (() => {
    if (tab === "all") {
      return requests;
    }

    if (tab === "completed") {
      return requests.filter((row) => row.status === "accepted");
    }

    return requests.filter((row) => row.status === tab);
  })();

  if (overviewQuery.isLoading || requestsQuery.isLoading) {
    return (
      <section className="bg-white px-6 py-7 md:px-8">
        <Skeleton className="h-[52px] w-[360px] rounded-[12px]" />
        <Skeleton className="mt-6 h-[720px] rounded-[20px]" />
      </section>
    );
  }

  return (
    <section className="bg-white px-6 py-7 md:px-8">
      <AdminBackHeader href="/drivers" title="Driver Profile" subtitle="See Driver Management" />

      <AdminSectionCard>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex gap-4">
            <div className="flex size-[178px] items-center justify-center rounded-full bg-[#d6b08f] text-[52px] font-semibold text-white">
              {driver?.name?.charAt(0) || "R"}
            </div>
            <div>
              <h2 className="text-[28px] font-semibold text-[#17223b]">{driver?.name || "Rahim Khan"}</h2>
              <p className="mt-2 text-[18px] text-[#16a34a]">Available</p>
              <p className="mt-4 text-[28px] font-medium text-[#202124]">
                Vehicle: <span className="text-[#4090f7]">Bike</span>
              </p>
              <p className="mt-2 text-[24px] text-[#202124]">
                ID: <span className="text-[#4090f7]">12345678</span>
              </p>
              <div className="mt-5 space-y-3 text-[18px] text-[#667085]">
                <p>{driver?.phone || "+880 1712-345678"}</p>
                <p>234 deliveries</p>
              </div>
            </div>
          </div>
          <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-[10px] border border-[#3d8ef5] text-[#4090f7]">
            <span className="text-[24px]">o</span>
            <span className="text-[18px]">Bike</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <AdminMetricCard label="Total Driver" value="12,832" accent="blue" />
          <AdminMetricCard label="Total Pending order" value="12,832" accent="cream" />
          <AdminMetricCard label="Total Completed order" value="12,832" accent="green" />
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
        {scopedRequests.map((request) => (
          <RequestCard
            key={request._id}
            request={{
              ...request,
              shopName: request.shopId?.name,
              orderId: request.orderId?.orderId || request.orderId?._id || request._id,
            }}
            actionLabel="Assign Driver"
            onAction={() => setAssignOpen(true)}
          />
        ))}
      </div>

      <AssignDriverModal
        open={assignOpen}
        title="Assign Driver to Order #OI027"
        drivers={
          (overview?.recentDrivers || []).map((row, index) => ({
            ...row,
            status: index % 2 === 0 ? "available" : "busy",
            currentOrders: index % 2 === 0 ? 0 : 2,
          })) || []
        }
        onClose={() => setAssignOpen(false)}
      />
    </section>
  );
}
