export const getFormErrors = (errors) => {
  const errorMessages = [];
  Object.entries(errors).forEach(([field, error]) => {
    if (error?.message) {
      const fieldName = field
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      errorMessages.push(`${fieldName}: ${error.message}`);
    }
  });
  return errorMessages;
};
