import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import {
  ProtectedRoute,
  GuestOnlyRoute,
  ForwardRoute,
  useAuthContext,
  useTokenRefresh,
} from "@features/auth"

const LoginView = lazy(() =>
  import("@features/auth").then((m) => ({ default: m.LoginView })),
)
const RegisterView = lazy(() =>
  import("@features/auth").then((m) => ({ default: m.RegisterView })),
)
const DashboardView = lazy(() =>
  import("@features/dashboard").then((m) => ({ default: m.DashboardView })),
)
const SecuritySettings = lazy(() =>
  import("@features/dashboard").then((m) => ({ default: m.SecuritySettings })),
)
const ActivitySettings = lazy(() =>
  import("@features/dashboard").then((m) => ({ default: m.ActivitySettings })),
)
const PreferenceSettings = lazy(() =>
  import("@features/dashboard").then((m) => ({
    default: m.PreferenceSettings,
  })),
)
const AccountSettings = lazy(() =>
  import("@features/dashboard").then((m) => ({ default: m.AccountSettings })),
)
const NotFoundView = lazy(() =>
  import("@src/routes").then((m) => ({ default: m.NotFoundView })),
)
const TotpSetupView = lazy(() =>
  import("@features/totp").then((m) => ({ default: m.TotpSetupView })),
)
const MfaAuthView = lazy(() =>
  import("@features/mfa").then((m) => ({ default: m.MfaAuthView })),
)
const TotpLogin = lazy(() =>
  import("@features/mfa").then((m) => ({ default: m.TotpLogin })),
)

const AppRouter = () => {
  const { isInitialized } = useAuthContext()

  useTokenRefresh()

  if (!isInitialized) {
    return <></>
  }
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path="/" element={<ForwardRoute />}></Route>
        <Route path="/oauth/callback" element={<ForwardRoute />} />
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
        </Route>
        <Route element={<ProtectedRoute scope={["mfa:verify"]} />}>
          <Route path="/session/mfa" element={<MfaAuthView />}>
            <Route path="totp" element={<TotpLogin />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute scope={["admin:access"]} />}>
          <Route path="/dashboard" element={<DashboardView />}>
            <Route
              index={true}
              element={<Navigate to="/dashboard/security" replace />}
            />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="activity" element={<ActivitySettings />} />
            <Route path="preferences" element={<PreferenceSettings />} />
            <Route path="account" element={<AccountSettings />} />
          </Route>
          <Route path="totp/setup" element={<TotpSetupView />} />
        </Route>
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </Suspense>
  )
}
export default AppRouter
