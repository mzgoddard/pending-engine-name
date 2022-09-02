import React from "react";
import { WidgetTag, WidgetTagArray } from "../../../../widget-value";
import { WidgetAddTagEditor } from "./WidgetAddTagEditor";
import { WidgetTagsInnerEditor } from "./WidgetTagsInnerEditor";

export const WidgetTagsEditor = ({
  tags,
  setTags,
}: {
  tags: WidgetTagArray;
  setTags: (tags: WidgetTagArray) => void;
}) => {
  return (
    <details open>
      <summary>tags</summary>
      <div>
        <WidgetTagsInnerEditor
          tags={tags}
          setTags={setTags}
        ></WidgetTagsInnerEditor>
      </div>
    </details>
  );
};

function addTag(tags: WidgetTagArray, newTagItem: string): WidgetTagArray {
  if (newTagItem.trim() === "") {
    if (tags.length > 0 && tags[tags.length - 1].length > 0) {
      return [...tags, []] as any;
    }
    return tags;
  }
  return [...head(tags), [...(tags[tags.length - 1] ?? []), newTagItem]];
}

function head<T>(ary: readonly T[] = []): readonly T[] {
  return ary.slice(0, ary.length - 1);
}

export function removeIndex<T>(ary: readonly T[], index: number): T[] {
  return [...ary.slice(0, index), ...ary.slice(index + 1)];
}

export function moveIndex<T>(
  ary: readonly T[],
  index: number,
  increment: number,
): T[] {
  if (increment < 0) {
    if (index + increment <= 0) {
      return [ary[index], ...ary.slice(0, index), ...ary.slice(index + 1)];
    }
    return [
      ...ary.slice(0, index + increment),
      ary[index],
      ...ary.slice(index + increment, index),
      ...ary.slice(index + 1),
    ];
  } else if (increment > 0) {
    if (index + increment >= ary.length) {
      return [...ary.slice(0, index), ...ary.slice(index + 1), ary[index]];
    }
    return [
      ...ary.slice(0, index),
      ...ary.slice(index + 1, index + increment + 1),
      ary[index],
      ...ary.slice(index + increment + 1),
    ];
  }
  return ary.slice();
}
