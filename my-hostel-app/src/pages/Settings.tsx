import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const [email, setEmail] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? '');
      const { data: profile } = await supabase
        .from('landlord_profiles')
        .select('hostel_name')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profile?.hostel_name) setHostelName(profile.hostel_name);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not signed in.');
      return;
    }
    const { error } = await supabase
      .from('landlord_profiles')
      .update({ hostel_name: hostelName.trim() || 'My Hostel' })
      .eq('id', user.id);
    if (error) setError(error.message);
    else setSaved(true);
    setSaving(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Settings</h1>

      <div className="card max-w-lg p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label" htmlFor="hostel-name">
              Hostel name
            </label>
            <input
              id="hostel-name"
              className="input"
              value={hostelName}
              onChange={(e) => setHostelName(e.target.value)}
              placeholder="My Hostel"
            />
          </div>
          <div>
            <label className="label" htmlFor="account-email">
              Account email
            </label>
            <input id="account-email" className="input bg-neutral-100" value={email} disabled />
            <p className="mt-1 text-xs text-neutral-500">
              Sign-in email cannot be changed here.
            </p>
          </div>
          {saved && <p className="text-sm text-brand-700">Settings saved.</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
