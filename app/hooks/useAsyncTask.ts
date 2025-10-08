import { useCallback, useTransition } from "react";

import type { Awaitable } from "../utils/types";

interface AsyncTaskOptions {
  onError?: (error: unknown) => void;
  onStart?: () => void;
  onSuccess?: () => void;
  task: () => Awaitable<void>;
}

interface AsyncTaskReturn {
  isPending: boolean;
  run: () => void;
}

export const useAsyncTask = ({
  onError,
  onStart,
  onSuccess,
  task,
}: AsyncTaskOptions): AsyncTaskReturn => {
  const [isPending, startTransition] = useTransition();

  const run = useCallback(() => {
    onStart?.();
    startTransition(async () => {
      try {
        await task();
        onSuccess?.();
      } catch (error) {
        onError?.(error);
      }
    });
  }, [onError, onStart, onSuccess, task]);

  return { isPending, run };
};
