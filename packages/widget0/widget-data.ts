import { WidgetType, WidgetTypeParameters } from "./widget-type";
import { WidgetTagArray, WidgetValue } from "./widget-value";

export interface WidgetData {
  parameters: WidgetTypeParameters;
  body: WidgetValue;
}

export interface WidgetDataDefinition {
  id: string;
  description?: string;
  tags: WidgetTagArray;
  parameters: WidgetTypeParameters;
  body: WidgetValue;
}

export interface WidgetFoundationDefinition {
  id: string;
  description?: string;
  tags: WidgetTagArray;
  parameters: WidgetTypeParameters;
  return: WidgetType;
}

export type WidgetDefinition =
  | WidgetDataDefinition
  | WidgetFoundationDefinition;

export function isDataDefinition(
  def: WidgetDefinition,
): def is WidgetDataDefinition {
  return !("create" in def);
}

export function isFoundationDefintion(
  def: WidgetDefinition,
): def is WidgetFoundationDefinition {
  return "create" in def;
}
