"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminMetricCard,
  AdminPageFrame,
  AssignDriverModal,
  RequestCard,
  SegmentedTabs,
  type DriverRow,
} from "@/components/admin/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { assignDriverToRequest, getAdminOverview, getDriverRequests, getDrivers } from "@/lib/api";
import { toast } from "sonner";

type DriverRequestRow = {
  _id: string;
  shopName?: string;
  phone?: string;
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
  };
};

type DriverRequestsResponse = {
  total: number;
  requests: DriverRequestRow[];
};

type AdminOverview = {
  recentDrivers: DriverRow[];
};

export default function DriverRequestsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DriverRequestRow | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const requestsQuery = useQuery({
    queryKey: ["admin-driver-requests", "screen"],
    queryFn: () => getDriverRequests({ page: 1, limit: 100 }),
  });
  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });
  const driversQuery = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: getDrivers,
    enabled: openAssign,
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
  const overview = overviewQuery.data as AdminOverview | undefined;
  const drivers = (driversQuery.data as DriverRow[] | undefined) || [];

  const filteredRequests = useMemo(() => {
    const rows = requestsData?.requests || [];
    if (tab === "all") {
      return rows;
    }

    if (tab === "completed") {
      return rows.filter((row) => row.status === "accepted");
    }

    return rows.filter((row) => row.status === tab);
  }, [requestsData?.requests, tab]);

  if (requestsQuery.isLoading || overviewQuery.isLoading) {
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

  const totalPending = (requestsData?.requests || []).filter((row) => row.status === "pending").length;
  const totalCompleted = (requestsData?.requests || []).filter((row) => row.status === "accepted").length;
  const selectedRequestOrderLabel =
    selectedRequest?.orderId?.orderId || selectedRequest?.orderId?._id || selectedRequest?._id || "Request";

  return (
    <AdminPageFrame title="For Driver Requests" subtitle="See Orders from this Store">
      <div className="grid gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Total Driver Request" value={requestsData?.total || filteredRequests.length} accent="blue" />
        <AdminMetricCard label="Total Pending" value={totalPending} accent="amber" />
        <AdminMetricCard label="Total Completed" value={totalCompleted} accent="green" />
      </div>

      <div className="mt-8">
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
        {filteredRequests.map((request) => (
          <RequestCard
            key={request._id}
            request={{
              ...request,
              orderId: request.orderId?.orderId || request.orderId?._id || request._id,
            }}
            actionLabel={request.driver?._id ? "Change Driver" : "Assign Driver"}
            onAction={() => {
              setSelectedRequest(request);
              setSelectedDriverId(request.driver?._id || null);
              setOpenAssign(true);
            }}
          />
        ))}
      </div>

      <AssignDriverModal
        open={openAssign}
        title={`Assign Driver to Order #${selectedRequestOrderLabel}`}
        drivers={drivers}
        loading={driversQuery.isLoading}
        selectedDriverId={selectedDriverId}
        assigning={assignMutation.isPending}
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
