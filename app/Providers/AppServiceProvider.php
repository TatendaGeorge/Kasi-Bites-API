<?php

namespace App\Providers;

use App\Events\OrderStatusUpdated;
use App\Listeners\SendOrderStatusNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Event::listen(
            OrderStatusUpdated::class,
            SendOrderStatusNotification::class
        );
    }
}
