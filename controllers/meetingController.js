const MeetingModel = require('../models/meetingModel');
const nodemailer = require('nodemailer');
const axios = require('axios');

class MeetingController {
  
  static async getUserMeetings(req, res) {
    try {
      const userId = req.user.id;
      const meetings = await MeetingModel.findMeetingsByUserId(userId);
      
      // Format meetings to ensure proper structure for frontend
      const formattedMeetings = meetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        date: meeting.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        userId: meeting.userId,
        status: meeting.status,
        user: meeting.user || null // Include user details if available
      }));

      res.json({ meetings: formattedMeetings });
    } catch (error) {
      console.error('Error fetching user meetings:', error);
      res.status(500).json({ message: 'Error fetching meetings', error: error.message });
    }
  }

// In your meetingController.js, replace the getAllMeetings method with this:

static async getAllMeetings(req, res) {
  try {
    const meetings = await MeetingModel.findAllMeetings();
    
    // Format meetings WITH user details (needed for email functionality)
    const formattedMeetings = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      date: meeting.date.toISOString().split('T')[0],
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      userId: meeting.userId,
      status: meeting.status,
      user: meeting.user // ✅ Include user details for email sending
    }));

    res.json({ meetings: formattedMeetings });
  } catch (error) {
    console.error('Error fetching all meetings:', error);
    res.status(500).json({ message: 'Error fetching all meetings', error: error.message });
  }
}

  static async createMeeting(req, res) {
    try {
      const { title, description, date, startTime, endTime } = req.body;
      const userId = req.user.id;

      if (!title || !date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Title, date, start time, and end time are required' });
      }

      // Check for overlapping meetings
      const overlappingMeetings = await MeetingModel.checkOverlappingMeetings(date, startTime, endTime);
      if (overlappingMeetings.length > 0) {
        return res.status(400).json({ 
          message: 'Meeting time conflicts with existing meeting',
          conflictingMeetings: overlappingMeetings.length
        });
      }

      const meeting = await MeetingModel.createMeeting(userId, title, description, date, startTime, endTime);
      
      // Get meeting with user details
      const meetingWithUser = await MeetingModel.findMeetingByIdWithUser(meeting.id);
      
      // Format response to match frontend expectations
      const formattedMeeting = {
        id: meetingWithUser.id,
        title: meetingWithUser.title,
        description: meetingWithUser.description,
        date: meetingWithUser.date.toISOString().split('T')[0],
        startTime: meetingWithUser.startTime,
        endTime: meetingWithUser.endTime,
        userId: meetingWithUser.userId,
        status: meetingWithUser.status,
        user: meetingWithUser.user
      };

      res.status(201).json({ 
        message: 'Meeting created successfully', 
        meeting: formattedMeeting 
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      res.status(500).json({ message: 'Error creating meeting', error: error.message });
    }
  }

  static async updateMeeting(req, res) {
    try {
      const { id } = req.params;
      const { title, description, date, startTime, endTime } = req.body;
      const userId = req.user.id;

      const existingMeeting = await MeetingModel.findMeetingById(parseInt(id));
      if (!existingMeeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Check if user owns the meeting or is admin
      if (existingMeeting.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'You can only update your own meetings' });
      }

      // Check for overlapping meetings if time/date is being updated
      if (date && startTime && endTime) {
        const overlappingMeetings = await MeetingModel.checkOverlappingMeetings(
          date, startTime, endTime, parseInt(id)
        );
        if (overlappingMeetings.length > 0) {
          return res.status(400).json({ 
            message: 'Meeting time conflicts with existing meeting',
            conflictingMeetings: overlappingMeetings.length
          });
        }
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = new Date(date);
      if (startTime !== undefined) updateData.startTime = startTime;
      if (endTime !== undefined) updateData.endTime = endTime;

      const updatedMeeting = await MeetingModel.updateMeeting(parseInt(id), updateData);
      const meetingWithUser = await MeetingModel.findMeetingByIdWithUser(updatedMeeting.id);

      // Format response
      const formattedMeeting = {
        id: meetingWithUser.id,
        title: meetingWithUser.title,
        description: meetingWithUser.description,
        date: meetingWithUser.date.toISOString().split('T')[0],
        startTime: meetingWithUser.startTime,
        endTime: meetingWithUser.endTime,
        userId: meetingWithUser.userId,
        status: meetingWithUser.status,
        user: meetingWithUser.user
      };

      res.json({ 
        message: 'Meeting updated successfully', 
        meeting: formattedMeeting 
      });
    } catch (error) {
      console.error('Error updating meeting:', error);
      res.status(500).json({ message: 'Error updating meeting', error: error.message });
    }
  }

  static async deleteMeeting(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existingMeeting = await MeetingModel.findMeetingById(parseInt(id));
      if (!existingMeeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Check if user owns the meeting or is admin
      if (existingMeeting.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'You can only delete your own meetings' });
      }

      await MeetingModel.deleteMeeting(parseInt(id));
      res.json({ 
        message: 'Meeting deleted successfully',
        deletedMeetingId: parseInt(id)
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      res.status(500).json({ message: 'Error deleting meeting', error: error.message });
    }
  }

  static async updateMeetingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      
      const validStatuses = ['pending', 'cancel', 'complete'];
      if (!status || !validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be one of: pending, cancel, complete' 
        });
      }

      const existingMeeting = await MeetingModel.findMeetingById(parseInt(id));
      if (!existingMeeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Check if user owns the meeting or is admin
      if (existingMeeting.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'You can only update your own meetings' });
      }

      const updatedMeeting = await MeetingModel.updateMeeting(parseInt(id), {
        status: status.toLowerCase()
      });

      const meetingWithUser = await MeetingModel.findMeetingByIdWithUser(updatedMeeting.id);

      // Format response
      const formattedMeeting = {
        id: meetingWithUser.id,
        title: meetingWithUser.title,
        description: meetingWithUser.description,
        date: meetingWithUser.date.toISOString().split('T')[0],
        startTime: meetingWithUser.startTime,
        endTime: meetingWithUser.endTime,
        userId: meetingWithUser.userId,
        status: meetingWithUser.status,
        user: meetingWithUser.user
      };

      res.json({
        message: 'Meeting status updated successfully',
        meeting: formattedMeeting
      });

    } catch (error) {
      console.error('Error updating meeting status:', error);
      res.status(500).json({ 
        message: 'Error updating meeting status', 
        error: error.message 
      });
    }
  }

  static async getMeetingById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const meeting = await MeetingModel.findMeetingByIdWithUser(parseInt(id));
      if (!meeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Check if user owns the meeting or is admin
      if (meeting.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'You can only access your own meetings' });
      }

      // Format response
      const formattedMeeting = {
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        date: meeting.date.toISOString().split('T')[0],
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        userId: meeting.userId,
        status: meeting.status,
        user: meeting.user
      };

      res.json({ meeting: formattedMeeting });

    } catch (error) {
      console.error('Error fetching meeting:', error);
      res.status(500).json({ 
        message: 'Error fetching meeting', 
        error: error.message 
      });
    }
  }

