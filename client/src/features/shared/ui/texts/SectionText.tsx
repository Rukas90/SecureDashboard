import clsx from "clsx"

const SectionText = ({
  children,
  className,
}: Pick<React.ComponentProps<"div">, "children" | "className">) => {
  return (
    <h1
      className={clsx(className, "text-[0.825rem] sm:text-sm text-stone-300")}
    >
      {children}
    </h1>
  )
}
export default SectionText
