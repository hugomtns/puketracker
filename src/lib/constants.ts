export const FOOD_TYPES = ["wet", "kibble", "snack"] as const;
export type FoodType = (typeof FOOD_TYPES)[number];

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  wet: "Wet Food",
  kibble: "Kibble",
  snack: "Snack",
};

export const PUKE_TYPES = [
  { value: "undigested_food", label: "Undigested Food" },
  { value: "digested_food", label: "Digested Food" },
  { value: "transparent_liquid", label: "Transparent Liquid" },
  { value: "yellow_bile", label: "Yellow Bile" },
  { value: "hairball", label: "Hairball" },
  { value: "other", label: "Other" },
] as const;
