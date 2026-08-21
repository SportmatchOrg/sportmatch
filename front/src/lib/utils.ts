import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const DESIGN_SYSTEM_TEXT_SIZES = [
  "hero",
  "display",
  "title",
  "body",
  "callout",
  "caption",
  "overline",
  "stat",
]

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: DESIGN_SYSTEM_TEXT_SIZES }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
