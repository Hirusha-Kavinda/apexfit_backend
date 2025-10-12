const express = require('express');
const router = express.Router();
const MeetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/authMiddleware');

// Meeting CRUD routes
router.post('/', authMiddleware(), (req, res) => MeetingController.createMeeting(req, res));
router.get('/', authMiddleware(), (req, res) => MeetingController.getUserMeetings(req, res));
router.get('/all', authMiddleware(), (req, res) => MeetingController.getAllMeetings(req, res));
router.put('/:id', authMiddleware(), (req, res) => MeetingController.updateMeeting(req, res));
router.delete('/:id', authMiddleware(), (req, res) => MeetingController.deleteMeeting(req, res));

// Meeting status and actions
router.patch('/:id/status', authMiddleware(), (req, res) => MeetingController.updateMeetingStatus(req, res));
router.get('/:id', authMiddleware(), (req, res) => MeetingController.getMeetingById(req, res));

// Meeting notifications and joining
router.post('/:id/notify-start', authMiddleware(), (req, res) => MeetingController.notifyMeetingStart(req, res));

// Public meeting access (no auth required for joining)
router.get('/public/:id', (req, res) => MeetingController.getPublicMeeting(req, res));

// Meeting room management
router.post('/:id/join', authMiddleware(), (req, res) => MeetingController.joinMeeting(req, res));
router.post('/:id/leave', authMiddleware(), (req, res) => MeetingController.leaveMeeting(req, res));
router.get('/:id/participants', authMiddleware(), (req, res) => MeetingController.getMeetingParticipants(req, res));

// Cross-browser connection status management
router.post('/:id/connection', authMiddleware(), (req, res) => MeetingController.setConnectionStatus(req, res));
router.get('/:id/connection', authMiddleware(), (req, res) => MeetingController.getConnectionStatus(req, res));
router.delete('/:id/connection', authMiddleware(), (req, res) => MeetingController.clearConnectionStatus(req, res));

// WebRTC signaling endpoints
router.post('/:id/webrtc/offer', authMiddleware(), (req, res) => MeetingController.createWebRTCOffer(req, res));
router.post('/:id/webrtc/answer', authMiddleware(), (req, res) => MeetingController.createWebRTCAnswer(req, res));
router.get('/:id/webrtc/offer', authMiddleware(), (req, res) => MeetingController.getWebRTCOffer(req, res));
router.get('/:id/webrtc/answer', authMiddleware(), (req, res) => MeetingController.getWebRTCAnswer(req, res));
router.post('/:id/webrtc/ice', authMiddleware(), (req, res) => MeetingController.addIceCandidate(req, res));
router.get('/:id/webrtc/ice', authMiddleware(), (req, res) => MeetingController.getIceCandidates(req, res));

// Email sending endpoint
router.post('/send-email', authMiddleware(), (req, res) => MeetingController.sendMeetingEmail(req, res));

// ML API proxy endpoint (to handle CORS issues)
router.post('/ml-proxy/recommend', authMiddleware(), (req, res) => MeetingController.mlProxyRecommend(req, res));

module.exports = router;