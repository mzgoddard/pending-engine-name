import { castFoundation } from "../../../../cast";
import { jsxElementWidgetType } from "../../../../level2-react";
import widgetTypeFactory from "../../../../widget-type-factory";

export default castFoundation({
  id: "react-foundation-text",
  tags: [["text"]],
  parameters: {
    children: widgetTypeFactory.arrayOf(widgetTypeFactory.string),
  },
  return: widgetTypeFactory.string,
  create(params) {
    return params.children.join("");
  },
});
