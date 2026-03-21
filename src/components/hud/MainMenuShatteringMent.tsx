import type { CSSProperties, FC } from "react";

type MainMenuShatteringMentProps = {
  word: string;
};

type LetterOcclusionVars = {
  maskAngle: string;
};

const MENT_SUFFIX = "ment";

const LETTER_VARS: LetterOcclusionVars[] = [
  { maskAngle: "180deg" },
  { maskAngle: "0deg" },
  { maskAngle: "-90deg" },
  { maskAngle: "180deg" },
];

const toWrapStyle = (v: LetterOcclusionVars): CSSProperties =>
  ({
    "--ment-mask-angle": v.maskAngle,
  }) as CSSProperties;

export const MainMenuShatteringMent: FC<MainMenuShatteringMentProps> = ({
  word,
}) => {
  const lower = word.toLowerCase();

  if (!lower.endsWith(MENT_SUFFIX)) {
    return <span className="whitespace-nowrap">{word}</span>;
  }

  const stem = word.slice(0, -MENT_SUFFIX.length);
  const mentLetters = word.slice(-MENT_SUFFIX.length).split("");

  return (
    <span className="whitespace-nowrap">
      {stem}
      {mentLetters.map((ch, i) => {
        const vars = LETTER_VARS[i];
        if (!vars) {
          return <span key={`${ch}-${i}`}>{ch}</span>;
        }
        return (
          <span
            key={`${ch}-${i}`}
            className="title-ment-letter-wrap"
            style={toWrapStyle(vars)}
          >
            <span className="title-ment-glyph">{ch}</span>
          </span>
        );
      })}
    </span>
  );
};
