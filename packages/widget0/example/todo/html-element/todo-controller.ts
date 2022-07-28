import { WidgetTagArray } from "../../..";

export default [
  [["controller", "todo"]] as WidgetTagArray,
  {
    create(params) {
      return params.child({ todos: [], create() {} });
    },
  },
] as const;
