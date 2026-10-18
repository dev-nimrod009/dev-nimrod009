import { useState } from "react";
import { Feather, Fingerprint } from "lucide-react";
import { useAuth } from "../lib/auth";
import { Button, Input, Label } from "../components/ui";

export function SignInScreen() {
  const { signIn, signUp, signInWithPasskey } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and a password.");
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const result = mode === "signin"
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setBusy(false);
    if (result.error) setError(result.error);
  };

  const passkey = async () => {
    setError("");
    const result = await signInWithPasskey();
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-cream-200 p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sage-600 flex items-center justify-center mb-4">
            <Feather size={26} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-800">Life Hub</h1>
          <p className="text-sm text-ink-500 mt-1 text-center">
            Your private journal, planner, and wellbeing space
          </p>
        </div>

        <div className="flex rounded-xl bg-cream-100 p-1 mb-6">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                mode === m ? "bg-white text-ink-800 shadow-sm" : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="space-y-4"
        >
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          {mode === "signup" && (
            <div>
              <Label>Confirm password</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
              />
            </div>
          )}

          {error && <div className="rounded-xl bg-rose-soft-100 text-rose-soft-600 text-sm px-4 py-3">{error}</div>}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px bg-cream-200" />
          <span className="text-[10px] uppercase tracking-widest text-ink-500/70">or</span>
          <span className="flex-1 h-px bg-cream-200" />
        </div>

        <Button variant="secondary" className="w-full" onClick={() => void passkey()}>
          <Fingerprint size={16} /> Unlock with biometrics
        </Button>

        <p className="text-[11px] text-ink-500/70 text-center mt-6 leading-relaxed">
          Biometric unlock uses a device passkey. Set one up after signing in from your profile page.
        </p>
      </div>
    </div>
  );
}
