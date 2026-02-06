<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeys extends Command
{
    protected $signature = 'webpush:generate-keys';

    protected $description = 'Generate VAPID keys for Web Push notifications';

    public function handle(): int
    {
        $this->info('Generating VAPID keys...');

        $keys = VAPID::createVapidKeys();

        $this->newLine();
        $this->info('Add these to your .env file:');
        $this->newLine();
        $this->line("VAPID_PUBLIC_KEY={$keys['publicKey']}");
        $this->line("VAPID_PRIVATE_KEY={$keys['privateKey']}");
        $this->line('VAPID_SUBJECT=mailto:admin@kasibites.com');
        $this->newLine();
        $this->info('Also add the public key to your PWA .env file:');
        $this->newLine();
        $this->line("VITE_VAPID_PUBLIC_KEY={$keys['publicKey']}");
        $this->newLine();

        return self::SUCCESS;
    }
}