static async notifyMeetingStart(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get meeting with user details
    const meeting = await MeetingModel.findMeetingByIdWithUser(parseInt(id));
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Admin can notify for any meeting, user can only notify for their own
    if (req.user.role !== 'ADMIN' && meeting.userId !== userId) {
      return res.status(403).json({ message: 'You can only notify for your own meetings' });
    }

    if (!meeting.user || !meeting.user.email) {
      return res.status(400).json({ message: 'Meeting user email not found' });
    }

    // ✅ FIX: Create correct meeting link for users
    const meetingLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/meeting/${id}`;
    
    // Send email notification
    await MeetingController.sendMeetingStartEmail(meeting, meetingLink);

    res.json({
      message: 'Meeting start notification sent successfully',
      meetingLink,
      sentTo: meeting.user.email
    });

  } catch (error) {
    console.error('Error sending meeting notification:', error);
    res.status(500).json({ 
      message: 'Error sending meeting notification', 
      error: error.message 
    });
  }
}





  static async sendMeetingEmail(req, res) {
    try {
      const { to, subject, html } = req.body;
      
      if (!to || !subject || !html) {
        return res.status(400).json({ 
          message: 'to, subject, and html are required' 
        });
      }

      // Configure nodemailer transporter
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || '"ApexFit" <noreply@apexfit.com>',
        to: to,
        subject: subject,
        html: html
      };

      await transporter.sendMail(mailOptions);

      res.json({
        message: 'Email sent successfully',
        sentTo: to
      });

    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ 
        message: 'Error sending email', 
        error: error.message 
      });
    }
  }

  static async sendMeetingStartEmail(meeting, meetingLink) {
    try {
      // Configure nodemailer transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Email content
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Meeting System" <noreply@meetingsystem.com>',
        to: meeting.user.email,
        subject: `🎥 Meeting Started: ${meeting.title}`,
        html: `
         <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Started - Join Now!</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎥 Your Meeting is Ready!</h1>
        <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Click below to join now</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-top: 0; font-size: 24px;">Hi ${meeting.user.firstName}! 👋</h2>
        
        <p style="color: #555; font-size: 16px; margin: 20px 0;">
          Your meeting "<strong style="color: #333;">${meeting.title}</strong>" has started and is waiting for you!
        </p>
        
        <!-- Meeting Details -->
        <div style="background-color: #f8f9fa; border-left: 4px solid #10B981; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #333; margin: 0 0 15px; font-size: 18px;">📋 Meeting Details</h3>
          <p><strong>Title:</strong> ${meeting.title}</p>
          <p><strong>Time:</strong> ${meeting.startTime} - ${meeting.endTime}</p>
          <p><strong>Date:</strong> ${new Date(meeting.date).toLocaleDateString()}</p>
        </div>
        
        <!-- Big Join Button -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="${meetingLink}" 
             style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 20px; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);">
            🚀 JOIN MEETING NOW
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            Or copy this link: <br>
            <a href="${meetingLink}" style="color: #10B981; word-break: break-all;">${meetingLink}</a>
          </p>
        </div>
        
        <!-- Simple note -->
        <div style="background-color: #e0f2fe; border: 1px solid #0288d1; border-radius: 8px; padding: 15px; margin: 25px 0;">
          <p style="color: #0277bd; margin: 0; font-size: 14px;">
            💡 <strong>Just click the button above!</strong> No complex login required - just enter your name and join.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }




  static async getPublicMeeting(req, res) {
  try {
    const { id } = req.params;
    
    const meeting = await MeetingModel.findMeetingByIdWithUser(parseInt(id));
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Format response for public access
    const formattedMeeting = {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      date: meeting.date.toISOString().split('T')[0],
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      status: meeting.status,
      user: meeting.user ? {
        firstName: meeting.user.firstName,
        lastName: meeting.user.lastName
      } : null
    };

    res.json({ meeting: formattedMeeting });

  } catch (error) {
    console.error('Error fetching public meeting:', error);
    res.status(500).json({ 
      message: 'Error fetching meeting', 
      error: error.message 
    });
  }
}











