import React, { useState } from "react";
import { WidgetTagArray } from "../../../../widget-value";

interface AddTagStateInit {
  step: "init";
}

interface AddTagStateTags {
  step: "tags";
  tags: string[];
  newTag: string;
}

type AddTagState = AddTagStateInit | AddTagStateTags;

export function WidgetAddTagEditor({
  setTags,
  tags,
}: {
  setTags: (tags: WidgetTagArray) => void;
  tags: WidgetTagArray;
}) {
  const [tagState, setTagState] = useState(
    () => ({ step: "init" } as AddTagState),
  );
  console.log(tagState);
  if (tagState.step === "init") {
    return (
      <div>
        <button
          onClick={() => setTagState({ step: "tags", tags: [], newTag: "" })}
        >
          new tag
        </button>
      </div>
    );
  }
  const [newTagItem, setNewTagItem] = [
    tagState.newTag,
    (item) => setTagState({ ...tagState, newTag: item }),
  ];
  return (
    <div>
      <div>
        <input
          key={tagState.tags.length}
          type="text"
          onChange={(ev) => setNewTagItem(ev.target.value)}
        ></input>
        <button
          onClick={() =>
            setTagState({
              step: "tags",
              tags: [...tagState.tags, newTagItem],
              newTag: "",
            })
          }
        >
          add
        </button>
        <button
          onClick={() => {
            setTags([...tags, tagState.tags as any]);
            setTagState({ step: "init" });
          }}
          disabled={tagState.tags.length === 0}
        >
          save
        </button>
        <button onClick={() => setTagState({ step: "init" })}>clear</button>
      </div>
      <div>{tagState.tags.join(" ")}</div>
    </div>
  );
}
