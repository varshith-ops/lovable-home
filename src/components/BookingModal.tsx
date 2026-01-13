import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Users, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateBooking, useProcessPayment } from "@/hooks/useBookings";
import { format, addDays } from "date-fns";
import type { Movie } from "@/hooks/useMovies";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
}

const showTimes = ["10:00", "13:30", "16:00", "19:30", "22:00"];

const BookingModal = ({ isOpen, onClose, movie }: BookingModalProps) => {
  const [step, setStep] = useState<"select" | "payment" | "success">("select");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(showTimes[0]);
  const [seats, setSeats] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const createBooking = useCreateBooking();
  const processPayment = useProcessPayment();

  const totalAmount = Number(movie.price) * seats;

  // Generate next 7 days for date selection
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const handleBooking = async () => {
    try {
      const result = await createBooking.mutateAsync({
        movie_id: movie.id,
        seats,
        total_amount: totalAmount,
        show_date: format(selectedDate, "yyyy-MM-dd"),
        show_time: selectedTime,
      });
      setBookingId(result.id);
      setStep("payment");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handlePayment = async () => {
    if (!bookingId) return;

    try {
      await processPayment.mutateAsync({
        bookingId,
        amount: totalAmount,
        movieTitle: movie.title,
        seats,
        showDate: format(selectedDate, "MMM dd, yyyy"),
      });
      setStep("success");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedDate(new Date());
    setSelectedTime(showTimes[0]);
    setSeats(1);
    setBookingId(null);
    onClose();
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
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {step === "select" && (
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
                    <p className="text-primary font-semibold mt-2">
                      ₹{movie.price} per ticket
                    </p>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Select Date</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {dates.map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 px-4 py-3 rounded-lg border transition-all ${
                          format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary border-border hover:border-primary"
                        }`}
                      >
                        <div className="text-xs opacity-70">{format(date, "EEE")}</div>
                        <div className="font-semibold">{format(date, "dd")}</div>
                        <div className="text-xs opacity-70">{format(date, "MMM")}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Select Time</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {showTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          selectedTime === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary border-border hover:border-primary"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seats Selection */}
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
                  </div>
                </div>

                {/* Total & Book Button */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
                  </div>
                  <Button
                    onClick={handleBooking}
                    disabled={createBooking.isPending}
                    className="w-full bg-primary text-primary-foreground font-medium glow"
                  >
                    {createBooking.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Booking...
                      </>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </Button>
                </div>
              </>
            )}

            {step === "payment" && (
              <div className="text-center py-6">
                <CreditCard className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl text-foreground mb-2">Payment</h2>
                <p className="text-muted-foreground mb-6">
                  Complete your payment for {movie.title}
                </p>

                <div className="bg-secondary rounded-xl p-4 mb-6 text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Movie</span>
                    <span className="text-foreground">{movie.title}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground">{format(selectedDate, "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Time</span>
                    <span className="text-foreground">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="text-foreground">{seats}</span>
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="font-bold text-primary">₹{totalAmount}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processPayment.isPending}
                  className="w-full bg-primary text-primary-foreground font-medium glow"
                >
                  {processPayment.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay ₹${totalAmount}`
                  )}
                </Button>
              </div>
            )}

            {step === "success" && (
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
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground">{format(selectedDate, "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Time</span>
                    <span className="text-foreground">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="text-foreground">{seats}</span>
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
