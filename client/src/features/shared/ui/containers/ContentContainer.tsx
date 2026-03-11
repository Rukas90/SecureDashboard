import clsx from "clsx"

const ContentContainer = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      className={clsx(
        className,
        "relative max-w-7xl w-full mx-auto xs:px-8 px-4 pb-4",
      )}
      {...props}
    >
      {props.children}
    </div>
  )
}
export default ContentContainer
