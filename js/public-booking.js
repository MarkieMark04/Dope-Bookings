const publicMonthLabel = document.querySelector("[data-public-month]");
const publicCalendarGrid = document.querySelector(
  "[data-public-calendar-grid]",
);
const publicCalendarLayout = document.querySelector(
  "[data-public-calendar-layout]",
);
const publicDailyLayout = document.querySelector("[data-public-daily-layout]");
const publicWeeklyLayout = document.querySelector(
  "[data-public-weekly-layout]",
);
const publicDailyLabel = document.querySelector("[data-public-daily-label]");
const publicDailyGrid = document.querySelector("[data-public-daily-grid]");
const publicWeeklyLabel = document.querySelector("[data-public-weekly-label]");
const publicWeeklyTimes = document.querySelector("[data-public-weekly-times]");
const publicWeeklyColumns = document.querySelector(
  "[data-public-weekly-columns]",
);
const publicNavButtons = document.querySelectorAll("[data-public-nav]");
const publicDailyNavButtons = document.querySelectorAll(
  "[data-public-daily-nav]",
);
const publicWeeklyNavButtons = document.querySelectorAll(
  "[data-public-weekly-nav]",
);
const publicViewSelects = document.querySelectorAll(
  "[data-public-view-select]",
);
const publicFilterButtons = document.querySelectorAll("[data-booking-filter]");
const selectedDateLabel = document.querySelector("[data-selected-date-label]");
const selectedDateCopy = document.querySelector("[data-selected-date-copy]");
const sessionCount = document.querySelector("[data-public-session-count]");
const sessionCard = document.querySelector(".public-session-card");
const sessionList = document.querySelector("[data-public-session-list]");
const bookingCard = document.querySelector(".public-booking-card");
const bookingTitle = document.querySelector("[data-public-booking-title]");
const bookingForm = document.querySelector("[data-public-booking-form]");
const bookingStatus = document.querySelector("[data-public-form-status]");
const refundPolicyLink = document.querySelector("[data-refund-policy-open]");
const publicModal = document.querySelector("[data-public-modal]");
const publicModalTitle = document.querySelector("[data-public-modal-title]");
const publicModalContent = document.querySelector(
  "[data-public-modal-content]",
);
const publicModalCloseButtons = document.querySelectorAll(
  "[data-public-modal-close]",
);
const refundModal = document.querySelector("[data-refund-modal]");
const refundModalTitle = document.querySelector("[data-refund-modal-title]");
const refundModalContent = document.querySelector("[data-refund-modal-content]");
const refundModalCloseButtons = document.querySelectorAll("[data-refund-modal-close]");
const paymentModal = document.querySelector("[data-payment-modal]");
const paymentModalTitle = document.querySelector("[data-payment-modal-title]");
const paymentModalContent = document.querySelector("[data-payment-modal-content]");
const paymentModalStatus = document.querySelector("[data-payment-modal-status]");
const paymentModalCloseButtons = document.querySelectorAll("[data-payment-modal-close]");
const cardModal = document.querySelector("[data-card-modal]");
const cardPaymentForm = document.querySelector("[data-card-payment-form]");
const cardModalStatus = document.querySelector("[data-card-modal-status]");
const cardModalCloseButtons = document.querySelectorAll("[data-card-modal-close]");
const cardModalBackButton = document.querySelector("[data-card-modal-back]");
const onsiteCodeModal = document.querySelector("[data-onsite-code-modal]");
const onsiteCodeModalTitle = document.querySelector("[data-onsite-code-modal-title]");
const onsiteCodeModalContent = document.querySelector("[data-onsite-code-modal-content]");
const onsiteCodeModalCloseButtons = document.querySelectorAll("[data-onsite-code-modal-close]");

