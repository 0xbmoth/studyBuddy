import { MCQs } from "../types/mcq";

export function formatJson(jsonString: string) {
  if (!jsonString) {
    return "";
  }
  return jsonString.replace(/```json\n|```/g, "");
}

export default function formatString(string: string, numlines: number) {
  const paraLength = Math.round(string.length / numlines);
  const paragraphs = [];
  for (let i = 0; i < numlines; i++) {
    let marker = paraLength;
    //if the marker is right after a space, move marker back one character
    if (string.charAt(marker - 1) == " ") {
      marker--;
    }
    //move marker to end of a word if it's in the middle
    while (string.charAt(marker) != " " && string.charAt(marker) != "") {
      marker++;
    }
    const nextPara = string.substring(0, marker);
    paragraphs.push(nextPara);
    string = string.substring(nextPara.length + 1, string.length);
  }
  return paragraphs;
}

export function formatMcq(mcq: MCQs): MCQs {
  return {
    ...mcq,
    mcqs: mcq.mcqs.map((q) => ({
      ...q,
      answered: false,
    })),
  };
}
