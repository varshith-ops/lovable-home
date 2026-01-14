import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket, Calendar, Clock, Loader2, MapPin, Armchair } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { format } from "date-fns";

interface BookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-500",
  confirmed: "bg-blue-500/20 text-blue-500",
  paid: "bg-green-500/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-500",
};

const BookingsDrawer = ({ isOpen, onClose }: BookingsDrawerProps) => {
  const { data: bookings, isLoading } = useBookings();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl text-foreground">My Bookings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {!isLoading && (!bookings || bookings.length === 0) && (
                <div className="text-center py-12">
                  <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Book a movie to see it here
                  </p>
                </div>
              )}

              {!isLoading && bookings && bookings.length > 0 && (
                <div className="space-y-4">
                  {bookings.map((booking: any) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-secondary rounded-xl p-4 border border-border"
                    >
                      <div className="flex gap-3">
                        {booking.movies?.poster_url && (
                          <img
                            src={booking.movies.poster_url}
                            alt={booking.movies.title}
                            className="w-16 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground">
                              {booking.movies?.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                statusColors[booking.status as keyof typeof statusColors]
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1">
                            {booking.theaters && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.theaters.name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(booking.show_date), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{booking.show_time}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <span className="text-sm text-muted-foreground">
                                {booking.seats} seat{booking.seats > 1 ? "s" : ""}
                              </span>
                              {booking.seat_numbers && booking.seat_numbers.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Armchair className="w-3 h-3" />
                                  <span>{booking.seat_numbers.sort().join(", ")}</span>
                                </div>
                              )}
                            </div>
                            <span className="font-semibold text-primary">
                              ₹{booking.total_amount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingsDrawer;
