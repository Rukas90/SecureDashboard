import clsx from "clsx"

const HeadingText = ({
  className,
  children,
  ...props
}: React.ComponentProps<"h4">) => {
  return (
    <h4
      {...props}
      className={clsx(className, "text-stone-300 xs:text-lg text-base")}
    >
      {children}
    </h4>
  )
}
export default HeadingText
