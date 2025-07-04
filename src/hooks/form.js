// untuk form register dan login

import { useState } from "react"

export const useForm = (initialValues, validationRules) => {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    Object.keys(validationRules).forEach((field) => {
      const rules = validationRules[field]
      const value = formData[field]

      for (const rule of rules) {
        const error = rule(value)
        if (error) {
          newErrors[field] = error
          break
        }
      }
    })

    return newErrors
  }

  const handleSubmit = async (onSubmit) => {
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }

    setIsLoading(true)
    try {
      await onSubmit(formData)
      return true
    } catch (error) {
      console.error("Form submission failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSubmit,
    setErrors,
  }
}