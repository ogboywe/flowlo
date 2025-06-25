<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Customer;
use Stripe\PaymentIntent;
use Stripe\Subscription;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Price;
use Stripe\Product;
use App\Models\User;
use App\Models\Shop;
use App\Models\Booking;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createCustomer(User $user)
    {
        return Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'phone' => $user->phone,
            'metadata' => [
                'user_id' => $user->id,
                'role' => $user->role->value,
            ],
        ]);
    }

    public function createPaymentIntent($amount, $currency = 'usd', $customerId = null, $metadata = [])
    {
        $params = [
            'amount' => $amount * 100,
            'currency' => $currency,
            'automatic_payment_methods' => ['enabled' => true],
            'metadata' => $metadata,
        ];

        if ($customerId) {
            $params['customer'] = $customerId;
        }

        return PaymentIntent::create($params);
    }

    public function createConnectAccount(Shop $shop)
    {
        $account = Account::create([
            'type' => 'express',
            'country' => 'US',
            'email' => $shop->email ?: $shop->owner->email,
            'business_type' => 'individual',
            'metadata' => [
                'shop_id' => $shop->id,
                'owner_id' => $shop->owner_id,
            ],
        ]);

        $shop->update(['stripe_account_id' => $account->id]);

        return $account;
    }

    public function createAccountLink($accountId, $refreshUrl, $returnUrl)
    {
        return AccountLink::create([
            'account' => $accountId,
            'refresh_url' => $refreshUrl,
            'return_url' => $returnUrl,
            'type' => 'account_onboarding',
        ]);
    }

    public function createBarberSubscription(User $barber, $priceId = null)
    {
        if (!$priceId) {
            $priceId = $this->getOrCreateBarberPrice();
        }

        $customer = $this->createCustomer($barber);

        return Subscription::create([
            'customer' => $customer->id,
            'items' => [['price' => $priceId]],
            'payment_behavior' => 'default_incomplete',
            'payment_settings' => ['save_default_payment_method' => 'on_subscription'],
            'expand' => ['latest_invoice.payment_intent'],
            'metadata' => [
                'user_id' => $barber->id,
                'type' => 'barber_monthly',
            ],
        ]);
    }

    public function getOrCreateBarberPrice()
    {
        try {
            $prices = \Stripe\Price::all([
                'product' => $this->getOrCreateBarberProduct()->id,
                'active' => true,
                'limit' => 1,
            ]);

            if ($prices->data) {
                return $prices->data[0]->id;
            }
        } catch (\Exception $e) {
        }

        return Price::create([
            'product' => $this->getOrCreateBarberProduct()->id,
            'unit_amount' => 3000,
            'currency' => 'usd',
            'recurring' => ['interval' => 'month'],
            'nickname' => 'Barber Monthly Subscription',
        ])->id;
    }

    public function getOrCreateBarberProduct()
    {
        try {
            $products = \Stripe\Product::all([
                'active' => true,
                'limit' => 1,
            ]);

            foreach ($products->data as $product) {
                if (isset($product->metadata['type']) && $product->metadata['type'] === 'barber_subscription') {
                    return $product;
                }
            }
        } catch (\Exception $e) {
        }

        return Product::create([
            'name' => 'Barber Monthly Subscription',
            'description' => 'Monthly subscription for barbers to access the platform',
            'metadata' => ['type' => 'barber_subscription'],
        ]);
    }

    public function transferToShop(Booking $booking, $amount)
    {
        if (!$booking->shop->stripe_account_id) {
            throw new \Exception('Shop does not have a Stripe Connect account');
        }

        return \Stripe\Transfer::create([
            'amount' => $amount * 100,
            'currency' => 'usd',
            'destination' => $booking->shop->stripe_account_id,
            'metadata' => [
                'booking_id' => $booking->id,
                'shop_id' => $booking->shop_id,
            ],
        ]);
    }

    public function retrievePaymentIntent($paymentIntentId)
    {
        return PaymentIntent::retrieve($paymentIntentId);
    }

    public function retrieveSubscription($subscriptionId)
    {
        return Subscription::retrieve($subscriptionId);
    }

    public function cancelSubscription($subscriptionId)
    {
        return Subscription::update($subscriptionId, [
            'cancel_at_period_end' => true,
        ]);
    }
}
