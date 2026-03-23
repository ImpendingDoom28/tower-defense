import type { ChangeEvent } from "react";

type NumberInputElement = HTMLInputElement | HTMLSelectElement;

/** Same as `Number(value) \|\| whenFalsy` for controlled numeric inputs. */
export const parseNumberInputOr = (
  event: ChangeEvent<NumberInputElement>,
  whenFalsy: number,
): number => {
  const n = Number(event.target.value);
  return n || whenFalsy;
};

/** Returns `fallback` only when the value is `NaN`; keeps `0`. */
export const parseFiniteNumberFromEvent = (
  event: ChangeEvent<NumberInputElement>,
  fallback: number,
): number => {
  const n = Number(event.target.value);
  return Number.isNaN(n) ? fallback : n;
};
