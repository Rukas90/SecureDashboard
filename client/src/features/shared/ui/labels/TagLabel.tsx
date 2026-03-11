import type React from "react"

export type TagLabelStyle = "amber" | "red" | "green" | "gray"

interface Props extends Pick<
  React.ComponentProps<"div">,
  "className" | "children"
> {
  style?: TagLabelStyle
}

const styleMap: Record<TagLabelStyle, string> = {
  amber: "text-amber-400 border-amber-700 bg-amber-950",
  red: "text-red-400 border-red-800 bg-red-950",
  green: "text-green-400 border-green-800 bg-green-950",
  gray: "text-gray-400 border-gray-800 bg-gray-950",
}

const TagLabel = ({ style = "amber", className, children }: Props) => {
  return (
    <span
      className={`${className} ${styleMap[style]} max-h-full text-xs font-medium border rounded-full px-1.5 py-0.5`}
    >
      {children}
    </span>
  )
}
export default TagLabel
