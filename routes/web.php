<?php

use Illuminate\Support\Facades\Route;

// Shisa Admin SPA - the whole app (landing page, auth, store
// management) is a single React app; React Router handles the
// public "/" landing route as well as everything under "/admin".
Route::get('/', function () {
    return view('admin');
});

Route::get('/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');
