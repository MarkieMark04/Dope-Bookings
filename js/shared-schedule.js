(function () {
  const storageKey = "dopeBookings.sessions";
  const bookingsStorageKey = "dopeBookings.bookings";
  const brandingStorageKey = "dopeBookings.branding";
  const paymentSettingsStorageKey = "dopeBookings.paymentSettings";
  const sessionsCleanupVersionKey = "dopeBookings.sessionsCleanupVersion";
  const sessionsCleanupVersion = "2026-04-09-remove-seeded-sessions-1";
  const bookingsResetVersionKey = "dopeBookings.bookingsResetVersion";
  const bookingsResetVersion = "2026-04-09-clear-1";
  const seededSessionIds = [
    "salsa-2026-04-09-1830",
    "bachata-2026-04-09-2000",
    "showcase-2026-04-12-1900",
    "heels-2026-04-15-1730",
    "hiphop-2026-04-18-1100",
    "wedding-2026-04-21-1800",
    "kpop-2026-04-24-1630",
    "latin-party-2026-04-26-2000",
    "contemporary-2026-04-29-1830"
  ];

  const defaultSessions = [];
  const defaultBranding = {
    primary: "#49d10f",
    primaryText: "#ffffff",
    accent: "#0b130a",
    surface: "#ffffff",
    buttonStyle: "solid",
    bookingTheme: "clean-light"
  };
  const defaultPaymentSettings = {
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    paymentPublicNotes: "",
    paymentsRequireFullPayment: false,
    paymentsAllowPayOnsite: false,
    transactionSurcharge: "",
    paymentDueNotes: "",
    refundRule: "no-refunds",
    refundCutoff: "",
    refundAmount: "",
    refundDepositNonrefundable: true,
    refundPolicyCopy: ""
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const toWholeNumber = (value, fallback = 0) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return fallback;
    }
    return Math.max(0, Math.floor(numeric));
  };

  const hexToRgb = (hex) => {
    const normalized = String(hex || "").replace("#", "").trim();
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return null;
    }
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  };

  const rgba = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return `rgba(73, 209, 15, ${alpha})`;
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  const getReadableTextColor = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return "#0d1210";
    }

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness >= 160 ? "#0d1210" : "#ffffff";
  };

  const loadSessions = () => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return clone(defaultSessions);
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : clone(defaultSessions);
    } catch {
      return clone(defaultSessions);
    }
  };

  const saveSessions = (sessions) => {
    window.localStorage.setItem(storageKey, JSON.stringify(sessions));
  };

  const normalizeSessionCapacitySettings = (sessionInput) => {
    const session = { ...(sessionInput || {}) };
    const spots = toWholeNumber(session.spots, 0);
    return {
      ...session,
      spots,
      waitlistEnabled: Boolean(session.waitlistEnabled),
      waitlistLimit: Boolean(session.waitlistEnabled) ? toWholeNumber(session.waitlistLimit, 0) : 0,
      autoPromoteWaitlist: session.autoPromoteWaitlist !== false,
      autoCloseWhenFull: session.autoCloseWhenFull !== false,
      allowOverbooking: Boolean(session.allowOverbooking),
      overbookingLimit: Boolean(session.allowOverbooking) ? toWholeNumber(session.overbookingLimit, 0) : 0
    };
  };

  const sortBookingsByCreatedAt = (bookings) =>
    [...(bookings || [])].sort((left, right) => {
      const leftKey = `${left.createdAt || ""}-${left.id || ""}`;
      const rightKey = `${right.createdAt || ""}-${right.id || ""}`;
      return leftKey.localeCompare(rightKey);
    });

  const getSessionBookings = (sessionId, bookingsInput) =>
    sortBookingsByCreatedAt((bookingsInput || loadBookings()).filter((booking) => booking.sessionId === sessionId));

  const getSessionBookingSummary = (sessionInput, bookingsInput) => {
    const session = normalizeSessionCapacitySettings(sessionInput);
    const bookings = getSessionBookings(session.id, bookingsInput);
    const capacity = session.spots;
    const overbookingLimit = session.allowOverbooking ? session.overbookingLimit : 0;
    const waitlistLimit = session.waitlistEnabled ? session.waitlistLimit : 0;
    const confirmedThreshold = capacity;
    const overbookedThreshold = confirmedThreshold + overbookingLimit;
    const waitlistThreshold = overbookedThreshold + waitlistLimit;

    const bookingsWithStatus = bookings.map((booking, index) => {
      let bookingStatus = "blocked";
      if (index < confirmedThreshold) {
        bookingStatus = "confirmed";
      } else if (index < overbookedThreshold) {
        bookingStatus = "overbooked";
      } else if (index < waitlistThreshold) {
        bookingStatus = "waitlisted";
      }

      return {
        ...booking,
        bookingStatus
      };
    });

    const confirmedCount = bookingsWithStatus.filter((booking) => booking.bookingStatus === "confirmed").length;
    const overbookedCount = bookingsWithStatus.filter((booking) => booking.bookingStatus === "overbooked").length;
    const waitlistedCount = bookingsWithStatus.filter((booking) => booking.bookingStatus === "waitlisted").length;
    const blockedCount = bookingsWithStatus.filter((booking) => booking.bookingStatus === "blocked").length;
    const remainingConfirmedSpots = Math.max(0, confirmedThreshold - confirmedCount);
    const remainingOverbookingSpots = Math.max(0, overbookingLimit - overbookedCount);
    const remainingWaitlistSpots = Math.max(0, waitlistLimit - waitlistedCount);

    let nextBookingStatus = "blocked";
    if (remainingConfirmedSpots > 0) {
      nextBookingStatus = "confirmed";
    } else if (remainingOverbookingSpots > 0) {
      nextBookingStatus = "overbooked";
    } else if (remainingWaitlistSpots > 0) {
      nextBookingStatus = "waitlisted";
    }

    return {
      session,
      bookings: bookingsWithStatus,
      counts: {
        total: bookingsWithStatus.length,
        confirmed: confirmedCount,
        overbooked: overbookedCount,
        waitlisted: waitlistedCount,
        blocked: blockedCount
      },
      limits: {
        capacity,
        overbooking: overbookingLimit,
        waitlist: waitlistLimit
      },
      remaining: {
        confirmed: remainingConfirmedSpots,
        overbooking: remainingOverbookingSpots,
        waitlist: remainingWaitlistSpots
      },
      nextBookingStatus,
      isAtCapacity: confirmedCount >= confirmedThreshold,
      isClosed:
        session.autoCloseWhenFull &&
        nextBookingStatus === "blocked" &&
        !session.waitlistEnabled &&
        !session.allowOverbooking
    };
  };

  const loadBranding = () => {
    try {
      const raw = window.localStorage.getItem(brandingStorageKey);
      if (!raw) {
        return clone(defaultBranding);
      }
      const parsed = JSON.parse(raw);
      const branding = { ...clone(defaultBranding), ...(parsed || {}) };
      if (!parsed?.primaryText) {
        branding.primaryText = getReadableTextColor(branding.primary);
      }
      return branding;
    } catch {
      return clone(defaultBranding);
    }
  };

  const loadPaymentSettings = () => {
    try {
      const raw = window.localStorage.getItem(paymentSettingsStorageKey);
      if (!raw) {
        return clone(defaultPaymentSettings);
      }
      return { ...clone(defaultPaymentSettings), ...(JSON.parse(raw) || {}) };
    } catch {
      return clone(defaultPaymentSettings);
    }
  };

  const savePaymentSettings = (paymentSettings) => {
    const nextPaymentSettings = { ...clone(defaultPaymentSettings), ...(paymentSettings || {}) };
    window.localStorage.setItem(paymentSettingsStorageKey, JSON.stringify(nextPaymentSettings));
    return clone(nextPaymentSettings);
  };

  const saveBranding = (branding) => {
    const nextBranding = { ...clone(defaultBranding), ...(branding || {}) };
    if (!nextBranding.primaryText) {
      nextBranding.primaryText = getReadableTextColor(nextBranding.primary);
    }
    window.localStorage.setItem(brandingStorageKey, JSON.stringify(nextBranding));
    return clone(nextBranding);
  };

  const applyBranding = (brandingInput) => {
    if (!window.document?.documentElement) {
      return clone(defaultBranding);
    }

    const branding = { ...clone(defaultBranding), ...(brandingInput || loadBranding()) };
    const root = window.document.documentElement;
    const primaryText = branding.primaryText || getReadableTextColor(branding.primary);

    root.style.setProperty("--accent", branding.primary);
    root.style.setProperty("--today-ring", branding.primary);
    root.style.setProperty("--accent-strong", branding.accent);
    root.style.setProperty("--card-bg", rgba(branding.surface, 0.95));
    root.style.setProperty("--day-bg", rgba(branding.surface, 0.92));
    root.style.setProperty("--accent-soft", rgba(branding.primary, 0.12));
    root.style.setProperty("--shadow-accent", `0 14px 28px ${rgba(branding.primary, 0.24)}`);
    root.style.setProperty("--button-solid-text", primaryText);
    root.style.setProperty("--primary-fill-text", primaryText);
    root.style.setProperty("--button-soft-text", branding.primary);
    root.style.setProperty("--interactive-hover-border", rgba(branding.primary, 0.34));
    root.style.setProperty(
      "--interactive-hover-bg",
      `linear-gradient(135deg, ${rgba(branding.surface, 0.98)}, ${rgba(branding.primary, 0.08)})`
    );
    root.style.setProperty("--interactive-selected-border", branding.primary);
    root.style.setProperty(
      "--interactive-selected-bg",
      `linear-gradient(135deg, ${rgba(branding.surface, 0.98)}, ${rgba(branding.primary, 0.08)})`
    );
    root.style.setProperty(
      "--interactive-selected-shadow",
      `inset 0 0 0 2px ${rgba(branding.primary, 0.32)}, 0 16px 30px ${rgba(branding.primary, 0.12)}`
    );
    root.style.setProperty(
      "--page-bg",
      branding.bookingTheme === "bold-contrast"
        ? `radial-gradient(circle at top, ${rgba(branding.primary, 0.18)} 0%, ${rgba(
            branding.primary,
            0
          )} 28%), linear-gradient(180deg, #eef3ef 0%, #dfe7e1 100%)`
        : branding.bookingTheme === "minimal-studio"
          ? `linear-gradient(180deg, ${rgba(branding.surface, 1)} 0%, ${rgba(branding.surface, 0.92)} 100%)`
          : `radial-gradient(circle at top, ${rgba(branding.primary, 0.16)} 0%, ${rgba(
              branding.primary,
              0
            )} 26%), linear-gradient(180deg, #f7f9f8 0%, #edf1ef 55%, #e3e8e5 100%)`
    );

    root.dataset.buttonStyle = branding.buttonStyle;
    root.dataset.bookingTheme = branding.bookingTheme;

    return clone(branding);
  };

  const loadBookings = () => {
    try {
      const raw = window.localStorage.getItem(bookingsStorageKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveBookings = (bookings) => {
    window.localStorage.setItem(bookingsStorageKey, JSON.stringify(bookings));
  };

  const resetBookings = () => {
    saveBookings([]);
    window.localStorage.setItem(bookingsResetVersionKey, bookingsResetVersion);
    return [];
  };

  const addSession = (session) => {
    const sessions = loadSessions();
    sessions.push(normalizeSessionCapacitySettings(session));
    saveSessions(sessions);
    return clone(normalizeSessionCapacitySettings(session));
  };

  const updateSession = (id, nextSession) => {
    const sessions = loadSessions();
    const index = sessions.findIndex((session) => session.id === id);
    if (index < 0) {
      return null;
    }
    sessions[index] = normalizeSessionCapacitySettings({ ...sessions[index], ...nextSession, id });
    saveSessions(sessions);
    return clone(sessions[index]);
  };

  const deleteSession = (id) => {
    const sessions = loadSessions();
    const filtered = sessions.filter((session) => session.id !== id);
    saveSessions(filtered);
    return filtered.length !== sessions.length;
  };

  const addBooking = (booking) => {
    const sessions = loadSessions();
    const session = sessions.find((item) => item.id === booking.sessionId);
    if (!session) {
      return null;
    }

    const bookings = loadBookings();
    const summary = getSessionBookingSummary(session, bookings);
    if (summary.nextBookingStatus === "blocked") {
      return null;
    }

    const nextBooking = {
      ...booking,
      bookingStatus: summary.nextBookingStatus
    };
    bookings.push(nextBooking);
    saveBookings(bookings);
    return clone(nextBooking);
  };

  const updateBooking = (id, nextBooking) => {
    const bookings = loadBookings();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index < 0) {
      return null;
    }
    bookings[index] = { ...bookings[index], ...nextBooking, id };
    saveBookings(bookings);
    return clone(bookings[index]);
  };

  try {
    const appliedSessionsCleanupVersion = window.localStorage.getItem(sessionsCleanupVersionKey);
    if (appliedSessionsCleanupVersion !== sessionsCleanupVersion) {
      const sessions = loadSessions();
      const filteredSessions = sessions.filter((session) => !seededSessionIds.includes(session.id));
      saveSessions(filteredSessions);
      window.localStorage.setItem(sessionsCleanupVersionKey, sessionsCleanupVersion);
    }

    const appliedResetVersion = window.localStorage.getItem(bookingsResetVersionKey);
    if (appliedResetVersion !== bookingsResetVersion) {
      resetBookings();
    }

    applyBranding(loadBranding());
  } catch {
    // Ignore localStorage availability issues and leave runtime behavior unchanged.
  }

  const resetSessions = () => {
    saveSessions(defaultSessions);
    return clone(defaultSessions);
  };

  window.DopeScheduleStore = {
    storageKey,
    bookingsStorageKey,
    brandingStorageKey,
    paymentSettingsStorageKey,
    defaultSessions: clone(defaultSessions),
    defaultBranding: clone(defaultBranding),
    defaultPaymentSettings: clone(defaultPaymentSettings),
    loadSessions,
    saveSessions,
    normalizeSessionCapacitySettings,
    getSessionBookings,
    getSessionBookingSummary,
    loadBranding,
    saveBranding,
    loadPaymentSettings,
    savePaymentSettings,
    applyBranding,
    loadBookings,
    saveBookings,
    addSession,
    updateSession,
    deleteSession,
    addBooking,
    updateBooking,
    resetBookings,
    resetSessions
  };
})();
