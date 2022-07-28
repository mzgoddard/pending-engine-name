import { WidgetTagArray } from "../../..";

export default [
  [["controller", "add-todo"]] as WidgetTagArray,
  {
    create(params) {
      let description = "";
      return params.child({
        description,
        setDescription(newDescription) {
          description = newDescription;
        },
        create() {
          params.create({ description });
        },
      });
    },
  },
] as const;
