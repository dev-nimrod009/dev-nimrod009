import { useEffect, useState } from "react";
import { Utensils, Plus, Trash2, Wallet, Pencil } from "lucide-react";
import { listMeals, addMeal, deleteMeal, getWeeklyBudget, setWeeklyBudget } from "../lib/data";
import type { Meal } from "../lib/types";
import { Button, EmptyState, Input, SectionHeader } from "../components/ui";
import { cn, formatDay, todayISO } from "../lib/utils";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const DAYS_TO_SHOW = 7;
const MEAL_LIBRARY = [
  { name: "Overnight oats", type: "Breakfast", recipe: "Mix oats, milk, yogurt, and fruit. Chill overnight." },
  { name: "Chickpea bowl", type: "Lunch", recipe: "Roast chickpeas, add rice and greens, then finish with tahini." },
  { name: "Vegetable pasta", type: "Dinner", recipe: "Cook pasta, sauté vegetables, combine with sauce, and serve warm." },
];
const PANTRY_ITEMS = ["Rice", "Oats", "Olive oil", "Eggs", "Spinach", "Tomatoes"];

export function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [mealType, setMealType] = useState(MEAL_TYPES[0]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [budget, setBudget] = useState(0);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [mealsList, budgetValue] = await Promise.all([listMeals(), getWeeklyBudget()]);
      setMeals(mealsList);
      setBudget(budgetValue);
      setError("");
    } catch {
      setError("Could not read meals from this device.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    try {
      await addMeal({
        meal_date: selectedDate,
        meal_type: mealType,
        name: name.trim(),
        notes: notes.trim(),
        cost: parseCost(cost),
      });
      setCost("");
      setError("");
    } catch {
      setError("Could not add the meal.");
    }
    setName("");
    setNotes("");
    load();
  };

  const saveBudget = async () => {
    const value = Number(budgetDraft) || 0;
    try {
      await setWeeklyBudget(value);
      setBudget(value);
      setEditingBudget(false);
      setError("");
    } catch {
      setError("Could not save the budget.");
    }
  };

  const startEditBudget = () => {
    setBudgetDraft(String(budget));
    setEditingBudget(true);
  };

  const remove = async (id: string) => {
    try {
      await deleteMeal(id);
      setError("");
    } catch {
      setError("Could not remove the meal.");
    }
    load();
  };

  const totalCost = meals.reduce((sum, meal) => sum + (meal.cost ?? 0), 0);
  const remaining = budget - totalCost;

  const days: string[] = [];
  const start = new Date();
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  const dayMeals = meals.filter((m) => m.meal_date === selectedDate);

  return (
    <div className="animate-fade-up">
      <SectionHeader title="Meal Planner" subtitle="Plan the week's meals and stay on budget" />

      {error && <div className="mb-4 rounded-xl bg-rose-soft-100 text-rose-soft-600 text-sm px-4 py-3">{error}</div>}

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-cream-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h3 className="font-display text-lg font-semibold text-ink-800">Meal library</h3><p className="text-sm text-ink-500">Choose a planned meal, then assign it to the selected day.</p></div>
            <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">Weekly plan</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {MEAL_LIBRARY.map((meal) => <button key={meal.name} onClick={() => { setName(meal.name); setMealType(meal.type); setNotes(meal.recipe); }} className="rounded-xl border border-cream-200 bg-cream-50 p-3 text-left transition hover:border-sage-300"><p className="text-sm font-semibold text-ink-800">{meal.name}</p><p className="mt-1 text-xs text-ink-500">{meal.type}</p></button>)}
          </div>
        </div>
        <div className="rounded-2xl border border-cream-200 bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-ink-800">Pantry</h3><p className="mb-3 text-sm text-ink-500">What is already at home.</p>
          <div className="flex flex-wrap gap-2">{PANTRY_ITEMS.map((item) => <span key={item} className="rounded-full bg-cream-100 px-3 py-1.5 text-xs text-ink-700">{item}</span>)}</div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink-500">Shopping list</p><p className="mt-2 text-sm text-ink-600">Add missing ingredients from your recipes here each Sunday.</p>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-cream-200 bg-white p-5">
        <h3 className="font-display text-lg font-semibold text-ink-800">Recipes</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{MEAL_LIBRARY.map((meal) => <article key={meal.name} className="rounded-xl bg-cream-50 p-4"><p className="text-sm font-semibold text-ink-800">{meal.name}</p><p className="mt-2 text-sm leading-relaxed text-ink-600">{meal.recipe}</p></article>)}</div>
      </section>

      <section className="bg-white rounded-2xl border border-cream-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={17} className="text-sage-600" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-500">Weekly Budget</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">Your Budget</p>
            {editingBudget ? (
              <div className="flex items-center gap-1 justify-center mt-1">
                <input
                  type="number"
                  min={0}
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveBudget()}
                  className="w-20 rounded-lg border border-cream-200 px-2 py-1 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
                <Button variant="ghost" size="sm" onClick={saveBudget} aria-label="Save budget">
                  Save
                </Button>
              </div>
            ) : (
              <p className="font-display text-xl sm:text-2xl font-semibold text-ink-800 mt-1 flex items-center justify-center gap-1">
                {budget}
                <button onClick={startEditBudget} aria-label="Edit budget" className="text-ink-500/60 hover:text-sage-600">
                  <Pencil size={14} />
                </button>
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">Plan Cost</p>
            <p className="font-display text-xl sm:text-2xl font-semibold text-ink-800 mt-1">{totalCost}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">Remaining</p>
            <p
              className={`font-display text-xl sm:text-2xl font-semibold mt-1 ${
                remaining >= 0 ? "text-sage-600" : "text-clay-600"
              }`}
            >
              {remaining}
            </p>
          </div>
        </div>
      </section>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {days.map((day) => {
          const isSelected = day === selectedDate;
          const count = meals.filter((m) => m.meal_date === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "shrink-0 flex flex-col items-center rounded-2xl border px-4 py-3 min-w-[72px] transition-all duration-200",
                isSelected
                  ? "bg-sage-600 text-white border-sage-600 shadow-sm"
                  : "bg-white border-cream-200 text-ink-700 hover:border-sage-300"
              )}
            >
              <span className="text-[10px] uppercase tracking-wide opacity-75">
                {new Date(day + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span className="font-display text-lg font-semibold">{new Date(day + "T12:00:00").getDate()}</span>
              <span className="text-[9px] opacity-75">{count > 0 ? `${count} planned` : "—"}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 p-6 mb-6">
        <p className="font-display text-lg font-semibold text-ink-800 mb-4">{formatDay(selectedDate)}</p>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <Input placeholder="What's cooking?" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={add} disabled={!name.trim()}>
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Optional note (recipe link, ideas...)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <input
            type="number"
            min={0}
            placeholder="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-24 rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
          />
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((item) => (
                <div key={item} className="h-14 rounded-xl bg-cream-100 animate-pulse" />
              ))}
            </div>
          ) : dayMeals.length === 0 ? (
            <EmptyState
              icon={<Utensils size={22} />}
              title="No meals planned"
              hint="Add breakfast, lunch, dinner, or snacks above."
            />
          ) : (
            <ul className="space-y-2">
              {MEAL_TYPES.filter((type) => dayMeals.some((m) => m.meal_type === type)).map((type) => (
                <li key={type} className="bg-cream-50/70 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-500 mb-1">{type}</p>
                  {dayMeals
                    .filter((m) => m.meal_type === type)
                    .map((meal) => (
                      <div key={meal.id} className="group flex items-center gap-2 py-1">
                        <span className="flex-1 text-sm text-ink-800">{meal.name}</span>
                        {meal.notes && <span className="text-xs text-ink-500 truncate max-w-[200px]">{meal.notes}</span>}
                        {meal.cost != null && meal.cost > 0 && (
                          <span className="text-xs font-semibold text-sage-600 shrink-0">{meal.cost}</span>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => remove(meal.id)}
                          className="shrink-0"
                          aria-label="Remove meal"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function parseCost(input: string): number {
  const value = Number(input);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}
