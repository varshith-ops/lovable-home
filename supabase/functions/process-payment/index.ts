import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  bookingId: string;
  amount: number;
  paymentMethod: string;
  movieTitle: string;
  seats: number;
  showDate: string;
}

// Validate payment request
const validatePaymentRequest = (body: unknown): PaymentRequest => {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const req = body as Record<string, unknown>;

  if (!req.bookingId || typeof req.bookingId !== "string") {
    throw new Error("Invalid booking ID");
  }
  if (!req.amount || typeof req.amount !== "number" || req.amount <= 0) {
    throw new Error("Invalid amount");
  }
  if (!req.paymentMethod || !["debit", "credit", "upi"].includes(req.paymentMethod as string)) {
    throw new Error("Invalid payment method");
  }
  if (!req.movieTitle || typeof req.movieTitle !== "string") {
    throw new Error("Invalid movie title");
  }
  if (!req.seats || typeof req.seats !== "number" || req.seats <= 0) {
    throw new Error("Invalid seat count");
  }
  if (!req.showDate || typeof req.showDate !== "string") {
    throw new Error("Invalid show date");
  }

  return {
    bookingId: req.bookingId as string,
    amount: req.amount as number,
    paymentMethod: req.paymentMethod as string,
    movieTitle: req.movieTitle as string,
    seats: req.seats as number,
    showDate: req.showDate as string,
  };
};

// Simulate payment processing (replace with real payment gateway in production)
const processPaymentWithGateway = async (
  amount: number,
  paymentMethod: string
): Promise<{ success: boolean; transactionId: string }> => {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In production, integrate with real payment gateway:
  // - Stripe: https://stripe.com/docs
  // - Razorpay: https://razorpay.com/docs
  // - PayU: https://docs.payu.in

  // 95% success rate for demo purposes
  const success = Math.random() > 0.05;

  return {
    success,
    transactionId: success ? `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : "",
  };
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client for auth and user-specific operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client for checking all seat locks (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse and validate request body
    const body = await req.json();
    const paymentRequest = validatePaymentRequest(body);

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", paymentRequest.bookingId)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found or unauthorized");
    }

    if (booking.status === "paid") {
      throw new Error("Booking already paid");
    }

    // CRITICAL: Verify seats are not already booked by another user
    // Use admin client to check ALL seat locks for this showtime
    if (booking.showtime_id && booking.seat_numbers && booking.seat_numbers.length > 0) {
      const { data: existingLocks, error: lockError } = await supabaseAdmin
        .from("seat_locks")
        .select("seat_number, booking_id")
        .eq("showtime_id", booking.showtime_id)
        .in("seat_number", booking.seat_numbers);

      if (lockError) {
        console.error("Error checking seat locks:", lockError);
        throw new Error("Failed to verify seat availability");
      }

      // Check if any locked seats belong to a DIFFERENT booking
      const conflictingSeats = existingLocks?.filter(
        (lock) => lock.booking_id !== paymentRequest.bookingId
      );

      if (conflictingSeats && conflictingSeats.length > 0) {
        const conflictingSeatNumbers = conflictingSeats.map((s) => s.seat_number).join(", ");
        throw new Error(
          `Seats ${conflictingSeatNumbers} have already been booked. Please select different seats.`
        );
      }
    }

    // Verify amount matches booking
    const expectedAmount = booking.total_amount + Math.round(booking.total_amount * 0.05);
    if (Math.abs(paymentRequest.amount - expectedAmount) > 1) {
      throw new Error("Amount mismatch");
    }

    // Process payment through gateway
    const paymentResult = await processPaymentWithGateway(
      paymentRequest.amount,
      paymentRequest.paymentMethod
    );

    if (!paymentResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment failed. Please try again.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update booking status to paid
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentRequest.bookingId);

    if (updateError) {
      throw new Error("Failed to update booking status");
    }

    // Log successful payment (in production, save to payments table)
    console.log("Payment successful:", {
      bookingId: paymentRequest.bookingId,
      transactionId: paymentResult.transactionId,
      amount: paymentRequest.amount,
      paymentMethod: paymentRequest.paymentMethod,
      userId: user.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: paymentResult.transactionId,
        message: "Payment processed successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Payment error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Payment processing failed",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
