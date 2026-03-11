import {
  useState,
  type HTMLInputAutoCompleteAttribute,
  type HTMLInputTypeAttribute,
} from "react"
import { VisibilityToggleIcon } from "@features/shared"
import clsx from "clsx"

export type InputVariant = "default" | "mini"

const InputVariants = {
  default: {
    container: {
      base: "text-base",
      default: "h-12",
      expanded: "h-16",
    },
    input: {
      base: "",
      expanded: "pt-4",
    },
    label: {
      default: "text-[1rem] text-stone-500",
      expanded: "text-[0.85rem] text-stone-600",
    },
  },
  mini: {
    container: {
      base: "text-sm",
      default: "h-10",
      expanded: "h-12",
    },
    input: {
      base: "text-sm",
      expanded: "pt-5",
    },
    label: {
      default: "text-[0.85rem] text-stone-500",
      expanded: "text-[0.7rem] text-stone-600",
    },
  },
} satisfies Record<
  InputVariant,
  {
    container: {
      base: string
      default: string
      expanded: string
    }
    input: {
      base: string
      expanded: string
    }
    label: {
      default: string
      expanded: string
    }
  }
>

interface Props extends Pick<React.ComponentProps<"div">, "id" | "className"> {
  name?: string | undefined
  value?: string | readonly string[] | number | undefined
  maxLength?: number
  onValueChanged?: (newValue: string) => void
  type?: HTMLInputTypeAttribute | undefined
  placeholder?: string | undefined
  autocomplete?: HTMLInputAutoCompleteAttribute | undefined
  hideable?: boolean
  isHidden?: boolean
  extendWidth?: boolean
  indicateError?: boolean
  expandable?: boolean
  variant?: InputVariant
  pattern?: string
  required?: boolean
  readonly?: boolean
}
const InputField = ({
  id,
  name,
  value = undefined,
  maxLength,
  onValueChanged,
  type = "text",
  placeholder = "Input",
  autocomplete,
  className = "",
  hideable,
  isHidden,
  extendWidth,
  indicateError,
  expandable = true,
  variant = "default",
  pattern,
  required,
  readonly,
}: Props) => {
  const [text, setText] = useState(value || "")
  const [hidden, setHidden] = useState(hideable && isHidden)

  const onChangeCallback = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value

    setText(newValue)

    if (onValueChanged) {
      onValueChanged(newValue)
    }
  }
  const expand = expandable && !!text
  const config = InputVariants[variant]

  return (
    <div
      className={clsx(
        "relative px-3 py-2 rounded-sm flex items-center transition-[background-color,height]",
        "bg-stone-950 hover:bg-stone-900 focus:border focus:border-stone-300",
        config.container.base,
        expand ? config.container.expanded : config.container.default,
        indicateError && "border border-red-900",
        extendWidth && "w-full",
      )}
    >
      {(expandable || !text) && (
        <label
          htmlFor={id}
          className={clsx(
            "absolute pointer-events-none transition-all left-3 xs:text-sm! text-xs! xs:font-normal font-medium",
            expand ? config.label.expanded : config.label.default,
            expand
              ? "text-stone-500 top-1.5 translate-y-0"
              : "text-stone-600 top-1/2 -translate-y-1/2",
          )}
        >
          {placeholder}
        </label>
      )}
      <input
        id={id}
        name={name}
        value={text}
        onChange={onChangeCallback}
        type={hidden ? "password" : type}
        autoComplete={autocomplete}
        className={clsx(
          config.input.base,
          "bg-transparent border-0 outline-0 h-auto text-stone-200 p-0 m-0",
          expand && config.input.expanded,
          className,
          extendWidth && "w-full",
        )}
        maxLength={maxLength}
        pattern={pattern}
        required={required}
        readOnly={readonly}
      />
      {hideable && (
        <VisibilityToggleIcon isHidden={hidden} onToggled={setHidden} />
      )}
    </div>
  )
}
export default InputField