static activeMeetings = new Map();

static async joinMeeting(req, res) {
  try {
    const { id } = req.params;
    const { participantName, participantRole } = req.body;
    
    const meetingId = parseInt(id);
    
    // Get or create meeting room
    if (!MeetingController.activeMeetings.has(meetingId)) {
      MeetingController.activeMeetings.set(meetingId, {
        participants: [],
        startTime: new Date(),
        status: 'active'
      });
    }
    
    const meetingRoom = MeetingController.activeMeetings.get(meetingId);
    
    // Add participant if not already present
    const existingParticipant = meetingRoom.participants.find(p => 
      p.name === participantName && p.role === participantRole
    );
    
    if (!existingParticipant) {
      meetingRoom.participants.push({
        name: participantName,
        role: participantRole,
        joinedAt: new Date()
      });
    }
    
    res.json({
      message: 'Joined meeting successfully',
      participants: meetingRoom.participants.length,
      meetingRoom: {
        id: meetingId,
        participants: meetingRoom.participants,
        status: meetingRoom.status
      }
    });

  } catch (error) {
    console.error('Error joining meeting:', error);
    res.status(500).json({ message: 'Error joining meeting', error: error.message });
  }
}

static async leaveMeeting(req, res) {
  try {
    const { id } = req.params;
    const { participantName, participantRole } = req.body;
    
    const meetingId = parseInt(id);
    
    if (MeetingController.activeMeetings.has(meetingId)) {
      const meetingRoom = MeetingController.activeMeetings.get(meetingId);
      
      // Remove participant
      meetingRoom.participants = meetingRoom.participants.filter(p => 
        !(p.name === participantName && p.role === participantRole)
      );
      
      // If no participants left, clean up the meeting
      if (meetingRoom.participants.length === 0) {
        MeetingController.activeMeetings.delete(meetingId);
      }
    }
    
    res.json({ message: 'Left meeting successfully' });

  } catch (error) {
    console.error('Error leaving meeting:', error);
    res.status(500).json({ message: 'Error leaving meeting', error: error.message });
  }
}

