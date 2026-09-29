import { useAuth } from './useAuth';
import { Store } from '../types';

interface UseStoreResult {
  store: Store | null;
  hasStore: boolean;
  isLoading: boolean;
}

/**
 * The current user's own store, derived from the already-loaded auth user
 * (GET /user eager-loads the `store` relation) — no separate fetch.
 */
export function useStore(): UseStoreResult {
  const { user, isLoading } = useAuth();

  return {
    store: user?.store ?? null,
    hasStore: !!user?.store,
    isLoading,
  };
}
