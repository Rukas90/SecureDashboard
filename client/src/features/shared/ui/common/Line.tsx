import clsx from "clsx"

interface Props extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
  extend?: boolean
  defaultColor?: boolean
  defaultThickness?: boolean
}
const Line = ({
  orientation = "horizontal",
  extend = true,
  defaultColor = true,
  defaultThickness = true,
  className,
  ...props
}: Props) => {
  return (
    <div
      className={clsx(
        className,
        extend && (orientation === "horizontal" ? "w-full" : "h-full"),
        defaultThickness && (orientation === "horizontal" ? "h-px" : "w-px"),
        defaultColor && "bg-stone-900",
      )}
      {...props}
    />
  )
}
export default Line
