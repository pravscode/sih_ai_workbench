const API_BASE_URL = "http://127.0.0.1:8000"; // will be used once real backend call is added

export async function loginUser({ email, password: _password }) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    user: { email },
  };
}