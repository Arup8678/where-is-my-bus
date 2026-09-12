"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'RUNNING' | 'ESTIMATED' | 'DELAYED' | 'COMPLETED';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useLanguage();
  
  const statusConfig = {
    RUNNING: { label: t('running'), class: "bg-live text-white hover:bg-live/90" },
    ESTIMATED: { label: t('estimated'), class: "bg-estimated text-white hover:bg-estimated/90" },
    DELAYED: { label: t('delayed'), class: "bg-delayed text-white hover:bg-delayed/90" },
    COMPLETED: { label: t('completed'), class: "bg-gray-500 text-white hover:bg-gray-600" },
  };

  const config = statusConfig[status] || statusConfig.ESTIMATED;

  return (
    <Badge className={cn(config.class, className)}>
      {config.label}
    </Badge>
  );
}
