import axios from "axios"
// import { SuccessNotify, WarningNotify, ErrorNotify } from "./ToastConfig"

const instance = axios.create({
    baseURL: "http://localhost:5144",
    withCredentials: true,
})

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config
  }, function (error) {
    // Do something with request error
    return Promise.reject(error)
})

// Add a response interceptor
instance.interceptors.response.use(function (response) {
// Any status code that lie within the range of 2xx cause this function to trigger
// Do something with response data
  if (response.status === 200 && response.data.message) {
    const message = response.data.message
    // SuccessNotify(message)
  }

  return response
}, function (error) {
// Any status codes that falls outside the range of 2xx cause this function to trigger
// Do something with response error
  if (error && error.response && error.response.data) {
    const errorMessage = error.response.data.ErrorMessage || error.response.data.errorMessage
    const statusCode = error.response.status
    // console.log(error)
    // console.log(statusCode, error.response.data?.RetryRequest)
    if (statusCode === 401 && error.response.data?.RetryRequest && !error.config.retry) {
      console.log(error.config)
      console.log(error.config.retry)

      error.config.retry = true
      return instance(error.config)
    }
    console.log(errorMessage)
    switch (statusCode) {
      case 400:
      case 404:
        // WarningNotify(errorMessage)
        break
      case 403:
        // WarningNotify(errorMessage)
        break
      case 500:
        // ErrorNotify(errorMessage)
        break
      case 401:
        const currentPath = window.location.pathname + window.location.search
        localStorage.setItem("prevPage", currentPath)
        // WarningNotify(errorMessage)
  
        setTimeout(() => {
          // window.location.href = "/đăng nhập"
        }, 1700)
        break
      default:
        // ErrorNotify(errorMessage)
    } 
  }

  return Promise.reject(error)
})

export default instance