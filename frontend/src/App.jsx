import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useNavigate,
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

import { parseServiceIntent } from "./services/intentParser.js";
import { getFairMatches } from "./services/matching.js";
import { INITIAL_REQUESTS, WORKERS } from "./services/mockData.js";
import { api, checkBackendHealth } from "./services/api.js";
import { getStoredLanguage, setStoredLanguage } from "./services/i18n.js";

function AppContent() {
  const navigate = useNavigate();

  // Persistent Language state: 'en' | 'ta' | 'hi'
  const [currentLang, setCurrentLang] = useState(() => getStoredLanguage());

  const handleLanguageChange = (lang) => {
    setStoredLanguage(lang);
    setCurrentLang(lang);
  };

  // State management
  const [parsedIntent, setParsedIntent] = useState(() =>
    parseServiceIntent("My kitchen tap is leaking and I need someone today."),
  );
  const [matches, setMatches] = useState(() =>
    getFairMatches(parsedIntent, WORKERS),
  );
  const [customerRequests, setCustomerRequests] = useState(INITIAL_REQUESTS);
  const [isIntentReady, setIsIntentReady] = useState(true);

  // Check health of Node.js backend on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

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
    navigate("/find");

    // Create a new ServiceRequest strictly in CREATED status
    const reqData = {
      customerType: customerType,
      serviceCategory: parsed.serviceCategory,
      taskDetail: parsed.taskDetail,
      urgency: parsed.urgency,
      estimatedDuration: parsed.estimatedDuration,
      location: parsed.location || "K.K. Nagar, Madurai",
      customerName: "Anand Sundaram",
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
    const activeReq =
      customerRequests.find((r) => r.status === "CREATED") ||
      customerRequests[0];

    if (activeReq) {
      // Transition through the backend state machine in order.
      const requestId = activeReq.id || activeReq._id;
      await api.updateRequestStatus(requestId, "MATCHED");
      await api.updateRequestStatus(requestId, "WORKER_ACCEPTED", "MATCHED", {
        assignedWorkerId: worker.id,
      });

      setCustomerRequests(
        customerRequests.map((req) => {
          if (req.id === activeReq.id) {
            return {
              ...req,
              worker: worker,
              status: "WORKER_ACCEPTED",
            };
          }
          return req;
        }),
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
        customerName: "Anand Sundaram",
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
    const [targetWorker, setTargetWorker] = useState(
      () => WORKERS.find((w) => w.id === id) || WORKERS[0],
    );

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

      {/* React Router Views */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/find"
            element={
              <div className="center-processing-wrapper">
                <IntentProcessing
                  parsedIntent={parsedIntent}
                  onCompleteProcessing={handleCompleteProcessing}
                  isReady={isIntentReady}
                  currentLang={currentLang}
                />
              </div>
            }
          />

          <Route
            path="/matches"
            element={
              <FairMatchResultsPage
                intent={parsedIntent}
                matches={matches}
                onBack={() => navigate("/")}
                onRequestWorker={handleRequestWorker}
                onViewProfile={(w) => navigate(`/worker/${w.id}`)}
                currentLang={currentLang}
              />
            }
          />

          <Route path="/worker/:id" element={<WorkerProfileWrapper />} />

          <Route
            path="/customer"
            element={
              <CustomerDashboardPage
                requests={customerRequests}
                onAdvanceStep={handleAdvanceStep}
                onNewRequest={() => navigate("/")}
                onViewWorker={(workerId) => navigate(`/worker/${workerId}`)}
                currentLang={currentLang}
              />
            }
          />

          <Route
            path="/worker"
            element={<WorkerDashboardPage currentLang={currentLang} />}
          />

          <Route path="/how-it-works" element={<Navigate to="/" replace />} />
          <Route
            path="/worker-dashboard"
            element={<Navigate to="/worker" replace />}
          />

          <Route
            path="/cooperative"
            element={<CooperativeDashboardPage currentLang={currentLang} />}
          />

          <Route path="/backend" element={<BackendDashboardPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/worker/signup" element={<AuthPage mode="signup" />} />
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
      <AppContent />
    </BrowserRouter>
  );
}
