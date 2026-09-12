import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const skillQuestions = [
  {
    prompt: "A tap is leaking from the joint. What should you check first?",
    options: [
      "Tighten or inspect the joint and washer",
      "Paint over the leak",
      "Replace the whole sink",
      "Ignore it until it worsens",
    ],
    answer: 0,
  },
  {
    prompt: "Which tool is best for gripping a threaded pipe?",
    options: ["Spirit level", "Pipe wrench", "Paint brush", "Utility knife"],
    answer: 1,
  },
  {
    prompt: "Before starting a repair, what is the safest first step?",
    options: [
      "Turn off the relevant water supply",
      "Start cutting immediately",
      "Ask the customer to leave",
      "Remove every fitting",
    ],
    answer: 0,
  },
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  category: "plumbing",
  experienceYears: "5",
  cooperative: "",
  password: "",
  confirmPassword: "",
  role: "worker", // default to worker for now
};

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const isSignup = mode === "signup";

  const [step, setStep] = useState(isSignup ? 1 : 0);
  const [form, setForm] = useState(emptyForm);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // If already logged in, redirect away
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setStep(mode === "signup" ? 1 : 0);
    setForm(emptyForm);
    setAnswers({});
    setMessage("");
    setError("");
    setResult(null);
  }, [mode]);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      return setError("Enter your email and password to continue.");
    }
    setSubmitting(true);
    setError("");
    try {
      const data = await login(form.email, form.password);
      setMessage("Sign-in accepted. Redirecting to your portal...");
      const targetRole = data.user.role;
      setTimeout(() => {
        const requestedPath = location.state?.from?.pathname;
        if (
          requestedPath &&
          requestedPath !== "/signin" &&
          requestedPath !== "/login"
        ) {
          navigate(requestedPath, { replace: true });
        } else if (targetRole === "worker" || targetRole === "cooperative_member") {
          navigate("/worker", { replace: true });
        } else if (targetRole === "cooperative_admin" || targetRole === "platform_admin") {
          navigate("/cooperative", { replace: true });
        } else {
          navigate("/customer", { replace: true });
        }
      }, 500);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileNext = async (event) => {
    event.preventDefault();
    if (
      !form.name ||
      !form.phone ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      return setError("Complete all required fields before continuing.");
    }
    if (form.role === "worker" && !form.experienceYears) {
      return setError("Experience years is required for workers.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (form.role === "customer") {
      // Direct registration for customers
      setSubmitting(true);
      setError("");
      try {
        const regData = await register({
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: "customer"
        });
        setResult(regData.user);
        setStep(3); // Success step for customer
      } catch (submitError) {
        setError(submitError.message || "Registration could not be completed.");
      } finally {
        setSubmitting(false);
      }
    } else {
      // Proceed to skill test for workers
      setError("");
      setMessage("");
      setStep(2);
    }
  };

  const handleSkillSubmit = async (event) => {
    event.preventDefault();
    const score = skillQuestions.reduce(
      (total, question, index) =>
        total + (Number(answers[index]) === question.answer ? 1 : 0),
      0,
    );
    if (Object.keys(answers).length !== skillQuestions.length)
      return setError("Answer all skill questions before submitting.");
    setSubmitting(true);
    setError("");
    try {
      const regData = await register({
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "worker",
        category: form.category,
        experienceYears: Number(form.experienceYears),
        cooperative: form.cooperative,
      });
      setResult({
        ...regData.user,
        skillTestScore: Math.round((score / skillQuestions.length) * 100),
      });
      setStep(3);
    } catch (submitError) {
      setError(submitError.message || "Registration could not be completed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSignup) {
    return (
      <div className="auth-page">
        <div className="auth-shell">
          <div className="auth-intro">
            <span className="auth-kicker">
              <ShieldCheck size={15} /> CO-OP OS ACCESS
            </span>
            <h1>Work that starts with trust.</h1>
            <p>
              Sign in to manage service requests, worker opportunities, or
              cooperative operations.
            </p>
            <div className="auth-proof">
              <CheckCircle2 size={17} /> Verified cooperative network
            </div>
            <div className="auth-proof">
              <CheckCircle2 size={17} /> FairMatch-backed dispatch
            </div>
          </div>
          <form className="auth-card" onSubmit={handleLogin}>
            <div className="auth-card-heading">
              <LockKeyhole size={20} />
              <div>
                <span className="auth-kicker">WELCOME BACK</span>
                <h2>Sign in</h2>
              </div>
            </div>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            <button
              className="auth-primary-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in"}{" "}
              <ArrowRight size={17} />
            </button>
            <p className="auth-switch">
              New here?{" "}
              <button type="button" onClick={() => navigate("/signup")}>
                Create an account
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="signup-shell">
        <div className="signup-header">
          <div>
            <span className="auth-kicker">
              <UserPlus size={15} /> ACCOUNT REGISTRATION
            </span>
            <h1>{form.role === "worker" ? "Join the cooperative workforce." : "Create your customer account."}</h1>
            <p>
              {form.role === "worker" 
                ? "Build a verified Skill Passport and start receiving fair opportunities." 
                : "Register to request verified cooperative workers for your service needs."}
            </p>
          </div>
          {form.role === "worker" && <div className="step-indicator">Step {step} of 2</div>}
        </div>
        {form.role === "worker" && step < 3 && (
          <div className="signup-progress">
            <span className={step >= 1 ? "current" : ""} />
            <span className={step >= 2 ? "current" : ""} />
          </div>
        )}
        {step === 1 && (
          <form className="signup-card" onSubmit={handleProfileNext}>
            <div className="auth-card-heading">
              <UserPlus size={20} />
              <div>
                <span className="auth-kicker">PROFILE SETUP</span>
                <h2>Create your account</h2>
              </div>
            </div>
            
            <div className="role-selector" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: form.role === 'customer' ? '2px solid #4F46E5' : '1px solid #E2E8F0', borderRadius: '8px', flex: 1 }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="customer" 
                  checked={form.role === "customer"}
                  onChange={() => update("role", "customer")}
                  style={{ width: 'auto', marginBottom: 0 }}
                />
                Customer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: form.role === 'worker' ? '2px solid #4F46E5' : '1px solid #E2E8F0', borderRadius: '8px', flex: 1 }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="worker" 
                  checked={form.role === "worker"}
                  onChange={() => update("role", "worker")}
                  style={{ width: 'auto', marginBottom: 0 }}
                />
                Service Worker
              </label>
            </div>

            <div className="form-grid">
              <label>
                Full name *
                <input
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="e.g. Anand Sundaram"
                  required
                />
              </label>
              <label>
                Phone number *
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  placeholder="10-digit mobile number"
                  required
                />
              </label>
              <label>
                Email *
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label>
                Password *
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder="Create a password (min 6 chars)"
                  required
                  minLength={6}
                />
              </label>
              <label>
                Confirm password *
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    update("confirmPassword", event.target.value)
                  }
                  placeholder="Re-enter your password"
                  required
                />
              </label>
              
              {form.role === "worker" && (
                <>
                  <label>
                    Primary trade
                    <select
                      value={form.category}
                      onChange={(event) => update("category", event.target.value)}
                    >
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="carpentry">Carpentry</option>
                      <option value="painting">Painting</option>
                      <option value="cleaning">Cleaning</option>
                    </select>
                  </label>
                  <label>
                    Years of experience *
                    <input
                      type="number"
                      min="0"
                      value={form.experienceYears}
                      onChange={(event) =>
                        update("experienceYears", event.target.value)
                      }
                      placeholder="e.g. 5"
                      required={form.role === "worker"}
                    />
                  </label>
                  <label style={{ gridColumn: '1 / -1' }}>
                    Cooperative / society name
                    <input
                      value={form.cooperative}
                      onChange={(event) => update("cooperative", event.target.value)}
                      placeholder="Optional if joining independently"
                    />
                  </label>
                </>
              )}
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            <button className="auth-primary-btn" type="submit" disabled={submitting}>
              {submitting 
                ? "Processing..." 
                : form.role === "worker" 
                  ? "Continue to verification" 
                  : "Create Account"} 
              <ArrowRight size={17} />
            </button>
            <p className="auth-switch" style={{ marginTop: '16px', textAlign: 'center' }}>
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/signin")}>
                Sign in
              </button>
            </p>
          </form>
        )}
        
        {step === 2 && form.role === "worker" && (
          <form className="signup-card" onSubmit={handleSkillSubmit}>
            <div className="auth-card-heading">
              <ClipboardCheck size={20} />
              <div>
                <span className="auth-kicker">STEP 2</span>
                <h2>Trade skill check</h2>
              </div>
            </div>
            <p className="auth-muted">
              Answer these practical questions to establish your initial Skill
              Passport confidence.
            </p>
            <div className="skill-test-list">
              {skillQuestions.map((question, index) => (
                <fieldset key={question.prompt}>
                  <legend>
                    {index + 1}. {question.prompt}
                  </legend>
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={option}
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [index]: optionIndex,
                        }))
                      }
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        checked={String(answers[index]) === String(optionIndex)}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [index]: optionIndex,
                          }))
                        }
                      />
                      {option}
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button
              className="auth-primary-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creating Skill Passport..." : "Submit skill check"}{" "}
              <ArrowRight size={17} />
            </button>
          </form>
        )}
        
        {step === 3 && (
          <div className="signup-card success-card">
            <div className="success-icon">
              <CheckCircle2 size={32} />
            </div>
            <span className="auth-kicker">REGISTRATION COMPLETE</span>
            <h2>Welcome, {result?.full_name || form.name}.</h2>
            
            {form.role === "worker" ? (
              <>
                <p>
                  Your worker profile is verified and your initial Skill Passport is
                  ready.
                </p>
                <div className="verification-summary">
                  <span>
                    Skill test score<strong>{result?.skillTestScore ?? 85}%</strong>
                  </span>
                  <span>
                    Primary trade<strong>{form.category}</strong>
                  </span>
                </div>
                <button
                  className="auth-primary-btn"
                  type="button"
                  onClick={() => navigate("/worker")}
                >
                  Open worker portal <ArrowRight size={17} />
                </button>
              </>
            ) : (
              <>
                <p>
                  Your customer account has been created. You can now request verified cooperative workers.
                </p>
                <button
                  className="auth-primary-btn"
                  type="button"
                  onClick={() => navigate("/customer")}
                >
                  Open Dashboard <ArrowRight size={17} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
