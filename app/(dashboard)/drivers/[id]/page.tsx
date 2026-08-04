"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bike } from "lucide-react";
import {
  AdminBackHeader,
  AdminMetricCard,
  AdminSectionCard,
  RequestCard,
  SegmentedTabs,
  getDriverOnlineStatus,
  getDriverRideStatus,
  type DriverRow,
} from "@/components/admin/primitives";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { getDriverRequestsByDriver, getDrivers } from "@/lib/api";
import { getAssetUrl } from "@/lib/utils";

type DriverRequestRow = {
  _id: string;
  status?: string;
  orderId?: {
    address?: string;
    createdAt?: string;
    expectedDeliveryDate?: string;
    items?: {
      quantity?: number;
    }[];
    orderId?: string;
    _id?: string;
    phone?: string;
    recipientName?: string;
    status?: string;
    totalAmount?: number;
  };
  shopId?: {
    email?: string;
    name?: string;
  };
  customerName?: string;
  customerPhone?: string;
  customerLocation?: string;
  shopName?: string;
  shopPhone?: string;
  shopLocation?: string;
  location?: string;
  item?: string;
  phone?: string;
  orderDate?: string;
  createdAt?: string;
  totalAmount?: number;
  price?: number;
};

function formatVehicleLabel(value?: string) {
  if (!value) {
    return "N/A";
  }

  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isCompletedRequest(request: DriverRequestRow) {
  return request.status === "completed" || request.orderId?.status === "delivered";
}

function isPendingDriverDelivery(request: DriverRequestRow) {
  return request.status === "pending" || request.status === "accepted";
}

function getRequestItemCount(request: DriverRequestRow) {
  if (request.item) {
    return request.item;
  }

  const quantity = request.orderId?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  return `${quantity} ${quantity === 1 ? "item" : "items"}`;
}

const DRIVER_PROFILE_REQUESTS_PAGE_SIZE = 3;

export default function DriverProfilePage() {
  const params = useParams<{ id: string }>();
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  const driversQuery = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: getDrivers,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  });
  const requestsQuery = useQuery({
    queryKey: ["driver-profile-requests", params.id],
    queryFn: () => getDriverRequestsByDriver(params.id),
    enabled: Boolean(params.id),
  });

  const drivers = useMemo(() => (driversQuery.data as DriverRow[] | undefined) || [], [driversQuery.data]);
  const requestsData = requestsQuery.data as DriverRequestRow[] | undefined;
  const requests = useMemo(() => requestsData || [], [requestsData]);
  const driver = drivers.find((row) => row._id === params.id);
  const rideStatus = driver ? getDriverRideStatus(driver) : "available";
  const onlineStatus = driver ? getDriverOnlineStatus(driver) : "offline";
  const driverDisplayName = driver?.name || driver?.email?.split("@")[0] || "Driver";
  const vehicleLabel = formatVehicleLabel(driver?.vehicleType || driver?.vehicle);
  const avatarUrl = getAssetUrl(driver?.avatar);
  const completedOrders = requests.filter(isCompletedRequest).length;
  const pendingOrders = requests.filter(isPendingDriverDelivery).length;
  const totalDeliveries = driver?.completedDeliveries ?? completedOrders;

  const scopedRequests = useMemo(() => {
    if (tab === "all") {
      return requests;
    }

    if (tab === "completed") {
      return requests.filter(isCompletedRequest);
    }

    return requests.filter(isPendingDriverDelivery);
  }, [requests, tab]);
  const totalPages = Math.max(1, Math.ceil(scopedRequests.length / DRIVER_PROFILE_REQUESTS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRequests = scopedRequests.slice(
    (currentPage - 1) * DRIVER_PROFILE_REQUESTS_PAGE_SIZE,
    currentPage * DRIVER_PROFILE_REQUESTS_PAGE_SIZE,
  );

  if (driversQuery.isLoading || requestsQuery.isLoading) {
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
            <div className="relative flex size-[178px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d6b08f] text-[52px] font-semibold text-white">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={driverDisplayName} fill sizes="178px" className="object-cover" />
              ) : (
                driverDisplayName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-[28px] font-semibold text-[#17223b]">{driverDisplayName}</h2>
              <div className="mt-2 flex items-center gap-5 text-[18px] capitalize">
                <p className={rideStatus === "busy" ? "text-[#f97316]" : "text-[#16a34a]"}>
                  {rideStatus}
                </p>
                <p className={onlineStatus === "online" ? "text-[#16a34a]" : "text-[#667085]"}>
                  {onlineStatus}
                </p>
              </div>
              <p className="mt-4 text-[28px] font-medium text-[#202124]">
                Vehicle: <span className="text-[#4090f7]">{vehicleLabel}</span>
              </p>
              <p className="mt-2 text-[24px] text-[#202124]">
                ID: <span className="text-[#4090f7]">{driver?.driverId || driver?._id || params.id}</span>
              </p>
              <div className="mt-5 space-y-3 text-[18px] text-[#667085]">
                <p>{driver?.phone || "Phone unavailable"}</p>
                {driver?.vehiclePlateNumber ? <p>Plate: {driver.vehiclePlateNumber}</p> : null}
                <p>{totalDeliveries} deliveries</p>
              </div>
            </div>
          </div>
          <div className="flex min-h-[72px] w-[92px] flex-col items-center justify-center gap-1 rounded-[10px] border border-[#3d8ef5] px-2 text-center text-[#4090f7]">
            <Bike className="size-6" />
            <span className="text-[16px] leading-tight">{vehicleLabel}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <AdminMetricCard label="Total Orders" value={requests.length} accent="blue" />
          <AdminMetricCard label="Pending Orders" value={pendingOrders} accent="cream" />
          <AdminMetricCard label="Completed Orders" value={completedOrders} accent="green" />
        </div>
      </AdminSectionCard>

      <div className="mt-8">
        <h3 className="text-[24px] font-semibold text-[#202124]">Orders for this Driver</h3>
        <p className="mt-1 text-[16px] text-[#777]">See orders assigned to this driver</p>
      </div>

      <div className="mt-4">
        <SegmentedTabs
          items={[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Completed", value: "completed" },
          ]}
          value={tab}
          onChange={(value) => {
            setTab(value);
            setPage(1);
          }}
        />
      </div>

      <div className="mt-6 space-y-5">
        {paginatedRequests.map((request) => (
          <RequestCard
            key={request._id}
            request={{
              ...request,
              phone: request.shopPhone || "",
              location: request.shopLocation || "",
              shopName: request.shopName || request.shopId?.name || request.shopId?.email || "N/A",
              shopPhone: request.shopPhone || "N/A",
              shopLocation: request.shopLocation || "N/A",
              customerName: request.customerName || request.orderId?.recipientName,
              customerPhone: request.customerPhone || request.orderId?.phone || request.phone,
              customerLocation: request.customerLocation || request.orderId?.address || request.location,
              item: getRequestItemCount(request),
              orderDate: request.orderDate || request.orderId?.createdAt || request.createdAt,
              totalAmount: request.totalAmount ?? request.orderId?.totalAmount ?? request.price,
              orderId: request.orderId?.orderId || request.orderId?._id || request._id,
            }}
          />
        ))}
        {scopedRequests.length === 0 ? (
          <div className="rounded-[18px] border border-[#d2dce7] bg-[#f8fbff] px-6 py-10 text-center text-[15px] text-[#667085]">
            No orders found for this driver.
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex flex-col gap-3 rounded-[14px] border border-[#e2e8f0] bg-white text-[14px] text-[#5b6371] md:flex-row md:items-center md:justify-between md:pl-5">
        <span className="px-5 pt-4 md:px-0 md:pt-0">
          {scopedRequests.length > 0
            ? `Showing ${(currentPage - 1) * DRIVER_PROFILE_REQUESTS_PAGE_SIZE + 1} to ${Math.min(
                currentPage * DRIVER_PROFILE_REQUESTS_PAGE_SIZE,
                scopedRequests.length,
              )} of ${scopedRequests.length} orders`
            : "Showing 0 orders"}
        </span>
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </section>
  );
}
