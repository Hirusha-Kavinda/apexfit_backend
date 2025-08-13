const MeetingModel = require('../models/meetingModel');

class MeetingController {
  static async createMeeting(req, res) {
    try {
      const { title, description, date, startTime, endTime } = req.body;
      const userId = req.user.id; // From authMiddleware

      // Validate required fields
      if (!title || !date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Title, date, start time, and end time are required' });
      }

      // Validate date is not in the past
      const now = new Date();
      const meetingDateTime = new Date(`${date}T${startTime}:00+05:30`); // Adjust for IST
      if (meetingDateTime < now) {
        return res.status(400).json({ message: 'Cannot schedule meetings in the past' });
      }

      // Check for overlapping meetings
      const overlappingMeetings = await MeetingModel.checkOverlappingMeetings(date, startTime, endTime);
      if (overlappingMeetings.length > 0) {
        return res.status(400).json({ message: 'Time slot is already taken by another meeting' });
      }

      const meeting = await MeetingModel.createMeeting(userId, title, description || '', date, startTime, endTime);
      res.status(201).json({
        message: 'Meeting scheduled successfully',
        meeting: {
          id: meeting.id,
          userId: meeting.userId,
          title: meeting.title,
          description: meeting.description,
          date: meeting.date.toISOString().split('T')[0],
          startTime: meeting.startTime,
          endTime: meeting.endTime,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
    }
  }

  static async getUserMeetings(req, res) {
    try {
      const userId = req.user.id;
      const meetings = await MeetingModel.findMeetingsByUserId(userId);
      res.json({
        meetings: meetings.map(meeting => ({
          id: meeting.id,
          userId: meeting.userId,
          title: meeting.title,
          description: meeting.description,
          date: meeting.date.toISOString().split('T')[0],
          status: meeting.status,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching meetings', error: error.message });
    }
  }

static async getAllMeetings(req, res) {
  try {
    const meetings = await MeetingModel.findAllMeetings();
    res.json({
      meetings: meetings.map(meeting => ({
        id: meeting.id,
        userId: meeting.userId,
        title: meeting.title,
        description: meeting.description,
        date: meeting.date.toISOString().split('T')[0],
        status: meeting.status,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        user: {
          id: meeting.user.id,
          firstName: meeting.user.firstName,
          lastName: meeting.user.lastName,
          email: meeting.user.email, // optional
        }
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all meetings', error: error.message });
  }
}

  static async updateMeeting(req, res) {
    try {
      const { id } = req.params;
      const { title, description, date, startTime, endTime } = req.body;
      const userId = req.user.id;

      const meeting = await MeetingModel.findMeetingById(parseInt(id));
      if (!meeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }
      if (meeting.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to update this meeting' });
      }

      // Validate date is not in the past
      const now = new Date();
      const meetingDateTime = new Date(`${date}T${startTime}:00+05:30`);
      if (meetingDateTime < now) {
        return res.status(400).json({ message: 'Cannot schedule meetings in the past' });
      }

      // Check for overlapping meetings (excluding the current meeting)
      const overlappingMeetings = await MeetingModel.checkOverlappingMeetings(date, startTime, endTime, parseInt(id));
      if (overlappingMeetings.length > 0) {
        return res.status(400).json({ message: 'Time slot is already taken by another meeting' });
      }

      const updatedMeeting = await MeetingModel.updateMeeting(parseInt(id), {
        title: title || meeting.title,
        description: description || meeting.description,
        date: date ? new Date(date) : meeting.date,
        startTime: startTime || meeting.startTime,
        endTime: endTime || meeting.endTime,
      });

      res.json({
        message: 'Meeting updated successfully',
        meeting: {
          id: updatedMeeting.id,
          userId: updatedMeeting.userId,
          title: updatedMeeting.title,
          description: updatedMeeting.description,
          date: updatedMeeting.date.toISOString().split('T')[0],
          status: meeting.status,
          startTime: updatedMeeting.startTime,
          endTime: updatedMeeting.endTime,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating meeting', error: error.message });
    }
  }

  static async deleteMeeting(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const meeting = await MeetingModel.findMeetingById(parseInt(id));
      if (!meeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }
      if (meeting.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to delete this meeting' });
      }

      await MeetingModel.deleteMeeting(parseInt(id));
      res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting meeting', error: error.message });
    }
  }


static async updateMeetingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'complete', 'cancel'];
      if (!status || !validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be one of: pending, complete, cancel' 
        });
      }

      // Check if meeting exists
      const existingMeeting = await MeetingModel.findMeetingById(parseInt(id));
      if (!existingMeeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Update the meeting status
      const updatedMeeting = await MeetingModel.updateMeeting(parseInt(id), {
        status: status.toLowerCase()
      });

      res.json({
        message: 'Meeting status updated successfully',
        meeting: updatedMeeting
      });

    } catch (error) {
      console.error('Error updating meeting status:', error);
      res.status(500).json({ 
        message: 'Error updating meeting status', 
        error: error.message 
      });
    }
  }



}

module.exports = MeetingController;