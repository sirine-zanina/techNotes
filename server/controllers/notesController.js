const User = require("../models/User");
const Note = require("../models/Note");

const asyncHandler = require("express-async-handler");

// @desc Get all notes
// @route GET /notes
// @access private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();
  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" });
  }
  // Add username to each note before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
});

// @desc Create a new note
// @route POST /notes
// @access private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  // Create and store the new user
  const note = await Note.create({ user, title, text });

  if (note) {
    // Created
    return res.status(201).json({ message: "New note created" });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { user, title, text, completed } = req.body;
  // Confirm data
  if (
    !user ||
    !title ||
    !text ||
    typeof completed !== "Boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: `Note not found` });
  }

  // Check for duplicate
  const duplicate = await Note.findOne({  title }).lean().exec();

  // Allow updates to the original user.
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note" }); // conflict
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updateNote = await note.save();

  res.json({ message: `${updateNote.title} updated` });
});

// @desc Delete a note
// @route DELETE /note
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: `Note ID Required` });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: `Note not found` });
  }

  const result = await note.deleteOne();

  const reply = `Note ${result.title} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
