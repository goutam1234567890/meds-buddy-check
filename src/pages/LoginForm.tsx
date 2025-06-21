import { useState } from "react";
import { login, signup } from "@/api/auth";

type AuthMode = "login" | "signup";

export default function LoginForm({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "caretaker">("patient");
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!username.trim()) return "Username is required";
    if (!password.trim()) return "Password is required";
    if (mode === "signup" && password.length < 6)
      return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const vError = validate();
    setValidationError(vError);
    if (vError) return;
    setLoading(true);
    try {
      if (mode === "login") {
        const { token } = await login(username, password);
        localStorage.setItem("token", token);
        onAuthSuccess();
      } else {
        const { token } = await signup(username, password, role);
        localStorage.setItem("token", token);
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <form className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center mb-4">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>
        {validationError && <div className="text-red-500 text-center">{validationError}</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            className="w-full border p-2 rounded"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            className="w-full border p-2 rounded"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            disabled={loading}
          />
        </div>
        {mode === "signup" && (
          <div>
            <label className="block mb-1 font-medium">Role</label>
            <select
              className="w-full border p-2 rounded"
              value={role}
              onChange={e => setRole(e.target.value as "patient" | "caretaker")}
              disabled={loading}
            >
              <option value="patient">Patient</option>
              <option value="caretaker">Caretaker</option>
            </select>
          </div>
        )}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
        </button>
        <div className="text-center mt-2">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => !loading && setMode("signup")}
                disabled={loading}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => !loading && setMode("login")}
                disabled={loading}
              >
                Login
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}