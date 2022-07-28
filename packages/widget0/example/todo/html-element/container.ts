import { WidgetTagArray } from "../../..";

export default [
  ["container"] as WidgetTagArray,
  {
    parameters: { children: {} },
    create(params) {
      const e = document.createElement("div");
      e.replaceChildren(...params.children);
      return e;
    },
  },
] as const;
