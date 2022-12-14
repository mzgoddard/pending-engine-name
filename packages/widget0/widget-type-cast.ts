import {
  WidgetType,
  WidgetLiteralType,
  WidgetVoidType,
  WidgetAnyType,
  WidgetArrayType,
  WidgetTupleType,
  WidgetObjectType,
  WidgetFunctionType,
  WidgetUnionType,
} from "./widget-type";

type FromWidgetTupleTypeItems<T extends readonly WidgetType[]> = T extends []
  ? []
  : T extends [infer T2, ...infer TRest]
  ? [
      FromWidgetType<Extract<T2, WidgetType>>,
      ...FromWidgetTupleTypeItems<Extract<TRest, readonly WidgetType[]>>
    ]
  : never;
type FromWidgetTupleType<T extends WidgetType> = T extends {
  items: (infer I)[];
}
  ? FromWidgetTupleTypeItems<Extract<I, readonly WidgetType[]>>
  : never;

export type FromWidgetType<T extends WidgetType> = T extends WidgetLiteralType
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
