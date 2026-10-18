import { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock, Send } from 'lucide-react';
import { useSession } from '../lib/SessionContext';
import { sendChatMessage, fetchChatMessages } from '../lib/data';
import { Card } from './ui';
import type { ChatMessage, User } from '../lib/types';

export function ChatPage() {
  const { currentUser, users } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [partner, setPartner] = useState<User | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const msgs = await fetchChatMessages();
      setMessages(msgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const threads = useMemo(() => {
    if (!currentUser) return [];
    const partnerIds = new Set<string>();
    for (const m of messages) {
      if (m.sender_id === currentUser.id) partnerIds.add(m.recipient_id);
      if (m.recipient_id === currentUser.id) partnerIds.add(m.sender_id);
    }
    return users.filter((u) => partnerIds.has(u.id));
  }, [messages, currentUser, users]);

  const conversation = useMemo(() => {
    if (!currentUser || !partner) return [];
    return messages.filter(
      (m) =>
        (m.sender_id === currentUser.id && m.recipient_id === partner.id) ||
        (m.sender_id === partner.id && m.recipient_id === currentUser.id)
    );
  }, [messages, currentUser, partner]);

  const send = async () => {
    if (!currentUser || !partner || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendChatMessage({
        sender_id: currentUser.id,
        recipient_id: partner.id,
        body: draft.trim(),
      });
      setDraft('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Secure Messages</h1>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <Lock className="h-3.5 w-3.5" /> Private conversations between you and your care contacts.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">{error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit p-3">
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Care contacts</p>
          {loading ? (
            <p className="px-1 py-4 text-sm text-slate-400">Loading...</p>
          ) : threads.length === 0 ? (
            <p className="px-1 py-4 text-sm text-mate-400">No conversations yet.</p>
          ) : (
            <div className="space-y-1">
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPartner(t)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    partner?.id === t.id ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </Card>

        {partner ? (
          <Card className="flex h-[28rem] flex-col p-0">
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{partner.name}</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-4">
              {conversation.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">No messages yet.</p>
              )}
              {conversation.map((m) => {
                const mine = m.sender_id === currentUser.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        mine ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              />
              <button
                onClick={() => void send()}
                disabled={sending || !draft.trim()}
                className="rounded-lg bg-teal-600 p-2 text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
            Select a contact to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
