<?php

namespace App\Mail;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ShopApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $shop;

    public function __construct(Shop $shop)
    {
        $this->shop = $shop;
    }

    public function build()
    {
        return $this->subject('Your Shop Has Been Approved!')
                    ->view('emails.shop-approved')
                    ->with(['shop' => $this->shop]);
    }
}
