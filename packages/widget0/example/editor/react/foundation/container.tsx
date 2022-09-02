import React from "react";

import { castFoundation } from "../../../../cast";
import {
  jsxElementWidgetType,
  jsxNodeWidgetType,
} from "../../../../level2-react";

export default castFoundation({
  id: "react-foundation-container",
  tags: [["container"]],
  parameters: {
    children: jsxNodeWidgetType,
  },
  return: jsxElementWidgetType,
  create(params) {
    return <div>{params.children}</div>;
  },
});
