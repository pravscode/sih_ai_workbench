const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function loginUser({ email, password }) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    user: { email },
  };
}
