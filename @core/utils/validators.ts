import { isEmpty, isEmptyArray, isNullOrUndefined } from "./helpers";

// 👉 Required Validator
export const requiredValidator = (value: unknown) => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return "This field is required";

  return !!String(value).trim().length || "This field is required";
};

// 👉 Email Validator
export const emailValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  const re =
    /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-\d]+\.)+[a-z]{2,})$/i;

  if (Array.isArray(value))
    return (
      value.every((val) => re.test(String(val))) ||
      "The Email field must be a valid email"
    );

  return re.test(String(value)) || "The Email field must be a valid email";
};

// 👉 Password Validator
export const passwordValidator = (password: string) => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/;

  const validPassword = regExp.test(password);

  return (
    validPassword ||
    "Field must contain at least one uppercase, lowercase, special character and digit with min 8 chars"
  );
};

// 👉 Confirm Password Validator
export const confirmedValidator = (value: string, target: string) =>
  value === target || "Password must match";

// 👉 Between Validator
export const betweenValidator = (value: unknown, min: number, max: number) => {
  const valueAsNumber = Number(value);

  return (
    (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) ||
    `Enter number between ${min} and ${max}`
  );
};

// 👉 Integer Validator
export const integerValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  if (Array.isArray(value))
    return (
      value.every((val) => /^-?\d+$/.test(String(val))) ||
      "This field must be an integer"
    );

  return /^-?\d+$/.test(String(value)) || "This field must be an integer";
};

// 👉 Regex Validator
export const regexValidator = (
  value: unknown,
  regex: RegExp | string,
  message: string,
): string | boolean => {
  if (isEmpty(value)) return true;

  let regeX = regex;
  if (typeof regeX === "string") regeX = new RegExp(regeX);

  if (Array.isArray(value))
    return value.every((val) => regexValidator(val, regeX));

  return regeX.test(String(value)) || message;
};

// 👉 Alpha Validator
export const alphaValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  return (
    /^[A-Z]*$/i.test(String(value)) ||
    "The Alpha field may only contain alphabetic characters"
  );
};

// 👉 URL Validator
export const urlValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  const re = /^https?:\/\/[^\s$.?#].\S*$/;

  return re.test(String(value)) || "URL is invalid";
};

// 👉 Length Validator
export const lengthValidator = (value: unknown, length: number) => {
  if (isEmpty(value)) return true;

  return (
    String(value).length === length ||
    `"The length of the Characters field must be ${length} characters."`
  );
};

// 👉 Alpha-dash Validator
export const alphaDashValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  const valueAsString = String(value);

  return /^[\w-]*$/.test(valueAsString) || "All Character are not valid";
}
export const phoneValidator = (value: unknown) => {
  let phoneNumber = String(value).trim();

  // Remove non-digit characters
  phoneNumber = phoneNumber.replace(/\D/g, '');

  // Regular expression to check if the phone number starts with 03 and is followed by 9 digits
  const phoneNumberRegex = /^03\d{9}$/;

  if (!phoneNumberRegex.test(phoneNumber)) {
    return 'Phone number should start with 03 and must be exactly 11 digits long.';
  }

  return true; // Return true if validation passes
};

export const maxFiveFilesValidator = (value: unknown) => {
 if (Array.isArray(value) && value.length > 5) {
    return "You can upload a maximum of 5 files.";
  }
  return true;
};

export const max6mbValidator = (value: unknown) => {
  const maxFileSize = 6 * 1024 * 1024; // 6MB in bytes
  for (const file of value) {
    if (file instanceof File && file.size >= maxFileSize) {
      return `Each file size must not be greater than 6MB.`;
    }
  }

  return true;
};
export const imageFileValidator = (value: unknown) => {
  const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  for (const file of value) {
    if (file instanceof File && !validImageTypes.includes(file.type)) {
      return `Only image files (JPEG, PNG, GIF, WebP) are allowed.`;
    }
  }

  return true;
};

export const onInputRestrictLength = (value, maxLength) => {
  if (value.length > maxLength)
   return value.slice(0, maxLength)

  return value
}
