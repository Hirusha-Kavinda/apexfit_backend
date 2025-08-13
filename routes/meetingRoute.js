const express = require('express');
const router = express.Router();
const MeetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware(), (req, res) => MeetingController.createMeeting(req, res));
router.get('/', authMiddleware(), (req, res) => MeetingController.getUserMeetings(req, res));
router.get('/all', (req, res) => MeetingController.getAllMeetings(req, res));
router.put('/:id', authMiddleware(), (req, res) => MeetingController.updateMeeting(req, res));
router.delete('/:id', authMiddleware(), (req, res) => MeetingController.deleteMeeting(req, res));
router.patch('/:id/status', authMiddleware(), (req, res) => MeetingController.updateMeetingStatus(req, res));


module.exports = router;