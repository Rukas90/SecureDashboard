import clsx from "clsx"
import { IconDone } from "../icons"
import type React from "react"

interface Props extends Pick<React.ComponentProps<"div">, "className"> {
  stages: string[]
  currentIndex: number
}
const Stages = ({ stages, currentIndex, className }: Props) => {
  return (
    <div
      className={clsx(className, "flex py-6 max-w-full items-center mx-auto")}
    >
      {stages.map((stage, index) => {
        const isDone = currentIndex > index
        const isCurrent = currentIndex === index
        return (
          <>
            <p
              key={`Stage_${stage}`}
              className={clsx(
                "size-10 flex items-center justify-center xs:text-xl text-lg rounded-full border-2",
                isDone && "border-stone-500",
                isCurrent && "text-stone-950 bg-stone-300 border-stone-300",
                !isDone && !isCurrent && "text-stone-400 border-stone-500",
              )}
            >
              {isDone ? (
                <IconDone className="text-stone-400 xs:size-6 size-5" />
              ) : (
                stage
              )}
            </p>
            {index < stages.length - 1 && (
              <div className="grow h-0.5 bg-stone-700" />
            )}
          </>
        )
      })}
    </div>
  )
}
export default Stages
