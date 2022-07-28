import { WidgetTagArray } from "../../..";

const todos = [] as { description: string }[];
const addTodo = { description: "" };

let lastElement: HTMLElement;

export default [
  [["controller", "root"]] as WidgetTagArray,
  {
    parameters: {
      child: {
        type: "function",
        arguments: [
          {
            todos: { type: "array", items: { type: "object", properties: {} } },
            create: {
              type: "function",
              arguments: [],
              return: { type: "void" },
            },
          },
        ],
        return: { type: { type: "object", properties: {} } },
      },
    },
    create(params) {
      const self = this;
      const newElement = params.child({
        todos,
        create(newTodo) {
          todos.push(newTodo);
          self.create(params);
        },
      });
      if (lastElement) {
        lastElement.parentElement?.replaceChild(newElement, lastElement);
      }
      return (lastElement = newElement);
    },
  },
] as const;
