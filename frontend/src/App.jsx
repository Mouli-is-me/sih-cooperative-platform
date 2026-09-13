import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import IntentProcessing from "./components/IntentProcessing.jsx";
import Footer from "./components/Footer.jsx";

import FairMatchResultsPage from "./pages/FairMatchResultsPage.jsx";
import WorkerProfilePage from "./pages/WorkerProfilePage.jsx";
import CustomerDashboardPage from "./pages/CustomerDashboardPage.jsx";
import WorkerDashboardPage from "./pages/WorkerDashboardPage.jsx";
import CooperativeDashboardPage from "./pages/CooperativeDashboardPage.jsx";
import BackendDashboardPage from "./pages/BackendDashboardPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DemoControls from "./components/DemoControls.jsx";

import { parseServiceIntent } from "./services/intentParser.js";
import { api, checkBackendHealth } from "./services/api.js";
import { getStoredLanguage, setStoredLanguage } from "./services/i18n.js";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Persistent Language state: 'en' | 'ta' | 'hi'
  const [currentLang, setCurrentLang] = useState(() => getStoredLanguage());

  const handleLanguageChange = (lang) => {
    setStoredLanguage(lang);
    setCurrentLang(lang);
  };

  const handlePublicIntent = (...args) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: { pathname: "/find" } } });
      return;
    }
    return handleStartIntentFlow(...args);
  };

  const protectedElement = (element, allowedRoles) => (
    <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>
  );

  // State management
  const [parsedIntent, setParsedIntent] = useState(() =>
    parseServiceIntent("My kitchen tap is leaking and I need someone today."),
  );
  const [matches, setMatches] = useState([]);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [isIntentReady, setIsIntentReady] = useState(true);
  const [intentError, setIntentError] = useState("");

  // Check health of Node.js backend on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  // Fetch initial customer requests if customer
  useEffect(() => {
    if (isAuthenticated && user?.role === "customer") {
      // Just a stub for fetching initial requests - ideally use an API endpoint
      // We will leave it empty to show the empty state for real database workflow
      setCustomerRequests([]);
    }
  }, [isAuthenticated, user]);

  // Handle Intent submission flow
  const handleStartIntentFlow = async (
    rawText,
    customerType = "Household",
    confirmedIntent = null,
  ) => {
    const parsed = confirmedIntent || parseServiceIntent(rawText);
    parsed.customerType = customerType;
    setParsedIntent(parsed);
    setIsIntentReady(false);
    setIntentError("");
    navigate("/find");

    // Create a new ServiceRequest strictly in CREATED status
    const reqData = {
      customerType: customerType,
      serviceCategory: parsed.serviceCategory,
      taskDetail: parsed.taskDetail,
      urgency: parsed.urgency,
      estimatedDuration: parsed.estimatedDuration,
      location: parsed.location || "K.K. Nagar, Madurai",
      customerName: user ? user.fullName || user.name : "Customer",
      rawText: rawText,
      status: "CREATED",
    };

    try {
      const [scoredMatches, newReq] = await Promise.all([
        api.getFairMatches(parsed),
        api.createServiceRequest(reqData),
      ]);
      setMatches(scoredMatches);
      setCustomerRequests((prev) => [newReq, ...prev]);
    } catch (error) {
      setIntentError(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsIntentReady(true);
    }
  };

  // Completion of Intent Processing simulation
  const handleCompleteProcessing = () => {
    navigate("/matches");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Request Worker Action (Transitions CREATED -> MATCHED -> WORKER_ACCEPTED)
  const handleRequestWorker = async (worker) => {
    // Find active CREATED request or create new
    const activeReq = customerRequests.find((r) => r.status === "CREATED");

    if (activeReq) {
      // Transition through the backend state machine in order.
      const requestId = activeReq.id || activeReq._id;
      try {
        await api.updateRequestStatus(requestId, "MATCHED");
        await api.updateRequestStatus(requestId, "WORKER_ACCEPTED", "MATCHED", {
          assignedWorkerId: worker.id,
        });
      } catch (error) {
        console.warn(
          "[Request Worker] Continuing with local assignment:",
          error,
        );
      }

      setCustomerRequests((previous) =>
        previous.map((req) =>
          (req.id || req._id) === requestId
            ? { ...req, worker, status: "WORKER_ACCEPTED" }
            : req,
        ),
      );
    } else {
      const newReq = {
        id: `req-${Date.now()}`,
        customerType: parsedIntent ? parsedIntent.customerType : "Household",
        serviceCategory: parsedIntent
          ? parsedIntent.serviceCategory
          : worker.category,
        taskDetail: parsedIntent
          ? parsedIntent.taskDetail
          : `${worker.title} Dispatch`,
        urgency: parsedIntent ? parsedIntent.urgency : "Standard",
        estimatedDuration: parsedIntent
          ? parsedIntent.estimatedDuration
          : "45 min",
        location: "K.K. Nagar, Madurai",
        customerName: user ? user.fullName || user.name : "Customer",
        worker: worker,
        status: "WORKER_ACCEPTED",
      };
      setCustomerRequests([newReq, ...customerRequests]);
    }

    navigate("/customer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // State Machine transition for customer request lifecycle
  const handleAdvanceStep = async (reqId) => {
    const stepSequence = [
      "CREATED",
      "MATCHED",
      "WORKER_ACCEPTED",
      "EN_ROUTE",
      "JOB_STARTED",
      "COMPLETED",
    ];
    const targetReq = customerRequests.find((r) => r.id === reqId);
    if (!targetReq) return;

    const currentIdx = stepSequence.indexOf(targetReq.status || "CREATED");
    if (currentIdx >= stepSequence.length - 1) return; // Already COMPLETED

    const nextStatus = stepSequence[currentIdx + 1];

    // Call API transition
    await api.updateRequestStatus(
      reqId,
      nextStatus,
      targetReq.status || "CREATED",
    );

    setCustomerRequests((prev) =>
      prev.map((req) => {
        if (req.id === reqId) {
          return {
            ...req,
            status: nextStatus,
          };
        }
        return req;
      }),
    );
  };

  // Worker Detail Wrapper for Route
  const WorkerProfileWrapper = () => {
    const { id } = useParams();
    const [targetWorker, setTargetWorker] = useState(null);

    useEffect(() => {
      let active = true;
      api.getWorkers().then((workers) => {
        const liveWorker = workers.find((worker) => worker.id === id);
        if (active && liveWorker) setTargetWorker(liveWorker);
      });
      return () => {
        active = false;
      };
    }, [id]);

    if (!targetWorker)
      return (
        <div style={{ padding: "60px", textAlign: "center" }}>
          Loading worker profile...
        </div>
      );

    return (
      <WorkerProfilePage
        worker={targetWorker}
        onRequestWorker={handleRequestWorker}
        onBack={() => navigate("/matches")}
        currentLang={currentLang}
      />
    );
  };

  return (
    <div className={`app-root lang-${currentLang}`}>
      {/* Main Navbar */}
      <Navbar currentLang={currentLang} onChangeLang={handleLanguageChange} />

      <DemoControls
        activeView={location.pathname}
        onNavigate={navigate}
        onSelectPreset={(query) => handlePublicIntent(query, "Household")}
        currentLang={currentLang}
        onChangeLang={handleLanguageChange}
      />

      {/* React Router Views */}
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onSubmitIntent={handlePublicIntent}
                onSelectCategory={(category) =>
                  handlePublicIntent(category.desc, "Household")
                }
                currentLang={currentLang}
              />
            }
          />

          <Route
            path="/find"
            element={protectedElement(
              <>
                <div className="center-processing-wrapper">
                  <IntentProcessing
                    parsedIntent={parsedIntent}
                    onCompleteProcessing={handleCompleteProcessing}
                    isReady={isIntentReady}
                    error={intentError}
                    currentLang={currentLang}
                  />
                </div>
              </>,
            )}
          />

          <Route
            path="/matches"
            element={protectedElement(
              <>
                <FairMatchResultsPage
                  intent={parsedIntent}
                  matches={matches}
                  onBack={() => navigate("/")}
                  onRequestWorker={handleRequestWorker}
                  onViewProfile={(w) => navigate(`/worker/${w.id}`)}
                  currentLang={currentLang}
                />
              </>,
            )}
          />

          <Route
            path="/worker/:id"
            element={protectedElement(<WorkerProfileWrapper />)}
          />

          <Route
            path="/customer"
            element={protectedElement(
              <>
                <CustomerDashboardPage
                  requests={customerRequests}
                  onAdvanceStep={handleAdvanceStep}
                  onNewRequest={() => navigate("/")}
                  onViewWorker={(workerId) => navigate(`/worker/${workerId}`)}
                  currentLang={currentLang}
                />
              </>,
              ["customer", "platform_admin"],
            )}
          />

          <Route
            path="/worker"
            element={protectedElement(
              <WorkerDashboardPage currentLang={currentLang} />,
              ["worker", "cooperative_member"],
            )}
          />

          <Route path="/how-it-works" element={<Navigate to="/" replace />} />
          <Route
            path="/worker-dashboard"
            element={<Navigate to="/worker" replace />}
          />

          <Route
            path="/cooperative"
            element={protectedElement(
              <CooperativeDashboardPage currentLang={currentLang} />,
              ["cooperative_admin", "platform_admin"],
            )}
          />

          <Route
            path="/backend"
            element={protectedElement(<BackendDashboardPage />, [
              "platform_admin",
            ])}
          />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<AuthPage mode="login" />} />
          <Route
            path="/worker/signup"
            element={<Navigate to="/signup" replace />}
          />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer
        setActiveView={(path) => navigate(path === "home" ? "/" : `/${path}`)}
        currentLang={currentLang}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
