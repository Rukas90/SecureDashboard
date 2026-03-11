import { FullSizeContainer, TitleText } from "@features/shared"

const AppStartingView = () => {
  return (
    <FullSizeContainer className="flex justify-center items-center flex-col xs:gap-2 text-center">
      <TitleText>Site will open shortly.</TitleText>
      <p className="xs:text-4xl text-xl font-medium text-stone-500">
        The server is waking up.
      </p>
    </FullSizeContainer>
  )
}
export default AppStartingView
