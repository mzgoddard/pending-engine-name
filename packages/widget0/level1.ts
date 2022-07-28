import {
  WidgetBuilder,
  WidgetClass,
  WidgetData,
  WidgetDatabase,
  WidgetFoundation,
  WidgetTagArray,
  WidgetValue,
} from ".";
import { pickFirstWidget, visitWidgetRef } from "./level0";

async function asyncArrayFrom<T>(iter: AsyncIterable<T>): Promise<T[]> {
  const ary = [] as T[];
  for await (const item of iter) {
    ary.push(item);
  }
  return ary;
}

export interface BuildQueueWidgetClass<T> extends WidgetClass<T, any> {
  tagsWidgetMap: Map<WidgetTagArray, WidgetClass<T, any>>;
  body: WidgetValue;

  init(): void;
}

export class BuildQueue<Output, T extends BuildQueueWidgetClass<Output>> {
  private _buildCache: Map<WidgetData, WidgetClass<Output, any>> = new Map();
  buildCache: Map<WidgetData, Promise<WidgetClass<Output, any>>> = new Map();
  queue: {
    data: WidgetData;
    widget: T;
    finalResolve: (result: WidgetClass<Output, any>) => void;
  }[] = [];
  building = false;

  constructor(
    public builder: WidgetBuilder<Output>,
    public foundation: WidgetFoundation<Output>,
    public database: WidgetDatabase,
    public widgetConstructor: new () => T
  ) {}
  async build(data: WidgetData): Promise<WidgetClass<Output, any>> {
    if (!this.buildCache.has(data)) {
      this.buildCache.set(
        data,
        new Promise((finalResolve) => {
          const widget = new this.widgetConstructor();
          widget.body = data.body;
          this._buildCache.set(data, widget);
          this.queue.push({
            data,
            widget,
            finalResolve: finalResolve,
          });
        })
      );
      this.buildAll();
    }
    return this.buildCache.get(data) as Promise<any>;
  }
  async buildAll() {
    if (this.building) {
      return;
    }
    try {
      this.building = true;
      for (const queueItem of this.queue) {
        const refs = Array.from(visitWidgetRef(queueItem.data.body));
        queueItem.widget.tagsWidgetMap = new Map(
          await Promise.all(
            refs.map(async (ref) => {
              const foundationWidget = await this.foundation.search(ref.tags);
              if (foundationWidget) {
                return [ref.tags, foundationWidget] as const;
              }
              const databaseWidget = pickFirstWidget(
                await asyncArrayFrom(this.database.search(ref.tags))
              );
              this.build(databaseWidget);
              return [
                ref.tags,
                this._buildCache.get(databaseWidget) as WidgetClass<
                  Output,
                  any
                >,
              ] as const;
            })
          )
        );
      }
      for (const queueItem of this.queue) {
        queueItem.widget.init();
        queueItem.finalResolve(queueItem.widget);
      }
      this.queue.length = 0;
    } finally {
      this.building = false;
    }
  }
}
