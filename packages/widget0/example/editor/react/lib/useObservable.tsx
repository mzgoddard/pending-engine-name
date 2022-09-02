import { useEffect, useState } from "react";
import {
  observeOn,
  animationFrameScheduler,
  Observable,
  asapScheduler,
  asyncScheduler,
} from "rxjs";

export function useObservable<T>(
  observable: Observable<T>,
  defaultValue: T | (() => T),
) {
  const [state, setState] = useState(defaultValue);
  useEffect(() => {
    const subscription = observable
      // .pipe(observeOn(asyncScheduler))
      .subscribe({ next: setState });
    return () => subscription.unsubscribe();
  }, [observable]);
  return state;
}
