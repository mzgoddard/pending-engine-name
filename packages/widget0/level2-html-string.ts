import {
  WidgetBuilder,
  WidgetClass,
  WidgetComparisonOperator,
  WidgetData,
  WidgetDatabase,
  WidgetFoundation,
  WidgetRef,
  WidgetTagArray,
  WidgetValue,
} from ".";
import {
  buildWidgetEvaluator,
  pickFirstWidget,
  visitWidgetRef,
} from "./level0";

type Output = string;

async function asyncArrayFrom<T>(iter: AsyncIterable<T>): Promise<T[]> {
  const ary = [] as T[];
  for await (const item of iter) {
    ary.push(item);
  }
  return ary;
}

class BuildQueue {
  private _buildCache: Map<WidgetData, WidgetClass<Output, any>> = new Map();
  buildCache: Map<WidgetData, Promise<WidgetClass<Output, any>>> = new Map();
  queue: {
    data: WidgetData;
    widget: HtmlStringWidget;
    finalResolve: (result: WidgetClass<Output, any>) => void;
  }[] = [];
  building = false;

  constructor(public builder: HtmlStringBuilder) {}
  async build(data: WidgetData): Promise<WidgetClass<Output, any>> {
    if (!this.buildCache.has(data)) {
      this.buildCache.set(
        data,
        new Promise((finalResolve) => {
          const widget = new HtmlStringWidget();
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
              const foundationWidget = await this.builder.foundation.search(
                ref.tags
              );
              if (foundationWidget) {
                return [ref.tags, foundationWidget] as const;
              }
              const databaseWidget = pickFirstWidget(
                await asyncArrayFrom(this.builder.database.search(ref.tags))
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

export class HtmlStringBuilder implements WidgetBuilder<Output> {
  constructor(
    public foundation: WidgetFoundation<Output>,
    public database: WidgetDatabase
  ) {}
  async build<P>(
    data: WidgetData,
    queue: BuildQueue = new BuildQueue(this)
  ): Promise<WidgetClass<Output, P>> {
    return queue.build(data);
  }
}

class HtmlStringWidget<P extends { [key: string]: WidgetValue } = any>
  implements WidgetClass<Output, P>
{
  tagsWidgetMap: Map<WidgetTagArray, WidgetClass<Output, any>>;
  transform: (value: WidgetValue, params: P) => any;
  body: WidgetValue;

  init() {
    const widget = this;
    this.transform = buildWidgetEvaluator({
      parameter(value, params) {
        return params[value.parameter];
      },
      map(value, params) {
        return widget
          .transform(value.target, params)
          .map((item: any) =>
            widget.transform(value.map, { ...params, [value.argument]: item })
          );
      },
      ref(value, params) {
        return widget.tagsWidgetMap
          .get(value.tags)
          ?.create(widget.transform({ shape: value.parameters }, params));
      },
    }).value;
  }

  create(params: P): Output {
    return this.transform(this.body, params);
  }
}
