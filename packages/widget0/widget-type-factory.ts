import { WidgetType } from "./widget-type";

export type WidgetUnionOf<T extends WidgetType[]> = T extends [infer First]
  ? Extract<First, WidgetType>
  : T extends [infer First, ...infer Rest]
  ? {
      type: "union";
      left: Extract<First, WidgetType>;
      right: WidgetUnionOf<Extract<Rest, WidgetType[]>>;
    }
  : T extends []
  ? { type: "any" }
  : never;

export default {
  any: { type: "any" } as const,
  boolean: { type: "boolean" } as const,
  number: { type: "number" } as const,
  primitive: { type: "primitive" } as const,
  string: { type: "string" } as const,
  void: { type: "void" } as const,

  arrayOf<T extends WidgetType>(items: T) {
    return { type: "array", items } as const;
  },
  dictOf<T extends WidgetType>(values: T) {
    return { type: "dict", values } as const;
  },
  functionOf<A extends WidgetType[], R extends WidgetType>(
    argumentTypes: A,
    returnType: R,
  ) {
    return {
      type: "function",
      arguments: argumentTypes,
      return: returnType,
    } as const;
  },
  objectOf<T extends { [key: string]: WidgetType }>(props: T) {
    return { type: "object", props } as const;
  },
  tupleOf<T extends [] | WidgetType[]>(items: T) {
    return { type: "tuple", items } as const;
  },
  unionOf<T extends [] | WidgetType[]>(types: T): WidgetUnionOf<T> {
    if (types.length === 0) {
      return { type: "any" } as any;
    }
    return types
      .slice(1)
      .reduce(
        (left, right) => ({ type: "union", left, right }),
        types[0],
      ) as any;
  },
};
