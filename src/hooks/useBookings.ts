import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Booking = Tables<"bookings">;
export type BookingInsert = TablesInsert<"bookings">;

// Email notification is now handled by server-side toast simulation
const showPaymentConfirmation = (movieTitle: string, seats: number, showDate: string, paymentMethod: string) => {
  const methodLabel = paymentMethod === "upi" ? "UPI" : paymentMethod === "credit" ? "Credit Card" : "Debit Card";
  toast({
    title: "📧 Email Notification Sent!",
    description: `Confirmation email sent for ${seats} seat(s) to "${movieTitle}" on ${showDate}. Paid via ${methodLabel}.`,
  });
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
          movies (*),
          theaters (*)
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
          movies (*),
          theaters (*)
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
    mutationFn: async ({ bookingId, amount, movieTitle, seats, showDate, paymentMethod }: { 
      bookingId: string; 
      amount: number;
      movieTitle: string;
      seats: number;
      showDate: string;
      paymentMethod: string;
    }) => {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to process payment");
      }

      // Call the server-side payment processing edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            bookingId,
            amount,
            paymentMethod,
            movieTitle,
            seats,
            showDate,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Payment failed. Please try again.");
      }

      // Show confirmation notification
      showPaymentConfirmation(movieTitle, seats, showDate, paymentMethod);

      return result;
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
