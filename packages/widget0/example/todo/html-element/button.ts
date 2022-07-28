import { WidgetTagArray } from "../../..";

export default [
  ["button"] as WidgetTagArray,
  {
    create(params) {
      const button = document.createElement("button");
      button.replaceChildren(params.children);
      if (params.click) {
        button.onclick = () => params.click();
      }
      return button;
    },
  },
] as const;
