const validateNotEmpty = (data) => {
    const emptyFields = [];
    const requiredFields = [
        "name",
        "email",
        "phone",
        "dob",
        "address",
        "gender",
        "password",
        "confirmPassword"
      ];
  
    requiredFields.forEach(field => {
      const value = data[field];
  
      const isEmpty =
        value === undefined ||
        value === null||
        value === ""
      if (isEmpty) {
        emptyFields.push(field);
      }
    });
  
    return {
      isValid: emptyFields.length === 0,
      emptyFields,
    };
  };

  module.exports = { validateNotEmpty };
