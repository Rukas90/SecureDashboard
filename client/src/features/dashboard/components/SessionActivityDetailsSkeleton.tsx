import { OutlineBoxContainer } from "@features/shared"
import Skeleton from "react-loading-skeleton"

const SessionActivityDetailsSkeleton = () => {
  return (
    <OutlineBoxContainer>
      <div className="flex p-2 items-center">
        <Skeleton className="size-10!" />
        <div className="flex flex-col grow px-6">
          <Skeleton className="w-32!" />
          <div className="flex gap-2">
            <Skeleton className="size-2.75!" />
            <Skeleton className="w-16!" />
          </div>
          <Skeleton className="w-76!" />
          <Skeleton className="w-38!" />
        </div>
        <Skeleton className="w-15! h-6!" />
      </div>
    </OutlineBoxContainer>
  )
}
export default SessionActivityDetailsSkeleton
