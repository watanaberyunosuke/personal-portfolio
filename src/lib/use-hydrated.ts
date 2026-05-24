"use client";

import { useSyncExternalStore } from "react";

let hydrated = false;

function subscribe(onStoreChange: () => void) {
  if (!hydrated) {
    queueMicrotask(() => {
      hydrated = true;
      onStoreChange();
    });
  }

  return () => {};
}

function getSnapshot() {
  return hydrated;
}

function getServerSnapshot() {
  return false;
}

export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
