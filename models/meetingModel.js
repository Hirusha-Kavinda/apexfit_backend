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

  static async findMeetingById(id) {
    return await prisma.meeting.findUnique({
      where: { id },
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
}

module.exports = MeetingModel;