import { WidgetTagArray } from "../../..";

export default [
  ["text"] as WidgetTagArray,
  {
    create(params) {
      return params.children.join("");
    },
  },
] as const;
