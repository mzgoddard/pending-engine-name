import { cloneElement } from "react";
import { castFoundation } from "../../../../cast";
import { jsxElementWidgetType } from "../../../../level2-react";
import widgetTypeFactory from "../../../../widget-type-factory";

export default castFoundation({
  id: "react-foundation-style",
  tags: [["style"]],
  parameters: {
    element: jsxElementWidgetType,
    style: widgetTypeFactory.dictOf(widgetTypeFactory.string),
  },
  return: jsxElementWidgetType,
  create(params) {
    return cloneElement(params.element, {
      style: { ...(params.element?.props?.style ?? {}), ...params.style },
    }) as React.ReactElement;
  },
});
