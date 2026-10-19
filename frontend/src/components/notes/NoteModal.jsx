import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

export default function NoteModal({ note, onClose, onSaved }) {
  const isEdit = !!note?._id;

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [generatedSummary, setGeneratedSummary] = useState(
    note?.summary || ""
  );

const [summarizing, setSummarizing] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isEdit) {
      setForm({
        title: note.title,
        content: note.content,
        tags: note.tags || [],
      });

      setExistingImages(note.images || []);
      setGeneratedSummary(note.summary || "");
    }
  }, [note]);

const generateSummary = async () => {
  try {
    setSummarizing(true);

    const { data } = await api.post(
      `/notes/${note._id}/summarize`
    );

    setGeneratedSummary(data.summary);

    toast.success("Summary generated");
  } catch (err) {
    toast.error("Failed to generate summary");
  } finally {
    setSummarizing(false);
  }
};

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Add tag on Enter or comma
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, "");
      if (tag && !form.tags.includes(tag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tag) =>
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  const removeImage = (imageToRemove) => {
    setExistingImages(
      existingImages.filter(
        (img) => img !== imageToRemove
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      return toast.error("Title and content are required");
    }
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("content", form.content);

    form.tags.forEach((tag) => {
      formData.append("tags", tag);
    });

    existingImages.forEach((img) => {
      formData.append("existingImages", img);
    });

    images.forEach((image) => {
      formData.append("images", image);
    });
    setLoading(true);
    try {
      if (isEdit) {
        const { data } = await api.put(
          `/notes/${note._id}`,
          formData
        );

        onSaved(data, "edit");
        toast.success("Note updated");
      } else {
        const { data } = await api.post("/notes", formData);
        onSaved(data, "create");
        toast.success("Note created");
      }
      onClose();
    }catch (err) {
    console.log(err);
    console.log(err.response?.data);

    toast.error(
      err.response?.data?.error || "Something went wrong"
    );
   }finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{isEdit ? "Edit Note" : "New Note"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Note title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Write your note..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages([...e.target.files])}
              className="w-full text-sm"
            />

            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {existingImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative"
                  >
                    <img
                      src={`http://localhost:8000${img}`}
                      alt="Note"
                      className="w-20 h-20 object-cover rounded-lg border"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {generatedSummary && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary
              </label>

              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                {generatedSummary}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag and press Enter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            {isEdit && (
            <button
              type="button"
              onClick={generateSummary}
              disabled={summarizing}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
            >
              {summarizing ? "Generating..." : "Generate Summary"}
            </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Saving..." : isEdit ? "Save changes" : "Create note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
