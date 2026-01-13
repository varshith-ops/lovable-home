import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Booking = Tables<"bookings">;
export type BookingInsert = TablesInsert<"bookings">;

// Mock email notification
const sendMockEmailNotification = (movieTitle: string, seats: number, showDate: string) => {
  toast({
    title: "📧 Email Notification Sent!",
    description: `Confirmation email sent for ${seats} seat(s) to "${movieTitle}" on ${showDate}`,
  });
};

// Mock payment processing
const processMockPayment = async (amount: number): Promise<boolean> => {
  // Simulate payment delay (1-2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500));
  // 95% success rate for demo
  return Math.random() > 0.05;
};

export const useBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          movies (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (booking: Omit<BookingInsert, "user_id">) => {
      if (!user) throw new Error("Must be logged in to book");

      // Create booking with pending status
      const { data: newBooking, error } = await supabase
        .from("bookings")
        .insert({
          ...booking,
          user_id: user.id,
          status: "pending",
        })
        .select(`
          *,
          movies (*)
        `)
        .single();

      if (error) throw error;
      return newBooking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Booking Created!",
        description: "Proceeding to payment...",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, amount, movieTitle, seats, showDate }: { 
      bookingId: string; 
      amount: number;
      movieTitle: string;
      seats: number;
      showDate: string;
    }) => {
      // Process mock payment
      const paymentSuccess = await processMockPayment(amount);
      
      if (!paymentSuccess) {
        throw new Error("Payment failed. Please try again.");
      }

      // Update booking status to paid
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "paid" })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;

      // Send mock email notification
      sendMockEmailNotification(movieTitle, seats, showDate);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "🎉 Payment Successful!",
        description: "Your booking is confirmed. Enjoy the movie!",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
