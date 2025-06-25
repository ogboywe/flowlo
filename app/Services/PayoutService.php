<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Shop;
use App\Enums\BookingStatus;
use Illuminate\Support\Facades\DB;

class PayoutService
{
    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    public function processBookingPayout(Booking $booking)
    {
        if ($booking->status !== BookingStatus::COMPLETED) {
            throw new \Exception('Booking must be completed before payout');
        }

        if (!$booking->shop->stripe_account_id) {
            throw new \Exception('Shop does not have a Stripe Connect account');
        }

        $totalAmount = $booking->total_price;
        $platformFee = $totalAmount * 0.05;
        $barberCommission = $totalAmount * ($booking->barber->commission_rate / 100);
        $shopAmount = $totalAmount - $platformFee - $barberCommission;

        DB::transaction(function () use ($booking, $shopAmount, $barberCommission) {
            if ($shopAmount > 0) {
                $this->stripeService->transferToShop($booking, $shopAmount);
            }

            $this->recordPayout($booking, $shopAmount, $barberCommission);
        });

        return [
            'shop_amount' => $shopAmount,
            'barber_commission' => $barberCommission,
            'platform_fee' => $totalAmount * 0.05,
        ];
    }

    protected function recordPayout(Booking $booking, $shopAmount, $barberCommission)
    {
        $booking->update([
            'payout_processed' => true,
            'payout_processed_at' => now(),
        ]);
    }

    public function calculateEarnings(Shop $shop, $startDate = null, $endDate = null)
    {
        $query = $shop->bookings()
            ->where('status', BookingStatus::COMPLETED)
            ->where('payout_processed', true);

        if ($startDate) {
            $query->where('booking_datetime', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('booking_datetime', '<=', $endDate);
        }

        $bookings = $query->get();

        $totalRevenue = $bookings->sum('total_price');
        $platformFees = $totalRevenue * 0.05;
        $barberCommissions = $bookings->sum(function ($booking) {
            return $booking->total_price * ($booking->barber->commission_rate / 100);
        });
        $shopEarnings = $totalRevenue - $platformFees - $barberCommissions;

        return [
            'total_revenue' => $totalRevenue,
            'shop_earnings' => $shopEarnings,
            'barber_commissions' => $barberCommissions,
            'platform_fees' => $platformFees,
            'booking_count' => $bookings->count(),
        ];
    }
}
