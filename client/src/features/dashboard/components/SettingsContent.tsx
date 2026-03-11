import clsx from "clsx"

const SettingsContent = ({
  children,
  className,
}: Pick<React.ComponentProps<"div">, "children" | "className">) => {
  return (
    <div className={clsx(className, "flex items-center justify-between")}>
      {children}
    </div>
  )
}
export default SettingsContent
