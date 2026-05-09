import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import api from "../api";

export function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const authRef = useRef<HTMLDivElement | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);

    setTimeout(() => {
      authRef.current?.scrollIntoView({
        behavior: "smooth",
      });

      window.history.replaceState(null, "", "/#auth");
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint =
        authMode === "login" ? "/auth/login" : "/auth/signup";

      const payload =
        authMode === "login"
          ? {
            email: formData.email,
            password: formData.password,
          }
          : formData;

      const res = await api.post(endpoint, payload);

      login(res.data.token, res.data.user);

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1f1633] text-white">
      {/* HERO SECTION */}
      <section className="relative flex h-screen flex-col overflow-hidden">
        {/* Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10">
          <div className="font-display text-lg font-bold uppercase tracking-wide">
            Team Task Manager
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost-dark"
              onClick={() => openAuth("login")}
            >
              Login
            </Button>

            <Button
              variant="inverted"
              onClick={() => openAuth("signup")}
            >
              Signup
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Badge
            variant="lime-keyword"
            className="mb-6 uppercase tracking-wide"
          >
            Ethara AI Assignment
          </Badge>

          <h1 className="max-w-5xl font-display text-[64px] font-bold leading-[0.95] md:text-[96px]">
            Team Task Manager
          </h1>

          <p className="mt-6 max-w-2xl text-2xl font-medium text-white/90">
            Full-Stack Collaborative Task Management Platform
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
            Build a web app where users can create projects,
            assign tasks, and track progress with role-based
            access for Admins and Members.
          </p>
          <div className="mt-6 text-sm text-white hover:scale-110 transition-all duration-300 ease-in-out cursor-pointer">
            Built by Rhythm Doshi
          </div>

          <div className="mt-10 mb-4 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="inverted"
              onClick={() => openAuth("login")}
            >
              Login
            </Button>

            <Button
              variant="primary"
              className="border border-white/20"
              onClick={() => openAuth("signup")}
            >
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* AUTH SECTION */}
      <section
        id="auth"
        ref={authRef}
        className="flex min-h-screen items-center justify-center bg-white px-6 py-16"
      >
        <Card
          variant="light"
          className="w-full max-w-[60vw] min-w-[320px] rounded-3xl border border-[#e5e7eb] p-8 shadow-2xl md:p-10"
        >
          <div className="mb-8 text-center">
            <h2 className="font-display text-[28px] font-bold tracking-tight text-[#1f1633]">
              Team Task Manager
            </h2>

            <p className="mt-2 text-sm text-[#71717a]">
              {authMode === "login"
                ? "Login to continue managing your workspace"
                : "Create your account to get started"}
            </p>

            <div className="mt-3 text-[12px] font-medium text-[#a1a1aa]">
              Built by Rhythm Doshi
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto_1fr]">
            {/* LEFT SIDE */}
            <div className="min-w-0">
              {/* Tabs */}
              <div className="mb-8 flex items-center gap-6 border-b border-[#e5e7eb]">
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setError("");
                  }}
                  className={`relative pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${authMode === "login"
                    ? "text-[#150f23]"
                    : "text-[#150f23]/50"
                    }`}
                >
                  Login

                  {authMode === "login" && (
                    <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#150f23]" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setError("");
                  }}
                  className={`relative pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${authMode === "signup"
                    ? "text-[#150f23]"
                    : "text-[#150f23]/50"
                    }`}
                >
                  Signup

                  {authMode === "signup" && (
                    <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#150f23]" />
                  )}
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                {authMode === "signup" && (
                  <>
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                    />

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#1f1633]">
                        Role
                      </label>

                      <select
                        className="w-full rounded-xl border border-[#d9d9e3] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#1f1633]/10"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value,
                          })
                        }
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="mt-2 w-full"
                  isLoading={loading}
                >
                  {authMode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </Button>
              </form>
            </div>

            {/* DIVIDER */}
            <div className="hidden lg:block w-px self-stretch bg-[#e5e7eb]" />

            {/* RIGHT SIDE */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="rounded-2xl border border-[#ececec] bg-[#fafafa] p-5">
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.2px] text-[#71717a]">
                  Demo Credentials
                </p>

                <div className="space-y-4">
                  <div className="rounded-xl border border-[#ececec] bg-white p-4">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1f1633]">
                      Admin
                    </div>

                    <div className="space-y-1 text-[13px]">
                      <div className="text-[#1f1633]">
                        rhythmdoshi04@gmail.com
                      </div>

                      <div className="text-[#71717a]">
                        test@123
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");

                        setFormData((prev) => ({
                          ...prev,
                          email: "rhythmdoshi04@gmail.com",
                          password: "test@123",
                        }));
                      }}
                      className="mt-4 text-[12px] font-medium text-[#71717a] underline underline-offset-4 transition-colors hover:text-[#1f1633]"
                    >
                      Autofill credentials
                    </button>
                  </div>

                  <div className="rounded-xl border border-[#ececec] bg-white p-4">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1f1633]">
                      Member
                    </div>

                    <div className="space-y-1 text-[13px]">
                      <div className="text-[#1f1633]">
                        avinash04@gmail.com
                      </div>

                      <div className="text-[#71717a]">
                        test@123
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");

                        setFormData((prev) => ({
                          ...prev,
                          email: "avinash04@gmail.com",
                          password: "test@123",
                        }));
                      }}
                      className="mt-4 text-[12px] font-medium text-[#71717a] underline underline-offset-4 transition-colors hover:text-[#1f1633]"
                    >
                      Autofill credentials
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </Card>
      </section>
    </div>
  );
}