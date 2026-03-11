import { useMediaQuery } from "react-responsive"

const useIsCollapsed = () =>
  useMediaQuery({
    query: "(width < 30rem)",
  })
export default useIsCollapsed
