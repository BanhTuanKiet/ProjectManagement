'use client'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6 bg-red-100">
      <h2 className="text-red-600 font-bold">Something went wrong!</h2>
      <p>{error.message}</p>
      <button
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  )
}
