import { config } from "../../config"
import { useState, useRef, useEffect } from "react"
import { getProfileImageUrl } from "../../utils/profile-images" // Pastikan path ini benar

const Profile = ({ user = {}, onUserUpdate }) => {
  // Tambahkan onUserUpdate prop
  // State untuk form data, inisialisasi dari prop user
  const [formData, setFormData] = useState({
    username: user?.username || "",
    fullName: user?.fullName || "",
    email: user?.email || "",
    gender: user?.gender || "",
    age: user?.age || "",
    height: user?.height || "",
    weight: user?.weight || "",
    medicalHistory: user?.chronicDiseases ? user.chronicDiseases.join(", ") : "", // Gunakan chronicDiseases
    isActiveSmoker: user?.smokingStatus === "aktif" ? "Ya" : "Tidak", // Gunakan smokingStatus
  })

  // State untuk URL gambar profil yang ditampilkan, inisialisasi dari prop user
  const [profileImage, setProfileImage] = useState(
    user?.profilePicture ? getProfileImageUrl(user.profilePicture) : null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [tempImage, setTempImage] = useState(null) // Gambar sementara untuk cropping
  const [cropData, setCropData] = useState({
    x: 50,
    y: 50,
    size: 200,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, initialSize: 0, initialDistance: 0 })
  const [imageLoaded, setImageLoaded] = useState(false) // Menandakan gambar di cropper sudah dimuat
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 }) // Dimensi gambar asli di cropper
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const imageRef = useRef(null) // Referensi ke elemen img di cropper

  // Hapus fungsi fetchUserData dan useEffect terkait
  // useEffect(() => { fetchUserData() }, [])

  // Perbarui formData dan profileImage saat prop user berubah
  useEffect(() => {
    setFormData({
      username: user?.username || "",
      fullName: user?.fullName || "",
      email: user?.email || "",
      gender: user?.gender || "",
      age: user?.age || "",
      height: user?.height || "",
      weight: user?.weight || "",
      medicalHistory: user?.chronicDiseases ? user.chronicDiseases.join(", ") : "",
      isActiveSmoker: user?.smokingStatus === "aktif" ? "Ya" : "Tidak",
    })
    setProfileImage(user?.profilePicture ? getProfileImageUrl(user.profilePicture) : null)
  }, [user]) // Bergantung pada prop user

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTempImage(e.target.result)
        setShowImageCropper(true)
        setImageLoaded(false) // Reset imageLoaded state for new image
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image cropping
  const handleCropImage = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const image = imageRef.current

    if (!image || !canvas) return

    // Set canvas size to square
    canvas.width = cropData.size
    canvas.height = cropData.size

    // Calculate crop dimensions
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Draw cropped image
    ctx.drawImage(
      image,
      cropData.x * scaleX,
      cropData.y * scaleY,
      cropData.size * scaleX,
      cropData.size * scaleY,
      0,
      0,
      cropData.size,
      cropData.size,
    )

    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Gagal memotong gambar.")
        return
      }

      setIsLoading(true) // Set loading for upload
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          alert("Token tidak ditemukan. Silakan login kembali.")
          setIsLoading(false)
          return
        }

        const formData = new FormData()
        formData.append("image", blob, "profile.jpg") // 'image' adalah nama field dari README

        const response = await fetch(`${config.apiUserService}/api/photoprofile`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type diatur secara otomatis oleh fetch saat menggunakan FormData
          },
          body: formData,
        })

        const result = await response.json()

        if (response.ok && result.status === "success") {
          const newProfileFilename = result.data
          const newProfileUrl = getProfileImageUrl(newProfileFilename)
          setProfileImage(newProfileUrl)
          setShowImageCropper(false)
          setTempImage(null)
          setShowSuccessPopup(true) // Tampilkan popup sukses untuk unggah gambar

          // Perbarui state parent
          if (onUserUpdate) {
            onUserUpdate({ ...user, profilePicture: newProfileFilename }) // Kirim nama file kembali
          }
        } else {
          console.error("Gagal mengunggah foto profil:", result.message || result.error)
          alert("Gagal mengunggah foto profil: " + (result.message || "Terjadi kesalahan tidak dikenal"))
        }
      } catch (error) {
        console.error("Error saat mengunggah foto profil:", error)
        alert("Terjadi kesalahan saat mengunggah gambar.")
      } finally {
        setIsLoading(false)
        setTimeout(() => setShowSuccessPopup(false), 1500)
      }
    }, "image/jpeg")
  }

  // Handle profile image removal
  const handleRemoveImage = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.")
        setIsLoading(false)
        return
      }

      // Panggil endpoint DELETE di backend untuk menghapus foto profil
      const response = await fetch(`${config.apiUserService}/api/photoprofile`, {
        method: "DELETE", // Menggunakan metode DELETE
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Meskipun DELETE, tetap sertakan Content-Type
        },
      })

      const result = await response.json()

      if (response.ok && result.status === "success") {
        setProfileImage(null) // Hapus gambar dari state frontend
        if (fileInputRef.current) {
          fileInputRef.current.value = "" // Bersihkan input file
        }
        setShowSuccessPopup(true) // Tampilkan popup sukses
        // Perbarui state parent
        if (onUserUpdate) {
          onUserUpdate({ ...user, profilePicture: null })
        }
      } else {
        console.error("Gagal menghapus foto profil:", result.message || result.error)
        alert("Gagal menghapus foto profil: " + (result.message || "Terjadi kesalahan tidak dikenal"))
      }
    } catch (error) {
      console.error("Error saat menghapus foto profil:", error)
      alert("Terjadi kesalahan saat menghapus gambar.")
    } finally {
      setIsLoading(false)
      setTimeout(() => setShowSuccessPopup(false), 1500)
    }
  }

  // Handle image load to get dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current // Gunakan naturalWidth/Height untuk dimensi asli
      setImageDimensions({ width: naturalWidth, height: naturalHeight })
      setImageLoaded(true)

      // Reset crop to center with appropriate size
      const maxSize = Math.min(naturalWidth, naturalHeight)
      const initialSize = Math.min(200, maxSize) // Ukuran awal crop, maks 200px atau ukuran gambar
      setCropData({
        x: Math.max(0, (naturalWidth - initialSize) / 2),
        y: Math.max(0, (naturalHeight - initialSize) / 2),
        size: initialSize,
      })
    }
  }

  // Check if click is on resize handle
  const isOnResizeHandle = (x, y) => {
    const handleSize = 10
    const cropRight = cropData.x + cropData.size
    const cropBottom = cropData.y + cropData.size

    // Check corners
    const corners = [
      { x: cropData.x, y: cropData.y }, // top-left
      { x: cropRight, y: cropData.y }, // top-right
      { x: cropData.x, y: cropBottom }, // bottom-left
      { x: cropRight, y: cropBottom }, // bottom-right
    ]

    for (const corner of corners) {
      if (
        x >= corner.x - handleSize &&
        x <= corner.x + handleSize &&
        y >= corner.y - handleSize &&
        y <= corner.y + handleSize
      ) {
        return true
      }
    }

    return false
  }

  // Handle mouse down for dragging or resizing
  const handleMouseDown = (e) => {
    if (!imageLoaded) return

    e.preventDefault()
    e.stopPropagation()

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if click is on resize handle
    if (isOnResizeHandle(x, y)) {
      setIsResizing(true)
      const centerX = cropData.x + cropData.size / 2
      const centerY = cropData.y + cropData.size / 2
      const initialDistance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

      setResizeStart({
        x: centerX,
        y: centerY,
        initialSize: cropData.size,
        initialDistance: initialDistance,
      })
    } else if (
      x >= cropData.x &&
      x <= cropData.x + cropData.size &&
      y >= cropData.y &&
      y <= cropData.y + cropData.size
    ) {
      // Click is inside crop area for dragging
      setIsDragging(true)
      setDragStart({
        x: x - cropData.x,
        y: y - cropData.y,
      })
    }
  }

  // Handle mouse move for dragging or resizing
  const handleMouseMove = (e) => {
    if (!imageLoaded || (!isDragging && !isResizing)) return

    e.preventDefault()
    e.stopPropagation()

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isResizing) {
      // Calculate new size based on distance from center
      const currentDistance = Math.sqrt(Math.pow(x - resizeStart.x, 2) + Math.pow(y - resizeStart.y, 2))
      const ratio = currentDistance / resizeStart.initialDistance
      let newSize = Math.round(resizeStart.initialSize * ratio)

      // Constrain size
      const minSize = 50
      const maxSize = Math.min(imageDimensions.width, imageDimensions.height)
      newSize = Math.max(minSize, Math.min(newSize, maxSize))

      // Calculate new position to keep center
      const newX = Math.max(0, Math.min(resizeStart.x - newSize / 2, imageDimensions.width - newSize))
      const newY = Math.max(0, Math.min(resizeStart.y - newSize / 2, imageDimensions.height - newSize))

      setCropData({
        x: newX,
        y: newY,
        size: newSize,
      })
    } else if (isDragging) {
      // Handle dragging
      const newX = Math.max(0, Math.min(x - dragStart.x, imageDimensions.width - cropData.size))
      const newY = Math.max(0, Math.min(y - dragStart.y, imageDimensions.height - cropData.size))

      setCropData((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }))
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Get cursor style based on mouse position
  const getCursorStyle = (e) => {
    if (!imageLoaded) return "default"

    const rect = imageRef.current?.getBoundingClientRect()
    if (!rect) return "default"

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isOnResizeHandle(x, y)) {
      return "nw-resize"
    } else if (
      x >= cropData.x &&
      x <= cropData.x + cropData.size &&
      y >= cropData.y &&
      y <= cropData.y + cropData.size
    ) {
      return isDragging ? "grabbing" : "grab"
    }

    return "default"
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.")
        setIsLoading(false)
        return
      }

      const updateFields = {
        age: formData.age !== "" ? Number.parseInt(formData.age) : null,
        gender: formData.gender !== "" ? formData.gender : null,
        height_cm: formData.height !== "" ? Number.parseInt(formData.height) : null,
        weight_kg: formData.weight !== "" ? Number.parseInt(formData.weight) : null,
        smoking_status: formData.isActiveSmoker === "Ya" ? "aktif" : "tidak aktif",
        chronic_diseases: formData.medicalHistory
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        full_name: formData.fullName !== user?.fullName ? formData.fullName : null, // Hanya kirim jika berubah
        // email: formData.email !== user?.email ? formData.email : undefined, // Hanya kirim jika berubah
        // username: formData.username !== user?.username ? formData.username : undefined, // Hanya kirim jika berubah
      }

      // Filter nilai undefined untuk hanya mengirim bidang yang berubah
      const filteredUpdateFields = Object.fromEntries(
        Object.entries(updateFields).filter(([, value]) => value !== undefined),
      )

      // Penanganan khusus untuk chronic_diseases jika array kosong dan perlu dikirim
      if (updateFields.chronic_diseases !== undefined && updateFields.chronic_diseases.length === 0) {
        filteredUpdateFields.chronic_diseases = []
      }

      const response = await fetch(`${config.apiUserService}/api/update/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({updateFields : filteredUpdateFields}),
      })

      console.log({updateFields : filteredUpdateFields})

      const result = await response.json()

      if (response.ok && result.status === "success") {
        setShowSuccessPopup(true)
        if (onUserUpdate) {
          // Buat objek user baru dengan bidang yang diperbarui
          const updatedUser = { ...user }
          if (filteredUpdateFields.username !== undefined) updatedUser.username = filteredUpdateFields.username
          if (filteredUpdateFields.fullName !== undefined) updatedUser.fullName = filteredUpdateFields.fullName
          if (filteredUpdateFields.email !== undefined) updatedUser.email = filteredUpdateFields.email
          if (filteredUpdateFields.gender !== undefined) updatedUser.gender = filteredUpdateFields.gender
          if (filteredUpdateFields.age !== undefined) updatedUser.age = filteredUpdateFields.age
          if (filteredUpdateFields.height_cm !== undefined) updatedUser.height = filteredUpdateFields.height_cm // API menggunakan height_cm, lokal menggunakan height
          if (filteredUpdateFields.weight_kg !== undefined) updatedUser.weight = filteredUpdateFields.weight_kg // API menggunakan weight_kg, lokal menggunakan weight
          if (filteredUpdateFields.smoking_status !== undefined)
            updatedUser.smokingStatus = filteredUpdateFields.smoking_status
          if (filteredUpdateFields.chronic_diseases !== undefined)
            updatedUser.chronicDiseases = filteredUpdateFields.chronic_diseases

          onUserUpdate(updatedUser)
        }
      } else {
        console.error("Gagal memperbarui profil:", result.message || result.error)
        alert("Gagal menyimpan data ke server: " + (result.message || "Terjadi kesalahan tidak dikenal"))
      }
    } catch (error) {
      console.error("Error saat menyimpan profil:", error)
      alert("Terjadi kesalahan saat menyimpan data.")
    } finally {
      setIsLoading(false)
      setTimeout(() => setShowSuccessPopup(false), 1500)
    }
  }

  return (
    <div className="min-h-screen overflow-auto bg-gray-50 relative">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-[#ff3131] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-center text-[#ff3131] font-medium">Data berhasil diperbarui</p>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && profileImage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={profileImage || "/placeholder.svg"} // Use profileImage state directly
              alt="Profile Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showImageCropper && tempImage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-full overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sesuaikan Foto Profil</h3>
              <button
                onClick={() => {
                  setShowImageCropper(false)
                  setTempImage(null)
                  setImageLoaded(false)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Image with crop overlay */}
              <div
                className="relative inline-block select-none"
                onMouseMove={(e) => {
                  handleMouseMove(e)
                  e.currentTarget.style.cursor = getCursorStyle(e)
                }}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: "default" }}
              >
                <img
                  ref={imageRef}
                  src={tempImage || "/placeholder.svg"} // tempImage is the one being cropped
                  alt="Crop preview"
                  className="max-w-full h-auto block"
                  style={{ maxHeight: "400px" }}
                  onLoad={handleImageLoad}
                  onMouseDown={handleMouseDown}
                  draggable={false}
                />
                {/* Crop overlay - Square with red border only */}
                {imageLoaded && (
                  <div
                    className="absolute border-2 border-red-500 pointer-events-none"
                    style={{
                      left: cropData.x,
                      top: cropData.y,
                      width: cropData.size,
                      height: cropData.size,
                      backgroundColor: "transparent",
                    }}
                  >
                    {/* Resize handles at corners */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 pointer-events-auto cursor-nw-resize"></div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 pointer-events-auto cursor-ne-resize"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-red-500 pointer-events-auto cursor-sw-resize"></div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-red-500 pointer-events-auto cursor-se-resize"></div>
                  </div>
                )}
              </div>

              {/* Instructions only */}
              {imageLoaded && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Cara menggunakan:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Klik dan seret kotak merah untuk memindahkan area crop</li>
                    <li>• Seret sudut kotak merah untuk mengubah ukuran</li>
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowImageCropper(false)
                    setTempImage(null)
                    setImageLoaded(false)
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleCropImage}
                  disabled={!imageLoaded}
                  className="px-4 py-2 bg-[#ff3131] text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Gunakan Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            {/* Profile Picture Section dengan Username dan Full Name */}
            <div className="space-y-4">
              {/* Foto profil dan username */}
              <div className="flex items-start space-x-6">
                {/* Profile Picture */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => profileImage && setShowImageViewer(true)}
                  >
                    {profileImage ? (
                      <img
                        src={profileImage || "/placeholder.svg"} // Use profileImage state directly
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-700 text-3xl font-bold uppercase">
                        {formData.username ? formData.username.charAt(0) : "PP"}
                      </div>
                    )}
                  </div>

                  {/* Image Actions */}
                  <div className="absolute -bottom-2 -right-2 flex space-x-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer w-8 h-8 bg-[#ff3131] hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      title="Upload foto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>

                    {profileImage && (
                      <>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                          title="Hapus foto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Username di samping foto */}
                <div className="flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Username</label>
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3131] focus:border-[#ff3131] transition-colors"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>

              {/* Full Name di bawah foto profil */}
              <div className="space-y-2" style={{ marginLeft: "0px" }}>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3131] focus:border-[#ff3131] transition-colors"
                  placeholder=""
                />
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* Email Field (Read-only) - Full Width */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Alamat E-mail</label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Gender Field - Full Width */}
            <div className="space-y-3 ">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="pria"
                    checked={formData.gender === "pria"}
                    onChange={handleInputChange}
                    className="cursor-pointer w-4 h-4 text-[#ff3131] focus:ring-[#ff3131] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Laki-laki</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="wanita"
                    checked={formData.gender === "wanita"}
                    onChange={handleInputChange}
                    className="cursor-pointer w-4 h-4 text-[#ff3131] focus:ring-[#ff3131] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Perempuan</span>
                </label>
              </div>
            </div>

            {/* Age Field - Full Width */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Umur</label>
              </div>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3131] focus:border-[#ff3131] transition-colors"
                placeholder=""
                min="0"
              />
            </div>

            {/* Height and Weight - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Height Field */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Tinggi Badan</label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3131] focus:border-[#ff3131] transition-colors pr-12"
                    placeholder=""
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">cm</span>
                </div>
              </div>

              {/* Weight Field */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Berat Badan</label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3131] focus:border-[#ff3131] transition-colors pr-12"
                    placeholder=""
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">kg</span>
                </div>
              </div>
            </div>

            {/* Medical History Field - Full Width */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Riwayat Penyakit Bawaan</label>
              </div>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3131] focus:border-[#ff3131] transition-colors resize-none"
                placeholder="Masukkan riwayat penyakit bawaan (jika ada)"
              />
            </div>

            {/* Smoking Status Field - Full Width */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Perokok aktif</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActiveSmoker"
                    value="Ya"
                    checked={formData.isActiveSmoker === "Ya"}
                    onChange={handleInputChange}
                    className="cursor-pointer w-4 h-4 text-[#ff3131] focus:ring-[#ff3131] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Ya</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActiveSmoker"
                    value="Tidak"
                    checked={formData.isActiveSmoker === "Tidak"}
                    onChange={handleInputChange}
                    className="cursor-pointer w-4 h-4 text-[#ff3131] focus:ring-[#ff3131] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Tidak</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer bg-[#ff3131] hover:bg-red-600 hover:scale-110 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 hover:shadow-[0_0_40px_#b81414] text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#ff3131] focus:ring-offset-2 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 4 9.018C14.865 18.072 18 15.189 18 12a8 8 0 01-8-8z"
                      />
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile