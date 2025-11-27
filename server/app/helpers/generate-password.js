export const generatePassword = (firstName, mobileNumber) =>
  String(firstName.slice(0, 4)).toUpperCase() + mobileNumber.slice(-4);
