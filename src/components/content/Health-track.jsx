import { useState, useEffect, useCallback } from "react"
import { config } from "../../config"

const HealthTrack = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    exerciseDuration: "",
    exerciseType: "",
    sleepHours: "",
    waterIntake: "",
    junkFoodFrequency: "",
    mood: "",
    stress: "",
    screenTime: "",
    bloodPressureKnown: "",
    systolicBP: "",
  })
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [weeklyScores, setWeeklyScores] = useState([])
  const [apiAnalysisData, setApiAnalysisData] = useState(null)
  const [submissionMessage, setSubmissionMessage] = useState("")
  const [accessToken, setAccessToken] = useState(null)
  const [isStarted, setIsStarted] = useState(false)

  const totalSteps = 9
  const progress = (currentStep / totalSteps) * 100

  const USER_ID = 4

  const fetchApiAnalysisData = useCallback(async () => {
    if (!accessToken) {
      console.error("Access token not available for fetching analysis data.")
      setSubmissionMessage("Anda perlu login untuk melihat analisis.")
      return
    }
    try {
      const response = await fetch(`${config.apiUserService}/tracker`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (response.ok && data.status === "success") {
        setApiAnalysisData(data.data.analysis)
      } else {
        console.error("Failed to fetch API analysis data:", data.message)
        setSubmissionMessage("Gagal mengambil data analisis dari server.")
      }
    } catch (error) {
      console.error("Error fetching API analysis data:", error)
      setSubmissionMessage("Terjadi kesalahan saat mengambil data analisis.")
    }
  }, [accessToken])

  useEffect(() => {
    const storedWeeklyScores = JSON.parse(localStorage.getItem("weeklyScores") || "[]")
    const storedAccessToken = localStorage.getItem("accessToken")

    setWeeklyScores(storedWeeklyScores)
    setAccessToken(storedAccessToken)
  }, [])

  useEffect(() => {
    if (showAnalysis && accessToken) {
      fetchApiAnalysisData()
    }
  }, [showAnalysis, accessToken, fetchApiAnalysisData])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const mapExerciseDurationToMinutes = (duration) => {
    switch (duration) {
      case "0":
        return 0
      case "<10":
        return 5
      case "10–30":
        return 20
      case "30–60":
        return 45
      case "60+":
        return 75
      default:
        return 0
    }
  }

  const mapJunkFoodFrequencyToNumber = (frequency) => {
    switch (frequency) {
      case "0":
        return 0
      case "1":
        return 1
      case "2":
        return 2
      case "3":
        return 3
      case "4":
        return 4
      case ">5":
        return 6
      default:
        return 0
    }
  }

  const mapExerciseTypeToApiFormat = (type) => {
    return type.toLowerCase().replace(/\s/g, "_")
  }

  const handleAnalysis = async () => {
    if (!accessToken) {
      alert("Anda perlu login untuk mengirim data kesehatan.")
      return
    }

    const exerciseMinutes = mapExerciseDurationToMinutes(formData.exerciseDuration)
    const junkFoodCount = mapJunkFoodFrequencyToNumber(formData.junkFoodFrequency)
    const sleepHoursNum = Number.parseInt(formData.sleepHours)
    const waterIntakeNum = Number.parseInt(formData.waterIntake)
    const moodNum = Number.parseInt(formData.mood)
    const stressNum = Number.parseInt(formData.stress)
    const screenTimeNum = Number.parseFloat(formData.screenTime)
    const systolicBPNum = Number.parseInt(formData.systolicBP)

    const payload = {
      user_id: USER_ID,
      exercise_minutes: exerciseMinutes,
      exercise_type: mapExerciseTypeToApiFormat(formData.exerciseType),
      sleep_hours: sleepHoursNum,
      water_glasses: waterIntakeNum,
      junk_food_count: junkFoodCount,
      overall_mood: moodNum,
      stress_level: stressNum,
      screen_time_hours: screenTimeNum,
      blood_pressure: systolicBPNum,
    }

    try {
      const response = await fetch(`${config.apiUserService}/tracker`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.status === "success") {
        setSubmissionMessage("Data kesehatan berhasil disimpan!")

        // Update weekly scores for local chart
        const currentOverallScore = getOverallScore(getAnalysisData())
        const todayDate = new Date().toISOString().split("T")[0]
        const updatedWeeklyScores = [...weeklyScores, { date: todayDate, score: currentOverallScore }].slice(-7)
        localStorage.setItem("weeklyScores", JSON.stringify(updatedWeeklyScores))
        setWeeklyScores(updatedWeeklyScores)

        setShowAnalysis(true)
      } else {
        if (data.statusCode === 401 || data.message === "Token telah kedaluwarsa") {
          setSubmissionMessage("Sesi Anda telah berakhir. Harap login kembali.")
        } else {
          setSubmissionMessage(`Gagal menyimpan data: ${data.message || "Terjadi kesalahan."}`)
        }
        alert(submissionMessage)
        console.error("API Error:", data)
      }
    } catch (error) {
      setSubmissionMessage("Terjadi kesalahan jaringan. Silakan coba lagi.")
      alert(submissionMessage)
      console.error("Network Error:", error)
    }
  }

  const getAnalysisData = () => {
    const exerciseMinutes = mapExerciseDurationToMinutes(formData.exerciseDuration)
    const junkFoodCount = mapJunkFoodFrequencyToNumber(formData.junkFoodFrequency)
    const sleepHoursNum = Number.parseInt(formData.sleepHours) || 0
    const waterIntakeNum = Number.parseInt(formData.waterIntake) || 0
    const moodNum = Number.parseInt(formData.mood) || 1
    const stressNum = Number.parseInt(formData.stress) || 1
    const screenTimeNum = Number.parseFloat(formData.screenTime) || 0
    const systolicBPNum = Number.parseInt(formData.systolicBP) || 120

    const analysis = {
      physicalActivity: {
        score:
          exerciseMinutes >= 60
            ? 100
            : exerciseMinutes >= 30
              ? 80
              : exerciseMinutes >= 10
                ? 60
                : exerciseMinutes > 0
                  ? 40
                  : 20,
        status:
          exerciseMinutes >= 60
            ? "Excellent"
            : exerciseMinutes >= 30
              ? "Good"
              : exerciseMinutes >= 10
                ? "Fair"
                : "Needs Improvement",
      },
      sleep: {
        score: sleepHoursNum >= 7 && sleepHoursNum <= 9 ? 100 : sleepHoursNum >= 6 ? 70 : 40,
        status: sleepHoursNum >= 7 && sleepHoursNum <= 9 ? "Optimal" : sleepHoursNum >= 6 ? "Adequate" : "Insufficient",
      },
      hydration: {
        score: waterIntakeNum >= 8 ? 100 : waterIntakeNum >= 6 ? 80 : waterIntakeNum >= 4 ? 60 : 40,
        status: waterIntakeNum >= 8 ? "Excellent" : waterIntakeNum >= 6 ? "Good" : "Needs Improvement",
      },
      mentalHealth: {
        score: (moodNum + (6 - stressNum)) * 10,
        status: moodNum >= 4 && stressNum <= 2 ? "Good" : moodNum >= 3 && stressNum <= 3 ? "Fair" : "Needs Attention",
      },
      junkFood: {
        score: junkFoodCount === 0 ? 100 : junkFoodCount <= 1 ? 80 : junkFoodCount <= 2 ? 60 : 40,
        status: junkFoodCount === 0 ? "Excellent" : junkFoodCount <= 1 ? "Good" : "Needs Improvement",
      },
      screenTime: {
        score: screenTimeNum <= 2 ? 100 : screenTimeNum <= 4 ? 80 : screenTimeNum <= 6 ? 60 : 40,
        status: screenTimeNum <= 2 ? "Optimal" : screenTimeNum <= 4 ? "Moderate" : "High",
      },
      bloodPressure: {
        score:
          systolicBPNum >= 90 && systolicBPNum <= 120
            ? 100
            : systolicBPNum >= 121 && systolicBPNum <= 139
              ? 80
              : systolicBPNum >= 140 || systolicBPNum < 90
                ? 60
                : 40,
        status:
          systolicBPNum >= 90 && systolicBPNum <= 120
            ? "Optimal"
            : systolicBPNum >= 121 && systolicBPNum <= 139
              ? "Pre-hypertension"
              : "High/Low",
      },
    }
    return analysis
  }

  const getOverallScore = (analysis) => {
    const scores = [
      analysis.physicalActivity.score,
      analysis.sleep.score,
      analysis.hydration.score,
      analysis.mentalHealth.score,
      analysis.junkFood.score,
      analysis.screenTime.score,
      analysis.bloodPressure.score,
    ]
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    return Math.round(totalScore / scores.length)
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mulai Tracking Kesehatan Anda</h1>
          <p className="text-gray-600 mb-8">
            Jawab beberapa pertanyaan singkat untuk mendapatkan analisis kesehatan harian Anda.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setIsStarted(true)}
              className="w-full bg-[#ff3131] hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors h-12"
            >
              Mulai Sekarang
            </button>
            {apiAnalysisData && (
              <button
                onClick={() => {
                  setIsStarted(true)
                  setShowAnalysis(true)
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors h-12"
              >
                Lihat Analisis
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (showAnalysis) {
    const localAnalysis = getAnalysisData()
    const overallScore = getOverallScore(localAnalysis)

    const chartLabels = weeklyScores.map((entry) => {
      const date = new Date(entry.date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    })
    const chartData = weeklyScores.map((entry) => entry.score)

    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4">
        <div className="w-[90%] max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analisis Kesehatan Anda</h1>
              <p className="text-gray-600">Berdasarkan data yang Anda berikan</p>
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-r from-[#ff3131] to-red-600 rounded-xl p-6 text-white mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{overallScore}/100</div>
                <div className="text-xl">Skor Kesehatan Keseluruhan Harian</div>
              </div>
            </div>

            {/* Weekly Overall Score Diagram */}
            {weeklyScores.length > 0 && (
              <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Tren Skor Kesehatan Mingguan</h3>
                <div className="w-full h-64">
                  <pre className="mermaid">
                    {`
                  lineChart
                    title "Skor Kesehatan Keseluruhan (7 Hari Terakhir)"
                    xLabels [${chartLabels.map((label) => `"${label}"`).join(", ")}]
                    series "Skor"
                      data [${chartData.join(", ")}]
                  `}
                  </pre>
                </div>
              </div>
            )}

            {/* Detailed Analysis Diagram */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Analisis Kategori Kesehatan</h3>
              <div className="w-full h-64">
                <pre className="mermaid">
                  {`
                barChart
                  title "Skor Kategori Kesehatan Harian"
                  xAxis "Kategori"
                  yAxis "Skor (0-100)"
                  series "Skor"
                    Aktivitas Fisik: ${localAnalysis.physicalActivity.score}
                    Tidur: ${localAnalysis.sleep.score}
                    Hidrasi: ${localAnalysis.hydration.score}
                    Kesehatan Mental: ${localAnalysis.mentalHealth.score}
                    Junk Food: ${localAnalysis.junkFood.score}
                    Screen Time: ${localAnalysis.screenTime.score}
                    Tekanan Darah: ${localAnalysis.bloodPressure.score}
                `}
                </pre>
              </div>
            </div>

            {/* Detailed Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">🏃</span>
                  </div>
                  <h3 className="text-lg font-semibold">Aktivitas Fisik</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{localAnalysis.physicalActivity.score}/100</span>
                  <span className="text-sm text-gray-600">{localAnalysis.physicalActivity.status}</span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">😴</span>
                  </div>
                  <h3 className="text-lg font-semibold">Kualitas Tidur</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">{localAnalysis.sleep.score}/100</span>
                  <span className="text-sm text-gray-600">{localAnalysis.sleep.status}</span>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">💧</span>
                  </div>
                  <h3 className="text-lg font-semibold">Hidrasi</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{localAnalysis.hydration.score}/100</span>
                  <span className="text-sm text-gray-600">{localAnalysis.hydration.status}</span>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">😊</span>
                  </div>
                  <h3 className="text-lg font-semibold">Kesehatan Mental</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-600">{localAnalysis.mentalHealth.score}/100</span>
                  <span className="text-sm text-gray-600">{localAnalysis.mentalHealth.status}</span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">🍔</span>
                  </div>
                  <h3 className="text-lg font-semibold">Pola Makan (Junk Food)</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">{localAnalysis.junkFood.score}/100</span>
                  <span className="text-sm text-gray-600">{localAnalysis.junkFood.status}</span>
                </div>
              </div>

              <div className="bg-cyan-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">📱</span>
                  </div>
                  <h3 className="text-lg font-semibold">Digital Wellbeing (Screen Time)</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-cyan-600">{localAnalysis.screenTime.score}/100</span>
                  <span className="text-sm text-gray-600">{localAnalysis.screenTime.status}</span>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">🩺</span>
                  </div>
                  <h3 className="text-lg font-semibold">Tekanan Darah</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-600">{localAnalysis.bloodPressure.score}/100</span>
                  <span className="text-sm text-gray-600">{localAnalysis.bloodPressure.status}</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Rekomendasi</h3>
              <ul className="space-y-2 text-gray-700">
                {apiAnalysisData?.recommendations?.length > 0 ? (
                  apiAnalysisData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#ff3131] mr-2">•</span>
                      <div>
                        <p className="font-medium">{rec.message}</p>
                        {rec.tips && rec.tips.length > 0 && (
                          <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                            {rec.tips.map((tip, tipIndex) => (
                              <li key={tipIndex}>{tip}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <>
                    {localAnalysis.physicalActivity.score < 70 && (
                      <li className="flex items-start">
                        <span className="text-[#ff3131] mr-2">•</span>
                        Tingkatkan aktivitas fisik Anda menjadi minimal 30 menit per hari
                      </li>
                    )}
                    {localAnalysis.sleep.score < 70 && (
                      <li className="flex items-start">
                        <span className="text-[#ff3131] mr-2">•</span>
                        Usahakan tidur 7-9 jam per malam untuk kesehatan optimal
                      </li>
                    )}
                    {localAnalysis.hydration.score < 70 && (
                      <li className="flex items-start">
                        <span className="text-[#ff3131] mr-2">•</span>
                        Tingkatkan konsumsi air putih menjadi minimal 8 gelas per hari
                      </li>
                    )}
                    {localAnalysis.mentalHealth.score < 70 && (
                      <li className="flex items-start">
                        <span className="text-[#ff3131] mr-2">•</span>
                        Pertimbangkan teknik relaksasi atau konsultasi untuk mengelola stres
                      </li>
                    )}
                    {localAnalysis.junkFood.score < 70 && (
                      <li className="flex items-start">
                        <span className="text-[#ff3131] mr-2">•</span>
                        Kurangi konsumsi makanan olahan/junk food.
                      </li>
                    )}
                    {localAnalysis.screenTime.score < 70 && (
                      <li className="flex items-start">
                        <span className="text-[#ff3131] mr-2">•</span>
                        Batasi waktu layar Anda untuk kesehatan mata dan mental.
                      </li>
                    )}
                    {localAnalysis.bloodPressure.score < 70 && (
                      <li className="flex items-start">
                        <span className="text-[#ff3131] mr-2">•</span>
                        Pantau tekanan darah Anda secara teratur dan konsultasikan dengan dokter jika ada kekhawatiran.
                      </li>
                    )}
                    {localAnalysis.physicalActivity.score >= 70 &&
                      localAnalysis.sleep.score >= 70 &&
                      localAnalysis.hydration.score >= 70 &&
                      localAnalysis.mentalHealth.score >= 70 &&
                      localAnalysis.junkFood.score >= 70 &&
                      localAnalysis.screenTime.score >= 70 &&
                      localAnalysis.bloodPressure.score >= 70 && (
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          Pertahankan kebiasaan sehat Anda!
                        </li>
                      )}
                  </>
                )}
              </ul>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  setShowAnalysis(false)
                  setIsStarted(false)
                  setSubmissionMessage("")
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors h-12 min-w-[200px]"
              >
                Kembali ke Beranda
              </button>
              <button
                onClick={() => {
                  setShowAnalysis(false)
                  setCurrentStep(1)
                  setFormData({
                    exerciseDuration: "",
                    exerciseType: "",
                    sleepHours: "",
                    waterIntake: "",
                    junkFoodFrequency: "",
                    mood: "",
                    stress: "",
                    screenTime: "",
                    bloodPressureKnown: "",
                    systolicBP: "",
                  })
                  setSubmissionMessage("")
                  setIsStarted(true)
                }}
                className="bg-[#ff3131] hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors h-12 min-w-[200px]"
              >
                Isi Form Baru
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🏃</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Aktivitas Fisik</h2>
              <p className="text-gray-600">Berapa menit kamu berolahraga atau bergerak aktif hari ini?</p>
            </div>

            <div className="space-y-3">
              {["0", "<10", "10–30", "30–60", "60+"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleInputChange("exerciseDuration", option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all h-14 flex items-center ${
                    formData.exerciseDuration === option
                      ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option} menit
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🏃</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Jenis Olahraga</h2>
              <p className="text-gray-600">Jenis olahraga hari ini?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Jalan kaki", "Lari", "Sepeda", "Gym", "Yoga", "Tim", "Lainnya"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleInputChange("exerciseType", option)}
                  className={`p-4 text-center rounded-lg border-2 transition-all h-14 flex items-center justify-center ${
                    formData.exerciseType === option
                      ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">😴</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tidur</h2>
              <p className="text-gray-600">Berapa jam kamu tidur semalam?</p>
            </div>

            <div className="max-w-md mx-auto">
              <input
                type="number"
                value={formData.sleepHours}
                onChange={(e) => handleInputChange("sleepHours", e.target.value)}
                placeholder="Masukkan jumlah jam"
                className="w-full p-4 text-center text-2xl border-2 border-gray-200 rounded-lg focus:border-[#ff3131] focus:outline-none h-16"
                min="0"
                max="24"
              />
              <p className="text-center text-gray-500 mt-2">jam</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🥤</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nutrisi & Pola Makan</h2>
              <p className="text-gray-600">Berapa gelas air yang kamu minum hari ini?</p>
            </div>

            <div className="max-w-md mx-auto">
              <input
                type="number"
                value={formData.waterIntake}
                onChange={(e) => handleInputChange("waterIntake", e.target.value)}
                placeholder="Masukkan jumlah gelas"
                className="w-full p-4 text-center text-2xl border-2 border-gray-200 rounded-lg focus:border-[#ff3131] focus:outline-none h-16"
                min="0"
              />
              <p className="text-center text-gray-500 mt-2">gelas</p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🥤</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nutrisi & Pola Makan</h2>
              <p className="text-gray-600">Berapa kali kamu makan makanan olahan atau junk food hari ini?</p>
            </div>

            <div className="space-y-3">
              {["0", "1", "2", "3", "4", ">5"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleInputChange("junkFoodFrequency", option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all h-14 flex items-center ${
                    formData.junkFoodFrequency === option
                      ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option} kali
                </button>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">😊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mood & Mental Health</h2>
              <p className="text-gray-600">Bagaimana mood kamu secara keseluruhan hari ini?</p>
            </div>

            <div className="space-y-4">
              <div className="text-center text-sm text-gray-500 mb-4">Skala 1-5</div>
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleInputChange("mood", rating.toString())}
                    className={`w-16 h-16 rounded-full border-2 text-xl font-bold transition-all ${
                      formData.mood === rating.toString()
                        ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sangat Buruk</span>
                <span>Sangat Baik</span>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">😊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mood & Mental Health</h2>
              <p className="text-gray-600">Seberapa stres kamu hari ini?</p>
            </div>

            <div className="space-y-4">
              <div className="text-center text-sm text-gray-500 mb-4">Skala 1-5</div>
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleInputChange("stress", rating.toString())}
                    className={`w-16 h-16 rounded-full border-2 text-xl font-bold transition-all ${
                      formData.stress === rating.toString()
                        ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tidak Stres</span>
                <span>Sangat Stres</span>
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">📱</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Digital Wellbeing</h2>
              <p className="text-gray-600">Berapa jam screen time kamu hari ini?</p>
            </div>

            <div className="max-w-md mx-auto">
              <input
                type="number"
                value={formData.screenTime}
                onChange={(e) => handleInputChange("screenTime", e.target.value)}
                placeholder="Masukkan jumlah jam"
                className="w-full p-4 text-center text-2xl border-2 border-gray-200 rounded-lg focus:border-[#ff3131] focus:outline-none h-16"
                min="0"
                max="24"
                step="0.5"
              />
              <p className="text-center text-gray-500 mt-2">jam</p>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🩺</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pemeriksaan Kesehatan</h2>
              <p className="text-gray-600">Apakah kamu tahu tekanan darah terakhirmu?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <button
                  onClick={() => handleInputChange("bloodPressureKnown", "yes")}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all h-14 flex items-center ${
                    formData.bloodPressureKnown === "yes"
                      ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Ya, saya tahu
                </button>

                <button
                  onClick={() => {
                    handleInputChange("bloodPressureKnown", "no")
                    handleInputChange("systolicBP", "120")
                  }}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all h-14 flex items-center ${
                    formData.bloodPressureKnown === "no"
                      ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Tidak tahu (Gunakan estimasi 120 mm)
                </button>
              </div>

              {formData.bloodPressureKnown === "yes" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tekanan Darah Sistolik (mmHg)</label>
                  <input
                    type="number"
                    value={formData.systolicBP}
                    onChange={(e) => handleInputChange("systolicBP", e.target.value)}
                    placeholder="Contoh: 120"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#ff3131] focus:outline-none h-12"
                    min="80"
                    max="200"
                  />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4">
      <div className="w-[90%] max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {currentStep}/{totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#ff3131] h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Submission Message */}
        {submissionMessage && (
          <div className="mb-4 p-3 rounded-lg text-center bg-green-100 text-green-700">{submissionMessage}</div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">{renderStep()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors h-12 min-w-[120px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          <div className="ml-auto">
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-[#ff3131] text-white rounded-lg hover:bg-red-600 transition-colors h-12 min-w-[120px]"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleAnalysis}
                className="flex items-center px-6 py-3 text-white rounded-lg transition-colors h-12 min-w-[180px] bg-green-600 hover:bg-green-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Kirim Analisis
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthTrack