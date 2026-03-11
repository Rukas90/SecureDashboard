import TotpSetupProvider from "../providers/TotpSetupProvider"

const TotpSetupContainer = ({
  children,
}: Pick<React.ComponentProps<"div">, "children">) => {
  return (
    <div className="flex flex-col gap-2 items-center w-141 max-w-full xs:p-6 p-4 bg-[#181514] border border-stone-700 rounded-md mx-auto">
      <TotpSetupProvider>{children}</TotpSetupProvider>
    </div>
  )
}
export default TotpSetupContainer
