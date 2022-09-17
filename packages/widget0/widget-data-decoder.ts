import {
  WidgetDataDefinition,
  WidgetDefinition,
  WidgetFoundationDefinition,
} from "./widget-data";
import { WidgetType, WidgetTypeParameters } from "./widget-type";
import { WidgetValue } from "./widget-value";

export function* listTypeIds(type: WidgetType): Iterable<string> {}
export function* listValueIds(value: WidgetValue): Iterable<string> {}
export function* listDataIds(def: WidgetDataDefinition): Iterable<string> {}
export function* listFoundationIds(
  def: WidgetFoundationDefinition,
): Iterable<string> {}
export function* listDefinitionIds(def: WidgetDefinition): Iterable<string> {}

export async function decodeType(
  type: WidgetType,
  def: WidgetDefinition,
  lookupDefinition: (id: string) => Promise<WidgetDefinition>,
): Promise<WidgetType> {}
export async function decodeTypeParameters(
  typeParameters: WidgetTypeParameters,
  def: WidgetDefinition,
  lookupDefinition: (id: string) => Promise<WidgetDefinition>,
): Promise<WidgetType> {}
