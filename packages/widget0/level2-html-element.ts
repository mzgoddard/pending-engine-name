import {
  WidgetBuilder,
  WidgetClass,
  WidgetData,
  WidgetDatabase,
  WidgetFoundation,
  WidgetTagArray,
  WidgetValue,
} from ".";
import { buildWidgetEvaluator } from "./level0";
import { BuildQueue, BuildQueueWidgetClass } from "./level1";

type Output = HTMLElement | string;

export class HtmlElementBuilder implements WidgetBuilder<Output> {
  constructor(
    public foundation: WidgetFoundation<Output>,
    public database: WidgetDatabase
  ) {}
  async build<P>(
    data: WidgetData,
    queue: BuildQueue<Output, HtmlElementWidget> = new BuildQueue(
      this,
      this.foundation,
      this.database,
      HtmlElementWidget
    )
  ): Promise<WidgetClass<Output, P>> {
    return queue.build(data);
  }
}

class HtmlElementWidget<P extends { [key: string]: WidgetValue } = any>
  implements WidgetClass<Output, P>, BuildQueueWidgetClass<Output>
{
  tagsWidgetMap: Map<WidgetTagArray, WidgetClass<Output, any>>;
  body: WidgetValue;

  transform: (value: WidgetValue, params: P) => any;

  init() {
    const widget = this;
    this.transform = buildWidgetEvaluator({
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
