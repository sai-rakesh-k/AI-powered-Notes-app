const Note = require("../models/Note");
const axios = require("axios");

// @route GET /api/notes
// Get all notes for logged-in user (pinned notes appear first)
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({
      isPinned: -1,
      updatedAt: -1,
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @route POST /api/notes
// Create a new note
const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const images = req.files
      ? req.files.map(
          (file) => `/uploads/${file.filename}`
        )
      : [];

    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

  const normalizedTags = tags
    ? Array.isArray(tags)
      ? tags
      : [tags]
    : [];

    const note = await Note.create({
      userId: req.user._id,
      title,
      content,
      tags: normalizedTags,
      images,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @route PUT /api/notes/:id
// Update an existing note
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found" });

    const { title, content, tags } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        error: "Title cannot be empty",
      });
    }

    if (content !== undefined && !content.trim()) {
      return res.status(400).json({
        error: "Content cannot be empty",
      });
    }

    const normalizedTags = tags
      ? Array.isArray(tags)
        ? tags
        : [tags]
      : [];
  
    const existingImages = req.body.existingImages
      ? Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages]
      : [];

    const images = req.files
      ? req.files.map(
          (file) => `/uploads/${file.filename}`
        )
      : [];

    if (
      existingImages.length + images.length > 10
    ) {
      return res.status(400).json({
        error: "Maximum 10 images allowed",
      });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) {

        // Content changed -> invalidate old summary
        if (note.content !== content) {
            note.summary = null;
        }

        note.content = content;
    }
    if (tags !== undefined) {
      note.tags = normalizedTags;
    }

    note.images = [
      ...existingImages,
      ...images
    ];

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @route DELETE /api/notes/:id
// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!note) return res.status(404).json({ error: "Note not found" });

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @route PATCH /api/notes/:id/pin
// Toggle pinned status of a note
const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found" });

    note.isPinned = !note.isPinned;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @route GET /api/notes/search?q=keyword
// Search notes by title or content
const searchNotes = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Search query is required" });

    const notes = await Note.find({
      userId: req.user._id,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    }).sort({ isPinned: -1, updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const summarizeNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        error: "Note not found",
      });
    }
    // Return cached summary if it already exists
    if (note.summary!==null) {
      return res.json({
        summary: note.summary,
        cached: true,
      });
    }

    const prompt = `
Summarize the following note.

Guidelines:
- Adapt the summary length to the note length.
- Preserve important concepts, definitions, and key facts.
- Remove repetition and unnecessary details.
- If the note is very short, provide a brief summary.
- If the note is medium length, provide a concise summary.
- If the note is long, provide a structured summary with key points.
- Use clear and easy-to-read language.

Note:

${note.content}
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "qwen2.5-coder:7b",
        prompt,
        stream: false,
      }
    );

    note.summary = response.data.response.trim();

    await note.save();

    res.json({
      summary: note.summary,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote, togglePin, searchNotes,  summarizeNote, };
