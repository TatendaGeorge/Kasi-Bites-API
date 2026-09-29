<?php

namespace App\Traits;

use App\Models\Store;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Used by owner-facing Admin controllers, which run behind the
 * `auth:sanctum` + `store.owner` middleware pair — the current user is
 * guaranteed to own exactly one store by that point.
 */
trait ResolvesCurrentStore
{
    protected function currentStore(Request $request): Store
    {
        return $request->user()->store;
    }

    protected function assertOwnedByCurrentStore(Request $request, Model $model): void
    {
        if ($model->store_id !== $this->currentStore($request)->id) {
            throw new NotFoundHttpException();
        }
    }
}
