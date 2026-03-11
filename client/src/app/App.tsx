import { ToastContainer } from "react-toastify"
import AppProviders from "./AppProviders"
import AppRouter from "./AppRouter"
import { AppStartingView } from "@src/routes"
import useServerHealth from "./hooks/useServerHealth"

const App = () => {
  const { isSuccess } = useServerHealth()

  if (!isSuccess) {
    return <AppStartingView />
  }
  return (
    <AppProviders>
      <AppRouter />
      <ToastContainer
        stacked={false}
        theme="dark"
        newestOnTop={true}
        hideProgressBar
        draggable
        pauseOnHover
        toastStyle={{
          height: 12,
        }}
        toastClassName={"text-sm py-2! max-h-10!"}
      />
    </AppProviders>
  )
}
export default App
