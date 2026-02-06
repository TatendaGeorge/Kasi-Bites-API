<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Admin dashboard SPA - all /admin routes go to the React app
Route::get('/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');
