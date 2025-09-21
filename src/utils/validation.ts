// Utility function to validate required fields in request body
export const validateRequiredFields = (body: Record<string, unknown>, requiredFields: string[]): string[] => {
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missingFields.push(field);
    }
  });
  
  return missingFields;
};

// Utility function to validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function to validate UUID format
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};