const express = require("express");
const router = express.Router();
const notesController = require('../controllers/notesController');

router.route('/')
    .get(notesController.getAllNotes) // read
    .post(notesController.createNewNote) // create
    .patch(notesController.updateNote) // update
    .delete(notesController.deleteNote) // delete

module.exports = router;