"use client";

import { useMemo, useState } from "react";

import type {
  DashboardResponse,
} from "@/types/dashboard";

import {
  ALL_GROUPS_KEY,
  filterDevicesByGroup,
} from "@/utils/device-groups";

import {
  DashboardSummary,
} from "./DashboardSummary";

import {
  DashboardDevices,
} from "./DashboardDevices";

interface DashboardContentProps {
  dashboard: DashboardResponse;
}

export function DashboardContent({
  dashboard,
}: DashboardContentProps) {
  const [
    selectedGroup,
    setSelectedGroup,
  ] = useState(
    ALL_GROUPS_KEY,
  );

  const selectedDevices =
    useMemo(
      () =>
        filterDevicesByGroup(
          dashboard.devices,
          selectedGroup,
        ),
      [
        dashboard.devices,
        selectedGroup,
      ],
    );

  return (
    <>
      <DashboardSummary
        devices={
          selectedDevices
        }
      />

      <DashboardDevices
        devices={
          dashboard.devices
        }
        selectedGroup={
          selectedGroup
        }
        onGroupChange={
          setSelectedGroup
        }
      />
    </>
  );
}