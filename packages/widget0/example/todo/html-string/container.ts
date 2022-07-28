import { WidgetClass, WidgetTagArray } from "../../..";

export default [
  ["container"],
  {
    create(children) {
      return `<div>${children.join("")}</div>`;
    },
  },
] as [WidgetTagArray, WidgetClass<string, any>];
