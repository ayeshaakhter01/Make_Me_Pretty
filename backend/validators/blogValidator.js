
const validateBlog = (blogData, isUpdate = false) => {
  const errors = [];

  if (
    !blogData ||
    typeof blogData !== "object" ||
    Array.isArray(blogData)
  ) {
    return {
      isValid: false,
      errors: ["Blog data must be an object"],
    };
  }

  const allowedFields = [
    "title",
    "slug",
    "tag",
    "read",
    "excerpt",
    "body",
    "image",
    "status",
    "order",
  ];

  const requiredFields = ["title", "excerpt", "body"];

  const unknownFields = Object.keys(blogData).filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    errors.push(`Unsupported fields: ${unknownFields.join(", ")}`);
  }

  if (
    isUpdate &&
    !Object.keys(blogData).some((field) =>
      allowedFields.includes(field)
    )
  ) {
    errors.push("Provide at least one field to update");
  }

  for (const field of requiredFields) {
    const value = blogData[field];

    if (!isUpdate || value !== undefined) {
      if (field === "body") {
        if (
          !Array.isArray(value) ||
          value.length === 0 ||
          !value.every(
            (paragraph) =>
              typeof paragraph === "string" && paragraph.trim().length > 0
          )
        ) {
          errors.push("Body must be a non-empty array of paragraphs");
        }
      } else if (typeof value !== "string" || !value.trim()) {
        errors.push(`${field} must be a non-empty string`);
      }
    }
  }

  if (blogData.slug !== undefined) {
    if (
      typeof blogData.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(blogData.slug)
    ) {
      errors.push(
        "Slug must contain lowercase letters, numbers, and single hyphens"
      );
    }
  }

  for (const field of ["tag", "read", "image"]) {
    if (
      blogData[field] !== undefined &&
      typeof blogData[field] !== "string"
    ) {
      errors.push(`${field} must be a string`);
    }
  }

  if (
    blogData.status !== undefined &&
    !["draft", "published"].includes(blogData.status)
  ) {
    errors.push("Status must be draft or published");
  }

  if (
    blogData.order !== undefined &&
    (!Number.isInteger(blogData.order) || blogData.order < 0)
  ) {
    errors.push("Order must be a non-negative integer");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default validateBlog;
