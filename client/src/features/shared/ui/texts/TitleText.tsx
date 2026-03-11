import clsx from "clsx"

const TitleText = ({
  className,
  children,
  ...props
}: React.ComponentProps<"h1">) => {
  return (
    <h1
      {...props}
      className={clsx(
        className,
        "xs:text-5xl text-3xl text-stone-200 font-medium mb-4",
      )}
    >
      {children}
    </h1>
  )
}
export default TitleText
