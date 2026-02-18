import { useMemo } from "react";
import "./storyPlayer.css";

/*
  Story Grammar (writers unknowingly follow this)

  "Hello"  -> dialogue
  ...      -> pause
  —        -> action beat
  CAPS     -> emphasis
*/

function parse(text) {
  if (!text) return [];

  const lines = text.split("\n");

  return lines.map((line, i) => {
    const t = line.trim();

    if (!t) return { type: "space", id: i };

    // dialogue
    if (t.startsWith('"') && t.endsWith('"'))
      return { type: "dialogue", value: t.replace(/"/g, ""), id: i };

    // pause
    if (t === "..." || t === "—")
      return { type: "pause", value: t, id: i };

    // emphasis (ALL CAPS)
    if (t === t.toUpperCase() && t.length > 3)
      return { type: "emphasis", value: t, id: i };

    // normal narration
    return { type: "text", value: t, id: i };
  });
}

export default function StoryPlayer({ text, theme }) {
  const nodes = useMemo(() => parse(text), [text]);

  return (
    <div className={`player theme-${theme}`}>
      {nodes.map(node => {
        switch (node.type) {

          case "dialogue":
            return <p key={node.id} className="sp-dialogue">“{node.value}”</p>;

          case "pause":
            return <div key={node.id} className="sp-pause">{node.value}</div>;

          case "emphasis":
            return <p key={node.id} className="sp-emphasis">{node.value}</p>;

          case "space":
            return <div key={node.id} className="sp-space" />;

          default:
            return <p key={node.id} className="sp-text">{node.value}</p>;
        }
      })}
    </div>
  );
}
