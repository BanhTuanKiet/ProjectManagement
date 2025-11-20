import { toast, ToastOptions, ToastPosition } from "react-toastify"

const toastConfig: ToastOptions = {
  position: "top-right" as ToastPosition,
  autoClose: 1000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  theme: "light",
}

export const SuccessNotify = (content: string) => {
  toast.success(content, toastConfig)
}

export const WarningNotify = (content: string) => {
  toast.warning(content, toastConfig)
}

export const ErrorNotify = (content: string) => {
  toast.error(content, toastConfig)
}
