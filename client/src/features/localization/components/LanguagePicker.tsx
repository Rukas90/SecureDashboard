import {
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  IconFlag,
  SectionText,
} from "@features/shared"
import { useLanguageContext } from "../hooks"
import { toast } from "@src/lib"

const LanguagePicker = () => {
  const { currentLanguage, setLanguage, languages } = useLanguageContext()

  return (
    <DropdownMenu
      label={
        <>
          <IconFlag
            code={currentLanguage.flag}
            className="size-3 rounded-sm mr-0.5"
          />
          <SectionText>{currentLanguage.label}</SectionText>
        </>
      }
    >
      {languages &&
        languages.map((lang) => (
          <DropdownItem
            key={lang.code}
            onSelected={() => {
              toast.info(`Language is changed to ${lang.label}.`)
              setLanguage(lang.code)
            }}
            content={
              <DropdownLabel
                text={lang.label}
                icon={
                  <IconFlag
                    className="size-3 rounded-sm mr-1"
                    code={lang.flag}
                  />
                }
              />
            }
          />
        ))}
    </DropdownMenu>
  )
}
export default LanguagePicker
