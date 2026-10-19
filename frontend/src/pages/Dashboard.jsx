import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import Navbar from "../components/common/Navbar";
import NoteCard from "../components/notes/NoteCard";
import NoteModal from "../components/notes/NoteModal";
import EmptyState from "../components/common/EmptyState";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all notes on mount
  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await api.get("/notes");
      setNotes(data);
      setFilteredNotes(data);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Handle search — debounce via API or filter locally
  const handleSearch = useCallback(
    async (query) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredNotes(notes);
        return;
      }
      try {
        const { data } = await api.get(`/notes/search?q=${encodeURIComponent(query)}`);
        setFilteredNotes(data);
      } catch {
        toast.error("Search failed");
      }
    },
    [notes]
  );

  // Called after create or edit
  const handleSaved = (savedNote, type) => {
    if (type === "create") {
      const updated = [savedNote, ...notes].sort((a, b) => b.isPinned - a.isPinned);
      setNotes(updated);
      setFilteredNotes(updated);
    } else {
      const updated = notes
        .map((n) => (n._id === savedNote._id ? savedNote : n))
        .sort((a, b) => b.isPinned - a.isPinned);
      setNotes(updated);
      setFilteredNotes(updated);
    }
  };

  // Delete note with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/notes/${id}`);
      const updated = notes.filter((n) => n._id !== id);
      setNotes(updated);
      setFilteredNotes(updated);
      toast.success("Note deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // Toggle pin status
  const handleTogglePin = async (id) => {
    try {
      const { data } = await api.patch(`/notes/${id}/pin`);
      const updated = notes
        .map((n) => (n._id === id ? data : n))
        .sort((a, b) => b.isPinned - a.isPinned);
      setNotes(updated);
      setFilteredNotes(updated);
      toast.success(data.isPinned ? "Note pinned" : "Note unpinned");
    } catch {
      toast.error("Failed to update pin");
    }
  };

  const openCreate = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  // Separate pinned and unpinned notes for display
  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={handleSearch} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">My Notes</h1>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-0.5">
                {filteredNotes.length} result{filteredNotes.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
            )}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-40 animate-pulse">
                <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded mb-1.5" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <EmptyState isSearch={!!searchQuery} />
        ) : (
          <>
            {/* Pinned section */}
            {pinnedNotes.length > 0 && (
              <section className="mb-6">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Pinned</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Other notes */}
            {otherNotes.length > 0 && (
              <section>
                {pinnedNotes.length > 0 && (
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">All Notes</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {otherNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Create/Edit modal */}
      {modalOpen && (
        <NoteModal
          note={editingNote}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
