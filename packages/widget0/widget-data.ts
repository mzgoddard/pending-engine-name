import { WidgetType } from "./widget-type";
import { WidgetValue } from "./widget-value";

export interface WidgetData {
  parameters: { [key: string]: WidgetType };
  body: WidgetValue;
}
