export interface WidgetLiteralType {
  readonly type: "boolean" | "number" | "string" | "symbol";
}

export interface WidgetArrayType {
  readonly type: "array";
  readonly items: WidgetType;
}

export interface WidgetTupleType {
  readonly type: "tuple";
  readonly items: readonly WidgetType[];
}

export interface WidgetObjectType {
  readonly type: "object";
  readonly props: { readonly [key: string]: WidgetType };
}

export interface WidgetFunctionType {
  readonly type: "function";
  readonly arguments: readonly WidgetType[];
  readonly return: WidgetType;
}

export interface WidgetVoidType {
  readonly type: "void";
}

export interface WidgetAnyType {
  readonly type: "any";
}

export interface WidgetUnionType {
  readonly type: "union";
  readonly left: WidgetType;
  readonly right: WidgetType;
}

export type WidgetType =
  | WidgetLiteralType
  | WidgetArrayType
  | WidgetTupleType
  | WidgetObjectType
  | WidgetFunctionType
  | WidgetVoidType
  | WidgetUnionType
  | WidgetAnyType;
