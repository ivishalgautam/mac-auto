export const getFormErrors = (errors, prefix = "") => {
  const errorMessages = [];

  for (const [key, value] of Object.entries(errors)) {
    const fieldName = prefix
      ? `${prefix} > ${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
      : key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    if (value?.message) {
      errorMessages.push(`${fieldName}: ${value.message}`);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === "object") {
          errorMessages.push(...getFormErrors(item, `${fieldName}[${index}]`));
        }
      });
    } else if (typeof value === "object") {
      errorMessages.push(...getFormErrors(value, fieldName));
    }
  }

  return errorMessages;
};
