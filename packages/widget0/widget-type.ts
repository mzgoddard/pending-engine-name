import { WidgetTagArray, WidgetValue } from "./widget-value";

export interface WidgetPrimitiveType {
  readonly type: "boolean" | "number" | "string" | "symbol" | "primitive";
  readonly comment?: string;
}

export interface WidgetLiteralType {
  readonly type: "literal";
  readonly literal: boolean | number | string;
  readonly comment?: string;
}

export interface WidgetArrayType {
  readonly type: "array";
  readonly items: WidgetType;
  readonly comment?: string;
}

export interface WidgetTupleType {
  readonly type: "tuple";
  readonly items: readonly WidgetType[];
  readonly comment?: string;
}

export interface WidgetDictType {
  readonly type: "dict";
  readonly values: WidgetType;
  readonly comment?: string;
}

export interface WidgetObjectType {
  readonly type: "object";
  readonly props: { readonly [key: string]: WidgetType };
  readonly comment?: string;
}

export interface WidgetTypeParameters {
  [key: string]: WidgetType;
}

export interface WidgetClosureType {
  readonly type: "closure";
  readonly parameters: WidgetTypeParameters;
  readonly value: WidgetValue;
  readonly comment?: string;
}

export interface WidgetFunctionType {
  readonly type: "function";
  readonly arguments: readonly WidgetType[];
  readonly return: WidgetType;
  readonly comment?: string;
}

export interface WidgetVoidType {
  readonly type: "void";
  readonly comment?: string;
}

export interface WidgetAnyType {
  readonly type: "any";
  readonly comment?: string;
}

export interface WidgetUnionType {
  readonly type: "union";
  readonly left: WidgetType;
  readonly right: WidgetType;
  readonly comment?: string;
}

export type WidgetType =
  | WidgetPrimitiveType
  | WidgetLiteralType
  | WidgetArrayType
  | WidgetTupleType
  | WidgetDictType
  | WidgetObjectType
  | WidgetFunctionType
  | WidgetClosureType
  | WidgetVoidType
  | WidgetUnionType
  | WidgetAnyType;
