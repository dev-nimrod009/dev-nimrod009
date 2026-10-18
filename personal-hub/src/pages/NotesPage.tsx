import { useEffect, useState } from "react";
import { Notebook, Plus, Trash2, Pin, PinOff, Pencil } from "lucide-react";
import { listNotes, upsertNote, setNotePinned, deleteNote } from "../lib/data";
import type { Note } from "../lib/types";
import { Button, EmptyState, Input, Label, Modal, SectionHeader, Textarea } from "../components/ui";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setNotes(await listNotes());
      setError("");
    } catch {
      setError("Could not read notes from this device.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm({ title: "", content: "" });
    setOpen(true);
  };

  const startEdit = (note: Note) => {
    setEditing(note);
    setForm({ title: note.title, content: note.content });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() && !form.content.trim()) return;
    setSaving(true);
    try {
      await upsertNote(editing ? { id: editing.id, ...form } : form);
      setError("");
    } catch {
      setError("Could not save the note.");
    } finally {
      setSaving(false);
      setOpen(false);
      load();
    }
  };

  const togglePin = async (note: Note) => {
    try {
      await setNotePinned(note.id, !note.pinned);
    } catch {
      setError("Could not pin the note.");
    }
    load();
  };

  const remove = async (id: string) => {
    try {
      await deleteNote(id);
    } catch {
      setError("Could not delete the note.");
    }
    load();
  };

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Notepad"
        subtitle="Quick notes, lists, and things to remember"
        action={
          <Button onClick={startNew}>
            <Plus size={16} /> New note
          </Button>
        }
      />

      {error && <div className="mb-4 rounded-xl bg-rose-soft-100 text-rose-soft-600 text-sm px-4 py-3">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-cream-100 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<Notebook size={26} />}
          title="No notes yet"
          hint="Jot down anything — a gift idea, a packing list, a passing thought."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((note) => (
            <div
              key={note.id}
              className={`group relative bg-white rounded-2xl border p-5 hover:shadow-md transition-all duration-200 ${
                note.pinned ? "border-honey-300 bg-honey-100/40" : "border-cream-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display text-lg font-semibold text-ink-800 truncate">
                  {note.title || "Untitled"}
                </h4>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => togglePin(note)} aria-label="Pin">
                    {note.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(note)} aria-label="Edit">
                    <Pencil size={13} />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(note.id)} aria-label="Delete">
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-ink-600 leading-relaxed mt-2 whitespace-pre-wrap line-clamp-5">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit note" : "New note"}>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Note title..."
            />
          </div>
          <div>
            <Label>Note</Label>
            <Textarea
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write it down..."
            />
          </div>
          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? "Saving..." : editing ? "Save changes" : "Save note"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
