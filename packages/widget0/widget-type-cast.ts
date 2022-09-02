import {
  WidgetType,
  WidgetPrimitiveType,
  WidgetVoidType,
  WidgetAnyType,
  WidgetArrayType,
  WidgetTupleType,
  WidgetObjectType,
  WidgetFunctionType,
  WidgetUnionType,
  WidgetDictType,
} from "./widget-type";

type FromWidgetTupleTypeItems<T extends readonly WidgetType[]> = T extends []
  ? []
  : T extends [infer T2, ...infer TRest]
  ? [
      FromWidgetType<Extract<T2, WidgetType>>,
      ...FromWidgetTupleTypeItems<Extract<TRest, readonly WidgetType[]>>,
    ]
  : never;
type FromWidgetTupleType<T extends WidgetType> = T extends {
  items: (infer I)[];
}
  ? FromWidgetTupleTypeItems<Extract<I, readonly WidgetType[]>>
  : never;

export type FromWidgetType<T extends WidgetType> = T extends WidgetPrimitiveType
  ? T extends { type: "boolean" }
    ? boolean
    : T extends { type: "number" }
    ? number
    : T extends { type: "string" }
    ? string
    : T extends { type: "symbol" }
    ? symbol
    : never
  : T extends WidgetVoidType
  ? undefined
  : T extends WidgetAnyType
  ? any
  : T extends WidgetArrayType
  ? T extends { items: infer T2 }
    ? FromWidgetType<Extract<T2, WidgetType>>[]
    : never
  : T extends WidgetTupleType
  ? FromWidgetTupleType<T>
  : T extends WidgetDictType
  ? T extends { values: infer T2 }
    ? { [key: string]: FromWidgetType<Extract<T2, WidgetType>> }
    : never
  : T extends WidgetObjectType
  ? T extends { props: infer TProps }
    ? {
        [key in keyof TProps]: FromWidgetType<Extract<TProps[key], WidgetType>>;
      }
    : never
  : T extends WidgetFunctionType
  ? T extends { arguments: infer Args; return: infer R }
    ? (
        ...args: Extract<
          FromWidgetType<{
            type: "tuple";
            items: Extract<Args, readonly WidgetType[]>;
          }>,
          any[]
        >
      ) => FromWidgetType<Extract<R, WidgetType>>
    : never
  : T extends WidgetUnionType
  ? T extends { left: infer L; right: infer R }
    ?
        | FromWidgetType<Extract<L, WidgetType>>
        | FromWidgetType<Extract<R, WidgetType>>
    : never
  : never;

export type InferWidgetType<T> = T extends WidgetType
  ? T
  : T extends boolean
  ? { type: "boolean" }
  : T extends number
  ? { type: "number" }
  : T extends string
  ? { type: "string" }
  : T extends []
  ? { type: "tuple"; items: [] }
  : T extends [infer First, ...infer Rest]
  ? {
      type: "tuple";
      items: [
        InferWidgetType<First>,
        ...Extract<InferWidgetType<Rest>["items"], any[]>,
      ];
    }
  : T extends (infer I)[]
  ? { type: "array"; items: InferWidgetType<I> }
  : T extends (...args: infer Args) => infer Return
  ? {
      type: "func";
      arguments: InferWidgetType<Args>["items"];
      return: InferWidgetType<Return>;
    }
  : T extends { [key: string]: any }
  ? string extends keyof T
    ? { type: "dict"; values: InferWidgetType<T[any]> }
    : { type: "object"; props: { [key in keyof T]: InferWidgetType<T[key]> } }
  : T extends never
  ? { type: "void" }
  : T extends void
  ? { type: "void" }
  : { type: "any" };

type A1 = InferWidgetType<[string, number, boolean]>;
type A2 = InferWidgetType<(a: string, b: number) => void>;
type A3 = InferWidgetType<{ [key: string]: number[] }>;
type A4 = InferWidgetType<{ a: string; b: number }>;
