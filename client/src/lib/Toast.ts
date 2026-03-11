import { toast as baseToast } from "react-toastify"

const base = (message: string) =>
  baseToast(message, {
    className: "text-sm py-2! max-h-10!",
  })

const success = (message: string) =>
  baseToast.success(message, {
    className: "text-sm py-2! max-h-10! border-l-2 border-green-500",
  })

const error = (message: string) =>
  baseToast.error(message, {
    className: "text-sm py-2! max-h-10! border-l-2 border-red-500",
  })

const warning = (message: string) =>
  baseToast.warning(message, {
    className: "text-sm py-2! max-h-10! border-l-2 border-yellow-500",
  })

const info = (message: string) =>
  baseToast.info(message, {
    className: "text-sm py-2! max-h-10! border-l-2 border-blue-500",
  })

export const toast = { base, success, error, warning, info }
