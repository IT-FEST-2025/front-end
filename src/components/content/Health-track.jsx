import { config } from "../../config"
import { useState, useEffect } from "react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const HealthTrack = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    exercise_minutes: "",
    exercise_type: "",
    sleep_hours: "",
    water_glasses: "",
    junk_food_count: "",
    overall_mood: "",
    stress_level: "",
    screen_time_hours: "",
    blood_pressure: "",
  })
  const [isStarted, setIsStarted] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasData, setHasData] = useState(false)

  const totalSteps = 9
  const progress = (currentStep / totalSteps) * 100

  // Fetch existing health data when component mounts or when showing analysis
  useEffect(() => {
    if (showAnalysis) {
      fetchHealthData()
    }
  }, [showAnalysis])

  const fetchHealthData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.")
      }

      // Fetch analysis data
      const analysisResponse = await fetch(`${config.apiUserService}/tracker`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!analysisResponse.ok) {
        if (analysisResponse.status === 401) {
          throw new Error("Sesi telah berakhir. Silakan login kembali.")
        }
        // If no data found, we'll show empty state but still show the analysis layout
        if (analysisResponse.status === 404 || analysisResponse.status === 400 || analysisResponse.status === 500) {
          console.log("No data found, showing empty state")
          setHasData(false)
          setAnalysisData(null)
          setWeeklyData([])
          setIsLoading(false)
          return
        }
        throw new Error("Gagal mengambil data kesehatan")
      }

      const analysisResult = await analysisResponse.json()

      if (analysisResult.status === "success" && analysisResult.data) {
        setHasData(true)
        setAnalysisData(analysisResult.data.analysis)

        // Use dailyDiagnifyScore from the backend for the line chart
        const dailyScores = analysisResult.data.dailyDiagnifyScore

        if (dailyScores && dailyScores.length > 0) {
          const chartData = dailyScores.map((item) => {
            const date = new Date(item.record_date)
            // Format date to "DD Mon" for better readability on X-axis
            const formattedDate = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
            return {
              day: formattedDate, // Use formatted date for X-axis label
              date: item.record_date, // Keep original date if needed elsewhere
              score: Math.round(item.diagnifyScore), // Use actual diagnifyScore
            }
          })
          setWeeklyData(chartData)
        } else {
          setWeeklyData([]) // No daily scores available
        }
      } else {
        // No data available, but don't throw error - show empty state
        console.log("No analysis data in response, showing empty state")
        setHasData(false)
        setAnalysisData(null)
        setWeeklyData([])
      }
    } catch (err) {
      console.error("Error fetching health data:", err)
      // For network errors or other issues, show error
      // But for "no data" cases, we want to show empty state instead
      if (err.message.includes("Token") || err.message.includes("Sesi")) {
        setError(err.message)
      } else {
        // Treat other errors as "no data" for now
        setHasData(false)
        setAnalysisData(null)
        setWeeklyData([])
      }
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleStart = () => {
    setIsStarted(true)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.")
      }

      // Convert form data to match backend expectations - ensure numeric values
      const submitData = {
        exercise_minutes: Number(formData.exercise_minutes) || 0,
        exercise_type: formData.exercise_type || "tidak_ada",
        sleep_hours: Number(formData.sleep_hours) || 0,
        water_glasses: Number(formData.water_glasses) || 0,
        junk_food_count: Number(formData.junk_food_count) || 0,
        overall_mood: Number(formData.overall_mood) || 1,
        stress_level: Number(formData.stress_level) || 1,
        screen_time_hours: Number(formData.screen_time_hours) || 0,
        blood_pressure: Number(formData.blood_pressure) || 120,
      }

      const response = await fetch(`${config.apiUserService}/tracker`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error("Sesi telah berakhir. Silakan login kembali.")
        }
        // Check for duplicate entry error
        if (
          errorData.message &&
          errorData.message.includes(
            'new row for relation "health_records" violates check constraint "health_records_blood_pressure_check"',
          )
        ) {
          throw new Error("Anda sudah mengisi Health Track hari ini. Silakan coba lagi besok.")
        } else if (
          errorData.message &&
          (errorData.message.includes("duplicate") || errorData.message.includes("sudah ada"))
        ) {
          // Keep the previous duplicate check for other potential duplicate errors
          throw new Error("Anda sudah mengisi Health Track hari ini. Silakan coba lagi besok.")
        }
        throw new Error(errorData.message || "Gagal menyimpan data kesehatan")
      }

      const result = await response.json()

      if (result.status === "success") {
        // After successful submission, fetch the updated analysis
        await fetchHealthData()
        setShowAnalysis(true)
      } else {
        throw new Error(result.message || "Gagal menyimpan data")
      }
    } catch (err) {
      console.error("Error submitting health data:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="cursor-default text-center mb-8">
              <div className="text-4xl mb-4">🏃</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Aktivitas Fisik</h2>
              <p className="text-gray-600">Berapa menit kamu berolahraga atau bergerak aktif hari ini?</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "0 menit", value: "0" },
                { label: "<10 menit", value: "5" },
                { label: "10-30 menit", value: "20" },
                { label: "30-60 menit", value: "45" },
                { label: ">60 menit", value: "75" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange("exercise_minutes", option.value)}
                  className={`cursor-pointer w-full p-4 text-left rounded-lg border-2 transition-all h-14 flex items-center ${
                    formData.exercise_minutes === option.value
                      ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                      : "border-gray-200 hover:border-[#ff3131]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="cursor-default text-center mb-8">
              <div className="text-4xl mb-4">🏃</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Jenis Olahraga</h2>
              <p className="text-gray-600">Jenis olahraga hari ini?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Jalan kaki", value: "jalan_kaki" },
                { label: "Lari", value: "lari" },
                { label: "Sepeda", value: "sepeda" },
                { label: "Gym", value: "gym" },
                { label: "Yoga", value: "yoga" },
                { label: "Olahraga Tim", value: "tim" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange("exercise_type", option.value)}
                  className={`cursor-pointer p-4 text-center rounded-lg border-2 transition-all h-14 flex items-center justify-center ${
                    formData.exercise_type === option.value
                      ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                      : "border-gray-200 hover:border-[#ff3131]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="w-full">
              <button
                onClick={() => handleInputChange("exercise_type", "lainnya")}
                className={`cursor-pointer w-full p-4 text-center rounded-lg border-2 transition-all h-14 flex items-center justify-center ${
                  formData.exercise_type === "lainnya"
                    ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                    : "border-gray-200 hover:border-[#ff3131]"
                }`}
              >
                Lainnya
              </button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="cursor-default text-center mb-8">
              <div className="text-4xl mb-4">😴</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tidur</h2>
              <p className="text-gray-600">Berapa jam kamu tidur semalam?</p>
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="number"
                value={formData.sleep_hours}
                onChange={(e) => handleInputChange("sleep_hours", e.target.value)}
                placeholder="Masukkan jumlah jam"
                className="w-full p-4 text-center text-2xl border-2 border-gray-200 rounded-lg focus:border-[#ff3131] focus:outline-none duration-200 transition-colors h-16"
                min="0"
                max="24"
                step="0.5"
              />
              <p className="cursor-default text-center text-gray-500 mt-2">jam</p>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🥤</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hidrasi</h2>
              <p className="text-gray-600">Berapa gelas air yang kamu minum hari ini?</p>
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="number"
                value={formData.water_glasses}
                onChange={(e) => handleInputChange("water_glasses", e.target.value)}
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
            <div className="cursor-default text-center mb-8">
              <div className="text-4xl mb-4">🍔</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pola Makan</h2>
              <p className="text-gray-600">Berapa kali kamu makan makanan olahan atau junk food hari ini?</p>
            </div>
            <div className="space-y-3">
              {["0", "1", "2", "3", "4", "≥5"].map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleInputChange("junk_food_count", index.toString())}
                  className={`cursor-pointer w-full p-4 text-left rounded-lg border-2 transition-all h-14 flex items-center ${
                    formData.junk_food_count === index.toString()
                      ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                      : "border-gray-200 hover:border-[#ff3131]"
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
            <div className="cursor-default text-center mb-8">
              <div className="text-4xl mb-4">😊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mood Keseluruhan</h2>
              <p className="text-gray-600">Bagaimana mood kamu secara keseluruhan hari ini?</p>
            </div>
            <div className="space-y-4">
              <div className="cursor-default text-center text-sm text-gray-500 mb-4">Skala 1-5</div>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-between items-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleInputChange("overall_mood", rating.toString())}
                    className={`cursor-pointer w-16 h-16 rounded-full border-2 text-xl font-bold transition-all ${
                      formData.overall_mood === rating.toString()
                        ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                        : "border-gray-200 hover:border-[#ff3131]"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="cursor-default flex justify-between text-sm text-gray-500">
                <span>Sangat Buruk (1)</span>
                <span>Sangat Baik (5)</span>
              </div>
            </div>
          </div>
        )
      case 7:
        return (
          <div className="space-y-6">
            <div className="cursor-default text-center mb-8">
              <div className="text-4xl mb-4">😰</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tingkat Stress</h2>
              <p className="text-gray-600">Seberapa stres kamu hari ini?</p>
            </div>
            <div className="space-y-4">
              <div className="cursor-default text-center text-sm text-gray-500 mb-4">Skala 1-5</div>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-between items-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleInputChange("stress_level", rating.toString())}
                    className={`w-16 h-16 rounded-full border-2 text-xl font-bold transition-all ${
                      formData.stress_level === rating.toString()
                        ? "border-[#ff3131] bg-red-50 text-[#ff3131]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="cursor-default flex justify-between text-sm text-gray-500">
                <span>Tidak Stres (1)</span>
                <span>Sangat Stres (5)</span>
              </div>
            </div>
          </div>
        )
      case 8:
        return (
          <div className="space-y-6">
            <div className="cursor-default text-center mb-8">
              <div className="text-4xl mb-4">📱</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Screen Time</h2>
              <p className="text-gray-600">Berapa jam screen time kamu hari ini?</p>
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="number"
                value={formData.screen_time_hours}
                onChange={(e) => handleInputChange("screen_time_hours", e.target.value)}
                placeholder="Masukkan jumlah jam"
                className="w-full p-4 text-center text-2xl border-2 border-gray-200 rounded-lg focus:border-[#ff3131] focus:outline-none duration-200 transition-colors h-16"
                min="0"
                step="0.5"
              />
              <p className="cursor-default text-center text-gray-500 mt-2">jam</p>
            </div>
          </div>
        )
      case 9:
        return (
          <div className="space-y-6">
            <div className="cursor-default text-center mb-8">
              <div className="text-4xl mb-4">🩺</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tekanan Darah</h2>
              <p className="text-gray-600">Masukkan tekanan darah sistolik Anda (misal: 120)</p>
              <p className="text-gray-600">Disclaimer: Kosongkan saja jika tidak tahu</p>
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="number"
                value={formData.blood_pressure}
                onChange={(e) => handleInputChange("blood_pressure", e.target.value)}
                placeholder="Masukkan tekanan darah"
                className="w-full p-4 text-center text-2xl border-2 border-gray-200 rounded-lg focus:border-[#ff3131] focus:outline-none duration-200 transition-colors h-16"
                min="0"
              />
              <p className="cursor-default text-center text-gray-500 mt-2">mmHg</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Define max scores for each category as per TrackerService.js's calculateDiagnifyScore
  const categoryMaxScores = {
    Tidur: 20,
    Olahraga: 15,
    Hidrasi: 10,
    "Pola Makan": 10, // Corresponds to Diet
    Mental: 15, // Corresponds to Overall Mood
    Stress: 10, // Corresponds to Stress Level
    Screen: 10, // Corresponds to Screen Time
    Tekanan: 10, // Corresponds to Blood Pressure
  }

  // Helper function to calculate individual category scores based on averages
  const calculateIndividualCategoryScores = (averages) => {
    let sleepScore = 0
    if (averages.sleepHours >= 7 && averages.sleepHours <= 9) {
      sleepScore = 20
    } else if (averages.sleepHours >= 6 && averages.sleepHours < 7) {
      sleepScore = 15
    } else if (averages.sleepHours >= 5 && averages.sleepHours < 6) {
      sleepScore = 10
    } else {
      sleepScore = 5
    }

    let exerciseScore = 0
    if (averages.exerciseMinutes >= 30) {
      exerciseScore = 15
    } else if (averages.exerciseMinutes >= 20) {
      exerciseScore = 12
    } else if (averages.exerciseMinutes >= 10) {
      exerciseScore = 8
    } else if (averages.exerciseMinutes > 0) {
      exerciseScore = 5
    }

    let waterScore = 0
    if (averages.waterGlasses >= 8) {
      waterScore = 10
    } else if (averages.waterGlasses >= 6) {
      waterScore = 8
    } else if (averages.waterGlasses >= 4) {
      waterScore = 6
    } else {
      waterScore = 3
    }

    let junkFoodScore = 0
    if (averages.junkFoodCount <= 1) {
      junkFoodScore = 10
    } else if (averages.junkFoodCount <= 3) {
      junkFoodScore = 7
    } else if (averages.junkFoodCount <= 5) {
      junkFoodScore = 4
    } else {
      junkFoodScore = 1
    }

    let moodScore = 0
    if (averages.overallMood >= 4) {
      moodScore = 15
    } else if (averages.overallMood >= 3) {
      moodScore = 12
    } else if (averages.overallMood >= 2) {
      moodScore = 8
    } else {
      moodScore = 5
    }

    let stressScore = 0
    if (averages.stressLevel <= 2) {
      stressScore = 10
    } else if (averages.stressLevel <= 3) {
      stressScore = 8
    } else if (averages.stressLevel <= 4) {
      stressScore = 5
    } else {
      stressScore = 2
    }

    let screenTimeScore = 0
    if (averages.screenTimeHours <= 6) {
      screenTimeScore = 10
    } else if (averages.screenTimeHours <= 8) {
      screenTimeScore = 8
    } else if (averages.screenTimeHours <= 12) {
      screenTimeScore = 5
    } else {
      screenTimeScore = 2
    }

    let bloodPressureScore = 0
    // Logic based on TrackerService.js interpretation, prioritizing normal range
    if (averages.bloodPressure >= 90 && averages.bloodPressure <= 120) {
      bloodPressureScore = 10 // Normal
    } else if (averages.bloodPressure > 120 && averages.bloodPressure < 130) {
      bloodPressureScore = 7 // Elevated (closer to normal)
    } else if (averages.bloodPressure >= 130 && averages.bloodPressure < 140) {
      bloodPressureScore = 6 // Stage 1 Hypertension
    } else if (averages.bloodPressure >= 140 && averages.bloodPressure < 180) {
      bloodPressureScore = 4 // Stage 2 Hypertension
    } else if (averages.bloodPressure >= 180) {
      bloodPressureScore = 1 // Hypertensive Crisis (lowest score)
    } else if (averages.bloodPressure < 90 && averages.bloodPressure >= 50) {
      bloodPressureScore = 5 // Low blood pressure (not ideal, but not as critical as very high)
    } else if (averages.bloodPressure < 50) {
      bloodPressureScore = 2 // Very low blood pressure
    } else {
      bloodPressureScore = 0 // Fallback for unexpected values
    }

    return {
      sleep: sleepScore,
      exercise: exerciseScore,
      hydration: waterScore,
      diet: junkFoodScore,
      mental: moodScore,
      stress: stressScore,
      screenTime: screenTimeScore,
      bloodPressure: bloodPressureScore,
    }
  }

  // Generate daily health categories data for bar chart
  const getDailyChartData = () => {
    if (!hasData || !analysisData?.healthCategories || !analysisData?.analysis?.averages) {
      // Return empty data structure for no data state
      return [
        { name: "Tidur", shortName: "Tidur", score: 0, status: "-", fill: "#8884d8" },
        { name: "Olahraga", shortName: "Olahraga", score: 0, status: "-", fill: "#82ca9d" },
        { name: "Hidrasi", shortName: "Hidrasi", score: 0, status: "-", fill: "#ffc658" },
        { name: "Mental", shortName: "Mental", score: 0, status: "-", fill: "#ff7300" },
        { name: "Diet", shortName: "Diet", score: 0, status: "-", fill: "#00ff00" },
        { name: "Stress", shortName: "Stress", score: 0, status: "-", fill: "#ff00ff" },
        { name: "Screen Time", shortName: "Screen", score: 0, status: "-", fill: "#ff0000" },
        { name: "Tekanan Darah", shortName: "Tekanan", score: 0, status: "-", fill: "#8dd1e1" },
      ]
    }

    const individualScores = calculateIndividualCategoryScores(analysisData.analysis.averages)

    const categories = [
      { name: "Tidur", shortName: "Tidur", category: "sleep", color: "#8884d8" },
      { name: "Olahraga", shortName: "Olahraga", category: "exercise", color: "#82ca9d" },
      { name: "Hidrasi", shortName: "Hidrasi", category: "hydration", color: "#ffc658" },
      { name: "Mental", shortName: "Mental", category: "mental", color: "#ff7300" },
      { name: "Pola Makan", shortName: "Pola Makan", category: "diet", color: "#00ff00" },
      { name: "Stres", shortName: "Stres", category: "stress", color: "#ff00ff" },
      { name: "Waktu Layar", shortName: "Waktu Layar", category: "screenTime", color: "#ff0000" },
      { name: "Tekanan Darah", shortName: "Tekanan", category: "bloodPressure", color: "#8dd1e1" },
    ]

    return categories.map((cat) => {
      const status = analysisData.healthCategories[cat.category]
      const score = individualScores[cat.category] // Use the actual calculated score

      return {
        name: cat.name,
        shortName: cat.shortName,
        score,
        status,
        fill: cat.color,
      }
    })
  }

  // Custom tooltip for line chart
  const LineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          <p className="text-[#ff3131]">{`Skor Harianmu: ${payload[0].value}/100`}</p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const categoryName = payload[0].payload.name
      const maxScore = categoryMaxScores[payload[0].payload.shortName] || 20 // Use shortName for lookup, default to 20
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${categoryName}`}</p>
          <p className="text-gray-700">{`Status: ${payload[0].payload.status}`}</p>
          <p className="text-blue-600">{`Skor: ${payload[0].value}/${maxScore}`}</p>
        </div>
      )
    }
    return null
  }

  // Custom tick formatter for responsive X-axis
  const formatXAxisTick = (value, index, isMobile) => {
    if (isMobile) {
      return "" // Hide labels on mobile
    }
    // For desktop, show short names
    const data = getDailyChartData()
    const item = data.find((d) => d.name === value)
    return item ? item.shortName : value
  }

  // Show analysis page
  if (showAnalysis) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff3131] mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat analisis kesehatan...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setShowAnalysis(false)
                setIsStarted(false)
                setError(null)
              }}
              className="bg-[#ff3131] hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors h-12 min-w-[200px]"
            >
              Kembali
            </button>
          </div>
        </div>
      )
    }

    // Always show analysis layout, regardless of hasData
    const dailyChartData = getDailyChartData()

    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4">
        <div className="w-[96%] max-w-8xl mx-auto">
          <div className="bg-white rounded-xl cursor-default shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analisis Kesehatan Anda</h1>
              <p className="text-gray-600">
                {hasData && analysisData ? `Berdasarkan data ${analysisData.period}` : "Data belum tersedia"}
              </p>
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-r from-[#ff3131] to-red-600 rounded-xl p-6 text-white mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {hasData && analysisData ? `${analysisData.diagnifyScore}/100` : "-/100"}
                </div>
                <div className="text-xl">
                  Skor rata-ratamu ({hasData && analysisData ? analysisData.scoreCategory : "Belum Ada Data"})
                </div>
              </div>
            </div>

            {/* Weekly Trend Chart */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Tren Skor Kesehatan {hasData && weeklyData.length > 0 ? `${weeklyData.length} Hari Terakhirmu` : ""}
              </h3>
              {hasData && weeklyData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: 5, bottom: 40 }}>
                      {" "}
                      {/* Increased bottom margin */}
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="day"
                        angle={-45}
                        textAnchor="end"
                        height={60} // Increased height for labels
                        interval={0}
                        tick={{ fontSize: 12 }}
                        // Removed conditional hidden/block classes to ensure labels are always rendered and responsive
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip content={<LineTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#ff3131"
                        strokeWidth={3}
                        dot={{ fill: "#ff3131", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#ff3131", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="font-medium">Data belum tersedia</p>
                    <p className="text-sm">Isi form tracking secara rutin untuk melihat tren</p>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Health Categories Chart */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Skor Kesehatan Harianmu</h3>
              {hasData && analysisData ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyChartData} margin={{ top: 5, right: 10, left: 5, bottom: 40 }}>
                      {" "}
                      {/* Increased bottom margin */}
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60} // Increased height for labels
                        interval={0}
                        tick={{ fontSize: 12 }}
                        // Removed conditional hidden/block classes to ensure labels are always rendered and responsive
                        tickFormatter={(value) => {
                          const item = dailyChartData.find((d) => d.name === value)
                          return item ? item.shortName : value
                        }}
                      />
                      <YAxis domain={[0, 20]} />
                      <Tooltip content={<BarTooltip />} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="font-medium">Data belum tersedia</p>
                    <p className="text-sm">Isi form tracking untuk melihat analisis kategori kesehatan</p>
                  </div>
                </div>
              )}
            </div>

            {/* Health Categories Grid */}
            <div className="mb-8">
              {hasData && analysisData && analysisData.healthCategories
                ? (() => {
                    const categories = Object.entries(analysisData.healthCategories).map(([key, status]) => {
                      const categoryInfo = {
                        sleep: {
                          name: "Kualitas Tidur",
                          emoji: "😴",
                          avg: analysisData.analysis?.averages?.sleepHours,
                        },
                        exercise: {
                          name: "Aktivitas Fisik",
                          emoji: "🏃",
                          avg: analysisData.analysis?.averages?.exerciseMinutes,
                        },
                        hydration: { name: "Hidrasi", emoji: "💧", avg: analysisData.analysis?.averages?.waterGlasses },
                        mental: {
                          name: "Kesehatan Mental",
                          emoji: "😊",
                          avg: analysisData.analysis?.averages?.overallMood,
                        },
                        diet: { name: "Pola Makan", emoji: "🍔", avg: analysisData.analysis?.averages?.junkFoodCount },
                        stress: {
                          name: "Tingkat Stress",
                          emoji: "😰",
                          avg: analysisData.analysis?.averages?.stressLevel,
                        },
                        screenTime: {
                          name: "Screen Time",
                          emoji: "📱",
                          avg: analysisData.analysis?.averages?.screenTimeHours,
                        },
                        bloodPressure: {
                          name: "Tekanan Darah",
                          emoji: "🩺",
                          avg: analysisData.analysis?.averages?.bloodPressure,
                        },
                      }[key]

                      const getStatusColor = (status) => {
                        switch (status) {
                          case "Sangat Baik":
                          case "Baik":
                          case "Aktif":
                          case "Terhidrasi":
                          case "Sehat":
                          case "Normal":
                          case "Rendah":
                            return "bg-green-50 text-green-600 border-green-200"
                          case "Cukup":
                          case "Sedang":
                            return "bg-yellow-50 text-yellow-600 border-yellow-200"
                          default:
                            return "bg-red-50 text-red-600 border-red-200"
                        }
                      }

                      return {
                        key,
                        status,
                        categoryInfo,
                        colorClass: getStatusColor(status),
                      }
                    })

                    // Separate first 6 and last 2 categories
                    const firstSixCategories = categories.slice(0, 6)
                    const lastTwoCategories = categories.slice(6, 8)

                    return (
                      <>
                        {/* First 6 categories in 3 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                          {firstSixCategories.map(({ key, status, categoryInfo, colorClass }) => (
                            <div key={key} className={`rounded-lg p-4 border-2 ${colorClass}`}>
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-2">{categoryInfo?.emoji}</span>
                                <h4 className="font-semibold">{categoryInfo?.name}</h4>
                              </div>
                              <div className="text-sm">
                                <div className="font-medium">Status: {status}</div>
                                <div className="text-gray-600">
                                  Rata-rata: {categoryInfo?.avg?.toFixed(1) || "N/A"}
                                  {key === "sleep" && " jam"}
                                  {key === "exercise" && " menit"}
                                  {key === "hydration" && " gelas"}
                                  {key === "screenTime" && " jam"}
                                  {key === "bloodPressure" && " mmHg"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Last 2 categories in 2 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {lastTwoCategories.map(({ key, status, categoryInfo, colorClass }) => (
                            <div key={key} className={`rounded-lg p-4 border-2 ${colorClass}`}>
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-2">{categoryInfo?.emoji}</span>
                                <h4 className="font-semibold">{categoryInfo?.name}</h4>
                              </div>
                              <div className="text-sm">
                                <div className="font-medium">Status: {status}</div>
                                <div className="text-gray-600">
                                  Rata-rata: {categoryInfo?.avg?.toFixed(1) || "N/A"}
                                  {key === "sleep" && " jam"}
                                  {key === "exercise" && " menit"}
                                  {key === "hydration" && " gelas"}
                                  {key === "screenTime" && " jam"}
                                  {key === "bloodPressure" && " mmHg"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  })()
                : null}
            </div>

            {/* Recommendations */}
            {hasData && analysisData && analysisData.recommendations && analysisData.recommendations.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Rekomendasi</h3>
                <div className="space-y-4">
                  {analysisData.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start mb-2">
                        {(() => {
                          let priorityText = rec.priority
                          let priorityClasses = "bg-[#ff3131] text-white" // Default for Tinggi and Kritis

                          if (rec.priority === "Tinggi") {
                            priorityText = "Penting"
                          } else if (rec.priority.includes("Sedang")) {
                            priorityText = "Tingkatkan"
                            priorityClasses = "bg-yellow-50 text-yellow-600 border-yellow-200"
                          }

                          return (
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded mr-2 ${priorityClasses}`}
                            >
                              {priorityText}
                            </span>
                          )
                        })()}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{rec.category}</h4>
                          <p className="text-gray-700 mt-1">{rec.message}</p>
                        </div>
                      </div>
                      {rec.tips && rec.tips.length > 0 && (
                        <ul className="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                          {rec.tips.map((tip, tipIndex) => (
                            <li key={tipIndex}>{tip}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Rekomendasi</h3>
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">💡</div>
                  <p className="font-medium">Rekomendasi belum tersedia</p>
                  <p className="text-sm">Isi form tracking untuk mendapatkan rekomendasi kesehatan personal</p>
                </div>
              </div>
            )}

            {/* Summary */}
            {hasData && analysisData && analysisData.summary ? (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Ringkasan</h3>
                <p className="text-blue-700">{analysisData.summary}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-600">Ringkasan</h3>
                <p className="text-gray-500">
                  Ringkasan analisis akan tersedia setelah Anda mengisi form tracking kesehatan.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  setShowAnalysis(false)
                  setIsStarted(false)
                  setFormData({
                    exercise_minutes: "",
                    exercise_type: "",
                    sleep_hours: "",
                    water_glasses: "",
                    junk_food_count: "",
                    overall_mood: "",
                    stress_level: "",
                    screen_time_hours: "",
                    blood_pressure: "",
                  })
                  setCurrentStep(1)
                }}
                className="w-full sm:w-auto cursor-pointer bg-[#ff3131] hover:scale-105 hover:shadow-[0_0_40px_#b81414] duration-300 transition-all text-white px-8 py-3 rounded-lg font-medium h-12 min-w-[200px]"
              >
                {hasData ? "Kembali ke Beranda" : "Mulai Tracking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show start page
  if (!isStarted && !showAnalysis) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="cursor-default text-center max-w-md w-full">
          <div className="text-6xl mb-4">🩺</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Health Tracker</h1>
          <p className="text-gray-600 mb-8">
            Jawab beberapa pertanyaan singkat untuk mendapatkan analisis kesehatan harian Anda.
          </p>
          <p className="text-gray-600 mb-8">
            (Jawab dengan jujur dapat meningkatkan hasil analisis kesehatan harianmu).
          </p>
          <div className="space-y-4">
            <button
              onClick={handleStart}
              className="cursor-pointer w-full bg-[#ff3131] hover:scale-105 hover:shadow-[0_0_40px_#b81414] duration-300 transition-all text-white px-8 py-3 rounded-lg font-medium h-12"
            >
              Mulai Tracking
            </button>
            <button
              onClick={() => setShowAnalysis(true)}
              className="cursor-pointer w-full bg-green-600 hover:scale-105 duration-300 hover:shadow-[0_0_40px_#008000] text-white px-8 py-3 rounded-lg font-medium transition-all h-12"
            >
              Lihat Analisis
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show form steps
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4">
      <div className="w-[90%] max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="cursor-default flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progres</span>
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-400 mr-2">⚠️</div>
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">{renderStep()}</div>

        <div className="flex justify-between">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="cursor-pointer flex items-center px-6 py-3 bg-green-600 hover:scale-105 duration-300 hover:shadow-[0_0_40px_#008000] text-white border border-gray-300 rounded-lg transition-all h-12 min-w-[120px] disabled:opacity-50"
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
                disabled={isLoading}
                className="cursor-pointer flex items-center px-6 py-3 bg-[#ff3131] hover:scale-105 hover:shadow-[0_0_40px_#b81414] duration-300 transition-all text-white rounded-lg h-12 min-w-[120px] disabled:opacity-50"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="cursor-pointer flex items-center px-6 py-3 bg-green-600 hover:scale-105 duration-300 hover:shadow-[0_0_40px_#008000] text-white rounded-lg transition-all h-12 min-w-[180px] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Submit
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthTrack