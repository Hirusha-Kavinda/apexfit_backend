const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MeetingModel {
  static async createMeeting(userId, title, description, date, startTime, endTime) {
    return await prisma.meeting.create({
      data: {
        userId,
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
      },
    });
  }

  static async findMeetingsByUserId(userId) {
    return await prisma.meeting.findMany({
      where: { userId },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  static async findAllMeetings() {
    return await prisma.meeting.findMany({
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });
  }

  static async findMeetingById(id) {
    return await prisma.meeting.findUnique({
      where: { id },
    });
  }

  static async findMeetingByIdWithUser(id) {
    return await prisma.meeting.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });
  }

  static async updateMeeting(id, data) {
    return await prisma.meeting.update({
      where: { id },
      data,
    });
  }

  static async deleteMeeting(id) {
    return await prisma.meeting.delete({
      where: { id },
    });
  }

  static async checkOverlappingMeetings(date, startTime, endTime, excludeMeetingId = null) {
    return await prisma.meeting.findMany({
      where: {
        date: new Date(date),
        AND: [
          {
            OR: [
              {
                AND: [
                  { startTime: { lte: endTime } },
                  { endTime: { gte: startTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { startTime: { lte: endTime } },
                ],
              },
              {
                AND: [
                  { endTime: { gte: startTime } },
                  { endTime: { lte: endTime } },
                ],
              },
            ],
          },
          ...(excludeMeetingId ? [{ id: { not: excludeMeetingId } }] : []),
        ],
      },
    });
  }

  // Add these methods to your existing meetingModel.js

// Method to find all meetings with user details (for admin view)
static async findAllMeetingsWithUsers() {
  try {
    const query = `
      SELECT 
        m.id, m.title, m.description, m.date, m.startTime, m.endTime, 
        m.userId, m.status, m.createdAt, m.updatedAt,
        u.id as user_id, u.firstName, u.lastName, u.email, u.role
      FROM meetings m
      LEFT JOIN users u ON m.userId = u.id
      ORDER BY m.date DESC, m.startTime ASC
    `;
    
    const [rows] = await db.execute(query);
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime,
      userId: row.userId,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user_id ? {
        id: row.user_id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        role: row.role
      } : null
    }));
  } catch (error) {
    console.error('Error finding meetings with users:', error);
    throw error;
  }
}

// Method to find meetings by user ID with user details
static async findMeetingsByUserIdWithUser(userId) {
  try {
    const query = `
      SELECT 
        m.id, m.title, m.description, m.date, m.startTime, m.endTime, 
        m.userId, m.status, m.createdAt, m.updatedAt,
        u.id as user_id, u.firstName, u.lastName, u.email, u.role
      FROM meetings m
      LEFT JOIN users u ON m.userId = u.id
      WHERE m.userId = ?
      ORDER BY m.date DESC, m.startTime ASC
    `;
    
    const [rows] = await db.execute(query, [userId]);
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime,
      userId: row.userId,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user_id ? {
        id: row.user_id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        role: row.role
      } : null
    }));
  } catch (error) {
    console.error('Error finding user meetings with user details:', error);
    throw error;
  }
}

}

module.exports = MeetingModel;