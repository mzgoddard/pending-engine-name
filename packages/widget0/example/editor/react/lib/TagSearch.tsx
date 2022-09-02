import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  map,
  Observable,
  Subject,
  debounceTime,
  switchMap,
  tap,
  startWith,
} from "rxjs";
import { WidgetDataDefinition, WidgetTag, WidgetTagArray } from "../../../..";
import { WidgetDefinition } from "../../../../widget-data";
import {
  Database,
  useDatabase,
  WidgetTagged,
  WidgetTagSearchArray,
} from "../../database";
import { useObservable } from "./useObservable";

export const TagSearch = () => {
  const database = useDatabase();
  const [newTagItem, setNewTagItem] = useState("");
  const [tags, setTags] = useState([] as WidgetTagSearchArray);
  const results = database
    .find(fullTags(tags))
    // exclude foundations
    .filter((def) => !("create" in def));
  const inputTarget$ = useMemo(() => new Subject<HTMLInputElement>(), []);
  const suggestions$ = useMemo(
    () =>
      inputTarget$.pipe(
        map((target) => target.value),
        tap((tagItem) => {
          setNewTagItem(tagItem);
        }),
        debounceTime(16),
        startWith(""),
        map((target) => appendSearchTag(tags, target)),
        map((suggestTags) => database.findSuggestions(suggestTags)),
      ),
    [],
  );
  // const results$ =
  return (
    <>
      <TagSearchInput
        {...{ tags, setTags, inputTarget$, suggestions$, newTagItem }}
      />
      <TagSearchResults results={results} />
    </>
  );
};

function TagSearchInput({
  tags,
  setTags,
  inputTarget$,
  suggestions$,
  newTagItem,
}: {
  tags: WidgetTagged[] | [...WidgetTagged[], string[]];
  setTags: React.Dispatch<
    React.SetStateAction<WidgetTagged[] | [...WidgetTagged[], string[]]>
  >;
  inputTarget$: Subject<HTMLInputElement>;
  suggestions$: Observable<string[]>;
  newTagItem: string;
}) {
  return (
    <>
      <div>
        {tags.map((tag, index) => (
          <div>
            <button onClick={() => setTags(dropIndex(tags, index))}>
              remove
            </button>
            {tag.join(" ")}
          </div>
        ))}
        <form onSubmit={(ev) => ev.preventDefault()}>
          <input
            type="text"
            list="tag-suggestions"
            onKeyDown={({ target }) => {
              inputTarget$.next(target);
            }}
            onChange={(ev) => inputTarget$.next(ev.target)}
          ></input>
          <datalist id="tag-suggestions">
            <TagSuggestions suggestions$={suggestions$}></TagSuggestions>
          </datalist>
          <button onClick={() => setTags(appendSearchTag(tags, newTagItem))}>
            add
          </button>
        </form>
      </div>
    </>
  );
}

function TagSearchResults({ results }: { results: WidgetDefinition[] }) {
  return (
    <>
      <div>results</div>
      <table>
        {results.map((def) => (
          <tr>
            <td>
              <Link to={`/widget/${def.id}/edit`}>
                <span style={{ fontFamily: "monospace" }}>{def.id}</span>
              </Link>
            </td>
            <td>
              {def.tags.map((tag) => (
                <>
                  <span>{tag.join(" ")}</span>{" "}
                </>
              ))}
            </td>
          </tr>
        ))}
      </table>
    </>
  );
}

function dropIndex(
  tags: WidgetTagSearchArray,
  index: number,
): WidgetTagSearchArray {
  return [
    ...tags.slice(0, index),
    ...tags.slice(index + 1),
  ] as WidgetTagSearchArray;
}

const TagSuggestions = ({
  suggestions$,
}: {
  suggestions$: Observable<string[]>;
}) => {
  const suggestions = useObservable(suggestions$, []);
  console.log("suggestions", suggestions);
  return (
    <>
      {suggestions.map((suggestTag) => (
        <option value={suggestTag} />
      ))}
    </>
  );
};

const TagArrayView = ({ tags }: { tags: WidgetTagArray }) => {
  return (
    <div>
      {tags.map((tag) =>
        typeof tag === "string" ? (
          <span>{tag}</span>
        ) : (
          <span>{tag.join("/")}</span>
        ),
      )}
    </div>
  );
};

function fullTags(tags: WidgetTagSearchArray): WidgetTagArray {
  if (tags.length > 0 && tags[tags.length - 1].length === 0) {
    return tags.slice(0, tags.length - 1) as WidgetTagArray;
  }
  return tags as WidgetTagArray;
}

function appendSearchTag(
  tags: WidgetTagSearchArray,
  target: string,
): WidgetTagSearchArray {
  if (target.trim() === "") {
    if (tags.length === 0 || tags[tags.length - 1].length === 0) {
      return tags;
    }
    return [...(tags as WidgetTagged[]), []];
  }
  return [
    ...(tags as WidgetTagged[]).slice(0, tags.length - 1),
    [...(tags[tags.length - 1] ?? []), target],
  ];
}

function containString(goal: string, target: string) {
  return target.indexOf(goal) > -1;
}

function containTag(goal: WidgetTag, target: WidgetTag) {
  if (typeof goal === "string") {
    if (typeof target !== "string") {
      return false;
    }
    return containString(goal, target);
  }
  if (goal.length === 0) {
    return true;
  }
  if (goal.length > target.length) {
    return false;
  }
  for (let i = 0; i < goal.length - 1; i++) {
    if (goal[i] !== target[i]) {
      return false;
    }
  }
  return containString(goal[goal.length - 1], target[goal.length - 1]);
}

function containTagArray(goal: WidgetTagArray, target: WidgetTagArray) {
  for (let i = 0; i < goal.length; i++) {
    const subgoal = goal[i];
    let foundSubgoal = false;
    for (let j = 0; j < target.length; j++) {
      if (containTag(subgoal, target[j])) {
        foundSubgoal = true;
        break;
      }
    }
    if (!foundSubgoal) {
      return false;
    }
  }
  return true;
}

function scoreTagArray(goal: WidgetTagArray, target: WidgetTagArray) {}