if (publicMonthLabel && publicCalendarGrid) {
  const store = window.DopeScheduleStore;
  const today = new Date();
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let visibleDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  let visibleWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  let activeFilter = "all";
  let selectedDateKey = "";
  let selectedGridSlotKey = "";
  let selectedSessionId = "";
  let pendingBookingRequest = null;

  const loadSessions = () => (store ? store.loadSessions() : []);
  const loadBookings = () => (store ? store.loadBookings() : []);
  const loadPaymentSettings = () => (store ? store.loadPaymentSettings?.() : null);

  const toDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;

  const startOfWeek = (date) => {
    const result = new Date(date);
    result.setDate(result.getDate() - result.getDay());
    return result;
  };

  const parseTimeValue = (timeText) => {
    const match = String(timeText || "").match(
      /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i,
    );
    if (!match) {
      return Number.MAX_SAFE_INTEGER;
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const suffix = match[3].toUpperCase();
    if (suffix === "PM" && hours !== 12) {
      hours += 12;
    }
    if (suffix === "AM" && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  };

  const getFilteredSessions = () =>
    loadSessions()
      .filter(
        (session) => activeFilter === "all" || session.type === activeFilter,
      )
      .sort((left, right) => {
        if (left.date !== right.date) {
          return left.date.localeCompare(right.date);
        }
        return parseTimeValue(left.time) - parseTimeValue(right.time);
      });

  const getSessionsForDate = (dateKey) =>
    getFilteredSessions().filter((session) => session.date === dateKey);

  const getSessionSummary = (session) =>
    store?.getSessionBookingSummary?.(session, loadBookings()) || {
      session,
      bookings: [],
      counts: { total: 0, confirmed: 0, overbooked: 0, waitlisted: 0, blocked: 0 },
      limits: { capacity: Number(session?.spots || 0), overbooking: 0, waitlist: 0 },
      remaining: { confirmed: 0, overbooking: 0, waitlist: 0 },
      nextBookingStatus: "blocked",
      isAtCapacity: false,
      isClosed: false
    };

  const formatSessionAvailability = (session) => {
    const summary = getSessionSummary(session);
    if (summary.remaining.confirmed > 0) {
      return `${summary.remaining.confirmed} spots left`;
    }
    if (summary.remaining.overbooking > 0) {
      return `${summary.remaining.overbooking} overbooking spots left`;
    }
    if (summary.remaining.waitlist > 0) {
      return `${summary.remaining.waitlist} waitlist spots left`;
    }
    return summary.session.autoCloseWhenFull ? "Closed" : "Full";
  };

  const getNextBookingMessage = (session) => {
    const summary = getSessionSummary(session);
    if (summary.nextBookingStatus === "confirmed") {
      return "Booking will be confirmed instantly.";
    }
    if (summary.nextBookingStatus === "overbooked") {
      return "Capacity is full. New bookings will be marked as overbooked.";
    }
    if (summary.nextBookingStatus === "waitlisted") {
      return "Capacity is full. New bookings will join the waitlist.";
    }
    return summary.session.autoCloseWhenFull ? "This session is closed." : "This session is full.";
  };

  const getBookingResultMessage = (session, booking, name) => {
    if (booking.bookingStatus === "waitlisted") {
      return `${name} was added to the waitlist for ${session.title} on ${formatDateLabel(session.date)} via ${
        booking.paymentMethod === "onsite" ? "pay on-site" : "pay online"
      }${booking.onsiteCode ? `. Bring code ${booking.onsiteCode}.` : "."}`;
    }
    if (booking.bookingStatus === "overbooked") {
      return `${name} was booked into ${session.title} on ${formatDateLabel(session.date)} as an overbooked attendee via ${
        booking.paymentMethod === "onsite" ? "pay on-site" : "pay online"
      }${booking.onsiteCode ? `. Bring code ${booking.onsiteCode}.` : "."}`;
    }
    return `Reserved ${session.title} on ${formatDateLabel(session.date)} for ${name} via ${
      booking.paymentMethod === "onsite" ? "pay on-site" : "pay online"
    }${booking.onsiteCode ? `. Bring code ${booking.onsiteCode}.` : "."}`;
  };

  const generateOnsiteCode = () =>
    `ONS-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;

  const hasRefundPolicy = () => {
    const paymentSettings = loadPaymentSettings() || {};
    const defaultPaymentSettings = store?.defaultPaymentSettings || {};

    return [
      "refundRule",
      "refundCutoff",
      "refundAmount",
      "refundDepositNonrefundable",
      "refundPolicyCopy"
    ].some((key) => String(paymentSettings[key] ?? "") !== String(defaultPaymentSettings[key] ?? ""));
  };

  const syncRefundPolicyLink = () => {
    if (!refundPolicyLink) {
      return;
    }

    refundPolicyLink.hidden = !hasRefundPolicy();
  };

  const formatDateLabel = (dateKey) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatWeekRange = (date) => {
    const weekStart = startOfWeek(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const getDailySlotKeyForSession = (session) => {
    const bucket = Math.floor(parseTimeValue(session.time) / 60) * 60;
    return `${session.date}-${bucket}`;
  };

  const getWeeklySlotKeyForSession = (session) => {
    const hour = Math.floor(parseTimeValue(session.time) / 60);
    return `${session.date}-${Math.max(0, hour - 9)}`;
  };

  const ensureSelectedDate = () => {
    const filteredSessions = getFilteredSessions();
    if (!filteredSessions.length) {
      selectedSessionId = "";
      return;
    }

    if (!selectedDateKey) {
      selectedDateKey = "";
      selectedSessionId = "";
      selectedGridSlotKey = "";
    }
  };

  const updateVisibleView = () => {
    if (
      !publicCalendarLayout ||
      !publicDailyLayout ||
      !publicWeeklyLayout ||
      !publicViewSelects.length
    ) {
      return;
    }

    const currentView =
      Array.from(publicViewSelects).find((select) => select.value)?.value ||
      "monthly";
    publicViewSelects.forEach((select) => {
      if (select.value !== currentView) {
        select.value = currentView;
      }
    });

    publicCalendarLayout.classList.toggle(
      "is-hidden",
      currentView !== "monthly",
    );
    publicDailyLayout.classList.toggle("is-hidden", currentView !== "daily");
    publicWeeklyLayout.classList.toggle("is-hidden", currentView !== "weekly");
  };

  const openPublicModal = (session) => {
    if (!publicModal || !publicModalTitle || !publicModalContent) {
      return;
    }

    const hasMap = session.latitude && session.longitude;
    const lat = Number(session.latitude);
    const lon = Number(session.longitude);
    const delta = 0.01;
    const left = encodeURIComponent(String(lon - delta));
    const bottom = encodeURIComponent(String(lat - delta));
    const right = encodeURIComponent(String(lon + delta));
    const top = encodeURIComponent(String(lat + delta));
    const markerLat = encodeURIComponent(String(lat));
    const markerLon = encodeURIComponent(String(lon));

    publicModalTitle.textContent = session.title;
    publicModalContent.innerHTML = `
      <section class="public-modal-hero ${session.type === "event" ? "is-event" : ""}">
        <div>
          <span class="public-modal-type">${session.type}</span>
          <h3 class="public-summary-title">${session.title}</h3>
        </div>
        <div class="public-modal-time">${formatDateLabel(session.date)} - ${session.time}</div>
      </section>
      <section class="public-modal-grid">
        <div class="public-modal-card">
          <span class="public-modal-label">Price</span>
          <span class="public-modal-value">${session.price || "TBC"}</span>
        </div>
        <div class="public-modal-card">
          <span class="public-modal-label">Age Group</span>
          <span class="public-modal-value">${session.ageGroup || "All ages"}</span>
        </div>
        <div class="public-modal-card">
          <span class="public-modal-label">Capacity</span>
          <span class="public-modal-value">${formatSessionAvailability(session)}</span>
        </div>
        <div class="public-modal-card">
          <span class="public-modal-label">Duration</span>
          <span class="public-modal-value">${session.duration || "TBC"}</span>
        </div>
        <div class="public-modal-card">
          <span class="public-modal-label">Location</span>
          <span class="public-modal-value">${session.location || "TBC"}</span>
        </div>
        <div class="public-modal-card">
          <span class="public-modal-label">Instructor / Host</span>
          <span class="public-modal-value">${session.instructor || "TBC"}</span>
        </div>
      </section>
      <section class="public-modal-description">
        <span class="public-modal-label">Description</span>
        <p>${session.description || "No description provided."}</p>
      </section>
      <section class="public-modal-description">
        <span class="public-modal-label">Booking Status</span>
        <p>${getNextBookingMessage(session)}</p>
      </section>
      ${
        hasMap
          ? `<section class="public-modal-map">
              <span class="public-modal-label">Address</span>
              <div class="public-modal-value">${session.address || "TBC"}</div>
              <span class="public-modal-label">Map</span>
              <div class="public-modal-map-frame">
                <iframe
                  title="Event location map"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${markerLat}%2C${markerLon}"
                ></iframe>
              </div>
            </section>`
          : ""
      }
    `;

    publicModal.classList.remove("is-hidden");
    publicModal.setAttribute("aria-hidden", "false");
  };

  const closePublicModal = () => {
    if (!publicModal) {
      return;
    }

    publicModal.classList.add("is-hidden");
    publicModal.setAttribute("aria-hidden", "true");
  };

  const openRefundModal = () => {
    if (!refundModal || !refundModalTitle || !refundModalContent) {
      return;
    }

    const paymentSettings = loadPaymentSettings() || {};
    refundModalTitle.textContent = "Refund Policy";
    refundModalContent.innerHTML = `
      <section class="public-modal-description">
        <span class="public-modal-label">Refund Rule</span>
        <p>${paymentSettings.refundRule || "No refunds"}</p>
      </section>
      <section class="public-modal-grid">
        <div class="public-modal-card">
          <span class="public-modal-label">Refund Cutoff</span>
          <span class="public-modal-value">${paymentSettings.refundCutoff || "Not specified"}</span>
        </div>
        <div class="public-modal-card">
          <span class="public-modal-label">Refund Amount</span>
          <span class="public-modal-value">${paymentSettings.refundAmount || "Not specified"}</span>
        </div>
        <div class="public-modal-card">
          <span class="public-modal-label">Deposit Rule</span>
          <span class="public-modal-value">${
            paymentSettings.refundDepositNonrefundable ? "Deposit is non-refundable" : "Deposit may be refunded"
          }</span>
        </div>
        <div class="public-modal-card">
          <span class="public-modal-label">Pay Full Now</span>
          <span class="public-modal-value">${
            paymentSettings.paymentsRequireFullPayment ? "Required" : "Optional"
          }</span>
        </div>
      </section>
      <section class="public-modal-description">
        <span class="public-modal-label">Policy Details</span>
        <p>${paymentSettings.refundPolicyCopy || "No refund policy has been published yet."}</p>
      </section>
    `;

    refundModal.classList.remove("is-hidden");
    refundModal.setAttribute("aria-hidden", "false");
  };

  const closeRefundModal = () => {
    if (!refundModal) {
      return;
    }

    refundModal.classList.add("is-hidden");
    refundModal.setAttribute("aria-hidden", "true");
  };

  const openPaymentModal = () => {
    if (!paymentModal || !paymentModalTitle || !paymentModalContent || !pendingBookingRequest) {
      return;
    }

    const paymentSettings = loadPaymentSettings() || {};
    const onlineAllowed = Boolean(paymentSettings.paymentsRequireFullPayment);
    const surchargeText = String(paymentSettings.transactionSurcharge || "").trim();
    const onsiteAllowed = Boolean(paymentSettings.paymentsAllowPayOnsite);
    const hasEnabledPayments = onlineAllowed || onsiteAllowed;

    paymentModalTitle.textContent = "Choose Payment Method";
    paymentModalContent.innerHTML = `
      <section class="public-modal-description">
        <span class="public-modal-label">Booking</span>
        <p>${pendingBookingRequest.name} is booking ${pendingBookingRequest.session.title} on ${formatDateLabel(
          pendingBookingRequest.session.date
        )} at ${pendingBookingRequest.session.time}.</p>
      </section>
      ${
        hasEnabledPayments
          ? `<section class="public-modal-grid">
              ${
                onlineAllowed
                  ? `<div class="public-modal-card">
                      <span class="public-modal-label">Pay Online</span>
                      <span class="public-modal-value">Use Stripe checkout when it is connected.</span>
                      <button type="button" class="calendar-create payment-choice-button" data-payment-choice="online">Pay Online</button>
                    </div>`
                  : ""
              }
              ${
                onsiteAllowed
                  ? `<div class="public-modal-card">
                      <span class="public-modal-label">Pay On-Site</span>
                      <span class="public-modal-value">Reserve now and pay at the venue.</span>
                      <button type="button" class="calendar-nav payment-choice-button" data-payment-choice="onsite">Pay On-Site</button>
                    </div>`
                  : ""
              }
            </section>`
          : `<section class="public-modal-description">
              <span class="public-modal-label">Payments Disabled</span>
              <p>Enable payments in Checkout before customers can continue.</p>
            </section>`
      }
      ${
        onlineAllowed && surchargeText
          ? `<section class="public-modal-description">
              <span class="public-modal-label">Surcharge</span>
              <p>An online payment surcharge of ${surchargeText} may apply.</p>
            </section>`
          : ""
      }
    `;

    if (paymentModalStatus) {
      paymentModalStatus.textContent = !hasEnabledPayments
        ? "Enable payments in Checkout settings first."
        : onlineAllowed && onsiteAllowed
          ? "Select Pay Online or Pay On-Site to finish your booking."
          : onlineAllowed
            ? "Pay On-Site is disabled. Continue with Pay Online."
            : "Pay Online is disabled. Continue with Pay On-Site.";
    }

    paymentModal.classList.remove("is-hidden");
    paymentModal.setAttribute("aria-hidden", "false");
  };

  const closePaymentModal = () => {
    if (!paymentModal) {
      return;
    }

    paymentModal.classList.add("is-hidden");
    paymentModal.setAttribute("aria-hidden", "true");
  };

  const openCardModal = () => {
    if (!cardModal || !pendingBookingRequest) {
      return;
    }

    if (cardModalStatus) {
      cardModalStatus.textContent = `Demo card form for ${pendingBookingRequest.session.title}. No real payment is processed.`;
    }
    cardModal.classList.remove("is-hidden");
    cardModal.setAttribute("aria-hidden", "false");
  };

  const closeCardModal = () => {
    if (!cardModal) {
      return;
    }

    cardModal.classList.add("is-hidden");
    cardModal.setAttribute("aria-hidden", "true");
  };

  const openOnsiteCodeModal = (booking) => {
    if (!onsiteCodeModal || !onsiteCodeModalTitle || !onsiteCodeModalContent || !booking) {
      return;
    }

    onsiteCodeModalTitle.textContent = "Your Check-In Code";
    onsiteCodeModalContent.innerHTML = `
      <section class="public-modal-description">
        <span class="public-modal-label">Booking Confirmed</span>
        <p>${booking.customerName}, your reservation for ${booking.sessionTitle} is confirmed as Pay On-Site.</p>
      </section>
      <section class="public-modal-description">
        <span class="public-modal-label">Code</span>
        <p class="public-booking-code">${booking.onsiteCode || ""}</p>
      </section>
      <section class="public-modal-description">
        <span class="public-modal-label">Bring This Code</span>
        <p>Show this code at arrival so staff can find your booking quickly.</p>
      </section>
    `;

    onsiteCodeModal.classList.remove("is-hidden");
    onsiteCodeModal.setAttribute("aria-hidden", "false");
  };

  const closeOnsiteCodeModal = () => {
    if (!onsiteCodeModal) {
      return;
    }

    onsiteCodeModal.classList.add("is-hidden");
    onsiteCodeModal.setAttribute("aria-hidden", "true");
  };

  const finalizeBooking = (paymentMethod) => {
    if (!pendingBookingRequest) {
      return;
    }

    const { session, name, email, notes } = pendingBookingRequest;
    const booking = store?.addBooking({
      id: `booking-${Date.now()}`,
      sessionId: session.id,
      sessionTitle: session.title,
      sessionDate: session.date,
      sessionTime: session.time,
      customerName: name,
      customerEmail: email,
      notes,
      paymentMethod,
      onsiteCode: paymentMethod === "onsite" ? generateOnsiteCode() : "",
      createdAt: new Date().toISOString()
    });

    if (!booking) {
      if (bookingStatus) {
        bookingStatus.textContent = getNextBookingMessage(session);
      }
      closePaymentModal();
      closeCardModal();
      pendingBookingRequest = null;
      rerenderAll();
      return;
    }

    if (bookingStatus) {
      bookingStatus.textContent = getBookingResultMessage(session, booking, name);
    }
    bookingForm?.reset();
    closePaymentModal();
    closeCardModal();
    cardPaymentForm?.reset();
    if (paymentMethod === "onsite" && booking.onsiteCode) {
      openOnsiteCodeModal(booking);
    }
    pendingBookingRequest = null;
    rerenderAll();
  };

  const selectDate = (dateKey, sessionId = "", gridSlotKey = "") => {
    selectedDateKey = dateKey;
    selectedSessionId = sessionId || "";
    selectedGridSlotKey = gridSlotKey || "";
    const [year, month, day] = dateKey.split("-").map(Number);
    visibleDay = new Date(year, month - 1, day);
    visibleWeek = new Date(year, month - 1, day);
    visibleMonth = new Date(year, month - 1, 1);
  };

  const selectSession = (session, gridSlotKey = "") => {
    if (!session?.date) {
      return;
    }

    selectDate(session.date, session.id, gridSlotKey);
  };

  const clearSelection = () => {
    selectedDateKey = "";
    selectedSessionId = "";
    selectedGridSlotKey = "";
  };

  const updateBookingCardVisibility = (selectedSession) => {
    if (!bookingCard) {
      return;
    }

    bookingCard.hidden = !selectedSession;
  };

  const updateSessionCardVisibility = (hasSelectedDate, hasSessions) => {
    if (!sessionCard) {
      return;
    }

    sessionCard.hidden = !hasSelectedDate || !hasSessions;
  };

  const renderSessionList = () => {
    ensureSelectedDate();
    const dateSessions = selectedDateKey
      ? getSessionsForDate(selectedDateKey)
      : [];

    selectedDateLabel.textContent = selectedDateKey
      ? formatDateLabel(selectedDateKey)
      : "No available dates";
    selectedDateCopy.textContent = !selectedDateKey
      ? "There are no sessions available for the current filter."
      : dateSessions.length
        ? "Select a class or event below to complete your booking."
        : "There are no sessions scheduled for this date.";

    sessionCount.textContent = String(dateSessions.length);

    if (!selectedDateKey) {
      sessionList.innerHTML = "";
      bookingTitle.textContent = "No session selected";
      selectedSessionId = "";
      selectedGridSlotKey = "";
      updateSessionCardVisibility(false, false);
      updateBookingCardVisibility(null);
      if (bookingStatus) {
        bookingStatus.textContent = "";
      }
      return;
    }

    if (!dateSessions.length) {
      sessionList.innerHTML =
        '<p class="public-empty">No sessions available for this date.</p>';
      bookingTitle.textContent = "No session selected";
      selectedSessionId = "";
      updateSessionCardVisibility(false, false);
      updateBookingCardVisibility(null);
      if (bookingStatus) {
        bookingStatus.textContent = "";
      }
      return;
    }

    if (!dateSessions.some((session) => session.id === selectedSessionId)) {
      selectedSessionId = "";
    }

    sessionList.innerHTML = dateSessions
      .map(
        (session) => `
          <article class="public-session-item ${session.type === "event" ? "is-event" : ""} ${
            session.id === selectedSessionId ? "is-selected" : ""
          }" data-session-id="${session.id}">
            <div class="public-session-top">
              <span class="public-session-type">${session.type}</span>
              <span class="public-session-time">${session.time}</span>
            </div>
            <div class="public-session-name">${session.title}</div>
            <div class="public-session-meta">${session.location || "TBC"} - ${formatSessionAvailability(session)}</div>
            <div class="public-session-actions">
              <button type="button" class="public-session-book" data-session-view="${session.id}">Class Details</button>
            </div>
          </article>
        `,
      )
      .join("");

    const selectedSession = dateSessions.find(
      (session) => session.id === selectedSessionId,
    );
    updateSessionCardVisibility(true, true);
    bookingTitle.textContent = selectedSession
      ? `${selectedSession.title} - ${selectedSession.time}`
      : "No session selected";
    updateBookingCardVisibility(selectedSession || null);
    if (bookingStatus && selectedSession) {
      bookingStatus.textContent = getNextBookingMessage(selectedSession);
    }
  };

  const renderCalendar = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const firstVisibleDate = new Date(firstDayOfMonth);
    firstVisibleDate.setDate(
      firstVisibleDate.getDate() - firstDayOfMonth.getDay(),
    );

    publicMonthLabel.textContent = visibleMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    publicCalendarGrid.innerHTML = "";

    for (let index = 0; index < 42; index += 1) {
      const cellDate = new Date(firstVisibleDate);
      cellDate.setDate(firstVisibleDate.getDate() + index);
      const dateKey = toDateKey(cellDate);
      const daySessions =
        cellDate.getMonth() === month ? getSessionsForDate(dateKey) : [];
      const isOutsideMonth = cellDate.getMonth() !== month;
      const isToday = toDateKey(cellDate) === toDateKey(today);

      const dayCell = document.createElement("article");
      dayCell.className = "calendar-day";
      dayCell.dataset.date = dateKey;

      if (isOutsideMonth) {
        dayCell.classList.add("is-outside");
      }
      if (isToday) {
        dayCell.classList.add("is-today");
      }
      if (daySessions.length) {
        dayCell.classList.add("is-bookable");
      }
      if (selectedDateKey === dateKey) {
        dayCell.classList.add("is-selected");
      }

      dayCell.innerHTML = `
        <div class="calendar-day-head public-day-meta">
          <span class="calendar-day-number">${cellDate.getDate()}</span>
        </div>
        <div class="public-slot-stack">
          ${daySessions
            .slice(0, 2)
            .map(
              (session) => `
                <button
                  type="button"
                  class="public-slot-pill ${session.type === "event" ? "is-event" : ""}"
                  data-session-select="${session.id}"
                >
                  <span class="public-slot-time">${session.time}</span>
                  <span class="public-slot-title">${session.title}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      `;

      publicCalendarGrid.appendChild(dayCell);
    }
  };

  const renderDailyView = () => {
    if (!publicDailyLabel || !publicDailyGrid) {
      return;
    }

    const dayKey = toDateKey(visibleDay);
    const daySessions = getSessionsForDate(dayKey);
    const slots = Array.from({ length: 14 }, (_, index) => {
      const hour = index + 8;
      const labelDate = new Date(visibleDay);
      labelDate.setHours(hour, 0, 0, 0);
      return {
        label: labelDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        value: hour * 60,
      };
    });

    publicDailyLabel.textContent = formatDateLabel(dayKey);
    publicDailyGrid.innerHTML = slots
      .map((slot) => {
        const session = daySessions.find((item) => {
          const timeValue = parseTimeValue(item.time);
          return timeValue >= slot.value && timeValue < slot.value + 60;
        });
        const hasSession = daySessions.some((item) => {
          const timeValue = parseTimeValue(item.time);
          return timeValue >= slot.value && timeValue < slot.value + 60;
        });

        return `
          <div class="daily-slot">
            <div class="daily-time">${slot.label}</div>
            <div
              class="daily-lane ${selectedGridSlotKey === `${dayKey}-${slot.value}` ? "is-selected" : ""} ${
                hasSession ? "has-session" : ""
              }"
              data-date="${dayKey}"
              data-slot-key="${dayKey}-${slot.value}"
            >
              ${
                session
                  ? `<button
                      type="button"
                      class="daily-event ${session.type === "event" ? "is-event" : ""}"
                      data-session-select="${session.id}"
                    >
                      <span class="daily-event-time">${session.time}</span>
                      <span class="daily-event-title">${session.title}</span>
                    </button>`
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");
  };

  const renderWeeklyView = () => {
    if (!publicWeeklyLabel || !publicWeeklyTimes || !publicWeeklyColumns) {
      return;
    }

    const weekStart = startOfWeek(visibleWeek);
    const slots = Array.from({ length: 10 }, (_, index) => {
      const hour = index + 9;
      return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
    });

    publicWeeklyLabel.textContent = formatWeekRange(visibleWeek);
    publicWeeklyTimes.innerHTML = slots
      .map((slot) => `<div class="weekly-time">${slot}</div>`)
      .join("");

    publicWeeklyColumns.innerHTML = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayIndex);
      const dateKey = toDateKey(date);
      const daySessions = getSessionsForDate(dateKey);
      const isToday = dateKey === toDateKey(today);

      const slotMarkup = slots
        .map((_, slotIndex) => {
          const slotHour = slotIndex + 9;
          const session = daySessions.find((item) => {
            const timeValue = parseTimeValue(item.time);
            return (
              timeValue >= slotHour * 60 && timeValue < (slotHour + 1) * 60
            );
          });
          const hasSession = daySessions.some((item) => {
            const timeValue = parseTimeValue(item.time);
            return (
              timeValue >= slotHour * 60 && timeValue < (slotHour + 1) * 60
            );
          });

          return `
            <div
              class="weekly-slot ${selectedGridSlotKey === `${dateKey}-${slotIndex}` ? "is-selected" : ""}"
              ${hasSession ? ' data-has-session="true"' : ""}
              data-date="${dateKey}"
              data-slot-key="${dateKey}-${slotIndex}"
            >
              ${
                session
                  ? `<button
                      type="button"
                      class="weekly-event ${session.type === "event" ? "is-event" : ""}"
                      data-session-select="${session.id}"
                    >
                      <span class="weekly-event-time">${session.time}</span>
                      <span class="weekly-event-title">${session.title}</span>
                    </button>`
                  : ""
              }
            </div>
          `;
        })
        .join("");

      return `
        <div class="weekly-column">
          <div class="weekly-day-header ${isToday ? "is-today" : ""}" data-date="${dateKey}">
            <span class="weekly-day-name">${date.toLocaleDateString("en-US", { weekday: "short" })}</span>
            <span class="weekly-day-date">${date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}</span>
          </div>
          ${slotMarkup}
        </div>
      `;
    }).join("");
  };

  const rerenderAll = () => {
    ensureSelectedDate();
    renderCalendar();
    renderDailyView();
    renderWeeklyView();
    renderSessionList();
    updateVisibleView();
  };

  publicNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.publicNav === "next" ? 1 : -1;
      visibleMonth = new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() + direction,
        1,
      );
      rerenderAll();
    });
  });

  publicDailyNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.publicDailyNav === "next" ? 1 : -1;
      visibleDay = new Date(
        visibleDay.getFullYear(),
        visibleDay.getMonth(),
        visibleDay.getDate() + direction,
      );
      selectedDateKey = toDateKey(visibleDay);
      selectedGridSlotKey = "";
      visibleMonth = new Date(
        visibleDay.getFullYear(),
        visibleDay.getMonth(),
        1,
      );
      visibleWeek = new Date(visibleDay);
      rerenderAll();
    });
  });

  publicWeeklyNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.publicWeeklyNav === "next" ? 7 : -7;
      visibleWeek = new Date(
        visibleWeek.getFullYear(),
        visibleWeek.getMonth(),
        visibleWeek.getDate() + direction,
      );
      selectedDateKey = toDateKey(startOfWeek(visibleWeek));
      selectedGridSlotKey = "";
      visibleDay = new Date(startOfWeek(visibleWeek));
      visibleMonth = new Date(
        visibleWeek.getFullYear(),
        visibleWeek.getMonth(),
        1,
      );
      rerenderAll();
    });
  });

  publicViewSelects.forEach((select) => {
    select.addEventListener("change", () => {
      publicViewSelects.forEach((otherSelect) => {
        otherSelect.value = select.value;
      });
      rerenderAll();
    });
  });

  publicFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.bookingFilter || "all";
      publicFilterButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      selectedSessionId = "";
      selectedGridSlotKey = "";
      rerenderAll();
    });
  });

  publicCalendarGrid.addEventListener("click", (event) => {
    const sessionTrigger = event.target.closest("[data-session-select]");
    if (sessionTrigger) {
      const session = loadSessions().find(
        (item) => item.id === sessionTrigger.dataset.sessionSelect,
      );
      if (!session) {
        return;
      }

      selectSession(session);
      rerenderAll();
      return;
    }

    const dayCell = event.target.closest(".calendar-day");
    if (!dayCell?.dataset.date) {
      return;
    }

    selectDate(dayCell.dataset.date);
    rerenderAll();
  });

  publicDailyGrid?.addEventListener("click", (event) => {
    const sessionTrigger = event.target.closest("[data-session-select]");
    if (sessionTrigger) {
      const session = loadSessions().find(
        (item) => item.id === sessionTrigger.dataset.sessionSelect,
      );
      if (!session) {
        return;
      }

      const slotKey =
        event.target.closest("[data-slot-key]")?.dataset.slotKey ||
        getDailySlotKeyForSession(session);
      selectSession(session, slotKey);
      rerenderAll();
      return;
    }

    const lane = event.target.closest("[data-date]");
    if (!lane?.dataset.date || !lane?.dataset.slotKey) {
      return;
    }

    selectDate(lane.dataset.date, "", lane.dataset.slotKey);
    rerenderAll();
  });

  publicWeeklyColumns?.addEventListener("click", (event) => {
    const sessionTrigger = event.target.closest("[data-session-select]");
    if (sessionTrigger) {
      const session = loadSessions().find(
        (item) => item.id === sessionTrigger.dataset.sessionSelect,
      );
      if (!session) {
        return;
      }

      const slotKey =
        event.target.closest("[data-slot-key]")?.dataset.slotKey ||
        getWeeklySlotKeyForSession(session);
      selectSession(session, slotKey);
      rerenderAll();
      return;
    }

    const target = event.target.closest("[data-date]");
    if (!target?.dataset.date || !target?.dataset.slotKey) {
      return;
    }

    selectDate(target.dataset.date, "", target.dataset.slotKey);
    rerenderAll();
  });

  sessionList?.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-session-view]");
    if (viewButton) {
      const session = loadSessions().find(
        (item) => item.id === viewButton.dataset.sessionView,
      );
      if (session) {
        openPublicModal(session);
      }
      return;
    }

    const selectButton = event.target.closest("[data-session-select]");
    if (!selectButton) {
      return;
    }

    const session = loadSessions().find(
      (item) => item.id === selectButton.dataset.sessionSelect,
    );
    if (!session) {
      return;
    }

    selectSession(session);
    rerenderAll();
  });

  bookingForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const selectedSession = loadSessions().find(
      (session) => session.id === selectedSessionId,
    );

    if (!selectedSession || !selectedDateKey) {
      if (bookingStatus) {
        bookingStatus.textContent = "Select a session before booking.";
      }
      return;
    }

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    pendingBookingRequest = {
      session: selectedSession,
      name,
      email,
      notes
    };
    openPaymentModal();
  });

  publicModalCloseButtons.forEach((button) => {
    button.addEventListener("click", closePublicModal);
  });

  refundPolicyLink?.addEventListener("click", openRefundModal);
  refundModalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeRefundModal);
  });
  paymentModalCloseButtons.forEach((button) => {
    button.addEventListener("click", closePaymentModal);
  });
  cardModalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeCardModal);
  });
  cardModalBackButton?.addEventListener("click", () => {
    closeCardModal();
    openPaymentModal();
  });
  onsiteCodeModalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeOnsiteCodeModal);
  });
  paymentModalContent?.addEventListener("click", (event) => {
    const choiceButton = event.target.closest("[data-payment-choice]");
    if (!choiceButton) {
      return;
    }

    if (choiceButton.dataset.paymentChoice === "online") {
      closePaymentModal();
      openCardModal();
      return;
    }

    finalizeBooking(choiceButton.dataset.paymentChoice);
  });
  cardPaymentForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    finalizeBooking("online");
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      publicModal &&
      !publicModal.classList.contains("is-hidden")
    ) {
      closePublicModal();
    }
    if (
      event.key === "Escape" &&
      refundModal &&
      !refundModal.classList.contains("is-hidden")
    ) {
      closeRefundModal();
    }
    if (
      event.key === "Escape" &&
      paymentModal &&
      !paymentModal.classList.contains("is-hidden")
    ) {
      closePaymentModal();
    }
    if (
      event.key === "Escape" &&
      cardModal &&
      !cardModal.classList.contains("is-hidden")
    ) {
      closeCardModal();
    }
    if (
      event.key === "Escape" &&
      onsiteCodeModal &&
      !onsiteCodeModal.classList.contains("is-hidden")
    ) {
      closeOnsiteCodeModal();
    }
  });

  syncRefundPolicyLink();
  updateSessionCardVisibility(false, false);
  updateBookingCardVisibility(null);
  rerenderAll();
}
