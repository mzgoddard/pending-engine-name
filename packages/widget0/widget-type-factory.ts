import {
  WidgetIdType,
  WidgetPathType,
  WidgetRootType,
  WidgetType,
} from "./widget-type";

export type WidgetPathOf<
  T extends WidgetIdType | WidgetRootType | WidgetPathType,
  P extends string[],
> = P extends [infer First, ...infer Rest]
  ? WidgetPathOf<
      { type: "path"; target: T; path: Extract<First, string> },
      Extract<Rest, string[]>
    >
  : P extends []
  ? T
  : never;

export type WidgetRootPathOf<T extends string[]> = T extends [infer First]
  ? { type: "root"; parameter: First }
  : T extends [infer First, ...infer Rest]
  ? {
      type: "path";
      target: WidgetRootPathOf<Extract<Rest, string[]>>;
      path: First;
    }
  : never;

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

export type WidgetLiteralTupleOf<T extends string[]> = T extends [
  infer First,
  ...infer Rest,
]
  ? [
      { type: "literal"; literal: First },
      ...WidgetLiteralTupleOf<Extract<Rest, string[]>>,
    ]
  : T extends []
  ? []
  : never;

export const any = { type: "any" } as const;
export const boolean = { type: "boolean" } as const;
export const number = { type: "number" } as const;
export const primitive = { type: "primitive" } as const;
export const string = { type: "string" } as const;
export const voidType = { type: "void" } as const;

export const pathOf = <
  T extends WidgetIdType | WidgetRootType | WidgetPathType,
  P extends string[],
>(
  type: T,
  ...path: P
) => {
  return path.reduce(
    (target: WidgetIdType | WidgetRootType | WidgetPathType, key) =>
      ({ type: "path", target, path: key } as WidgetPathType),
    type,
  ) as WidgetPathOf<T, P>;
};

const idPath = <I extends string, S extends string, T extends string[]>(
  id: I,
  parameter: S,
  ...path: T
) => {
  return pathOf({ type: "id", id, parameter }, ...path);
};

export const rootPath = <S extends string, T extends string[]>(
  parameter: S,
  ...path: T
) => {
  return pathOf({ type: "root", parameter }, ...path);
};

export const unionOf = <T extends [] | WidgetType[]>(
  types: T,
): WidgetUnionOf<T> => {
  if (types.length === 0) {
    return { type: "any" } as any;
  }
  return types
    .slice(1)
    .reduce((left, right) => ({ type: "union", left, right }), types[0]) as any;
};

export default {
  any,
  boolean,
  number,
  primitive,
  string,
  void: voidType,
  voidType,

  pathOf,
  idPath,
  rootPath,
  literal<T extends boolean | number | string>(literal: T) {
    return { type: "literal", literal } as const;
  },
  optional<T extends WidgetType>(type: T) {
    return { type: "union", left: type, right: { type: "void" } } as const;
  },
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
  unionOf,
  enumOf<T extends [] | string[]>(
    ...values: T
  ): WidgetUnionOf<WidgetLiteralTupleOf<T>> {
    return unionOf(
      values.map(
        (value: string) => ({ type: "literal", literal: value } as const),
      ),
    );
  },
};
