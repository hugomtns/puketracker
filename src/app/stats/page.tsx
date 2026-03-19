"use client";

import { useState, useEffect } from "react";
import { PUKE_TYPES } from "@/lib/constants";

type Stats = {
  totalDays: number;
  pukeDays: number;
  totalPukes: number;
  pukeRate: number;
  foodCorrelations: {
    name: string;
    daysEaten: number;
    daysWithPuke: number;
    pukeRate: number;
  }[];
  pukeTypeCounts: Record<string, number>;
  last7: { days: number; pukeDays: number };
  last30: { days: number; pukeDays: number };
};

function pukeTypeLabel(type: string) {
  return PUKE_TYPES.find((pt) => pt.value === type)?.label || type;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-8">Loading...</div>;
  if (!stats || stats.totalDays === 0) {
    return <div className="text-center text-gray-500 py-8">Not enough data yet. Keep logging!</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Stats & Patterns</h1>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold">{stats.totalDays}</div>
          <div className="text-sm text-gray-500">Days Logged</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-red-600">{stats.pukeRate}%</div>
          <div className="text-sm text-gray-500">Puke Rate</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-red-600">{stats.pukeDays}</div>
          <div className="text-sm text-gray-500">Puke Days</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold">{stats.totalPukes}</div>
          <div className="text-sm text-gray-500">Total Pukes</div>
        </div>
      </div>

      {/* Trend */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold mb-3">Recent Trend</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Last 7 days</span>
            <span className="font-medium">
              {stats.last7.pukeDays}/{stats.last7.days} days with puke
            </span>
          </div>
          <div className="flex justify-between">
            <span>Last 30 days</span>
            <span className="font-medium">
              {stats.last30.pukeDays}/{stats.last30.days} days with puke
            </span>
          </div>
        </div>
      </div>

      {/* Food Correlations */}
      {stats.foodCorrelations.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Food & Puke Correlation</h2>
          <p className="text-xs text-gray-500 mb-3">
            Shows how often puke occurred on days each food was eaten (min. 2 days)
          </p>
          <div className="space-y-3">
            {stats.foodCorrelations.map((fc, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate mr-2">{fc.name}</span>
                  <span className={`font-medium whitespace-nowrap ${fc.pukeRate > 50 ? "text-red-600" : "text-green-600"}`}>
                    {fc.pukeRate}% ({fc.daysWithPuke}/{fc.daysEaten})
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${fc.pukeRate > 50 ? "bg-red-400" : "bg-green-400"}`}
                    style={{ width: `${fc.pukeRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Puke Types */}
      {Object.keys(stats.pukeTypeCounts).length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Puke Types</h2>
          <div className="space-y-2">
            {Object.entries(stats.pukeTypeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{pukeTypeLabel(type)}</span>
                  <span className="font-medium">{count} times</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
