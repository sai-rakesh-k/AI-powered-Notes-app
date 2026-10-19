const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  searchNotes,
  summarizeNote
} = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");

// All note routes are protected
router.use(protect);

router.get("/search", searchNotes);
router.get("/", getNotes);

router.post(
  "/",
  upload.array("images", 5),
  createNote
);

router.put(
  "/:id",
  upload.array("images", 5),
  updateNote
);
router.delete("/:id", deleteNote);
router.patch("/:id/pin", togglePin);

router.post("/:id/summarize", summarizeNote);

module.exports = router;
