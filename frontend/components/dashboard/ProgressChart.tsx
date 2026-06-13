"use client";

import Card from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProgressItem {
  subject: string;
  value: number;
}

export default function ProgressChart({ data }: { data: ProgressItem[] }) {
  return (
    <Card className="h-full">
      <h3 className="font-bold text-lg mb-4">Subject Progress</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="var(--muted)" />
            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted)" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
              }}
            />
            <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
