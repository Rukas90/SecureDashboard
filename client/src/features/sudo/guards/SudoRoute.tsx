import { Outlet } from "react-router-dom"
import useSudo from "../hooks/useSudo"
import ConfirmAccessView from "../views/ConfirmAccessView"
import { HeadingText, IconSpinner } from "@src/features/shared"

const SudoRoute = ({
  children,
}: Pick<React.ComponentProps<"div">, "children">) => {
  const { isLoading, inSudo } = useSudo()

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col gap-4 justify-center items-center animate-pulse">
        <HeadingText>Validating access</HeadingText>
        <IconSpinner className="w-8 text-stone-300 animate-spin" />
      </div>
    )
  }
  if (!inSudo) {
    return <ConfirmAccessView />
  }
  return children ? <>{children}</> : <Outlet />
}
export default SudoRoute
