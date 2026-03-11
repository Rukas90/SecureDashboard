import clsx from "clsx"

type DrawLine = "left" | "right" | "both"

interface Props extends Pick<
  React.ComponentProps<"div">,
  "children" | "className"
> {
  drawLine?: DrawLine
}
const DividerLabel = ({ drawLine = "both", children, className }: Props) => {
  const line = <div aria-hidden className="grow h-px bg-stone-800" />
  return (
    <div
      className={clsx(
        className,
        "flex flex-row justify-center items-center gap-4 w-full",
      )}
    >
      {drawLine !== "right" && line}
      <p className="p-0 m-0 xs:whitespace-nowrap text-center">{children}</p>
      {drawLine !== "left" && line}
    </div>
  )
}
export default DividerLabel
