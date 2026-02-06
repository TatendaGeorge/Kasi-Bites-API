<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Classic Fries',
                'description' => 'Our signature crispy golden fries, perfectly seasoned with sea salt.',
                'image_url' => null,
                'sizes' => [
                    ['size' => 'small', 'price' => 25.00],
                    ['size' => 'medium', 'price' => 35.00],
                    ['size' => 'large', 'price' => 45.00],
                ],
            ],
            [
                'name' => 'Loaded Fries',
                'description' => 'Classic fries topped with melted cheese, bacon bits, and sour cream.',
                'image_url' => null,
                'sizes' => [
                    ['size' => 'small', 'price' => 35.00],
                    ['size' => 'medium', 'price' => 50.00],
                    ['size' => 'large', 'price' => 65.00],
                ],
            ],
            [
                'name' => 'Spicy Fries',
                'description' => 'Hot and crispy fries with our special peri-peri seasoning.',
                'image_url' => null,
                'sizes' => [
                    ['size' => 'small', 'price' => 28.00],
                    ['size' => 'medium', 'price' => 38.00],
                    ['size' => 'large', 'price' => 48.00],
                ],
            ],
            [
                'name' => 'Cheese Fries',
                'description' => 'Golden fries smothered in our creamy cheese sauce.',
                'image_url' => null,
                'sizes' => [
                    ['size' => 'small', 'price' => 30.00],
                    ['size' => 'medium', 'price' => 42.00],
                    ['size' => 'large', 'price' => 55.00],
                ],
            ],
            [
                'name' => 'Sweet Potato Fries',
                'description' => 'Crispy sweet potato fries with a hint of cinnamon.',
                'image_url' => null,
                'sizes' => [
                    ['size' => 'small', 'price' => 32.00],
                    ['size' => 'medium', 'price' => 45.00],
                    ['size' => 'large', 'price' => 58.00],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $sizes = $productData['sizes'];
            unset($productData['sizes']);

            $product = Product::create($productData);

            foreach ($sizes as $sizeData) {
                $product->sizes()->create($sizeData);
            }
        }
    }
}
