import { WidgetFoundationClass } from "./index";
import { WidgetType } from "./widget-type";

export function castFoundation<
  P extends { [key: string]: WidgetType },
  R extends WidgetType,
>(foundationClass: WidgetFoundationClass<P, R>): WidgetFoundationClass<P, R> {
  return foundationClass;
}
