import clsx from "clsx"

interface Props extends React.ComponentProps<"p"> {
  overrideColor?: boolean
}
const PlainText = ({
  overrideColor = false,
  className,
  children,
  ...props
}: Props) => {
  return (
    <p
      {...props}
      className={clsx(!overrideColor && "text-stone-500", className, "text-sm")}
    >
      {children}
    </p>
  )
}
export default PlainText
