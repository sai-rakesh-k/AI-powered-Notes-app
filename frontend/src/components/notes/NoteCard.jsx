import { Pin, Pencil, Trash2, FileText } from "lucide-react";
import jsPDF from "jspdf";
import api from "../../utils/api";

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  // Format date to readable string
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const testSummary = async () => {
    alert("Generating summary... This may take a few seconds.");
    try {
      const { data } = await api.post(
        `/notes/${note._id}/summarize`
      );

      console.log(data);

      alert("Summary generated!");
    } catch (err) {
      console.log(err);
      alert("Failed");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(note.title, 10, 20);

    doc.setFontSize(12);

    const contentLines = doc.splitTextToSize(
      note.content,
      180
    );

    doc.text(contentLines, 10, 35);

    if (note.tags?.length) {
      doc.text(
        `Tags: ${note.tags.join(", ")}`,
        10,
        60 + contentLines.length * 5
      );
    }

    doc.save(`${note.title}.pdf`);
  };

  return (
    <div className={`bg-white rounded-xl border p-4 flex flex-col gap-2 group relative transition-shadow hover:shadow-md ${note.isPinned ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"}`}>
      {/* Pin indicator */}
      {note.isPinned && (
        <span className="absolute top-3 right-3 text-blue-500">
          <Pin size={14} fill="currentColor" />
        </span>
      )}

      {/* Title */}
      <h3 className="font-semibold text-gray-800 text-sm pr-6 line-clamp-2">{note.title}</h3>

      {/* Content preview */}
      <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed flex-1">{note.content}</p>

      {/* Images preview */}
      {note.images?.length > 0 && (
      <div className="flex gap-2 overflow-x-auto py-1">
        {note.images.map((img, index) => (
          <img
            key={index}
            src={`http://localhost:8000${img}`}
            alt="Note"
            className="w-16 h-16 object-cover rounded-lg border"
          />
        ))}
      </div>
    )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.tags.map((tag, i) => (
            <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: date + actions */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{formatDate(note.updatedAt)}</span>

        {/* Action buttons (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={exportPDF}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-green-600 transition-colors"
          >
            <FileText size={13} />
          </button>

          <button
            onClick={() => onTogglePin(note._id)}
            title={note.isPinned ? "Unpin" : "Pin"}
            className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? "text-blue-500 hover:bg-blue-50" : "text-gray-400 hover:bg-gray-100 hover:text-blue-500"}`}
          >
            <Pin size={13} />
          </button>

          <button
            onClick={testSummary}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
          >
            Summary
          </button>

          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Pencil size={13} />
          </button>

          <button
            onClick={() => onDelete(note._id)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
