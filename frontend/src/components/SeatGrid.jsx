import React, { useEffect, useState, useRef } from 'react';
import { getSocket, joinShowRoom, leaveShowRoom } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

const SeatGrid = ({ showId, initialSeats = [], pricing = {} }) => {
  const { user } = useAuth();
  const { selectedSeats, toggleSeat, setSelectedSeats } = useBooking();
  const [seats, setSeats] = useState(initialSeats);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const timerRef = useRef(null);

  // Sync initial seats
  useEffect(() => {
    setSeats(initialSeats);
  }, [initialSeats]);

  // Socket.io integration
  useEffect(() => {
    if (!showId) return;

    const socket = getSocket();
    joinShowRoom(showId);

    // Seat locked by someone
    const handleSeatLocked = (data) => {
      if (data.showId === showId) {
        setSeats((prev) =>
          prev.map((s) => {
            if (s.seatNumber === data.seatNumber) {
              return {
                ...s,
                status: 'LOCKED',
                lockedBy: data.userId,
              };
            }
            return s;
          })
        );
      }
    };

    // Seat unlocked
    const handleSeatUnlocked = (data) => {
      if (data.showId === showId) {
        setSeats((prev) =>
          prev.map((s) => {
            if (s.seatNumber === data.seatNumber) {
              return {
                ...s,
                status: 'AVAILABLE',
                lockedBy: null,
              };
            }
            return s;
          })
        );
      }
    };

    // Seat booked
    const handleSeatBooked = (data) => {
      if (data.showId === showId) {
        setSeats((prev) =>
          prev.map((s) => {
            if (data.seatNumbers?.includes(s.seatNumber)) {
              return {
                ...s,
                status: 'BOOKED',
              };
            }
            return s;
          })
        );
      }
    };

    socket.on('seat_locked', handleSeatLocked);
    socket.on('seat_unlocked', handleSeatUnlocked);
    socket.on('seat_booked', handleSeatBooked);

    return () => {
      socket.off('seat_locked', handleSeatLocked);
      socket.off('seat_unlocked', handleSeatUnlocked);
      socket.off('seat_booked', handleSeatBooked);
      leaveShowRoom(showId);
    };
  }, [showId]);

  // Reservation countdown timer
  useEffect(() => {
    if (selectedSeats.length > 0) {
      if (!timerRef.current) {
        setTimeLeft(300); // Reset to 5 mins
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              alert('Seat reservation session timed out. Please select your seats again.');
              setSelectedSeats([]);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(300);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [selectedSeats.length]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'BOOKED') return;

    const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
    const socket = getSocket();
    const userId = user?.id || user?._id || 'guest-' + Math.random().toString(36).substr(2, 6);

    if (isSelected) {
      // Unlock seat
      socket.emit('unlock_seat', { showId, seatNumber: seat.seatNumber, userId });
      toggleSeat(seat);
    } else {
      // Check if locked by someone else
      if (seat.status === 'LOCKED' && seat.lockedBy && seat.lockedBy !== userId) {
        alert('This seat is currently held by another user.');
        return;
      }

      // Lock seat in real time
      socket.emit('lock_seat', { showId, seatNumber: seat.seatNumber, userId }, (res) => {
        if (res && res.success) {
          toggleSeat(seat);
        } else {
          alert(res?.message || 'Unable to reserve seat.');
        }
      });
    }
  };

  // Group seats by row
  const rowMap = {};
  seats.forEach((seat) => {
    if (!rowMap[seat.row]) {
      rowMap[seat.row] = [];
    }
    rowMap[seat.row].push(seat);
  });

  const sortedRows = Object.keys(rowMap).sort();

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="seat-grid-container p-4 bg-black rounded-4 border border-secondary shadow-lg">
      {/* Curved Screen */}
      <div className="text-center mb-4">
        <div className="screen-curve"></div>
        <div className="screen-text">EYES THIS WAY - ALL EYES TOWARDS THE SCREEN</div>
      </div>

      {/* Countdown Timer Alert */}
      {selectedSeats.length > 0 && (
        <div className="alert alert-warning py-2 px-3 d-flex align-items-center justify-content-between mb-4 rounded-pill">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-stopwatch text-warning fs-5"></i>
            <span className="small fw-semibold">Seats held for you. Complete booking before timer expires:</span>
          </div>
          <span className="badge bg-dark text-warning fs-6 font-monospace px-3 py-1">
            {formatTimer(timeLeft)}
          </span>
        </div>
      )}

      {/* Seats Matrix */}
      <div className="seat-matrix overflow-auto py-2">
        {sortedRows.map((row) => {
          const rowSeats = rowMap[row].sort((a, b) => a.col - b.col);
          const tier = rowSeats[0]?.tier || 'SILVER';

          return (
            <div key={row} className="seat-row">
              <span className="seat-row-label">{row}</span>
              <div className="d-flex gap-2">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
                  const isBooked = seat.status === 'BOOKED';
                  const isLocked = seat.status === 'LOCKED' && !isSelected;

                  let seatClass = 'seat-available';
                  if (isBooked) seatClass = 'seat-booked';
                  else if (isSelected) seatClass = 'seat-selected';
                  else if (isLocked) seatClass = 'seat-locked';

                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      className={`seat-btn ${seatClass}`}
                      onClick={() => handleSeatClick(seat)}
                      disabled={isBooked || isLocked}
                      title={`${seat.seatNumber} (${tier} - $${seat.price})`}
                    >
                      {seat.col}
                    </button>
                  );
                })}
              </div>
              <span className="seat-row-label text-start ms-2">{row}</span>
            </div>
          );
        })}
      </div>

      {/* Legend & Pricing */}
      <div className="d-flex flex-wrap justify-content-center gap-4 mt-4 pt-3 border-top border-secondary small text-muted">
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-available" style={{ width: '22px', height: '22px' }}></div>
          <span>Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-selected" style={{ width: '22px', height: '22px' }}></div>
          <span>Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-locked" style={{ width: '22px', height: '22px' }}></div>
          <span>Locked</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-booked" style={{ width: '22px', height: '22px' }}></div>
          <span>Booked</span>
        </div>

        <div className="vr border-secondary"></div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-secondary">Silver ${pricing.silver || 15}</span>
          <span className="badge bg-warning text-dark">Gold ${pricing.gold || 22}</span>
          <span className="badge bg-primary">VIP ${pricing.vip || 35}</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
