export function parseStory(text) {
  const lines = text.split("\n");

  return lines.map((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) return { type: "gap", content: "" };

    if (trimmed.startsWith('"') && trimmed.endsWith('"'))
      return { type: "dialogue", content: trimmed };

    if (trimmed.length < 25)
      return { type: "beat", content: trimmed };

    if (trimmed.endsWith("..."))
      return { type: "suspense", content: trimmed };

    return { type: "narration", content: trimmed };
  });
}