static async getMeetingParticipants(req, res) {
  try {
    const { id } = req.params;
    const meetingId = parseInt(id);
    
    const meetingRoom = MeetingController.activeMeetings.get(meetingId);
    
    if (!meetingRoom) {
      return res.json({ participants: 0, meetingRoom: null });
    }
    
    res.json({
      participants: meetingRoom.participants.length,
      meetingRoom: {
        id: meetingId,
        participants: meetingRoom.participants,
        status: meetingRoom.status
      }
    });

  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({ message: 'Error getting participants', error: error.message });
  }
}

// Cross-browser connection status management
static connectionStatus = new Map();

static async setConnectionStatus(req, res) {
  try {
    const { id } = req.params;
    const { userRole, isConnected, userName, timestamp } = req.body;
    const meetingId = parseInt(id);
    
    // Get or create connection status for this meeting
    if (!MeetingController.connectionStatus.has(meetingId)) {
      MeetingController.connectionStatus.set(meetingId, {
        admin: { connected: false, name: 'Admin', lastSeen: 0 },
        user: { connected: false, name: 'User', lastSeen: 0 }
      });
    }
    
    const status = MeetingController.connectionStatus.get(meetingId);
    
    // Update the specific user's connection status
    if (userRole === 'ADMIN') {
      status.admin = {
        connected: isConnected,
        name: userName || 'Admin',
        lastSeen: timestamp || Date.now()
      };
    } else if (userRole === 'USER') {
      status.user = {
        connected: isConnected,
        name: userName || 'User',
        lastSeen: timestamp || Date.now()
      };
    }
    
    // Clean up stale connections (older than 15 seconds)
    const now = Date.now();
    const staleThreshold = 15000; // 15 seconds
    
    if (now - status.admin.lastSeen > staleThreshold) {
      status.admin.connected = false;
    }
    if (now - status.user.lastSeen > staleThreshold) {
      status.user.connected = false;
    }
    
    console.log(`Connection status updated for ${userRole} in meeting ${meetingId}:`, status);
    
    res.json({
      message: 'Connection status updated successfully',
      status: status
    });

  } catch (error) {
    console.error('Error setting connection status:', error);
    res.status(500).json({ message: 'Error setting connection status', error: error.message });
  }
}

