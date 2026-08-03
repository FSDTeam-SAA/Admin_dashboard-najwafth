"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminMetricCard,
  AdminPageFrame,
  AssignDriverModal,
  RequestCard,
  SegmentedTabs,
  type DriverRow,
} from "@/components/admin/primitives";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { assignDriverToRequest, getDriverRequests, getDrivers } from "@/lib/api";
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
  createdAt?: string;
  totalAmount?: number;
  price?: number;
  status?: string;
  orderId?: {
    orderId?: string;
    _id?: string;
  };
  driver?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: {
      url?: string;
    };
  };
};

type DriverRequestsResponse = {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  metrics?: {
    totalRequests: number;
    totalPending: number;
    totalCompleted: number;
  };
  requests: DriverRequestRow[];
};

const DRIVER_REQUESTS_PAGE_SIZE = 2;

export default function DriverRequestsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DriverRequestRow | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const statusFilter = tab === "all" ? undefined : tab;

  const requestsQuery = useQuery({
    queryKey: ["admin-driver-requests", "screen", page, statusFilter],
    queryFn: () => getDriverRequests({ page, limit: DRIVER_REQUESTS_PAGE_SIZE, status: statusFilter }),
    refetchInterval: 2_000,
    refetchOnWindowFocus: true,
  });
  const driversQuery = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: getDrivers,
    enabled: openAssign,
    refetchInterval: openAssign ? 2_000 : false,
    refetchOnWindowFocus: true,
  });

  const assignMutation = useMutation({
    mutationFn: ({ requestId, driverId }: { requestId: string; driverId: string }) =>
      assignDriverToRequest(requestId, driverId),
    onSuccess: () => {
      toast.success("Driver assigned successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-driver-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      setOpenAssign(false);
      setSelectedRequest(null);
      setSelectedDriverId(null);
    },
  });

  const requestsData = requestsQuery.data as DriverRequestsResponse | undefined;
  const drivers = (driversQuery.data as DriverRow[] | undefined) || [];
  const requests = requestsData?.requests || [];
  const totalRequests = requestsData?.metrics?.totalRequests ?? requestsData?.total ?? requests.length;
  const totalPending = requestsData?.metrics?.totalPending ?? requests.filter((row) => row.status === "pending").length;
  const totalCompleted = requestsData?.metrics?.totalCompleted ?? requests.filter((row) => row.status === "completed").length;
  const responsePage = requestsData?.page || page;
  const totalPages = requestsData?.totalPages || 1;
  const pageTotal = requestsData?.total || requests.length;

  if (requestsQuery.isLoading) {
    return (
      <AdminPageFrame title="For Driver Requests" subtitle="See Orders from this Store">
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[108px] rounded-[14px]" />
          ))}
        </div>
        <Skeleton className="mt-6 h-[700px] rounded-[18px]" />
      </AdminPageFrame>
    );
  }

  const selectedRequestOrderLabel =
    selectedRequest?.orderId?.orderId || selectedRequest?.orderId?._id || selectedRequest?._id || "Request";

  return (
    <AdminPageFrame title="For Driver Requests" subtitle="See Orders from this Store">
      <div className="grid gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Total Driver Request" value={totalRequests} accent="blue" />
        <AdminMetricCard label="Total Pending" value={totalPending} accent="amber" />
        <AdminMetricCard label="Total Completed" value={totalCompleted} accent="green" />
      </div>

      <div className="mt-8">
        <SegmentedTabs
          items={[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Current Offers", value: "accepted" },
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
        {requests.map((request) => {
          const isAccepted = request.status === "accepted";
          const canAssign = request.status === "pending";

          return (
            <RequestCard
              key={request._id}
              request={{
                ...request,
                orderId: request.orderId?.orderId || request.orderId?._id || request._id,
              }}
              actionLabel={
                isAccepted
                  ? "Driver Accepted"
                  : request.driver?._id
                    ? "Change Driver"
                    : "Assign Driver"
              }
              actionDisabled={!canAssign}
              onAction={() => {
                if (!canAssign) return;
                setSelectedRequest(request);
                setSelectedDriverId(null);
                setOpenAssign(true);
              }}
            />
          );
        })}
        {requests.length === 0 ? (
          <div className="rounded-[18px] border border-[#d2dce7] bg-[#f8fbff] px-5 py-10 text-center text-[15px] text-[#667085]">
            No driver requests found.
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[14px] border border-[#e2e8f0] bg-white text-[14px] text-[#5b6371] md:flex-row md:items-center md:justify-between md:pl-5">
        <span className="px-5 pt-4 md:px-0 md:pt-0">
          {requests.length > 0
            ? `Showing ${(responsePage - 1) * DRIVER_REQUESTS_PAGE_SIZE + 1} to ${(responsePage - 1) * DRIVER_REQUESTS_PAGE_SIZE + requests.length} of ${pageTotal} results`
            : "Showing 0 results"}
        </span>
        <Pagination page={responsePage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AssignDriverModal
        open={openAssign}
        title={`Assign Driver to Order #${selectedRequestOrderLabel}`}
        drivers={drivers}
        loading={driversQuery.isLoading}
        selectedDriverId={selectedDriverId}
        assigning={assignMutation.isPending}
        warning={
          selectedRequest?.driver?._id && selectedRequest.status === "pending"
            ? `This request is already assigned to ${selectedRequest.driver.name || "a driver"} (status: ${
                selectedRequest.status || "pending"
              }). Reassigning will notify the previous driver.`
            : undefined
        }
        onSelectDriver={setSelectedDriverId}
        onAssignDriver={() => {
          if (!selectedRequest?._id || !selectedDriverId) {
            toast.error("Select a driver first.");
            return;
          }

          assignMutation.mutate({
            requestId: selectedRequest._id,
            driverId: selectedDriverId,
          });
        }}
        onClose={() => {
          setOpenAssign(false);
          setSelectedRequest(null);
          setSelectedDriverId(null);
        }}
      />
    </AdminPageFrame>
  );
}
