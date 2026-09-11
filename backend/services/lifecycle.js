// Service Request State Machine & Lifecycle Transition Service

export const STAGES = {
  CREATED: "CREATED",
  MATCHED: "MATCHED",
  WORKER_ACCEPTED: "WORKER_ACCEPTED",
  EN_ROUTE: "EN_ROUTE",
  JOB_STARTED: "JOB_STARTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const ALLOWED_TRANSITIONS = {
  [STAGES.CREATED]: [STAGES.MATCHED, STAGES.CANCELLED],
  [STAGES.MATCHED]: [STAGES.WORKER_ACCEPTED, STAGES.CANCELLED],
  [STAGES.WORKER_ACCEPTED]: [STAGES.EN_ROUTE, STAGES.CANCELLED],
  [STAGES.EN_ROUTE]: [STAGES.JOB_STARTED, STAGES.CANCELLED],
  [STAGES.JOB_STARTED]: [STAGES.COMPLETED, STAGES.CANCELLED],
  [STAGES.COMPLETED]: [],
  [STAGES.CANCELLED]: [],
};

/**
 * Validate and execute lifecycle transition
 */
export const transitionRequest = (request, nextStatus) => {
  const currentStatus = request.status || STAGES.CREATED;

  if (currentStatus === nextStatus) {
    return {
      success: true,
      request,
      message: `Request is already in status ${nextStatus}`,
    };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      success: false,
      error: `Invalid transition from ${currentStatus} to ${nextStatus}. Allowed next states: ${allowed.join(", ") || "None (Terminal state)"}`,
    };
  }

  // Record timestamp for transition
  const now = new Date();
  const timestamps = request.transitionTimestamps || {};

  if (nextStatus === STAGES.MATCHED) timestamps.matchedAt = now;
  if (nextStatus === STAGES.WORKER_ACCEPTED) timestamps.acceptedAt = now;
  if (nextStatus === STAGES.EN_ROUTE) timestamps.enRouteAt = now;
  if (nextStatus === STAGES.JOB_STARTED) timestamps.startedAt = now;
  if (nextStatus === STAGES.COMPLETED) timestamps.completedAt = now;
  if (nextStatus === STAGES.CANCELLED) timestamps.cancelledAt = now;

  request.status = nextStatus;
  request.transitionTimestamps = timestamps;

  return {
    success: true,
    request,
    message: `Successfully transitioned request to ${nextStatus}`,
  };
};

/**
 * Generate standard UI timeline steps based on request state
 */
export const buildRequestTimeline = (request) => {
  const status = request.status || STAGES.CREATED;
  const stageOrder = [
    STAGES.CREATED,
    STAGES.MATCHED,
    STAGES.WORKER_ACCEPTED,
    STAGES.EN_ROUTE,
    STAGES.JOB_STARTED,
    STAGES.COMPLETED,
  ];
  const currentIdx = stageOrder.indexOf(status);

  return [
    {
      step: "Request Created",
      statusKey: STAGES.CREATED,
      done: currentIdx >= 0,
    },
    {
      step: "FairMatch Completed",
      statusKey: STAGES.MATCHED,
      done: currentIdx >= 1,
    },
    {
      step: "Worker Accepted",
      statusKey: STAGES.WORKER_ACCEPTED,
      done: currentIdx >= 2,
    },
    {
      step: "Worker En Route",
      statusKey: STAGES.EN_ROUTE,
      done: currentIdx >= 3,
    },
    {
      step: "Job Started",
      statusKey: STAGES.JOB_STARTED,
      done: currentIdx >= 4,
    },
    {
      step: "Job Completed",
      statusKey: STAGES.COMPLETED,
      done: currentIdx >= 5,
    },
  ];
};
