"use client";

import Card from "@/components/ui/Card";
import { Activity } from "lucide-react";

interface ActivityItem {
  action: string;
  time: string;
  subject: string;
}

export default function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">Recent Activity</h3>
      </div>
      <ul className="space-y-4">
        {activities.map((item, i) => (
          <li key={i} className="flex items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.action}</p>
              <p className="text-sm text-muted truncate">{item.subject}</p>
            </div>
            <span className="text-xs text-muted shrink-0">{item.time}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
