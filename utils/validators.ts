// Required Field Validator
export const requiredValidator = (value: string) => 
    !!value || "This field is required";
  
  // Minimum Length Validator
  export const minLengthValidator = (minLength: number) => (value: string) => {
    return value.length >= minLength || `Field must contain at least ${minLength} characters`;
  };
  
  // Alphabet-Only Validator
  export const alphabetValidator = (value: string) => {
    return /^[A-Za-z\s]+$/.test(value) || "Field can only contain alphabets";
  };
  
  // Number-Only Validator
  export const numberValidator = (value: string) => {
    return /^\d+$/.test(value) || "Field can only contain numbers";
  };
  
  // Custom Length Validator
  export const exactLengthValidator = (exactLength: number) => (value: string) => {
    return value.length === exactLength || `Field must be exactly ${exactLength} characters`;
  };

  export const emailValidator = (value: string) => {
     /^\S+@\S+\.\S+$/.test(value) || 'Invalid email address';
  };

  export const passwordValidator = (value: string) => value.length >= 8 || 'Password should be 8 characters long';

  export const phoneValidator = (value: string) => {
      const phoneRegex = /^[0-9]{11}$/;
      return phoneRegex.test(value) || 'Invalid phone number. Must be be valid phone number.';
    };



  