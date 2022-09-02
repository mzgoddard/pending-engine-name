import React from "react";
import { WidgetTagArray } from "../../../../widget-value";
import { WidgetAddTagEditor } from "./WidgetAddTagEditor";
import { removeIndex, moveIndex } from "./WidgetTagsEditor";

export const WidgetTagsInnerEditor = ({
  tags,
  setTags,
}: {
  tags: WidgetTagArray;
  setTags: (tags: WidgetTagArray) => void;
}) => (
  <>
    {tags.map((tag, index) => (
      <div>
        <button onClick={() => setTags(removeIndex(tags, index))}>
          remove
        </button>
        <button
          onClick={() => setTags(moveIndex(tags, index, -1))}
          disabled={index === 0}
        >
          move up
        </button>
        <button
          onClick={() => setTags(moveIndex(tags, index, 1))}
          disabled={index === tags.length - 1}
        >
          move down
        </button>
        {tag.join(" ")}
      </div>
    ))}
    <WidgetAddTagEditor setTags={setTags} tags={tags} />
  </>
);
