"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { PUKE_TYPES } from "@/lib/constants";

type Entry = {
  id: string;
  date: string;
  breakfast: { brand: string; details: string } | null;
  dinner: { brand: string; details: string } | null;
  kibble: { brand: string; details: string } | null;
  extras: { food: { brand: string; details: string } }[];
  puked: boolean;
  pukeCount: number;
  pukeTypes: { type: string }[];
  notes: string;
};

function foodLabel(f: { brand: string; details: string } | null) {
  if (!f) return "-";
  return `${f.brand}${f.details ? ` - ${f.details}` : ""}`;
}

function pukeTypeLabel(type: string) {
  return PUKE_TYPES.find((pt) => pt.value === type)?.label || type;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-8">Loading...</div>;

  if (entries.length === 0) {
    return <div className="text-center text-gray-500 py-8">No entries yet. Start logging!</div>;
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">History</h1>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
            entry.puked ? "border-red-400" : "border-green-400"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">
              {format(new Date(entry.date), "EEE, MMM d, yyyy")}
            </span>
            {entry.puked ? (
              <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                Puked x{entry.pukeCount}
              </span>
            ) : (
              <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                No puke
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div><span className="font-medium">Breakfast:</span> {foodLabel(entry.breakfast)}</div>
            <div><span className="font-medium">Dinner:</span> {foodLabel(entry.dinner)}</div>
            <div><span className="font-medium">Kibble:</span> {foodLabel(entry.kibble)}</div>
            {entry.extras.length > 0 && (
              <div>
                <span className="font-medium">Extras:</span>{" "}
                {entry.extras.map((e) => foodLabel(e.food)).join(", ")}
              </div>
            )}
            {entry.puked && entry.pukeTypes.length > 0 && (
              <div>
                <span className="font-medium">Type:</span>{" "}
                {entry.pukeTypes.map((p) => pukeTypeLabel(p.type)).join(", ")}
              </div>
            )}
            {entry.notes && (
              <div className="italic text-gray-500">{entry.notes}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
