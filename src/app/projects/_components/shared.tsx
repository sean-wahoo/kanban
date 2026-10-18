"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@base-ui/react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import styles from "../styles.module.scss";

export type SortDir = "asc" | "desc";

export const SortIcon = ({
  active,
  dir,
}: {
  active: boolean;
  dir: SortDir;
}) => {
  if (!active) {
    return <ArrowUpDownIcon size={14} className={styles.sort_icon} />;
  }
  return dir === "asc" ? (
    <ArrowUpIcon size={14} className={styles.sort_icon} />
  ) : (
    <ArrowDownIcon size={14} className={styles.sort_icon} />
  );
};

interface TooltipTdProps {
  className?: string;
  label: string;
  children: ReactNode;
}

export const TooltipTd = ({ className, label, children }: TooltipTdProps) => (
  <Tooltip.Root>
    <Tooltip.Trigger render={<td className={className} />}>
      {children}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner className={styles.tooltip_positioner} side="top">
        <Tooltip.Popup className={styles.tooltip_popup}>{label}</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
);
