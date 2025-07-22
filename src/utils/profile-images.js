export const getProfileImageUrl = (filename) => {
  if (!filename) {
    return "/placeholder.svg?height=80&width=80" // Mengembalikan URL placeholder default jika tidak ada nama file
  }
  const BASE_UPLOAD_URL = "https://api.ayuwoki.my.id/users/uploads/"
  return `${BASE_UPLOAD_URL}${filename}`
}
