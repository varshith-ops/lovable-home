import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";

interface SeatSelectionProps {
  totalSeats: number;
  seatsToSelect: number;
  bookedSeats: string[];
  onSeatsSelected: (seats: string[]) => void;
}

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SEATS_PER_ROW = 12;

const SeatSelection = ({ 
  totalSeats, 
  seatsToSelect, 
  bookedSeats, 
  onSeatsSelected 
}: SeatSelectionProps) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    onSeatsSelected(selectedSeats);
  }, [selectedSeats, onSeatsSelected]);

  const toggleSeat = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return;
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(s => s !== seatId);
      }
      if (prev.length >= seatsToSelect) {
        // Replace the first selected seat
        return [...prev.slice(1), seatId];
      }
      return [...prev, seatId];
    });
  };

  const getSeatStatus = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return "booked";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  return (
    <div className="w-full">
      {/* Screen */}
      <div className="relative mb-8">
        <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
        <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground text-sm">
          <Monitor className="w-4 h-4" />
          <span>SCREEN</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-2">
        {ROWS.map((row, rowIndex) => (
          <motion.div
            key={row}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
            className="flex items-center gap-1 sm:gap-2"
          >
            {/* Row Label */}
            <span className="w-6 text-center text-muted-foreground text-sm font-medium">
              {row}
            </span>

            {/* Seats */}
            <div className="flex gap-1 sm:gap-2">
              {Array.from({ length: SEATS_PER_ROW }, (_, seatIndex) => {
                const seatNumber = seatIndex + 1;
                const seatId = `${row}${seatNumber}`;
                const status = getSeatStatus(seatId);
                
                // Add aisle gap in the middle
                const hasAisle = seatIndex === 3 || seatIndex === 8;

                return (
                  <div key={seatId} className={`flex ${hasAisle ? "mr-2 sm:mr-4" : ""}`}>
                    <button
                      onClick={() => toggleSeat(seatId)}
                      disabled={status === "booked"}
                      className={`
                        w-6 h-6 sm:w-8 sm:h-8 rounded-t-lg text-xs font-medium
                        transition-all duration-200 flex items-center justify-center
                        ${status === "booked" 
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" 
                          : status === "selected"
                            ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30"
                            : "border-2 border-green-500 text-green-500 hover:bg-green-500/10 cursor-pointer"
                        }
                      `}
                      title={status === "booked" ? "Seat unavailable" : `Seat ${seatId}`}
                    >
                      {seatNumber}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Row Label (right side) */}
            <span className="w-6 text-center text-muted-foreground text-sm font-medium">
              {row}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg border-2 border-green-500" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-primary" />
          <span className="text-sm text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-muted opacity-50" />
          <span className="text-sm text-muted-foreground">Booked</span>
        </div>
      </div>

      {/* Selection Status */}
      <div className="mt-6 text-center">
        <p className="text-foreground">
          <span className="font-semibold text-primary">{selectedSeats.length}</span>
          <span className="text-muted-foreground"> of </span>
          <span className="font-semibold">{seatsToSelect}</span>
          <span className="text-muted-foreground"> seats selected</span>
        </p>
        {selectedSeats.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Seats: {selectedSeats.sort().join(", ")}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeatSelection;
