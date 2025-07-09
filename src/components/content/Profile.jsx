import { config } from "../../config"
import { useState, useRef, useEffect } from "react"

const Profile = ({ user = {}, onUserUpdate }) => {
  // State untuk form data
  const [formData, setFormData] = useState({
    username: user?.username || "",
    fullName: user?.fullName || "",
    email: user?.email || "",
    gender: user?.gender || "",
    age: user?.age || "",
    height: user?.height || "",
    weight: user?.weight || "",
    medicalHistory: user?.medicalHistory || "",
    isActiveSmoker: user?.isActiveSmoker || "",
  })

  const [profileImage, setProfileImage] = useState(user?.profilePicture || null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [tempImage, setTempImage] = useState(null)
  const [cropData, setCropData] = useState({
    x: 50,
    y: 50,
    size: 200,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, initialSize: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  // Fetch complete profile data when component mounts or user changes
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const response = await fetch(`${config.apiUserService}/api/update/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const result = await response.json()

        if (response.ok && result.data) {
          // Update formData with fetched profile data
          setFormData((prev) => ({
            ...prev,
            gender: result.data.gender || "",
            age: result.data.age || "",
            height: result.data.height_cm || "",
            weight: result.data.weight_kg || "",
            medicalHistory: Array.isArray(result.data.chronic_diseases)
              ? result.data.chronic_diseases.join(", ")
              : "",
            isActiveSmoker: result.data.smoking_status === "aktif" ? "Ya" : "Tidak",
          }))
        } else {
          console.error("Failed to fetch additional profile data:", result.message)
        }
      } catch (error) {
        console.error("Error fetching additional profile data:", error)
      }
    }

    if (user?.username) { // Only fetch if user data is available (meaning logged in)
      fetchProfileData()
      setProfileImage(user.profilePicture || null); // Set initial profile image from user prop
    }
  }, [user])


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
        setImageLoaded(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image cropping and upload
  const handleCropImage = async () => {
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

    // Convert to data URL
    const croppedImage = canvas.toDataURL("image/jpeg", 0.8)
    setProfileImage(croppedImage)
    setShowImageCropper(false)
    setTempImage(null)

    // Upload to server
    try {
      const token = localStorage.getItem("token")
      function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(",")
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], { type: mime })
      }

      const blob = dataURLtoBlob(croppedImage)
      const formData = new FormData()
      formData.append("image", blob, "profile.jpg") // 'image' = nama field

      const res = await fetch(`${config.apiUserService}/api/photoprofile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`  
        },
        body: formData
      })

      const result = await res.json()
      if (res.ok && result.profilePictureUrl) {
        // Update user data in ContentContainer and localStorage
        const updatedUser = {
          ...user,
          profilePicture: result.profilePictureUrl
        }
        onUserUpdate(updatedUser); // Update parent state
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 1500);
      } else {
        alert("Gagal menyimpan foto: " + (result.message || "Unknown error"))
      }
    } catch (err) {
      console.error("Upload error", err)
      alert("Terjadi kesalahan saat upload foto.")
    }
  }

  // Handle profile image removal
  const handleRemoveImage = async () => {
    // Implement API call to remove photo from server if needed
    // For now, just clear locally
    setProfileImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    // Optional: API call to delete photo from server
    try {
      const token = localStorage.getItem("token");
      await fetch(`${config.apiUserService}/api/photoprofile`, { // Assuming DELETE method for removing photo
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedUser = { ...user, profilePicture: "" };
      onUserUpdate(updatedUser);
      alert("Foto profil berhasil dihapus.");
    } catch (error) {
      console.error("Error removing profile photo:", error);
      alert("Terjadi kesalahan saat menghapus foto profil.");
    }
  };

  // Handle image load to get dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { width, height } = imageRef.current
      setImageDimensions({ width, height })
      setImageLoaded(true)

      // Reset crop to center with appropriate size
      const maxSize = Math.min(width, height, 300)
      const initialSize = Math.min(200, maxSize)
      setCropData({
        x: (width - initialSize) / 2,
        y: (height - initialSize) / 2,
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

  // Handle form submission for profile data
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const updateFields = {
        age: parseInt(formData.age),
        gender: formData.gender || "lainnya",
        height_cm: parseInt(formData.height),
        weight_kg: parseInt(formData.weight),
        smoking_status: formData.isActiveSmoker === "Ya" ? "aktif" : "tidak aktif",
        chronic_diseases: formData.medicalHistory
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
      }
      const response = await fetch(`${config.apiUserService}/api/update/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateFields), // Send updateFields directly
      })
      const result = await response.json()

      if (response.ok) {
        setShowSuccessPopup(true)
        // Update user data in ContentContainer and localStorage
        const updatedUser = {
          ...user,
          ...formData, // Update with new form data
          gender: updateFields.gender,
          age: updateFields.age,
          height: updateFields.height_cm,
          weight: updateFields.weight_kg,
          medicalHistory: updateFields.chronic_diseases,
          isActiveSmoker: updateFields.smoking_status === "aktif" ? "Ya" : "Tidak",
        };
        onUserUpdate(updatedUser); // Update parent state
      } else {
        console.error("Gagal memperbarui profil:", result.message)
        alert("Gagal menyimpan data ke server: " + (result.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Error saat menyimpan profil:", error)
      alert("Terjadi kesalahan saat menyimpan data.")
    } finally {
      setIsLoading(false)
      setTimeout(() => setShowSuccessPopup(false), 1500)
    }
  }

  const profileImgSrc = profileImage || "/default-avatar.jpg"; // Use profileImage state
  const hasProfilePicture = profileImage && profileImage !== "";

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
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">
              Berhasil!
            </h3>
            <p className="text-center text-gray-600">
              Profil Anda telah diperbarui.
            </p>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showImageCropper && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Crop Image
            </h2>
            <div
              className="relative overflow-hidden flex justify-center items-center bg-gray-100"
              style={{ width: "100%", height: "300px" }}
            >
              {tempImage && (
                <img
                  ref={imageRef}
                  src={tempImage}
                  alt="Image to crop"
                  className="max-w-full max-h-full object-contain"
                  onLoad={handleImageLoad}
                  onMouseDown={handleMouseDown}
                  style={{ cursor: isDragging ? "grabbing" : "grab" }}
                />
              )}
              {imageLoaded && (
                <>
                  <div
                    className="absolute border-2 border-red-500 box-border pointer-events-none"
                    style={{
                      left: cropData.x,
                      top: cropData.y,
                      width: cropData.size,
                      height: cropData.size,
                      cursor: getCursorStyle(),
                    }}
                  ></div>
                  <div
                    className="absolute w-4 h-4 bg-red-500 border border-white rounded-full cursor-nw-resize"
                    style={{
                      left: cropData.x + cropData.size - 8,
                      top: cropData.y + cropData.size - 8,
                      pointerEvents: "auto",
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      setIsResizing(true)
                      const centerX = cropData.x + cropData.size / 2
                      const centerY = cropData.y + cropData.size / 2
                      const initialDistance = Math.sqrt(
                        Math.pow(e.clientX - (imageRef.current.getBoundingClientRect().left + centerX), 2) +
                        Math.pow(e.clientY - (imageRef.current.getBoundingClientRect().top + centerY), 2)
                      )
                      setResizeStart({
                        x: centerX,
                        y: centerY,
                        initialSize: cropData.size,
                        initialDistance: initialDistance,
                      })
                    }}
                  ></div>
                </>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas> {/* Hidden canvas for cropping */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowImageCropper(false)
                  setTempImage(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropImage}
                className="px-4 py-2 bg-[#ff3131] text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowImageViewer(false)}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-xl max-w-xl max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              &times;
            </button>
            <img
              src={profileImage}
              alt="Profile"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16 pt-24">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10 leading-tight">
          Profil Pengguna
        </h1>
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 lg:p-12 max-w-3xl mx-auto border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto Profil */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#ff3131] shadow-md group">
                <img
                  src={profileImgSrc}
                  alt="Foto Profil"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  onClick={() => setShowImageViewer(true)}
                  title="Lihat Foto"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <div className="mt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="bg-[#ff3131] hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span>Unggah Foto</span>
                </button>
                {hasProfilePicture && ( // Only show remove button if there's a picture
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>
            </div>

            {/* Informasi Akun */}
            <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">
              Informasi Akun
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff3131] focus:border-[#ff3131] sm:text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff3131] focus:border-[#ff3131] sm:text-sm"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff3131] focus:border-[#ff3131] sm:text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            {/* Data Kesehatan Tambahan */}
            <h2 className="text-2xl font-bold text-gray-700 mb-4 pt-8 border-b pb-2">
              Data Kesehatan Tambahan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jenis Kelamin
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff3131] focus:border-[#ff3131] sm:text-sm"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="laki-laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Usia (tahun)
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff3131] focus:border-[#ff3131] sm:text-sm"
                  placeholder="Masukkan usia Anda"
                />
              </div>
              <div>
                <label
                  htmlF
                  ="weight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tinggi Badan (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff3131] focus:border-[#ff3131] sm:text-sm"
                  placeholder="Masukkan tinggi badan Anda"
                />
              </div>
              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Berat Badan (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff3131] focus:border-[#ff3131] sm:text-sm"
                  placeholder="Masukkan berat badan Anda"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="medicalHistory"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Riwayat Penyakit (pisahkan dengan koma)
                </label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  rows="3"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff3131] focus:border-[#ff3131] sm:text-sm resize-y"
                  placeholder="Contoh: Diabetes, Hipertensi"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="isActiveSmoker"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status Perokok Aktif
                </label>
                <select
                  id="isActiveSmoker"
                  name="isActiveSmoker"
                  value={formData.isActiveSmoker}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff3131] focus:border-[#ff3131] sm:text-sm"
                >
                  <option value="">Pilih</option>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ff3131] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:shadow-[0_0_40px_#b81414] text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#ff3131] focus:ring-offset-2 flex items-center justify-center space-x-2"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Menyimpan...</span>
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