<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Barber;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BarberSubscriptionController extends Controller
{
    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    public function createSubscription(Request $request)
    {
        $user = $request->user();

        if (!$user->isBarber()) {
            return response()->json(['message' => 'Only barbers can create subscriptions'], 403);
        }

        $barber = $user->barberProfile;
        if (!$barber) {
            return response()->json(['message' => 'Barber profile not found'], 404);
        }

        if ($barber->stripe_subscription_id) {
            return response()->json(['message' => 'Subscription already exists'], 400);
        }

        try {
            $subscription = $this->stripeService->createBarberSubscription($user);

            $barber->update([
                'stripe_subscription_id' => $subscription->id,
                'subscription_status' => 'incomplete',
            ]);

            return response()->json([
                'subscription' => $subscription,
                'client_secret' => $subscription->latest_invoice->payment_intent->client_secret,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSubscription(Request $request)
    {
        $user = $request->user();
        $barber = $user->barberProfile;

        if (!$barber || !$barber->stripe_subscription_id) {
            return response()->json(['subscription' => null]);
        }

        try {
            $subscription = $this->stripeService->retrieveSubscription($barber->stripe_subscription_id);

            return response()->json([
                'subscription' => $subscription,
                'local_status' => $barber->subscription_status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancelSubscription(Request $request)
    {
        $user = $request->user();
        $barber = $user->barberProfile;

        if (!$barber || !$barber->stripe_subscription_id) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        try {
            $subscription = $this->stripeService->cancelSubscription($barber->stripe_subscription_id);

            $barber->update(['subscription_status' => 'cancelled']);

            return response()->json([
                'message' => 'Subscription cancelled successfully',
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to cancel subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePaymentMethod(Request $request)
    {
        $request->validate([
            'payment_method_id' => 'required|string',
        ]);

        $user = $request->user();
        $barber = $user->barberProfile;

        if (!$barber || !$barber->stripe_subscription_id) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        try {
            $subscription = \Stripe\Subscription::update($barber->stripe_subscription_id, [
                'default_payment_method' => $request->payment_method_id,
            ]);

            return response()->json([
                'message' => 'Payment method updated successfully',
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update payment method',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSubscriptionStatus(Request $request)
    {
        $user = $request->user();
        $barber = $user->barberProfile;

        if (!$barber) {
            return response()->json(['status' => 'no_profile']);
        }

        if (!$barber->stripe_subscription_id) {
            return response()->json(['status' => 'no_subscription']);
        }

        return response()->json([
            'status' => $barber->subscription_status,
            'stripe_subscription_id' => $barber->stripe_subscription_id,
        ]);
    }
}
