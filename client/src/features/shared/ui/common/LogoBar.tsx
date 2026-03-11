import { IconFingerprint } from "@features/shared"

const LogoBar = () => {
  return (
    <div className="flex gap-3 items-center">
      <IconFingerprint className="w-7 h-7 text-stone-300" />
      <p className="my-auto text-stone-200 sm:text-xl xs:text-lg text-[0.9rem] font-semibold">
        Authentication App
      </p>
    </div>
  )
}
export default LogoBar
