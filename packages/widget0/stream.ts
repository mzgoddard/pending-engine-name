interface Subscriber<T> {
  next(value: T): void;
  complete(): void;
  error(reason: any): void;
}

class Subscription {
  tasks = [] as { unsubscribe: () => void }[];
  constructor(unsubscribe?: Unsubscribe) {
    if (typeof unsubscribe === "function") {
      this.add({ unsubscribe });
    } else if (typeof unsubscribe === "object") {
      this.add(unsubscribe);
    }
  }
  add(subscription: { unsubscribe: () => void }) {
    this.tasks.push(subscription);
  }
  remove(subscription: { unsubscribe: () => void }) {
    this.tasks.splice(this.tasks.indexOf(subscription), 1);
  }
  unsubscribe(): void {
    const tasks = this.tasks.slice();
    this.tasks.length = 0;
    for (const task of tasks) {
      task.unsubscribe();
    }
  }
}

type Unsubscribe =
  | Subscription
  | { unsubscribe: () => void }
  | (() => void)
  | undefined;

interface ObservablePipeFactory<T1, T2 = T1> {
  (observable: HTMLElementObservable<T1>): HTMLElementObservable<T2>;
}

class HTMLElementObservable<T> {
  constructor(
    protected onsubscribe: (subscriber: Subscriber<T>) => Unsubscribe
  ) {}
  subscribe(subscriber: Partial<Subscriber<T>>): Subscription {
    return new Subscription(
      this.onsubscribe({
        next() {},
        complete() {},
        error() {},
        ...subscriber,
      })
    );
  }
}

const observable = (() => {
  function map<T0, T1>(
    map: (value: T0, index: number) => T1
  ): ObservablePipeFactory<T0, T1> {
    return function (observable) {
      return new HTMLElementObservable((subscriber) => {
        let index = 0;
        return observable.subscribe({
          complete: subscriber.complete,
          error: subscriber.error,
          next(value) {
            subscriber.next(map(value, index++));
          },
        });
      });
    };
  }

  function observeOn<T>(scheduler): ObservablePipeFactory<T> {
    return function (observable) {
      return new HTMLElementObservable((subscriber) => {
        return observable.subscribe({
          next(value) {
            scheduler(() => {
              subscriber.next(value);
            });
          },
          complete() {
            scheduler(() => {
              subscriber.complete();
            });
          },
          error(reason) {
            scheduler(() => {
              subscriber.error(reason);
            });
          },
        });
      });
    };
  }

  function pipe<T0, T1>(
    factory0: ObservablePipeFactory<T0, T1>
  ): ObservablePipeFactory<T0, T1>;
  function pipe<T0, T1, T2>(
    factory0: ObservablePipeFactory<T0, T1>,
    factory1: ObservablePipeFactory<T1, T2>
  ): ObservablePipeFactory<T0, T2>;
  function pipe<T0, T1, T2, T3>(
    factory0: ObservablePipeFactory<T0, T1>,
    factory1: ObservablePipeFactory<T1, T2>,
    factory2: ObservablePipeFactory<T2, T3>
  ): ObservablePipeFactory<T0, T3>;
  function pipe<T extends ObservablePipeFactory<any, any>[]>(
    ...args: T
  ): ObservablePipeFactory<any, any>;
  function pipe<T extends ObservablePipeFactory<any, any>[]>(
    ...args: T
  ): ObservablePipeFactory<any, any>;
  function pipe<T extends ObservablePipeFactory<any, any>[]>(
    ...args: T
  ): ObservablePipeFactory<any, any> {
    if (args.length > 1) {
      const [factory0, ...factories] = args;
      const factory1 = pipe(...factories);
      return function (observable) {
        return factory1(factory0(observable));
      };
    } else if (args.length === 1) {
      return args[0];
    }
    return function (observable) {
      return observable;
    };
  }

  function share<T>(): ObservablePipeFactory<T> {
    return function (observable) {
      const subject = new HTMLElementSubject<T>();
      let subjectSubscription: Subscription;
      let refCount = 0;
      return new HTMLElementObservable((subscriber) => {
        if (refCount === 0) {
          subjectSubscription = observable.subscribe(subject);
        }
        refCount += 1;
        const subscription = subject.subscribe(subscriber);
        subscription.add(
          new Subscription(() => {
            refCount -= 1;
            if (refCount === 0) {
              subjectSubscription.unsubscribe();
            }
          })
        );
        return subscription;
      });
    };
  }

  return { map, observeOn, pipe, share };
})();

class HTMLElementSubject<T> extends HTMLElementObservable<T> {
  subscribers = [] as Subscriber<T>[];
  constructor() {
    super((subscriber) => {
      this.subscribers.push(subscriber);
      return () =>
        this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
    });
  }
  next(value: T) {
    for (const sub of this.subscribers) {
      sub.next(value);
    }
  }
  complete() {
    for (const sub of this.subscribers) {
      sub.complete();
    }
  }
  error(reason: any) {
    for (const sub of this.subscribers) {
      sub.error(reason);
    }
  }
}

class HTMLElementValue<T> extends HTMLElementSubject<T> {
  constructor(public value: T) {
    super();
  }
  get(): T {
    return this.value;
  }
  set(value: T) {
    this.value = value;
    this.next(value);
  }
}
