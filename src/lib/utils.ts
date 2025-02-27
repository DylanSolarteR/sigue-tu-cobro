import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { KeyboardEvent } from "react";
export const onlyNumberInput = (e: KeyboardEvent) => {
  if (!/[0-9]|Delete| |-|Backspace|ArrowLeft|Tab|ArrowRight/i.test(e.key)) {
    e.preventDefault()
  }
};

export const priceInput = (e: KeyboardEvent) => {
  if (!/[0-9]|Delete|Backspace|ArrowLeft|Tab|ArrowRight/i.test(e.key)) {
    e.preventDefault()
  }
};