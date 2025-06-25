<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Barber;
use App\Services\PayoutService;
use App\Enums\BookingStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    protected $payoutService;

    public function __construct(PayoutService $payoutService)
    {
        $this->payoutService = $payoutService;
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid payload in Stripe webhook', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Invalid signature in Stripe webhook', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        try {
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentIntentFailed($event->data->object);
                    break;

                case 'invoice.payment_succeeded':
                    $this->handleInvoicePaymentSucceeded($event->data->object);
                    break;

                case 'invoice.payment_failed':
                    $this->handleInvoicePaymentFailed($event->data->object);
                    break;

                case 'customer.subscription.updated':
                    $this->handleSubscriptionUpdated($event->data->object);
                    break;

                case 'customer.subscription.deleted':
                    $this->handleSubscriptionDeleted($event->data->object);
                    break;

                case 'account.updated':
                    $this->handleAccountUpdated($event->data->object);
                    break;

                default:
                    Log::info('Unhandled Stripe webhook event', ['type' => $event->type]);
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Error processing Stripe webhook', [
                'event_type' => $event->type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        $booking = Booking::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($booking) {
            $booking->update(['status' => BookingStatus::CONFIRMED]);

            Log::info('Payment confirmed for booking', ['booking_id' => $booking->id]);
        }
    }

    protected function handlePaymentIntentFailed($paymentIntent)
    {
        $booking = Booking::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($booking) {
            $booking->update(['status' => BookingStatus::CANCELLED]);

            Log::info('Payment failed for booking', ['booking_id' => $booking->id]);
        }
    }

    protected function handleInvoicePaymentSucceeded($invoice)
    {
        if (isset($invoice->subscription)) {
            $barber = Barber::where('stripe_subscription_id', $invoice->subscription)->first();

            if ($barber) {
                $barber->update([
                    'subscription_status' => 'active',
                    'last_payment_date' => now(),
                ]);

                Log::info('Barber subscription payment succeeded', ['barber_id' => $barber->id]);
            }
        }
    }

    protected function handleInvoicePaymentFailed($invoice)
    {
        if (isset($invoice->subscription)) {
            $barber = Barber::where('stripe_subscription_id', $invoice->subscription)->first();

            if ($barber) {
                $barber->update(['subscription_status' => 'past_due']);

                Log::warning('Barber subscription payment failed', ['barber_id' => $barber->id]);
            }
        }
    }

    protected function handleSubscriptionUpdated($subscription)
    {
        $barber = Barber::where('stripe_subscription_id', $subscription->id)->first();

        if ($barber) {
            $status = $subscription->status;

            $barber->update(['subscription_status' => $status]);

            Log::info('Barber subscription updated', [
                'barber_id' => $barber->id,
                'status' => $status
            ]);
        }
    }

    protected function handleSubscriptionDeleted($subscription)
    {
        $barber = Barber::where('stripe_subscription_id', $subscription->id)->first();

        if ($barber) {
            $barber->update([
                'subscription_status' => 'cancelled',
                'stripe_subscription_id' => null,
            ]);

            Log::info('Barber subscription cancelled', ['barber_id' => $barber->id]);
        }
    }

    protected function handleAccountUpdated($account)
    {
        $shop = \App\Models\Shop::where('stripe_account_id', $account->id)->first();

        if ($shop) {
            $shop->update([
                'stripe_account_charges_enabled' => $account->charges_enabled,
                'stripe_account_payouts_enabled' => $account->payouts_enabled,
            ]);

            Log::info('Shop Stripe account updated', [
                'shop_id' => $shop->id,
                'charges_enabled' => $account->charges_enabled,
                'payouts_enabled' => $account->payouts_enabled
            ]);
        }
    }
}
