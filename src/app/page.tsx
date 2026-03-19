"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays, subDays } from "date-fns";
import { PUKE_TYPES } from "@/lib/constants";

type Food = {
  id: string;
  type: string;
  brand: string;
  details: string;
};

type EntryData = {
  id?: string;
  breakfastId: string | null;
  dinnerId: string | null;
  kibbleId: string | null;
  extraIds: string[];
  puked: boolean;
  pukeCount: number;
  pukeTypes: string[];
  notes: string;
};

const emptyEntry: EntryData = {
  breakfastId: null,
  dinnerId: null,
  kibbleId: null,
  extraIds: [],
  puked: false,
  pukeCount: 0,
  pukeTypes: [],
  notes: "",
};

export default function Home() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [foods, setFoods] = useState<Food[]>([]);
  const [entry, setEntry] = useState<EntryData>(emptyEntry);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const wetFoods = foods.filter((f) => f.type === "wet");
  const kibbleFoods = foods.filter((f) => f.type === "kibble");
  const snackFoods = foods.filter((f) => f.type === "snack");

  const loadEntry = useCallback(async (d: string) => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/entries?date=${d}`);
      const data = await res.json();
      if (data) {
        setEntry({
          id: data.id,
          breakfastId: data.breakfastId,
          dinnerId: data.dinnerId,
          kibbleId: data.kibbleId,
          extraIds: data.extras?.map((e: { foodId: string }) => e.foodId) || [],
          puked: data.puked,
          pukeCount: data.pukeCount,
          pukeTypes: data.pukeTypes?.map((p: { type: string }) => p.type) || [],
          notes: data.notes || "",
        });
      } else {
        setEntry(emptyEntry);
      }
    } catch {
      setEntry(emptyEntry);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/foods").then((r) => r.json()).then(setFoods);
  }, []);

  useEffect(() => {
    loadEntry(date);
  }, [date, loadEntry]);

  const save = async () => {
    setSaving(true);
    await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, date }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const foodLabel = (f: Food) =>
    `${f.brand}${f.details ? ` - ${f.details}` : ""}`;

  const toggleExtra = (foodId: string) => {
    setEntry((prev) => ({
      ...prev,
      extraIds: prev.extraIds.includes(foodId)
        ? prev.extraIds.filter((id) => id !== foodId)
        : [...prev.extraIds, foodId],
    }));
  };

  const togglePukeType = (type: string) => {
    setEntry((prev) => ({
      ...prev,
      pukeTypes: prev.pukeTypes.includes(type)
        ? prev.pukeTypes.filter((t) => t !== type)
        : [...prev.pukeTypes, type],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
        <button
          onClick={() => setDate(format(subDays(new Date(date), 1), "yyyy-MM-dd"))}
          className="p-2 hover:bg-gray-100 rounded-lg text-xl"
        >
          &larr;
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="text-center font-semibold text-lg bg-transparent border-none"
        />
        <button
          onClick={() => setDate(format(addDays(new Date(date), 1), "yyyy-MM-dd"))}
          className="p-2 hover:bg-gray-100 rounded-lg text-xl"
        >
          &rarr;
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : (
        <>
          {/* Meals */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg">Meals</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breakfast</label>
              <select
                value={entry.breakfastId || ""}
                onChange={(e) => setEntry({ ...entry, breakfastId: e.target.value || null })}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
              >
                <option value="">-- None --</option>
                {wetFoods.map((f) => (
                  <option key={f.id} value={f.id}>{foodLabel(f)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dinner</label>
              <select
                value={entry.dinnerId || ""}
                onChange={(e) => setEntry({ ...entry, dinnerId: e.target.value || null })}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
              >
                <option value="">-- None --</option>
                {wetFoods.map((f) => (
                  <option key={f.id} value={f.id}>{foodLabel(f)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kibble</label>
              <select
                value={entry.kibbleId || ""}
                onChange={(e) => setEntry({ ...entry, kibbleId: e.target.value || null })}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
              >
                <option value="">-- None --</option>
                {kibbleFoods.map((f) => (
                  <option key={f.id} value={f.id}>{foodLabel(f)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Snacks / Extras</label>
              {snackFoods.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {snackFoods.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => toggleExtra(f.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        entry.extraIds.includes(f.id)
                          ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {foodLabel(f)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No snacks configured. Add some in the Foods page.</p>
              )}
            </div>
          </div>

          {/* Puke Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Puke</h2>
              <button
                onClick={() =>
                  setEntry({
                    ...entry,
                    puked: !entry.puked,
                    pukeCount: !entry.puked ? 1 : 0,
                    pukeTypes: !entry.puked ? entry.pukeTypes : [],
                  })
                }
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  entry.puked
                    ? "bg-red-100 text-red-700 ring-2 ring-red-500"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {entry.puked ? "Yes" : "No puke"}
              </button>
            </div>

            {entry.puked && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How many times?
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={entry.pukeCount}
                    onChange={(e) =>
                      setEntry({ ...entry, pukeCount: parseInt(e.target.value) || 1 })
                    }
                    className="w-24 border border-gray-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type(s)</label>
                  <div className="flex flex-wrap gap-2">
                    {PUKE_TYPES.map((pt) => (
                      <button
                        key={pt.value}
                        onClick={() => togglePukeType(pt.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          entry.pukeTypes.includes(pt.value)
                            ? "bg-red-100 text-red-700 ring-2 ring-red-500"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={entry.notes}
              onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5"
              rows={2}
              placeholder="Any observations..."
            />
          </div>

          {/* Save */}
          <button
            onClick={save}
            disabled={saving}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
              saved
                ? "bg-green-500"
                : saving
                ? "bg-gray-400"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
            }`}
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save Entry"}
          </button>
        </>
      )}
    </div>
  );
}
