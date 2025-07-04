// memastikan form register dan login sesuai format

export const validationRules = {
  required: (value) => {
    if (!value || !value.toString().trim()) {
      return "Required"
    }
    return null
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`
    }
    return null
  },

  email: (value) => {
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      return "Invalid email format"
    }
    return null
  },
}