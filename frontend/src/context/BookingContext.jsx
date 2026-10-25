import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('imovies_city') || 'New York'
  );
  const [activeMovie, setActiveMovie] = useState(null);
  const [activeShow, setActiveShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // array of seat objects: { seatNumber, tier, price }
  const [completedBooking, setCompletedBooking] = useState(null);

  const setCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('imovies_city', city);
  };

  const toggleSeat = (seatObj) => {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.seatNumber === seatObj.seatNumber);
      if (exists) {
        return prev.filter((s) => s.seatNumber !== seatObj.seatNumber);
      } else {
        if (prev.length >= 8) {
          alert('You can select a maximum of 8 seats per booking transaction.');
          return prev;
        }
        return [...prev, seatObj];
      }
    });
  };

  const clearBookingSession = () => {
    setSelectedSeats([]);
    setActiveShow(null);
    setActiveMovie(null);
  };

  // Pricing calculations
  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
  const convenienceFee = selectedSeats.length > 0 ? Math.round(selectedSeats.length * 1.5 * 100) / 100 : 0;
  const taxes = Math.round(subtotal * 0.08 * 100) / 100;
  const totalAmount = Math.round((subtotal + convenienceFee + taxes) * 100) / 100;

  return (
    <BookingContext.Provider
      value={{
        selectedCity,
        setCity,
        activeMovie,
        setActiveMovie,
        activeShow,
        setActiveShow,
        selectedSeats,
        setSelectedSeats,
        toggleSeat,
        clearBookingSession,
        subtotal,
        convenienceFee,
        taxes,
        totalAmount,
        completedBooking,
        setCompletedBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
