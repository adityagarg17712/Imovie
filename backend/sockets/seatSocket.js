const Seat = require('../models/Seat');

const setupSeatSocket = (io) => {
  // Map of socketId -> Array of locked seat ids for auto-cleanup on disconnect
  const socketSeatLocks = new Map();

  io.on('connection', (socket) => {
    console.log(`[Socket.io] New client connected: ${socket.id}`);
    socketSeatLocks.set(socket.id, []);

    // User joins a specific show's real-time room
    socket.on('join_show', ({ showId }) => {
      if (!showId) return;
      const room = `show:${showId}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined room ${room}`);
    });

    // User leaves show room
    socket.on('leave_show', ({ showId }) => {
      if (!showId) return;
      const room = `show:${showId}`;
      socket.leave(room);
      console.log(`[Socket.io] Socket ${socket.id} left room ${room}`);
    });

    // Real-time seat lock request
    socket.on('lock_seat', async ({ showId, seatNumber, userId }, callback) => {
      try {
        if (!showId || !seatNumber) {
          if (callback) callback({ success: false, message: 'Invalid lock params' });
          return;
        }

        const seat = await Seat.findOne({ show: showId, seatNumber });
        if (!seat) {
          if (callback) callback({ success: false, message: 'Seat not found' });
          return;
        }

        // Check if already booked
        if (seat.status === 'BOOKED') {
          if (callback) callback({ success: false, message: 'Seat is already booked' });
          return;
        }

        // Check if locked by another user and not expired
        const lockDuration = parseInt(process.env.SEAT_LOCK_DURATION_MINUTES, 10) || 5;
        const expirationThreshold = new Date(Date.now() - lockDuration * 60 * 1000);

        if (
          seat.status === 'LOCKED' &&
          seat.lockedBy &&
          seat.lockedBy.toString() !== userId &&
          seat.lockedAt > expirationThreshold
        ) {
          if (callback)
            callback({
              success: false,
              message: 'Seat is currently being selected by another user',
            });
          return;
        }

        // Lock the seat
        seat.status = 'LOCKED';
        seat.lockedBy = userId || null;
        seat.lockedAt = new Date();
        await seat.save();

        // Track in socket lock map
        const userLocks = socketSeatLocks.get(socket.id) || [];
        userLocks.push({ showId, seatNumber });
        socketSeatLocks.set(socket.id, userLocks);

        // Broadcast to other users in the show room
        socket.to(`show:${showId}`).emit('seat_locked', {
          showId,
          seatNumber,
          userId,
        });

        if (callback) callback({ success: true, seatNumber, status: 'LOCKED' });
      } catch (err) {
        console.error('[Socket Error] lock_seat:', err.message);
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // Real-time seat unlock request (user deselects seat)
    socket.on('unlock_seat', async ({ showId, seatNumber, userId }, callback) => {
      try {
        if (!showId || !seatNumber) return;

        const seat = await Seat.findOne({ show: showId, seatNumber });
        if (seat && seat.status === 'LOCKED') {
          // If locked by this user, release it
          if (!seat.lockedBy || seat.lockedBy.toString() === userId) {
            seat.status = 'AVAILABLE';
            seat.lockedBy = null;
            seat.lockedAt = null;
            await seat.save();

            // Broadcast unlock to everyone in the show room
            io.to(`show:${showId}`).emit('seat_unlocked', {
              showId,
              seatNumber,
            });
          }
        }

        // Remove from tracking map
        const userLocks = socketSeatLocks.get(socket.id) || [];
        const updated = userLocks.filter(
          (item) => !(item.showId === showId && item.seatNumber === seatNumber)
        );
        socketSeatLocks.set(socket.id, updated);

        if (callback) callback({ success: true, seatNumber, status: 'AVAILABLE' });
      } catch (err) {
        console.error('[Socket Error] unlock_seat:', err.message);
      }
    });

    // Disconnect cleanup: auto-release any seats locked by this disconnected socket
    socket.on('disconnect', async () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
      const locks = socketSeatLocks.get(socket.id) || [];

      for (const item of locks) {
        try {
          const seat = await Seat.findOne({
            show: item.showId,
            seatNumber: item.seatNumber,
            status: 'LOCKED',
          });
          if (seat) {
            seat.status = 'AVAILABLE';
            seat.lockedBy = null;
            seat.lockedAt = null;
            await seat.save();

            io.to(`show:${item.showId}`).emit('seat_unlocked', {
              showId: item.showId,
              seatNumber: item.seatNumber,
            });
          }
        } catch (err) {
          console.error('[Socket Error] Disconnect seat release:', err.message);
        }
      }
      socketSeatLocks.delete(socket.id);
    });
  });
};

module.exports = setupSeatSocket;
