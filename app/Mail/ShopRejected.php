<?php

namespace App\Mail;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ShopRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $shop;
    public $reason;

    public function __construct(Shop $shop, $reason)
    {
        $this->shop = $shop;
        $this->reason = $reason;
    }

    public function build()
    {
        return $this->subject('Shop Application Update')
                    ->view('emails.shop-rejected')
                    ->with([
                        'shop' => $this->shop,
                        'reason' => $this->reason,
                    ]);
    }
}
