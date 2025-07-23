import { config } from "../../config"
import { useState, useEffect } from "react"

const Symptom = () => {
  const [query, setQuery] = useState("")
  const [symptoms, setSymptoms] = useState([]) // Will store objects with both English and Indonesian
  const [selectedSymptoms, setSelectedSymptoms] = useState([]) // Will store English values for API
  const [selectedSymptomsDisplay, setSelectedSymptomsDisplay] = useState([]) // Will store Indonesian for display
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch gejala berdasarkan query
  useEffect(() => {
    const fetchSymptoms = async () => {
      if (!query) {
        setSymptoms([])
        setSearchLoading(false)
        return
      }

      setSearchLoading(true)
      try {
        const response = await fetch(`${config.apiSymtomService}/symptom?q=${query}`)
        const data = await response.json()
        console.log("Response GET symptoms:", data)

        // Handle different response structures
        let symptomsArray = []
        if (Array.isArray(data)) {
          symptomsArray = data
        } else if (data.symptoms && Array.isArray(data.symptoms)) {
          symptomsArray = data.symptoms
        }

        // Process symptoms to have both English and Indonesian
        const processedSymptoms = symptomsArray.map((symptom) => {
          if (typeof symptom === "object" && symptom !== null) {
            return {
              english: symptom.symptoms || symptom.id || "Unknown symptom",
              indonesian: symptom.symptoms_translated || symptom.symptoms || symptom.id || "Unknown symptom",
              id: symptom.id,
            }
          } else if (typeof symptom === "string") {
            return {
              english: symptom,
              indonesian: symptom,
              id: symptom,
            }
          }
          return {
            english: String(symptom),
            indonesian: String(symptom),
            id: String(symptom),
          }
        })

        setSymptoms(processedSymptoms)
      } catch (error) {
        console.error("Gagal fetch symptom:", error)
        setSymptoms([])
        setError("Gagal mengambil data gejala. Silakan coba lagi.")
      } finally {
        setSearchLoading(false)
      }
    }

    const timeout = setTimeout(fetchSymptoms, 300) // debounce
    return () => clearTimeout(timeout)
  }, [query])

  const toggleSymptom = (symptomObj) => {
    const englishValue = symptomObj.english
    const indonesianValue = symptomObj.indonesian

    if (selectedSymptoms.includes(englishValue)) {
      // Remove symptom
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== englishValue))
      setSelectedSymptomsDisplay(selectedSymptomsDisplay.filter((s) => s !== indonesianValue))
    } else {
      // Add symptom
      setSelectedSymptoms([...selectedSymptoms, englishValue])
      setSelectedSymptomsDisplay([...selectedSymptomsDisplay, indonesianValue])
    }
  }

  const removeSingleSymptom = (indonesianValue) => {
    const index = selectedSymptomsDisplay.indexOf(indonesianValue)
    if (index > -1) {
      const newSelectedSymptoms = [...selectedSymptoms]
      const newSelectedSymptomsDisplay = [...selectedSymptomsDisplay]

      newSelectedSymptoms.splice(index, 1)
      newSelectedSymptomsDisplay.splice(index, 1)

      setSelectedSymptoms(newSelectedSymptoms)
      setSelectedSymptomsDisplay(newSelectedSymptomsDisplay)
    }
  }

  const handleCheck = async () => {
    setLoading(true)
    setPrediction(null)
    setError(null)

    try {
      const response = await fetch(`${config.apiSymtomService}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selectedSymptoms }), // Send English values
      })

      const data = await response.json()
      console.log("Response POST predict:", data)
      setPrediction(data)
    } catch (error) {
      console.error("Gagal prediksi:", error)
      setError("Gagal mendapatkan prediksi. Silakan coba lagi.")
    }
    setLoading(false)
  }

  const handleReset = () => {
    setQuery("")
    setSymptoms([])
    setSelectedSymptoms([])
    setSelectedSymptomsDisplay([])
    setPrediction(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 lg:pt-25 pb-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cek Prediksi Penyakit</h1>
          <p className="text-gray-600">Masukkan gejala yang Anda rasakan untuk mendapatkan prediksi penyakit</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-400 mr-2">⚠️</div>
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Gejala</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik gejala yang Anda rasakan..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#ff3131] focus:outline-none transition-colors text-lg"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#ff3131]"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Symptoms List */}
            {symptoms.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Pilih Gejala:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {symptoms.map((symptomObj, idx) => {
                    const isSelected = selectedSymptoms.includes(symptomObj.english)
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleSymptom(symptomObj)}
                        className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-[#ff3131] bg-red-50 text-[#ff3131] shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{symptomObj.indonesian}</span>
                          {isSelected && <div className="text-[#ff3131]">✓</div>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* No symptoms found */}
            {query && !searchLoading && symptoms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p className="font-medium">Gejala tidak ditemukan</p>
                <p className="text-sm">Coba kata kunci yang berbeda</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Symptoms */}
        {selectedSymptomsDisplay.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Gejala Terpilih ({selectedSymptomsDisplay.length})
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSymptomsDisplay.map((symptomDisplay, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#ff3131] text-white"
                >
                  {symptomDisplay}
                  <button
                    onClick={() => removeSingleSymptom(symptomDisplay)}
                    className="ml-2 hover:bg-red-600 rounded-full p-1 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCheck}
                disabled={selectedSymptoms.length === 0 || loading}
                className="flex-1 sm:flex-none bg-[#ff3131] hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-12 min-w-[200px]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  "Cek Prediksi"
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 h-12"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Prediction Results */}
        {prediction && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📋</div>
              <h2 className="text-2xl font-bold text-gray-900">Hasil Prediksi</h2>
            </div>

            <div className="bg-gradient-to-r from-[#ff3131] to-red-600 rounded-xl p-6 text-white mb-6">
              <div className="text-center">
                <div className="text-xl font-semibold mb-2">Prediksi Penyakit</div>
                <div className="text-sm opacity-90">Berdasarkan gejala yang Anda pilih</div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-6 text-gray-800 border-b-2 border-[#ff3131] pb-2">Detail Hasil</h3>

              {/* Input Symptoms Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-blue-800">Gejala yang Dimasukkan</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {prediction?.input_symptoms?.map((symptom, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-blue-100"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 font-medium">
                        {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predicted Diseases Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-6">
                  <div className="bg-green-500 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-green-800">Hasil Prediksi Penyakit</h4>
                </div>

                <div className="space-y-6">
                  {prediction?.details?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow"
                    >
                      {/* Disease Header */}
                      <div className="mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center mb-3">
                          <div className="bg-[#ff3131] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                            {index + 1}
                          </div>
                          <h5 className="text-xl font-bold text-gray-800">
                            {item.disease.charAt(0).toUpperCase() + item.disease.slice(1)}
                          </h5>
                        </div>
                        <div className="ml-11">
                          <div className="inline-flex items-center bg-[#ff3131] text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Probabilitas: {prediction?.predicted_diseases?.[index]?.probability ?? "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Disease Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {/* Description */}
                        <div className="md:col-span-2 xl:col-span-1">
                          <div className="flex items-center mb-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <h6 className="font-semibold text-gray-700">Deskripsi</h6>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                            {item.description}
                          </p>
                        </div>

                        {/* Treatment */}
                        <div className="md:col-span-2 xl:col-span-1">
                          <div className="flex items-center mb-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <h6 className="font-semibold text-gray-700">Pengobatan</h6>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed bg-green-50 p-4 rounded-lg border border-green-100">
                            {item.treatment}
                          </p>
                        </div>

                        {/* Urgency */}
                        <div className="md:col-span-2 xl:col-span-1">
                          <div className="flex items-center mb-3">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                            <h6 className="font-semibold text-gray-700">Tingkat Bahaya</h6>
                          </div>
                          <div
                            className={`p-4 rounded-lg text-sm font-semibold text-center ${
                              item.urgency.toLowerCase().includes("high") ||
                              item.urgency.toLowerCase().includes("tinggi")
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : item.urgency.toLowerCase().includes("medium") ||
                                    item.urgency.toLowerCase().includes("sedang")
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-green-100 text-green-800 border border-green-200"
                            }`}
                          >
                            {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <div className="text-blue-500 mr-2">ℹ️</div>
                <div className="text-blue-800 text-sm">
                  <strong>Disclaimer:</strong> Hasil prediksi ini hanya untuk referensi dan tidak menggantikan
                  konsultasi dengan dokter. Segera konsultasikan dengan tenaga medis profesional untuk diagnosis yang
                  akurat.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!query && selectedSymptomsDisplay.length === 0 && !prediction && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mulai Pencarian</h3>
            <p className="text-gray-600 mb-6">
              Ketik gejala yang Anda rasakan pada kolom pencarian di atas untuk memulai
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Symptom