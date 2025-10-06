type FetcherError = Error & {
  status?: number
  info?: unknown
}

export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" })

  if (!res.ok) {
    const error: FetcherError = new Error("Fetch error")
    console.log(error)
    error.status = res.status
    try {
      error.info = await res.json()
    } catch {
      error.info = await res.text()
    }
    throw error
  }

  return res.json() as Promise<T>
}
