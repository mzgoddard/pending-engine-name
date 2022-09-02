import { Observable, Subject } from "rxjs";
import { createContext, useContext, useEffect, useState } from "react";
import { WidgetFoundation, WidgetTagArray } from "../..";
import {
  WidgetDataDefinition,
  WidgetDefinition,
  WidgetFoundationDefinition,
} from "../../widget-data";
import { fulfillsType, inferType } from "../../fit-type";
import wtFactory from "../../widget-type-factory";
import reactFoundation from "./react/foundation";

export type WidgetTagged = [string, ...string[]];

export type WidgetTagSearchArray =
  | WidgetTagged[]
  | [...WidgetTagged[], string[]];

export interface Database {
  update$: Observable<Database>;

  defs(): Iterable<WidgetDefinition>;

  get(id: string): WidgetDefinition;
  update(def: WidgetDataDefinition): Promise<void>;

  find(tags: WidgetTagArray): WidgetDefinition[];
  findSuggestions(searchTags: WidgetTagSearchArray): string[];
}

export interface SearchAgent {}

export const create = (defs: WidgetDefinition[]): Database => {
  console.log(defs);
  const update$ = new Subject();
  return {
    update$: update$ as Observable<Database>,

    defs() {
      return defs;
    },

    get(widgetId) {
      const def = defs.find(({ id }) => id === widgetId);
      if (!def) {
        throw new Error(`no such definition ${widgetId}`);
      }
      return def;
    },
    async update(def) {
      defs = replaceIndex(
        defs,
        defs.findIndex(({ id }) => def.id === id),
        def,
      );
      await saveDef(def);
      await saveDefs(
        defs.filter((def) => !("create" in def)).map(({ id }) => id),
      );
      update$.next(this);
    },
    find(tags) {
      if (tags.length === 0) {
        return defs;
      }
      const suggestTag = tags[tags.length - 1];
      const [suggestKey] = suggestTag;
      const suggestArgs = suggestTag.slice(1, suggestTag.length - 1);
      const suggestTargetIndex = suggestTag.length - 1;
      const suggestTarget = suggestTag[suggestTargetIndex];
      const suggestFilterTags =
        suggestTag.length > 1 ? [[suggestKey, ...suggestArgs]] : [];
      const filterTags = [
        ...tags.slice(0, tags.length - 1),
        ...suggestFilterTags,
      ];
      return defs.filter(
        (data) =>
          tags.length === 0 ||
          tags.every(([filterKey, ...filterArgs]) =>
            data.tags.find(
              ([key, ...args]) =>
                key === filterKey &&
                filterArgs.every((filter, index) => args[index] === filter),
            ),
          ),
      );
    },
    findSuggestions(searchTags) {
      if (searchTags.length === 0) {
        return defs
          .flatMap(({ tags }) => tags.map(([key]) => key))
          .reduce((carry, item) => {
            if (carry.includes(item)) {
              return carry;
            }
            carry.push(item);
            return carry;
          }, [] as string[]);
      }
      const suggestTag = searchTags[searchTags.length - 1] ?? [];
      const [suggestKey] = suggestTag;
      const suggestArgs = suggestTag.slice(1, suggestTag.length - 1);
      const suggestTargetIndex = suggestTag.length - 1;
      const suggestTarget = suggestTag[suggestTargetIndex];
      const suggestFilterTags =
        suggestTag.length > 1 ? [[suggestKey, ...suggestArgs]] : [];
      const filterTags = [
        ...searchTags.slice(0, searchTags.length - 1),
        ...suggestFilterTags,
      ];
      const defsFilter1 = defs.filter(
        (data) =>
          filterTags.length === 0 ||
          filterTags.every(([filterKey, ...filterArgs]) =>
            data.tags.find(
              ([key, ...args]) =>
                key === filterKey &&
                filterArgs.every((filter, index) => args[index] === filter),
            ),
          ),
      );
      const defsFilter2 =
        suggestTargetIndex === 0
          ? defsFilter1.filter((data) =>
              data.tags.some(([key]) => key.indexOf(suggestTarget) >= 0),
            )
          : defsFilter1.filter((data) =>
              data.tags.some(
                ([key, ...args]) =>
                  key === suggestKey &&
                  args.length >= suggestTargetIndex &&
                  args[suggestTargetIndex].indexOf(suggestTarget) >= 0,
              ),
            );
      const defsFilterMap = defsFilter2.map((data) =>
        suggestTag.length === 0
          ? data.tags.map(([key]) => key)
          : data.tags
              .filter(([key]) =>
                suggestTargetIndex === 0
                  ? key.indexOf(suggestKey) >= 0
                  : key === suggestKey,
              )
              .map((tag) => tag[suggestTargetIndex]),
      );
      return defsFilterMap.reduce(
        (carry, suggest) => [
          ...carry,
          ...suggest.filter(
            (item, index) =>
              carry.indexOf(item) === -1 && suggest.indexOf(item) === index,
          ),
        ],
        [],
      );
    },
  };
};

export const load = async () => create(await loadDefs());

export const loadFoundation = async () => {
  return reactFoundation;
};

export const loadDefs = async () => {
  const defs = JSON.parse(localStorage.getItem("widgets") || "[]");
  const defsType = inferType(defs);
  if (!fulfillsType(wtFactory.arrayOf(wtFactory.string), defsType).same) {
    if (
      fulfillsType(
        wtFactory.arrayOf(wtFactory.objectOf({ id: wtFactory.string })),
        defsType,
      ).same
    ) {
      await Promise.all(defs.map(saveDef));
      await saveDefs(defs.map(({ id }) => id));
      return loadDefs();
    }
    throw new Error();
  }
  return [
    ...(await Promise.all(defs.map(loadDef))),
    ...(await loadFoundation()),
  ];
};

const loadDef = async (id: string) => {
  return JSON.parse(localStorage.getItem(`widgets-${id}`) || "");
};

export const saveDefs = async (defs: string[]) => {
  localStorage.setItem("widgets", JSON.stringify(defs));
};

export const saveDef = async (def: WidgetDataDefinition) => {
  localStorage.setItem(`widgets-${def.id}`, JSON.stringify(def));
};

export const DatabaseContext = createContext(create([]));
export const { Consumer: DatabaseConsumer, Provider: DatabaseProvider } =
  DatabaseContext;

export const useDatabase = () => {
  const [state, setState] = useState(0);
  const database = useContext(DatabaseContext);
  useEffect(() => {
    let effect = 0;
    const subscription = database.update$.subscribe({
      next: () => setState(state + ++effect),
    });
    return () => subscription.unsubscribe();
  });
  return database;
};

function replaceIndex(array, index, replacement) {
  return [...array.slice(0, index), replacement, ...array.slice(index + 1)];
}
