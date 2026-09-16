import type { DeliveryOrderStatus } from "../../api/ordersServiceTypes";

export type OrderStatusTone = "danger" | "primary" | "success" | "warning";

type Translate = (key: string) => string;

export type OrderStatusPresentation = {
  icon: "calendar-clock" | "check-circle" | "clock-fast" | "close-circle" | "food" | "moped" | "package-variant-closed";
  label: string;
  progressStep: number | null;
  tone: OrderStatusTone;
};

const ACTIVE_PROGRESS: Partial<Record<string, number>> = {
  pending: 1,
  accepted: 1,
  preparing: 2,
  ready: 2,
  rider_assigned: 3,
  picked_up: 3,
  out_for_delivery: 3,
  arrived: 4,
};

const STATUS_KEYS: Partial<Record<string, string>> = {
  scheduled: "orders_status_scheduled",
  pending: "orders_status_received",
  accepted: "orders_status_confirmed",
  preparing: "orders_status_preparing",
  ready: "orders_status_ready",
  rider_assigned: "orders_status_courier_assigned",
  picked_up: "orders_status_on_the_way",
  out_for_delivery: "orders_status_on_the_way",
  arrived: "orders_status_arrived",
  delayed: "orders_status_delayed",
  delivered: "orders_status_delivered",
  cancelled: "orders_status_cancelled",
  rejected: "orders_status_rejected",
  failed: "orders_status_failed",
};

export function getOrderStatusPresentation(
  status: DeliveryOrderStatus,
  t: Translate,
): OrderStatusPresentation {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  const key = STATUS_KEYS[normalizedStatus];

  if (normalizedStatus === "delivered") {
    return {
      icon: "check-circle",
      label: t(key ?? "orders_status_delivered"),
      progressStep: null,
      tone: "success",
    };
  }

  if (["cancelled", "rejected", "failed"].includes(normalizedStatus)) {
    return {
      icon: "close-circle",
      label: key ? t(key) : formatOrderStatus(status),
      progressStep: null,
      tone: "danger",
    };
  }

  if (normalizedStatus === "scheduled") {
    return {
      icon: "calendar-clock",
      label: t(key ?? "orders_status_scheduled"),
      progressStep: null,
      tone: "warning",
    };
  }

  if (normalizedStatus === "delayed") {
    return {
      icon: "clock-fast",
      label: t(key ?? "orders_status_delayed"),
      progressStep: 2,
      tone: "warning",
    };
  }

  const icon = ["rider_assigned", "picked_up", "out_for_delivery", "arrived"].includes(
    normalizedStatus,
  )
    ? "moped"
    : normalizedStatus === "preparing" || normalizedStatus === "ready"
      ? "food"
      : "package-variant-closed";

  return {
    icon,
    label: key ? t(key) : formatOrderStatus(status),
    progressStep: ACTIVE_PROGRESS[normalizedStatus] ?? 1,
    tone: "primary",
  };
}

function formatOrderStatus(status: string) {
  if (!status) {
    return "";
  }

  return status
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
