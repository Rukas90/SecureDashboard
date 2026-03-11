import { useTranslation } from "react-i18next"
import NavButton from "./NavButton"
import {
  IconButton,
  IconClose,
  MenuIcon,
  useIsCollapsed,
  useMenu,
} from "@features/shared"

export const SettingsNav = () => {
  const { isOpen, open, close } = useMenu({ minWidth: 480 })
  const isCollapsed = useIsCollapsed()
  const { t } = useTranslation()

  return (
    <>
      {isCollapsed && (
        <div className="w-full">
          <IconButton
            onClick={open}
            icon={<MenuIcon className="size-8 text-stone-600 mt-2 mb-6" />}
          />
        </div>
      )}
      <ul
        className={`
        ${!isCollapsed || isOpen ? "opacity-100" : "opacity-0"}
        ${!isCollapsed || isOpen ? "pointer-events-auto" : "pointer-events-none"}
        xs:relative fixed 
        top-0 left-0 
        mx-auto flex 
        xs:flex-row flex-col 
        xs:w-fit w-full 
        xs:h-auto h-full 
        gap-10 py-12 
        xs:items-start items-center 
        xs:bg-transparent bg-stone-950 
        z-9999
        xs:justify-start justify-center`}
      >
        {isCollapsed && (
          <>
            <IconButton
              icon={
                <IconClose className="absolute top-6 right-6 text-stone-400 w-6" />
              }
              onClick={close}
            />
            <p className="text-stone-600 font-medium text-lg">
              {t("SETTINGS")}
            </p>
          </>
        )}
        <NavButton onClicked={close} to={"security"}>
          {t("SECURITY")}
        </NavButton>
        <NavButton onClicked={close} to={"activity"}>
          {t("ACTIVITY")}
        </NavButton>
        <NavButton onClicked={close} to={"preferences"}>
          {t("PREFERENCES")}
        </NavButton>
        <NavButton onClicked={close} to={"account"}>
          {t("ACCOUNT")}
        </NavButton>
      </ul>
    </>
  )
}
export default SettingsNav
