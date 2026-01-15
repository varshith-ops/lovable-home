import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Users, Loader2, CheckCircle, MapPin, Armchair, ArrowLeft, Ticket, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateBooking, useProcessPayment } from "@/hooks/useBookings";
import { useShowtimesByMovieAndDate, type TheaterWithShowtimes, type Showtime } from "@/hooks/useShowtimes";
import { useBookedSeats } from "@/hooks/useBookedSeats";
import { format, addDays } from "date-fns";
import type { Movie } from "@/hooks/useMovies";
import SeatSelection from "./SeatSelection";
import PaymentForm from "./PaymentForm";
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
}

const BookingModal = ({ isOpen, onClose, movie }: BookingModalProps) => {
  const [step, setStep] = useState<"theater" | "seats" | "payment" | "success">("theater");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedTheater, setSelectedTheater] = useState<TheaterWithShowtimes | null>(null);
  const [seats, setSeats] = useState(1);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const { data: theatersWithShowtimes = [], isLoading: loadingShowtimes } = useShowtimesByMovieAndDate(movie.id, dateString);
  const { data: bookedSeats = [], isLoading: loadingBookedSeats } = useBookedSeats(selectedShowtime?.id || null);

  const createBooking = useCreateBooking();
  const processPayment = useProcessPayment();

  const price = selectedShowtime?.price ?? movie.price ?? 250;
  const totalAmount = Number(price) * seats;

  // Generate next 7 days for date selection
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const handleSelectShowtime = (theater: TheaterWithShowtimes, showtime: Showtime) => {
    setSelectedTheater(theater);
    setSelectedShowtime(showtime);
    setSelectedSeatNumbers([]);
    setStep("seats");
  };

  const handleSeatsSelected = useCallback((selectedSeats: string[]) => {
    setSelectedSeatNumbers(selectedSeats);
  }, []);

  const handleBooking = async () => {
    if (!selectedShowtime || !selectedTheater || selectedSeatNumbers.length !== seats) return;
    
    try {
      const result = await createBooking.mutateAsync({
        movie_id: movie.id,
        seats,
        total_amount: totalAmount,
        show_date: format(selectedDate, "yyyy-MM-dd"),
        show_time: selectedShowtime.show_time,
        theater_id: selectedTheater.theater.id,
        showtime_id: selectedShowtime.id,
        seat_numbers: selectedSeatNumbers,
      });
      setBookingId(result.id);
      setStep("payment");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handlePayment = async (method: string) => {
    if (!bookingId) return;

    try {
      await processPayment.mutateAsync({
        bookingId,
        amount: totalAmount + Math.round(totalAmount * 0.05),
        movieTitle: movie.title,
        seats,
        showDate: format(selectedDate, "MMM dd, yyyy"),
        paymentMethod: method,
      });
      setStep("success");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setStep("theater");
    setSelectedDate(new Date());
    setSelectedShowtime(null);
    setSelectedTheater(null);
    setSeats(1);
    setSelectedSeatNumbers([]);
    setBookingId(null);
    onClose();
  };

  const handleBack = () => {
    if (step === "seats") {
      setSelectedShowtime(null);
      setSelectedTheater(null);
      setSelectedSeatNumbers([]);
      setStep("theater");
    } else if (step === "payment") {
      setStep("seats");
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full bg-card border border-border rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
              step === "seats" ? "max-w-4xl" : "max-w-2xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {step === "theater" && (
              <>
                {/* Movie Info */}
                <div className="flex gap-4 mb-6">
                  <img
                    src={movie.poster_url || ""}
                    alt={movie.title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="font-display text-xl text-foreground">{movie.title}</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {movie.genre?.join(" • ")}
                    </p>
                    {movie.duration_minutes && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m
                      </p>
                    )}
                  </div>
                </div>

                {/* Number of Tickets - Now BEFORE date selection */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Number of Seats</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSeats(Math.max(1, seats - 1))}
                      className="w-10 h-10 rounded-lg bg-secondary border border-border hover:border-primary transition-colors text-xl font-medium"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-foreground w-8 text-center">
                      {seats}
                    </span>
                    <button
                      onClick={() => setSeats(Math.min(10, seats + 1))}
                      className="w-10 h-10 rounded-lg bg-secondary border border-border hover:border-primary transition-colors text-xl font-medium"
                    >
                      +
                    </button>
                    <span className="text-muted-foreground text-sm ml-2">
                      {seats === 1 ? "seat" : "seats"} selected
                    </span>
                  </div>
                </div>

                {/* Horizontal Date Selection - Now AFTER seat selection */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Select Date</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                    {dates.map((date) => (
                      <motion.button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-shrink-0 min-w-[72px] px-4 py-3 rounded-xl border-2 transition-all ${
                          format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                            ? "bg-primary text-primary-foreground border-primary shadow-lg"
                            : "bg-secondary/50 border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`text-xs font-medium ${
                          format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}>
                          {format(date, "EEE")}
                        </div>
                        <div className="font-bold text-lg">{format(date, "dd")}</div>
                        <div className={`text-xs ${
                          format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}>
                          {format(date, "MMM")}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Theaters & Showtimes Section */}
                <div>
                  <h2 className="font-display text-2xl text-foreground mb-4">
                    Theaters Showing {movie.title}
                  </h2>

                  {loadingShowtimes ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : theatersWithShowtimes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No showtimes available for this date.</p>
                      <p className="text-sm mt-2">Please select a different date above.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {theatersWithShowtimes.map(({ theater, showtimes }) => (
                        <motion.div
                          key={theater.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-secondary/50 rounded-xl p-4 border border-border"
                        >
                          {/* Theater Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground text-lg">{theater.name}</h3>
                              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                                <MapPin className="w-4 h-4" />
                                <span>{theater.location}, {theater.city}</span>
                              </div>
                            </div>
                          </div>

                          {/* Amenities */}
                          {theater.amenities && theater.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {theater.amenities.map((amenity) => (
                                <span
                                  key={amenity}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Showtimes */}
                          <div>
                            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Available Showtimes
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {showtimes.map((showtime) => (
                                <button
                                  key={showtime.id}
                                  onClick={() => handleSelectShowtime({ theater, showtimes }, showtime)}
                                  className="px-4 py-2 rounded-lg border border-primary/50 bg-background hover:bg-primary hover:text-primary-foreground transition-all group"
                                >
                                  <div className="font-medium">{formatTime(showtime.show_time)}</div>
                                  <div className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">
                                    ₹{showtime.price}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {step === "seats" && selectedTheater && selectedShowtime && (
              <>
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="mb-4 text-primary hover:underline text-sm flex items-center gap-1"
                >
                  ← Back to theaters
                </button>

                {/* Movie & Theater Info */}
                <div className="flex gap-4 mb-6">
                  <img
                    src={movie.poster_url || ""}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h2 className="font-display text-lg text-foreground">{movie.title}</h2>
                    <p className="text-muted-foreground text-sm">
                      {selectedTheater.theater.name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(selectedDate, "EEE, MMM dd")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(selectedShowtime.show_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seat Selection Heading */}
                <div className="flex items-center gap-2 mb-4">
                  <Armchair className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Select Your Seats ({seats} tickets)</span>
                </div>

                {/* Seat Selection Grid */}
                {loadingBookedSeats ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <SeatSelection
                    totalSeats={100}
                    seatsToSelect={seats}
                    bookedSeats={bookedSeats}
                    onSeatsSelected={handleSeatsSelected}
                  />
                )}

                {/* Total & Book Button */}
                <div className="border-t border-border pt-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-muted-foreground">Total Amount</span>
                      <p className="text-sm text-muted-foreground">
                        {seats} × ₹{price}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
                  </div>
                  <Button
                    onClick={handleBooking}
                    disabled={createBooking.isPending || selectedSeatNumbers.length !== seats}
                    className="w-full bg-primary text-primary-foreground font-medium glow"
                  >
                    {createBooking.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Booking...
                      </>
                    ) : selectedSeatNumbers.length !== seats ? (
                      `Select ${seats - selectedSeatNumbers.length} more seat${seats - selectedSeatNumbers.length > 1 ? 's' : ''}`
                    ) : (
                      "Proceed to Payment"
                    )}
                  </Button>
                </div>
              </>
            )}

            {step === "payment" && selectedTheater && selectedShowtime && (
              <div className="py-2">
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="mb-4 text-primary hover:underline text-sm flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to seat selection
                </button>

                {/* Payment Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Receipt className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl text-foreground">Payment</h2>
                    <p className="text-muted-foreground text-sm">Complete your booking</p>
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="bg-secondary/50 rounded-xl p-4 mb-6 border border-border">
                  <div className="flex gap-4 mb-4">
                    <img
                      src={movie.poster_url || ""}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{movie.title}</h3>
                      <p className="text-muted-foreground text-sm">{selectedTheater.theater.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(selectedDate, "EEE, MMM dd")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(selectedShowtime.show_time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        Seats
                      </span>
                      <span className="text-foreground font-medium">
                        {selectedSeatNumbers.sort().join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ticket Price</span>
                      <span className="text-foreground">{seats} × ₹{price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Convenience Fee</span>
                      <span className="text-foreground">₹{Math.round(totalAmount * 0.05)}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between">
                      <span className="font-medium text-foreground">Total Amount</span>
                      <span className="font-bold text-primary text-lg">
                        ₹{totalAmount + Math.round(totalAmount * 0.05)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <PaymentForm
                  totalAmount={totalAmount + Math.round(totalAmount * 0.05)}
                  onPaymentSubmit={handlePayment}
                  isProcessing={processPayment.isPending}
                />
              </div>
            )}

            {step === "success" && selectedTheater && selectedShowtime && (
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="font-display text-2xl text-foreground mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Your tickets for {movie.title} have been booked successfully.
                </p>

                <div className="bg-secondary rounded-xl p-4 mb-6 text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Movie</span>
                    <span className="text-foreground">{movie.title}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Theater</span>
                    <span className="text-foreground">{selectedTheater.theater.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground">{format(selectedDate, "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Time</span>
                    <span className="text-foreground">{formatTime(selectedShowtime.show_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="text-foreground">{selectedSeatNumbers.sort().join(", ")}</span>
                  </div>
                </div>

                <Button
                  onClick={handleClose}
                  className="w-full bg-primary text-primary-foreground font-medium"
                >
                  Done
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