static async getConnectionStatus(req, res) {
  try {
    const { id } = req.params;
    const meetingId = parseInt(id);
    
    const status = MeetingController.connectionStatus.get(meetingId);
    
    if (!status) {
      return res.json({
        admin: { connected: false, name: 'Admin', lastSeen: 0 },
        user: { connected: false, name: 'User', lastSeen: 0 }
      });
    }
    
    // Clean up stale connections
    const now = Date.now();
    const staleThreshold = 15000; // 15 seconds
    
    if (now - status.admin.lastSeen > staleThreshold) {
      status.admin.connected = false;
    }
    if (now - status.user.lastSeen > staleThreshold) {
      status.user.connected = false;
    }
    
    res.json(status);

  } catch (error) {
    console.error('Error getting connection status:', error);
    res.status(500).json({ message: 'Error getting connection status', error: error.message });
  }
}

static async clearConnectionStatus(req, res) {
  try {
    const { id } = req.params;
    const { userRole } = req.body;
    const meetingId = parseInt(id);
    
    const status = MeetingController.connectionStatus.get(meetingId);
    
    if (status) {
      if (userRole === 'ADMIN') {
        status.admin.connected = false;
        status.admin.lastSeen = Date.now();
      } else if (userRole === 'USER') {
        status.user.connected = false;
        status.user.lastSeen = Date.now();
      }
      
      console.log(`Connection cleared for ${userRole} in meeting ${meetingId}`);
    }
    
    res.json({ message: 'Connection status cleared successfully' });

  } catch (error) {
    console.error('Error clearing connection status:', error);
    res.status(500).json({ message: 'Error clearing connection status', error: error.message });
  }
}

// WebRTC signaling for video calls
static webrtcSignaling = new Map();

static async createWebRTCOffer(req, res) {
  try {
    const { id } = req.params;
    const { offer, userRole } = req.body;
    const meetingId = parseInt(id);
    
    // Store the offer for the meeting
    if (!MeetingController.webrtcSignaling.has(meetingId)) {
      MeetingController.webrtcSignaling.set(meetingId, {
        offer: null,
        answer: null,
        adminConnected: false,
        userConnected: false
      });
    }
    
    const signaling = MeetingController.webrtcSignaling.get(meetingId);
    signaling.offer = offer;
    
    if (userRole === 'ADMIN') {
      signaling.adminConnected = true;
    } else if (userRole === 'USER') {
      signaling.userConnected = true;
    }
    
    console.log(`WebRTC offer created for meeting ${meetingId} by ${userRole}`);
    
    res.json({
      message: 'WebRTC offer created successfully',
      meetingId: meetingId
    });

  } catch (error) {
    console.error('Error creating WebRTC offer:', error);
    res.status(500).json({ message: 'Error creating WebRTC offer', error: error.message });
  }
}

static async createWebRTCAnswer(req, res) {
  try {
    const { id } = req.params;
    const { answer, userRole } = req.body;
    const meetingId = parseInt(id);
    
    const signaling = MeetingController.webrtcSignaling.get(meetingId);
    
    if (!signaling) {
      return res.status(404).json({ message: 'No WebRTC offer found for this meeting' });
    }
    
    signaling.answer = answer;
    
    if (userRole === 'ADMIN') {
      signaling.adminConnected = true;
    } else if (userRole === 'USER') {
      signaling.userConnected = true;
    }
    
    console.log(`WebRTC answer created for meeting ${meetingId} by ${userRole}`);
    
    res.json({
      message: 'WebRTC answer created successfully',
      meetingId: meetingId
    });

  } catch (error) {
    console.error('Error creating WebRTC answer:', error);
    res.status(500).json({ message: 'Error creating WebRTC answer', error: error.message });
  }
}

