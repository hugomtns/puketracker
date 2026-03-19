"use client";

import { useState, useEffect } from "react";
import { FOOD_TYPES, FOOD_TYPE_LABELS, type FoodType } from "@/lib/constants";

type Food = {
  id: string;
  type: string;
  brand: string;
  details: string;
};

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "wet" as FoodType, brand: "", details: "" });

  const loadFoods = () => {
    fetch("/api/foods")
      .then((r) => r.json())
      .then((data) => {
        setFoods(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const resetForm = () => {
    setForm({ type: "wet", brand: "", details: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const save = async () => {
    if (!form.brand.trim()) return;

    if (editingId) {
      await fetch(`/api/foods/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    resetForm();
    loadFoods();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this food?")) return;
    await fetch(`/api/foods/${id}`, { method: "DELETE" });
    loadFoods();
  };

  const startEdit = (food: Food) => {
    setForm({ type: food.type as FoodType, brand: food.brand, details: food.details });
    setEditingId(food.id);
    setShowForm(true);
  };

  if (loading) return <div className="text-center text-gray-500 py-8">Loading...</div>;

  const grouped = FOOD_TYPES.map((type) => ({
    type,
    label: FOOD_TYPE_LABELS[type],
    items: foods.filter((f) => f.type === type),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Food List</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Add Food
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="font-semibold">{editingId ? "Edit Food" : "Add Food"}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as FoodType })}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
            >
              {FOOD_TYPES.map((t) => (
                <option key={t} value={t}>{FOOD_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5"
              placeholder="e.g. Royal Canin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flavour / Details</label>
            <input
              type="text"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5"
              placeholder="e.g. Chicken & Rice"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700"
            >
              {editingId ? "Update" : "Add"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Food List */}
      {grouped.map((group) => (
        <div key={group.type}>
          <h2 className="font-semibold text-gray-900 mb-2">{group.label}</h2>
          {group.items.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">No {group.label.toLowerCase()} added yet</p>
          ) : (
            <div className="space-y-2 mb-4">
              {group.items.map((food) => (
                <div
                  key={food.id}
                  className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium">{food.brand}</span>
                    {food.details && (
                      <span className="text-gray-500 ml-1">- {food.details}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(food)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(food.id)}
                      className="text-sm text-red-600 hover:text-red-800 px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
