import { WidgetClass, WidgetTagArray } from "../../..";

export const foundationText: readonly [WidgetTagArray, WidgetClass<any, any>] =
  [
    ["text"],
    {
      create(params) {
        return params.children.join("");
      },
    },
  ];