static async getWebRTCOffer(req, res) {
  try {
    const { id } = req.params;
    const meetingId = parseInt(id);
    
    const signaling = MeetingController.webrtcSignaling.get(meetingId);
    
    if (!signaling || !signaling.offer) {
      return res.json({ offer: null, message: 'No offer available' });
    }
    
    res.json({
      offer: signaling.offer,
      adminConnected: signaling.adminConnected,
      userConnected: signaling.userConnected
    });

  } catch (error) {
    console.error('Error getting WebRTC offer:', error);
    res.status(500).json({ message: 'Error getting WebRTC offer', error: error.message });
  }
}

static async getWebRTCAnswer(req, res) {
  try {
    const { id } = req.params;
    const meetingId = parseInt(id);
    
    const signaling = MeetingController.webrtcSignaling.get(meetingId);
    
    if (!signaling || !signaling.answer) {
      return res.json({ answer: null, message: 'No answer available' });
    }
    
    res.json({
      answer: signaling.answer,
      adminConnected: signaling.adminConnected,
      userConnected: signaling.userConnected
    });

  } catch (error) {
    console.error('Error getting WebRTC answer:', error);
    res.status(500).json({ message: 'Error getting WebRTC answer', error: error.message });
  }
}

static async addIceCandidate(req, res) {
  try {
    const { id } = req.params;
    const { candidate, userRole } = req.body;
    const meetingId = parseInt(id);
    
    // Store ICE candidate for the meeting
    if (!MeetingController.webrtcSignaling.has(meetingId)) {
      MeetingController.webrtcSignaling.set(meetingId, {
        offer: null,
        answer: null,
        iceCandidates: [],
        adminConnected: false,
        userConnected: false
      });
    }
    
    const signaling = MeetingController.webrtcSignaling.get(meetingId);
    
    if (!signaling.iceCandidates) {
      signaling.iceCandidates = [];
    }
    
    signaling.iceCandidates.push({
      candidate: candidate,
      userRole: userRole,
      timestamp: Date.now()
    });
    
    console.log(`ICE candidate added for meeting ${meetingId} by ${userRole}`);
    
    res.json({ message: 'ICE candidate added successfully' });

  } catch (error) {
    console.error('Error adding ICE candidate:', error);
    res.status(500).json({ message: 'Error adding ICE candidate', error: error.message });
  }
}

static async getIceCandidates(req, res) {
  try {
    const { id } = req.params;
    const meetingId = parseInt(id);
    
    const signaling = MeetingController.webrtcSignaling.get(meetingId);
    
    if (!signaling || !signaling.iceCandidates) {
      return res.json({ candidates: [] });
    }
    
    res.json({ candidates: signaling.iceCandidates });

  } catch (error) {
    console.error('Error getting ICE candidates:', error);
    res.status(500).json({ message: 'Error getting ICE candidates', error: error.message });
  }
}

// ML API Proxy endpoint to handle CORS issues
static async mlProxyRecommend(req, res) {
  try {
    console.log('ML Proxy: Received request:', req.body);
    
    // Forward the request to the ML server
    const mlResponse = await axios.post('http://127.0.0.1:8000/recommend', req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    
    console.log('ML Proxy: ML server response status:', mlResponse.status);
    console.log('ML Proxy: ML server response data:', mlResponse.data);
    
    // Forward the response back to the frontend
    res.status(mlResponse.status).json(mlResponse.data);
    
  } catch (error) {
    console.error('ML Proxy Error:', error);
    
    if (error.response) {
      // ML server responded with error
      console.error('ML server error:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        message: 'ML server error',
        error: error.response.data
      });
    } else if (error.code === 'ECONNREFUSED') {
      // ML server not running
      res.status(503).json({
        message: 'ML server not available',
        error: 'Connection refused to http://127.0.0.1:8000'
      });
    } else {
      // Other errors
      res.status(500).json({
        message: 'ML proxy error',
        error: error.message
      });
    }
  }
}

}



module.exports = MeetingController;