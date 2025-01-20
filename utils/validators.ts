// Required Field Validator
export const requiredValidator = (value: string) =>
  !!value || 'This field is required'

// Minimum Length Validator
export const minLengthValidator = (minLength: number) => (value: string) => {
  return (
    value.trim().length >= minLength
    || `Field must contain at least ${minLength} characters`
  )
}

// Alphabet-Only Validator
export const alphabetValidator = (value: string) => {
  return /^[A-Z\s]+$/i.test(value) || 'Field can only contain alphabets'
}

// Number-Only Validator
export const numberValidator = (value: string) => {
  return /^\d+$/.test(value) || 'Field can only contain numbers'
}

// Custom Length Validator
export const exactLengthValidator
  = (exactLength: number) => (value: string) => {
    return (
      value.length === exactLength
      || `Field must be exactly ${exactLength} characters`
    )
  }

export const emailValidator = (value: string) => {
  if (isEmpty(value))
    return true

  const re
      = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-\d]+\.)+[a-z]{2,})$/i

  if (Array.isArray(value)) {
    return (
      value.every(val => re.test(String(val)))
        || 'The Email field must be a valid email'
    )
  }

  return re.test(String(value)) || 'The Email field must be a valid email'
}

export const passwordValidator = (value: string) =>
  value.length >= 8 || 'Password should be 8 characters long'

export const phoneValidator = (value: string) => {
  const phoneRegex = /^03\d{9}$/
  const startPhoneRegex = /^03/
  if (!startPhoneRegex.test(value))
    return 'Invalid phone number. Phone number must start with 03.'

  return (
    phoneRegex.test(value)
    || 'Invalid phone number. Must be be valid phone number.'
  )
}

// we also validator.ts in @core folder
