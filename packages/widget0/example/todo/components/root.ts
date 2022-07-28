import { WidgetData, WidgetTagArray } from "../../..";

export const componentRoot = [
  ["root"] as WidgetTagArray,
  {
    parameters: {},
    body: {
      tags: [["controller", "root"]],
      parameters: {
        child: {
          argument: "root",
          compute: {
            tags: ["container"],
            parameters: {
              children: {
                items: [
                  {
                    tags: ["container"],
                    parameters: {
                      children: {
                        target: {
                          target: { parameter: "root" },
                          property: "todos",
                        },
                        argument: "todo",
                        map: {
                          tags: ["todo"],
                          parameters: { todo: { parameter: "todo" } },
                        },
                      },
                    },
                  },
                  {
                    tags: ["add-todo"],
                    parameters: {
                      create: {
                        target: { parameter: "root" },
                        property: "create",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  } as WidgetData,
] as const;
