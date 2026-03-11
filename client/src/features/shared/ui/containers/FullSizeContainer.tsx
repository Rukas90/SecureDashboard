import clsx from "clsx"

const FullSizeContainer = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={clsx("w-full h-full", className)} {...props}>
      {children}
    </div>
  )
}
export default FullSizeContainer
