<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\StripeService;
use App\Services\PayoutService;
use App\Enums\BookingStatus;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected $stripeService;
    protected $payoutService;

    public function __construct(StripeService $stripeService, PayoutService $payoutService)
    {
        $this->stripeService = $stripeService;
        $this->payoutService = $payoutService;
    }

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::with(['client', 'shop', 'service'])->findOrFail($request->booking_id);

        if ($booking->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->stripe_payment_intent_id) {
            return response()->json(['message' => 'Payment intent already exists'], 400);
        }

        try {
            $paymentIntent = $this->stripeService->createPaymentIntent(
                $booking->total_price,
                'usd',
                null,
                [
                    'booking_id' => $booking->id,
                    'shop_id' => $booking->shop_id,
                    'client_id' => $booking->client_id,
                ]
            );

            $booking->update(['stripe_payment_intent_id' => $paymentIntent->id]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create payment intent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            $paymentIntent = $this->stripeService->retrievePaymentIntent($request->payment_intent_id);

            $booking = Booking::where('stripe_payment_intent_id', $paymentIntent->id)->first();

            if (!$booking) {
                return response()->json(['message' => 'Booking not found'], 404);
            }

            if ($paymentIntent->status === 'succeeded') {
                $booking->update(['status' => BookingStatus::CONFIRMED]);

                return response()->json([
                    'message' => 'Payment confirmed successfully',
                    'booking' => $booking->load(['client', 'barber.user', 'service', 'shop']),
                ]);
            }

            return response()->json([
                'message' => 'Payment not yet completed',
                'status' => $paymentIntent->status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to confirm payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function processRefund(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string|max:500',
        ]);

        $booking = Booking::findOrFail($request->booking_id);

        if (!$booking->stripe_payment_intent_id) {
            return response()->json(['message' => 'No payment to refund'], 400);
        }

        try {
            $refundAmount = $request->amount ?: $booking->total_price;

            $refund = \Stripe\Refund::create([
                'payment_intent' => $booking->stripe_payment_intent_id,
                'amount' => $refundAmount * 100,
                'reason' => 'requested_by_customer',
                'metadata' => [
                    'booking_id' => $booking->id,
                    'reason' => $request->reason ?: 'Customer requested refund',
                ],
            ]);

            $booking->update([
                'status' => BookingStatus::CANCELLED,
                'refund_amount' => $refundAmount,
                'refund_reason' => $request->reason,
            ]);

            return response()->json([
                'message' => 'Refund processed successfully',
                'refund' => $refund,
                'booking' => $booking,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function processPayout(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::with(['shop', 'barber'])->findOrFail($request->booking_id);

        if ($booking->status !== BookingStatus::COMPLETED) {
            return response()->json(['message' => 'Booking must be completed before payout'], 400);
        }

        try {
            $payoutDetails = $this->payoutService->processBookingPayout($booking);

            return response()->json([
                'message' => 'Payout processed successfully',
                'payout_details' => $payoutDetails,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process payout',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
