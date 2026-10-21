import { useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button, Input, Label } from "./ui";

const LOCK_KEY = "lifehub:private-lock-hash";

function readHash(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(LOCK_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeHash(value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCK_KEY, value);
  } catch {
    // Private content remains usable for this session if storage is unavailable.
  }
}

async function hashPassword(value: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return value;
}

export function usePrivateLock() {
  const [unlocked, setUnlocked] = useState(false);
  return { unlocked, unlock: setUnlocked };
}

export function PrivateLock({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(() => Boolean(readHash()));
  const [error, setError] = useState("");

  const submit = async () => {
    if (password.length < 4) {
      setError("Use at least 4 characters.");
      return;
    }
    const digest = await hashPassword(password);
    const saved = readHash();
    if (!saved) {
      writeHash(digest);
      setHasPassword(true);
      onUnlock();
      return;
    }
    if (digest !== saved) {
      setError("That password does not match.");
      return;
    }
    onUnlock();
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-cream-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
        {hasPassword ? <LockKeyhole size={26} /> : <ShieldCheck size={26} />}
      </div>
      <h3 className="font-display text-xl font-semibold text-ink-800">{hasPassword ? "Private section locked" : "Create your private lock"}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        {hasPassword ? "Enter your password to unlock this section. It works offline on this device." : "Choose a password for private notes and journal entries. It is stored only on this device."}
      </p>
      <div className="mt-5 text-left">
        <Label>Password</Label>
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void submit()} autoComplete="new-password" />
      </div>
      {error && <p className="mt-2 text-left text-sm text-rose-soft-600">{error}</p>}
      <Button className="mt-5 w-full" onClick={() => void submit()}>
        {hasPassword ? "Unlock private content" : "Set private password"}
      </Button>
    </section>
  );
}
