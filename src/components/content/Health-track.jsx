import { config } from "../../config"
import { useState, useEffect, useCallback } from "react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Line, LineChart, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart"

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
  const [restrictionMessage, setRestrictionMessage] = useState("")
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
      const response = await fetch(`${config.apiUserService}/tracker?range=7d`, {
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
        return 10
      case "10–30":
        return 20
      case "30–60":
        return 45
      case ">60":
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

  const calculateDiagnifyScore = (averages) => {
    let score = 0
    let maxScore = 0

    // Sleep Score (0-20 points)
    maxScore += 20
    if (averages.sleepHours >= 7 && averages.sleepHours <= 9) {
      score += 20
    } else if (averages.sleepHours >= 6 && averages.sleepHours < 7) {
      score += 15
    } else if (averages.sleepHours >= 5 && averages.sleepHours < 6) {
      score += 10
    } else {
      score += 5
    }

    // Exercise Score (0-15 points)
    maxScore += 15
    if (averages.exerciseMinutes >= 30) {
      score += 15
    } else if (averages.exerciseMinutes >= 20) {
      score += 12
    } else if (averages.exerciseMinutes >= 10) {
      score += 8
    } else if (averages.exerciseMinutes > 0) {
      score += 5
    }

    // Water Intake Score (0-10 points)
    maxScore += 10
    if (averages.waterGlasses >= 8) {
      score += 10
    } else if (averages.waterGlasses >= 6) {
      score += 8
    } else if (averages.waterGlasses >= 4) {
      score += 6
    } else {
      score += 3
    }

    // Junk Food Score (0-10 points)
    maxScore += 10
    if (averages.junkFoodCount <= 1) {
      score += 10
    } else if (averages.junkFoodCount <= 3) {
      score += 7
    } else if (averages.junkFoodCount <= 5) {
      score += 4
    } else {
      score += 1
    }

    // Mood Score (0-15 points)
    maxScore += 15
    if (averages.overallMood >= 4) {
      score += 15
    } else if (averages.overallMood >= 3) {
      score += 12
    } else if (averages.overallMood >= 2) {
      score += 8
    } else {
      score += 5
    }

    // Stress Level Score (0-10 points)
    maxScore += 10
    if (averages.stressLevel <= 2) {
      score += 10
    } else if (averages.stressLevel <= 3) {
      score += 8
    } else if (averages.stressLevel <= 4) {
      score += 5
    } else {
      score += 2
    }

    // Screen Time Score (0-10 points)
    maxScore += 10
    if (averages.screenTimeHours <= 6) {
      score += 10
    } else if (averages.screenTimeHours <= 8) {
      score += 8
    } else if (averages.screenTimeHours <= 12) {
      score += 5
    } else {
      score += 2
    }

    // Blood Pressure Score (0-10 points)
    maxScore += 10
    if (averages.bloodPressure <= 120) {
      score += 10
    } else if (averages.bloodPressure <= 130) {
      score += 8
    } else if (averages.bloodPressure <= 140) {
      score += 6
    } else if (averages.bloodPressure <= 160) {
      score += 4
    } else {
      score += 2
    }

    return (score / maxScore) * 100
  }

  const categorizeHealth = (averages) => {
    return {
      sleep: averages.sleepHours >= 7 ? "Baik" : averages.sleepHours >= 6 ? "Cukup" : "Kurang",
      exercise: averages.exerciseMinutes >= 30 ? "Aktif" : averages.exerciseMinutes >= 15 ? "Cukup" : "Kurang Aktif",
      hydration: averages.waterGlasses >= 8 ? "Terhidrasi" : averages.waterGlasses >= 6 ? "Cukup" : "Dehidrasi",
      diet: averages.junkFoodCount <= 2 ? "Sehat" : averages.junkFoodCount <= 4 ? "Cukup" : "Tidak Sehat",
      mental: averages.overallMood >= 4 ? "Baik" : averages.overallMood >= 3 ? "Cukup" : "Buruk",
      stress: averages.stressLevel <= 2 ? "Rendah" : averages.stressLevel <= 3 ? "Sedang" : "Tinggi",
      screenTime: averages.screenTimeHours <= 6 ? "Baik" : averages.screenTimeHours <= 10 ? "Cukup" : "Berlebihan",
      bloodPressure: averages.bloodPressure <= 120 ? "Normal" : averages.bloodPressure <= 140 ? "Tinggi" : "Berbahaya",
    }
  }

  const getScoreCategory = (score) => {
    if (score >= 85) return "Sangat Baik"
    if (score >= 70) return "Baik"
    if (score >= 55) return "Kurang"
    if (score >= 40) return "Buruk"
    return "Sangat Buruk"
  }

  const handleStart = () => {
    const todayDate = new Date().toISOString().split("T")[0]
    const hasSubmittedToday = weeklyScores.some((entry) => entry.date === todayDate)

    if (hasSubmittedToday) {
      setRestrictionMessage("Anda sudah mengisi, silakan coba lagi besok.")
    } else {
      setRestrictionMessage("")
      setIsStarted(true)
    }
  }

  const handleAnalysis = async () => {
    if (!accessToken) {
      alert("Anda perlu login untuk mengirim data kesehatan.")
      return
    }

    const exerciseMinutes = mapExerciseDurationToMinutes(formData.exerciseDuration)
    const junkFoodCount = mapJunkFoodFrequencyToNumber(formData.junkFoodFrequency)
    const sleepHoursNum = Number.parseInt(formData.sleepHours) || 0
    const waterIntakeNum = Number.parseInt(formData.waterIntake) || 0
    const moodNum = Number.parseInt(formData.mood) || 1
    const stressNum = Number.parseInt(formData.stress) || 1
    const screenTimeNum = Number.parseFloat(formData.screenTime) || 0
    const systolicBPNum = Number.parseInt(formData.systolicBP) || 120

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

        // Calculate daily score
        const dailyAverages = {
          exerciseMinutes: exerciseMinutes,
          sleepHours: sleepHoursNum,
          waterGlasses: waterIntakeNum,
          junkFoodCount: junkFoodCount,
          overallMood: moodNum,
          stressLevel: stressNum,
          screenTimeHours: screenTimeNum,
          bloodPressure: systolicBPNum,
        }
        const dailyScore = calculateDiagnifyScore(dailyAverages)

        // Update weekly scores for local chart, allowing multiple submissions
        const todayDate = new Date().toISOString().split("T")[0]
        const updatedWeeklyScores = [...weeklyScores, { date: todayDate, score: dailyScore }]
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

    const averages = {
      exerciseMinutes,
      sleepHours: sleepHoursNum,
      waterGlasses: waterIntakeNum,
      junkFoodCount,
      overallMood: moodNum,
      stressLevel: stressNum,
      screenTimeHours: screenTimeNum,
      bloodPressure: systolicBPNum,
    }

    const score = calculateDiagnifyScore(averages)
    const categories = categorizeHealth(averages)

    return {
      physicalActivity: {
        score:
          averages.exerciseMinutes >= 30
            ? 15
            : averages.exerciseMinutes >= 20
              ? 12
              : averages.exerciseMinutes >= 10
                ? 8
                : averages.exerciseMinutes > 0
                  ? 5
                  : 0,
        status: categories.exercise,
      },
      sleep: {
        score:
          averages.sleepHours >= 7 && averages.sleepHours <= 9
            ? 20
            : averages.sleepHours >= 6
              ? 15
              : averages.sleepHours >= 5
                ? 10
                : 5,
        status: categories.sleep,
      },
      hydration: {
        score: averages.waterGlasses >= 8 ? 10 : averages.waterGlasses >= 6 ? 8 : averages.waterGlasses >= 4 ? 6 : 3,
        status: categories.hydration,
      },
      mentalHealth: {
        score: averages.overallMood >= 4 ? 15 : averages.overallMood >= 3 ? 12 : averages.overallMood >= 2 ? 8 : 5,
        status: categories.mental,
      },
      junkFood: {
        score: averages.junkFoodCount <= 1 ? 10 : averages.junkFoodCount <= 3 ? 7 : averages.junkFoodCount <= 5 ? 4 : 1,
        status: categories.diet,
      },
      screenTime: {
        score:
          averages.screenTimeHours <= 6
            ? 10
            : averages.screenTimeHours <= 8
              ? 8
              : averages.screenTimeHours <= 12
                ? 5
                : 2,
        status: categories.screenTime,
      },
      bloodPressure: {
        score:
          averages.bloodPressure <= 120
            ? 10
            : averages.bloodPressure <= 130
              ? 8
              : averages.bloodPressure <= 140
                ? 6
                : averages.bloodPressure <= 160
                  ? 4
                  : 2,
        status: categories.bloodPressure,
      },
      overallScore: score,
      scoreCategory: getScoreCategory(score),
    }
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
              onClick={handleStart}
              className="w-full bg-[#ff3131] hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors h-12"
            >
              Mulai Sekarang
            </button>
            {restrictionMessage && <p className="text-red-600 text-sm">{restrictionMessage}</p>}
            {accessToken && (
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

    // Data for daily health categories bar chart
    const dailyChartData = [
      { name: "Aktivitas Fisik", score: localAnalysis.physicalActivity.score, max: 15 },
      { name: "Kualitas Tidur", score: localAnalysis.sleep.score, max: 20 },
      { name: "Hidrasi", score: localAnalysis.hydration.score, max: 10 },
      { name: "Kesehatan Mental", score: localAnalysis.mentalHealth.score, max: 15 },
      { name: "Pola Makan", score: localAnalysis.junkFood.score, max: 10 },
      { name: "Digital Wellbeing", score: localAnalysis.screenTime.score, max: 10 },
      { name: "Tekanan Darah", score: localAnalysis.bloodPressure.score, max: 10 },
    ]

    // Updated dailyChartConfig to match ChartContainer's expectations
    const dailyChartConfig = {
      "Aktivitas-Fisik": { label: "Aktivitas Fisik", color: "hsl(210 80% 60%)" }, // Blue
      "Kualitas-Tidur": { label: "Kualitas Tidur", color: "hsl(270 70% 60%)" }, // Purple
      Hidrasi: { label: "Hidrasi", color: "hsl(120 70% 50%)" }, // Green
      "Kesehatan-Mental": { label: "Kesehatan Mental", color: "hsl(45 90% 60%)" }, // Orange-Yellow
      "Pola-Makan": { label: "Pola Makan", color: "hsl(15 80% 60%)" }, // Orange
      "Digital-Wellbeing": { label: "Digital Wellbeing", color: "hsl(180 70% 50%)" }, // Cyan
      "Tekanan-Darah": { label: "Tekanan Darah", color: "hsl(0 80% 60%)" }, // Red
    }

    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4">
        <div className="w-[90%] max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analisis Kesehatan Anda</h1>
              <p className="text-gray-600">Berdasarkan data harian dan mingguan Anda</p>
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-r from-[#ff3131] to-red-600 rounded-xl p-6 text-white mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{Math.round(localAnalysis.overallScore)}/100</div>
                <div className="text-xl">Skor Kesehatan Harian ({localAnalysis.scoreCategory})</div>
              </div>
            </div>

            {/* Weekly Overall Score */}
            {apiAnalysisData && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 text-white mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{Math.round(apiAnalysisData.diagnifyScore)}/100</div>
                  <div className="text-xl">Skor Kesehatan Mingguan ({apiAnalysisData.scoreCategory})</div>
                </div>
              </div>
            )}

            {/* Weekly Trend Diagram */}
            {weeklyScores.length > 0 && (
              <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Tren Skor Kesehatan Mingguan</h3>
                <ChartContainer
                  config={{
                    score: {
                      label: "Skor",
                      color: "#ff3131", // Red
                    },
                  }}
                  className="min-h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      accessibilityLayer
                      data={weeklyScores}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}`
                        }}
                      />
                      <YAxis dataKey="score" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Line
                        dataKey="score"
                        type="monotone"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                        dot={{
                          fill: "var(--color-score)",
                          stroke: "var(--color-score)",
                        }}
                        activeDot={{
                          r: 6,
                          fill: "var(--color-score)",
                          stroke: "var(--color-score)",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}

            {/* Daily Health Categories Bar Chart */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Skor Kategori Kesehatan Harian</h3>
              <ChartContainer id="daily" config={dailyChartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    accessibilityLayer
                    data={dailyChartData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <XAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value}
                    />
                    <YAxis
                      dataKey="score"
                      type="number"
                      domain={[0, (dataMax) => Math.max(dataMax, 20)]}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
                    <Bar
                      dataKey="score"
                      radius={5}
                      fillOpacity={0.8}
                      fill={(entry) => {
                        // Cari key config berdasarkan label (label === entry.name)
                        const matched = Object.entries(dailyChartConfig).find(([, value]) => value.label === entry.name)
                        const colorKey = matched?.[0] || "chart-1" // fallback jika tidak ditemukan
                        return `var(--color-${colorKey})`
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Detailed Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                {
                  title: "Aktivitas Fisik",
                  emoji: "🏃",
                  bgClass: "bg-blue-50",
                  textColorClass: "text-blue-600",
                  circleBgClass: "bg-blue-500",
                  daily: localAnalysis.physicalActivity,
                  weekly: apiAnalysisData?.healthCategories?.exercise,
                  weeklyAvg: apiAnalysisData?.analysis.averages.exerciseMinutes,
                },
                {
                  title: "Kualitas Tidur",
                  emoji: "😴",
                  bgClass: "bg-purple-50",
                  textColorClass: "text-purple-600",
                  circleBgClass: "bg-purple-500",
                  daily: localAnalysis.sleep,
                  weekly: apiAnalysisData?.healthCategories?.sleep,
                  weeklyAvg: apiAnalysisData?.analysis.averages.sleepHours,
                },
                {
                  title: "Hidrasi",
                  emoji: "💧",
                  bgClass: "bg-green-50",
                  textColorClass: "text-green-600",
                  circleBgClass: "bg-green-500",
                  daily: localAnalysis.hydration,
                  weekly: apiAnalysisData?.healthCategories?.hydration,
                  weeklyAvg: apiAnalysisData?.analysis.averages.waterGlasses,
                },
                {
                  title: "Kesehatan Mental",
                  emoji: "😊",
                  bgClass: "bg-yellow-50",
                  textColorClass: "text-yellow-600",
                  circleBgClass: "bg-yellow-500",
                  daily: localAnalysis.mentalHealth,
                  weekly: apiAnalysisData?.healthCategories?.mental,
                  weeklyAvg: apiAnalysisData?.analysis.averages.overallMood,
                },
                {
                  title: "Pola Makan (Junk Food)",
                  emoji: "🍔",
                  bgClass: "bg-orange-50",
                  textColorClass: "text-orange-600",
                  circleBgClass: "bg-orange-500",
                  daily: localAnalysis.junkFood,
                  weekly: apiAnalysisData?.healthCategories?.diet,
                  weeklyAvg: apiAnalysisData?.analysis.averages.junkFoodCount,
                },
                {
                  title: "Digital Wellbeing (Screen Time)",
                  emoji: "📱",
                  bgClass: "bg-cyan-50",
                  textColorClass: "text-cyan-600",
                  circleBgClass: "bg-cyan-500",
                  daily: localAnalysis.screenTime,
                  weekly: apiAnalysisData?.healthCategories?.screenTime,
                  weeklyAvg: apiAnalysisData?.analysis.averages.screenTimeHours,
                },
                {
                  title: "Tekanan Darah",
                  emoji: "🩺",
                  bgClass: "bg-red-50",
                  textColorClass: "text-red-600",
                  circleBgClass: "bg-red-500",
                  daily: localAnalysis.bloodPressure,
                  weekly: apiAnalysisData?.healthCategories?.bloodPressure,
                  weeklyAvg: apiAnalysisData?.analysis.averages.bloodPressure,
                },
              ].map((category) => (
                <div key={category.title} className={`${category.bgClass} rounded-lg p-6`}>
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-10 h-10 ${category.circleBgClass} rounded-full flex items-center justify-center mr-3`}
                    >
                      <span className="text-white font-bold">{category.emoji}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${category.textColorClass}`}>
                        {category.daily.score}/
                        {category.title === "Aktivitas Fisik" ? 15 : category.title === "Kualitas Tidur" ? 20 : 10}
                      </span>
                      <span className="text-sm text-gray-600">Harian: {category.daily.status}</span>
                    </div>
                    {category.weekly && (
                      <div className="flex items-center justify-between">
                        <span className={`text-lg ${category.textColorClass}`}>
                          Rata-rata: {Math.round(category.weeklyAvg * 10) / 10}
                        </span>
                        <span className="text-sm text-gray-600">Mingguan: {category.weekly}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Pertahankan kebiasaan sehat Anda!
                  </li>
                )}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  setShowAnalysis(false)
                  setIsStarted(false)
                  setSubmissionMessage("")
                }}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors h-12 min-w-[200px]"
              >
                Kembali ke Beranda
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
              {["0", "<10", "10–30", "30–60", ">60"].map((option) => (
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
              <div className="flex flex-wrap justify-center gap-2 sm:justify-between items-center">
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
              <div className="flex flex-wrap justify-center gap-2 sm:justify-between items-center">
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
        {submissionMessage && (
          <div className="mb-4 p-3 rounded-lg text-center bg-green-100 text-green-700">{submissionMessage}</div>
        )}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">{renderStep()}</div>
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