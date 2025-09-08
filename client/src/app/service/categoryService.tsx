export const getCategories = async () => {
  const response = await fetch("http://localhost:2908/categories", {
    cache: "no-store"
  })

  const categories = await response.json()
  return categories.data
}