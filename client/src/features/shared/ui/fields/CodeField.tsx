import clsx from "clsx"
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react"
import { VisibilityToggleIcon } from "../icons"

interface Props extends Pick<
  React.ComponentProps<"input">,
  "id" | "name" | "className"
> {
  digits?: number
  onCodeChanged?: (code: string) => void
  onCompleted?: (code: string) => void
  allowedPattern?: RegExp
  placeholder?: string
  isHidden?: boolean
}
const CodeField = ({
  id,
  name,
  className,
  digits = 6,
  onCodeChanged,
  onCompleted,
  allowedPattern = /^[0-9]$/,
  placeholder = "X",
  isHidden,
}: Props) => {
  const [hidden, setHidden] = useState(isHidden)
  const [code, setCode] = useState("")
  const [values, setValues] = useState<string[]>([])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    setValues(new Array(digits).fill(""))
    inputRefs.current = new Array(digits).fill(null)
  }, [digits])

  useEffect(() => {
    if (code) {
      onCodeChanged?.(code)

      if (code.length === digits) {
        onCompleted?.(code)
      }
    }
  }, [code, digits, onCodeChanged, onCompleted])

  const onValueChanged = (
    index: number,
    evt: ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = evt.target.value
    let value = validateValue(newValue)

    setInputValue(index, value)

    if (newValue) {
      selectInput(index + 1)
    }
    deselectInput(index)
  }
  const setInputValue = (index: number, value: string) => {
    setValues((v) => {
      const newValues = [...v]
      newValues[index] = value
      const newCode = newValues.join("")

      setCode(newCode)
      return newValues
    })
  }
  const validateValue = (value: string): string => {
    if (!value || !allowedPattern.test(value)) {
      return ""
    }
    return value
  }
  const handleKeyDown = (
    index: number,
    evt: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (evt.key === values[index].toString()) {
      evt.preventDefault()
      deselectInput(index)
      selectInput(index + 1)
      return
    }
    if (evt.key === "Backspace" || evt.key === "Delete") {
      evt.preventDefault()
      setInputValue(index, "")
    }
    if (evt.key === "Backspace" || evt.key === "ArrowLeft") {
      selectInput(index - 1)
    }
    if (evt.key === "ArrowRight") {
      selectInput(index + 1)
    }
  }
  const deselectInput = (index: number) => {
    const input = inputRefs.current[index]
    input!!.blur()
  }
  const selectInput = (index: number) => {
    let newIndex = index

    if (newIndex < 0) {
      newIndex = 0
    }
    if (newIndex >= digits) {
      newIndex = digits - 1
    }
    const input = inputRefs.current[newIndex]
    input!!.focus()
  }
  const handleClick = (evt: MouseEvent<HTMLInputElement>) => {
    evt.currentTarget.select()
  }

  return (
    <div className={clsx("relative", className)}>
      <div className="flex">
        <input
          id={id}
          name={name}
          type="hidden"
          value={code}
          autoComplete="on"
          data-lpignore="false"
          data-bwignore="false"
        />
        {values.map((value, index) => (
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            id={`digit-${index}`}
            key={`CodeField_Value_${index}`}
            className="xs:w-8 w-6.75 xs:text-base text-sm mx-1 rounded-sm text-center p-1.5 text-stone-300 bg-stone-800 hover:bg-stone-700 focus:bg-stone-700 outline-amber-400 focus:outline-2 transition"
            value={value}
            placeholder={placeholder}
            type={hidden ? "password" : "text"}
            onFocus={(e) => e.target.select()}
            maxLength={2}
            onChange={(c) => {
              onValueChanged(index, c)
            }}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onClick={handleClick}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-bwignore="true"
            data-np-autofill-field-type="none"
            data-np-autofill-mfa-last="0"
          />
        ))}
        <div className="xs:absolute xs:left-[101.5%] xs:top-1/2 xs:-translate-y-1/2 xs:mt-0.5 mt-1 xs:ml-auto ml-1">
          <VisibilityToggleIcon isHidden={hidden} onToggled={setHidden} />
        </div>
      </div>
    </div>
  )
}
export default CodeField
