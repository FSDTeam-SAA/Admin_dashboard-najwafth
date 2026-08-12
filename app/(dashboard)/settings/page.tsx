"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Eye, EyeOff, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { AdminPageFrame, AdminSectionCard, ProfileHero } from "@/components/admin/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword, getAdminSettings, getProfile, updateAdminSettings, updateProfile } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

type ProfileData = {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  address?: string;
  image?: string;
  profileImage?: string;
  avatar?: string;
};

type AdminSettingsData = {
  adminCommissionRate?: number;
  deliveryFee?: number;
};

function splitName(name?: string) {
  const fullName = name || "Brooklyn Simmons";
  const [firstName, ...rest] = fullName.split(" ");
  return {
    firstName,
    lastName: rest.join(" ") || "Simmons",
  };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"personal" | "password">("personal");
  const [openCommissionModal, setOpenCommissionModal] = useState(false);
  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState("15");
  const [deliveryFee, setDeliveryFee] = useState("5");
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getProfile,
  });

  const profile = profileQuery.data as ProfileData | undefined;
  const names = useMemo(() => splitName(profile?.name), [profile?.name]);

  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getAdminSettings,
  });

  const adminSettings = settingsQuery.data as AdminSettingsData | undefined;
  const currentCommissionRate = Number(adminSettings?.adminCommissionRate ?? 15);
  const currentDeliveryFee = Number(adminSettings?.deliveryFee ?? 5);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
  });

  const commissionMutation = useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      toast.success("Admin commission updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["profit-overview-orders"] });
      setOpenCommissionModal(false);
    },
  });

  const deliveryFeeMutation = useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      toast.success("Shipping delivery fee updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setOpenDeliveryModal(false);
    },
  });

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    formData.delete("firstName");
    formData.delete("lastName");
    formData.set("name", `${firstName} ${lastName}`.trim());
    updateMutation.mutate(formData);
  }

  function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    passwordMutation.mutate({
      currentPassword: String(formData.get("currentPassword") || ""),
      newPassword: String(formData.get("newPassword") || ""),
      confirmPassword: String(formData.get("confirmPassword") || ""),
    });
  }

  return (
    <AdminPageFrame title="Setting" subtitle="Mange your Profile Information">
      <div className="grid gap-5 xl:grid-cols-4">
        <button
          className={`h-[62px] rounded-[10px] border text-[24px] font-medium ${
            tab === "personal" ? "bg-[#6d98c0] text-white border-[#6d98c0]" : "border-[#3d8ef5] bg-white text-[#4090f7]"
          }`}
          onClick={() => setTab("personal")}
          type="button"
        >
          Personal Information
        </button>
        <button
          className={`h-[62px] rounded-[10px] border text-[24px] font-medium ${
            tab === "password" ? "bg-[#6d98c0] text-white border-[#6d98c0]" : "border-[#3d8ef5] bg-white text-[#4090f7]"
          }`}
          onClick={() => setTab("password")}
          type="button"
        >
          Change Password
        </button>
        <button
          className="h-[62px] rounded-[10px] border border-[#3d8ef5] bg-white text-[24px] font-medium text-[#4090f7]"
          onClick={() => {
            setCommissionRate(String(currentCommissionRate));
            setOpenCommissionModal(true);
          }}
          type="button"
        >
          Admin Commission
        </button>
        <button
          className="flex h-[62px] items-center justify-center gap-2 rounded-[10px] border border-[#3d8ef5] bg-white text-[24px] font-medium text-[#4090f7]"
          onClick={() => {
            setDeliveryFee(String(currentDeliveryFee));
            setOpenDeliveryModal(true);
          }}
          type="button"
        >
          <Truck className="size-5" />
          Shipping Delivery
        </button>
      </div>

      <div className="mt-8">
        <ProfileHero
          name={profile?.name || "Brooklyn Simmons"}
          roleLabel="@admin"
          image={profile?.avatar || profile?.image || profile?.profileImage}
          onPickImage={
            tab === "personal"
              ? (file) => {
                  const formData = new FormData();
                  formData.set("avatar", file);
                  updateMutation.mutate(formData);
                }
              : undefined
          }
          uploading={updateMutation.isPending}
        />
      </div>

      {tab === "personal" ? (
        <AdminSectionCard className="mt-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-[24px] font-semibold text-[#202124]">Personal Information</h2>
            <Button className="h-[44px] rounded-[10px] bg-[#6d98c0] px-6 hover:bg-[#5f88ae]">Edit</Button>
          </div>

          <form className="space-y-5" onSubmit={handleProfileSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-[16px] font-medium text-[#202124]">Full Name</label>
                <Input className="h-[54px] rounded-[10px] border-[#cfd4dc]" defaultValue={names.firstName} name="firstName" />
              </div>
              <div>
                <label className="mb-3 block text-[16px] font-medium text-[#202124]">Email Address</label>
                <Input className="h-[54px] rounded-[10px] border-[#cfd4dc]" defaultValue={profile?.email || "raja1234@example.com"} name="email" />
              </div>
              <div>
                <label className="mb-3 block text-[16px] font-medium text-[#202124]">Phone</label>
                <Input className="h-[54px] rounded-[10px] border-[#cfd4dc]" defaultValue={profile?.phone || "(307) 555-0133"} name="phone" />
              </div>
            </div>
            <div>
              <label className="mb-3 block text-[16px] font-medium text-[#202124]">Bio</label>
              <textarea
                className="min-h-[145px] w-full rounded-[10px] border border-[#cfd4dc] px-4 py-4 text-[16px] text-[#555] outline-none focus:border-[#3d8ef5]"
                defaultValue={
                  profile?.bio ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                }
                name="bio"
              />
            </div>
            <Button className="h-[52px] rounded-[10px] bg-[#6d98c0] px-8 text-[18px] hover:bg-[#5f88ae]" disabled={updateMutation.isPending} type="submit">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </AdminSectionCard>
      ) : (
        <AdminSectionCard className="mt-8">
          <h2 className="text-[24px] font-semibold text-[#202124]">Change password</h2>
          <form className="mt-6" onSubmit={handlePasswordSubmit}>
            <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
              <div>
                <label className="mb-3 block text-[16px] font-medium text-[#202124]">Current Password</label>
                <div className="relative">
                  <Input
                    className="h-[52px] rounded-[10px] border-[#3d8ef5] pr-12"
                    name="currentPassword"
                    type={showPasswords.currentPassword ? "text" : "password"}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        currentPassword: !prev.currentPassword,
                      }))
                    }
                    type="button"
                  >
                    {showPasswords.currentPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-3 block text-[16px] font-medium text-[#202124]">New Password</label>
                <div className="relative">
                  <Input
                    className="h-[52px] rounded-[10px] border-[#3d8ef5] pr-12"
                    name="newPassword"
                    type={showPasswords.newPassword ? "text" : "password"}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        newPassword: !prev.newPassword,
                      }))
                    }
                    type="button"
                  >
                    {showPasswords.newPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-3 block text-[16px] font-medium text-[#202124]">Confirm New Password</label>
                <div className="relative">
                  <Input
                    className="h-[52px] rounded-[10px] border-[#3d8ef5] pr-12"
                    name="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword,
                      }))
                    }
                    type="button"
                  >
                    {showPasswords.confirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              <Button className="h-[52px] rounded-[10px] bg-[#6d98c0] px-8 text-[16px] hover:bg-[#5f88ae]" disabled={passwordMutation.isPending} type="submit">
                {passwordMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </AdminSectionCard>
      )}

      {openCommissionModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setOpenCommissionModal(false)}>
          <div className="w-full max-w-[520px] rounded-[16px] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-semibold text-[#202124]">Admin Commission</h2>
                <p className="mt-1 text-[14px] text-[#667085]">Current commission: {currentCommissionRate}%</p>
              </div>
              <button className="text-[#667085]" onClick={() => setOpenCommissionModal(false)} type="button">
                <X className="size-5" />
              </button>
            </div>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const parsedRate = Number(commissionRate);
                if (!Number.isFinite(parsedRate) || parsedRate < 0 || parsedRate > 100) {
                  toast.error("Enter a commission between 0 and 100.");
                  return;
                }
                commissionMutation.mutate({ adminCommissionRate: parsedRate });
              }}
            >
              <div>
                <label className="mb-3 block text-[16px] font-medium text-[#202124]">Commission Percentage</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#667085]" />
                  <Input
                    className="h-[54px] rounded-[10px] border-[#cfd4dc] pl-12 pr-12"
                    max="100"
                    min="0"
                    onChange={(event) => setCommissionRate(event.target.value)}
                    step="0.01"
                    type="number"
                    value={commissionRate}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-[#667085]">%</span>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button className="h-[44px] rounded-[10px]" onClick={() => setOpenCommissionModal(false)} type="button" variant="secondary">
                  Cancel
                </Button>
                <Button className="h-[44px] rounded-[10px] bg-[#6d98c0] px-6 hover:bg-[#5f88ae]" disabled={commissionMutation.isPending} type="submit">
                  {commissionMutation.isPending ? "Saving..." : "Update Commission"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {openDeliveryModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setOpenDeliveryModal(false)}>
          <div className="w-full max-w-[520px] rounded-[16px] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-semibold text-[#202124]">Shipping Delivery</h2>
                <p className="mt-1 text-[14px] text-[#667085]">Current delivery fee: {formatCurrency(currentDeliveryFee)}</p>
              </div>
              <button className="text-[#667085]" onClick={() => setOpenDeliveryModal(false)} type="button">
                <X className="size-5" />
              </button>
            </div>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const parsedFee = Number(deliveryFee);
                if (!Number.isFinite(parsedFee) || parsedFee < 0) {
                  toast.error("Enter a valid delivery fee.");
                  return;
                }
                deliveryFeeMutation.mutate({ deliveryFee: parsedFee });
              }}
            >
              <div>
                <label className="mb-3 block text-[16px] font-medium text-[#202124]">Delivery Fee</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#667085]" />
                  <Input
                    className="h-[54px] rounded-[10px] border-[#cfd4dc] pl-12"
                    min="0"
                    onChange={(event) => setDeliveryFee(event.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    value={deliveryFee}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button className="h-[44px] rounded-[10px]" onClick={() => setOpenDeliveryModal(false)} type="button" variant="secondary">
                  Cancel
                </Button>
                <Button className="h-[44px] rounded-[10px] bg-[#6d98c0] px-6 hover:bg-[#5f88ae]" disabled={deliveryFeeMutation.isPending} type="submit">
                  {deliveryFeeMutation.isPending ? "Saving..." : "Update Fee"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminPageFrame>
  );
}
