import {
  WidgetAnyType,
  WidgetArrayType,
  WidgetFunctionType,
  WidgetLiteralType,
  WidgetObjectType,
  WidgetTupleType,
  WidgetType,
  WidgetUnionType,
  WidgetVoidType,
} from "./widget-type";
import {
  WidgetComparisonOperator,
  WidgetComparisonValue,
  WidgetComputeValue,
  WidgetConditionValue,
  WidgetDeferValue,
  WidgetDirectValue,
  WidgetMapValue,
  WidgetMemberValue,
  WidgetParameterValue,
  WidgetPropertyValue,
  WidgetRef,
  WidgetShapeValue,
  WidgetTag,
  WidgetTagArray,
  WidgetTupleValue,
  WidgetValue,
} from "./widget-value";
import { WidgetData } from "./widget-data";
import { FromWidgetType } from "./widget-type-cast";
import { TransformValue } from "./widget-value-cast";

// Export "./widget-type".
export {
  WidgetAnyType,
  WidgetArrayType,
  WidgetFunctionType,
  WidgetLiteralType,
  WidgetObjectType,
  WidgetTupleType,
  WidgetType,
  WidgetUnionType,
  WidgetVoidType,
};

// Export "./widget-type-cast".
export { FromWidgetType };

// Export "./widget-value".
export {
  WidgetComparisonOperator,
  WidgetComparisonValue,
  WidgetComputeValue,
  WidgetConditionValue,
  WidgetDeferValue,
  WidgetDirectValue,
  WidgetMapValue,
  WidgetMemberValue,
  WidgetParameterValue,
  WidgetPropertyValue,
  WidgetRef,
  WidgetShapeValue,
  WidgetTag,
  WidgetTagArray,
  WidgetTupleValue,
  WidgetValue,
};

// Export "./widget-value-cast".
export { TransformValue };

// Export "./widget-data".
export { WidgetData };

export interface WidgetDatabase {
  search(id: WidgetTagArray): AsyncIterable<WidgetData>;
}

export interface WidgetFoundation<T> {
  search<P>(id: WidgetTagArray): Promise<WidgetClass<T, P> | null>;
}

export interface WidgetDataPicker {
  compare(first: WidgetData, second: WidgetData): number;
}

export interface PickWidgetData {
  (from: WidgetData[], picker: WidgetDataPicker): WidgetData;
}

interface WidgetSuggestions {
  suggestIdKey(id: WidgetTagArray, key: string): Promise<string>;
  suggestIdValue(
    id: WidgetTagArray,
    key: string,
    value: string
  ): Promise<string>;
  suggestParamKey(id: WidgetTagArray, paramKey: string): Promise<string>;
}

export interface WidgetBuilder<T> {
  build<P>(data: WidgetData): Promise<WidgetClass<T, P>>;
}

export interface WidgetClass<T, P> {
  create(parameters: P): T;
}

export interface WidgetFoundationClass<
  T,
  P extends { [key: string]: WidgetType }
> {
  readonly parameters: P;
  create(params: { [key in keyof P]: FromWidgetType<P[key]> }): T;
}
