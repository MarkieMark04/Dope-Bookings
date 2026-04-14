const monthLabel = document.querySelector("[data-calendar-month]");
const calendarGrid = document.querySelector("[data-calendar-grid]");
const miniMonthLabel = document.querySelector("[data-mini-calendar-month]");
const miniCalendarGrid = document.querySelector("[data-mini-calendar-grid]");
const calendarLayout = document.querySelector("[data-calendar-layout]");
const dailyLayout = document.querySelector("[data-daily-layout]");
const weeklyLayout = document.querySelector("[data-weekly-layout]");
const dailyLabel = document.querySelector("[data-daily-label]");
const dailyGrid = document.querySelector("[data-daily-grid]");
const weeklyLabel = document.querySelector("[data-weekly-label]");
const weeklyTimes = document.querySelector("[data-weekly-times]");
const weeklyColumns = document.querySelector("[data-weekly-columns]");
const viewSelects = document.querySelectorAll("[data-calendar-view-select]");
const navButtons = document.querySelectorAll("[data-calendar-nav]");
const dailyNavButtons = document.querySelectorAll("[data-daily-nav]");
const weeklyNavButtons = document.querySelectorAll("[data-weekly-nav]");
const createButton = document.querySelector(".calendar-create");
const adminModal = document.querySelector("[data-admin-modal]");
const adminModalCloseButtons = document.querySelectorAll("[data-admin-modal-close]");
const adminCreateForm = document.querySelector("[data-admin-create-form]");
const adminFormStatus = document.querySelector("[data-admin-form-status]");
const adminDetailsModal = document.querySelector("[data-admin-details-modal]");
const adminDetailsTitle = document.querySelector("[data-admin-details-title]");
const adminDetailsContent = document.querySelector("[data-admin-details-content]");
const adminDetailsCloseButtons = document.querySelectorAll("[data-admin-details-close]");
const adminEditSessionButton = document.querySelector("[data-admin-edit-session]");
const adminDeleteSessionButton = document.querySelector("[data-admin-delete-session]");
const adminDeleteModal = document.querySelector("[data-admin-delete-modal]");
const adminDeleteCloseButtons = document.querySelectorAll("[data-admin-delete-close]");
const adminDeleteConfirmButton = document.querySelector("[data-admin-delete-confirm]");
const adminDeleteMessage = document.querySelector("[data-admin-delete-message]");
const adminAttendeesModal = document.querySelector("[data-admin-attendees-modal]");
const adminAttendeesTitle = document.querySelector("[data-admin-attendees-title]");
const adminAttendeesList = document.querySelector("[data-admin-attendees-list]");
const adminAttendeesSearch = document.querySelector("[data-admin-attendees-search]");
const adminAttendeesCloseButtons = document.querySelectorAll("[data-admin-attendees-close]");
const adminEventAttendeesModal = document.querySelector("[data-admin-event-attendees-modal]");
const adminEventAttendeesTitle = document.querySelector("[data-admin-event-attendees-title]");
const adminEventAttendeesList = document.querySelector("[data-admin-event-attendees-list]");
const adminEventAttendeesSearch = document.querySelector("[data-admin-event-attendees-search]");
const adminEventAttendeesCloseButtons = document.querySelectorAll("[data-admin-event-attendees-close]");
const addressInputs = document.querySelectorAll("[data-address-search]");
const addressSuggestionsLists = document.querySelectorAll("[data-address-suggestions]");
const addressMapPreviews = document.querySelectorAll("[data-address-map-preview]");
const adminTabTriggers = document.querySelectorAll("[data-admin-tab-trigger]");
const adminTabPanels = document.querySelectorAll("[data-admin-tab-panel]");
const settingsTabTriggers = document.querySelectorAll("[data-settings-tab-trigger]");
const settingsTabPanels = document.querySelectorAll("[data-settings-tab-panel]");
const brandingColorInputs = document.querySelectorAll("[data-branding-color]");
const brandingButtonStyleInputs = document.querySelectorAll("[data-branding-button-style]");
const brandingThemeInputs = document.querySelectorAll("[data-branding-theme]");
const brandingDefaultButton = document.querySelector("[data-branding-default]");
const brandingSaveButton = document.querySelector("[data-branding-save]");
const brandingStatus = document.querySelector("[data-branding-status]");
const paymentsPanel = document.querySelector("[data-payments-panel]");
const paymentsSaveButton = document.querySelector("[data-payments-save]");
const paymentsDefaultButton = document.querySelector("[data-payments-default]");
const paymentsStatus = document.querySelector("[data-payments-status]");
const sessionTypeSelect = document.querySelector("[data-session-type]");
const currencyInputs = document.querySelectorAll("[data-currency-input]");
const timeSelects = document.querySelectorAll("[data-time-select]");
const classFields = document.querySelector("[data-class-fields]");
const eventFields = document.querySelector("[data-event-fields]");
const customerList = document.querySelector("[data-customer-list]");
const classList = document.querySelector("[data-class-list]");
const eventList = document.querySelector("[data-event-list]");

if (monthLabel && calendarGrid) {
  const store = window.DopeScheduleStore;
  const today = new Date();
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let visibleDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let visibleWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let selectedAdminDateKey = "";
  let selectedAdminSlotKey = "";
  let editingSessionId = "";
  let activeDetailsSessionId = "";
  let reopenDetailsOnModalClose = false;
  let addressSearchTimeout;

  const loadSessions = () => (store ? store.loadSessions() : []);
  const loadBookings = () => (store ? store.loadBookings() : []);

  const toDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  selectedAdminDateKey = toDateKey(today);

  const startOfWeek = (date) => {
    const result = new Date(date);
    result.setDate(result.getDate() - result.getDay());
    return result;
  };

  const normalizeTime = (time) => {
    if (!time) {
      return "";
    }

    const [hoursText, minutesText] = time.split(":");
    const hours = Number(hoursText);
    const minutes = Number(minutesText || "0");
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  const toTimeInputValue = (timeText) => {
    const match = String(timeText || "").match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) {
      return "";
    }
    let hours = Number(match[1]);
    const minutes = match[2];
    const suffix = match[3].toUpperCase();
    if (suffix === "PM" && hours !== 12) {
      hours += 12;
    }
    if (suffix === "AM" && hours === 12) {
      hours = 0;
    }
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  const parseTimeValue = (timeText) => {
    const match = String(timeText || "").match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
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

  const extractCurrencyNumber = (value) => {
    const normalized = String(value || "").replace(/[^0-9.]/g, "");
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : 0;
  };

  const formatCurrencyInputValue = (value) => {
    const amount = extractCurrencyNumber(value);
    return `$${amount.toFixed(2)}`;
  };

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

  const formatCapacityLabel = (session) => {
    const summary = getSessionSummary(session);
    const parts = [`${summary.counts.confirmed} / ${summary.limits.capacity || 0} confirmed`];
    if (summary.counts.overbooked) {
      parts.push(`${summary.counts.overbooked} overbooked`);
    }
    if (summary.counts.waitlisted) {
      parts.push(`${summary.counts.waitlisted} waitlisted`);
    }
    return parts.join(" • ");
  };

  const formatCapacityRulesMarkup = (session) => {
    const summary = getSessionSummary(session);
    return `
      <p><strong>Waitlist:</strong> ${
        summary.session.waitlistEnabled ? `On (${summary.counts.waitlisted}/${summary.limits.waitlist})` : "Off"
      }</p>
      <p><strong>Overbooking:</strong> ${
        summary.session.allowOverbooking
          ? `On (${summary.counts.overbooked}/${summary.limits.overbooking})`
          : "Off"
      }</p>
      <p><strong>Auto-close:</strong> ${summary.session.autoCloseWhenFull ? "On" : "Off"}</p>
      <p><strong>Auto-promote:</strong> ${summary.session.autoPromoteWaitlist ? "On" : "Off"}</p>
    `;
  };

  const getBookingStatusMarkup = (status) =>
    `<span class="booking-status booking-status--${status || "confirmed"}">${
      status === "waitlisted" ? "Waitlisted" : status === "overbooked" ? "Overbooked" : "Confirmed"
    }</span>`;

  const filterAttendeeList = (listElement, query) => {
    if (!listElement) {
      return;
    }

    const normalizedQuery = String(query || "").trim().toLowerCase();
    listElement.querySelectorAll(".admin-attendee-card").forEach((card) => {
      const matches = !normalizedQuery || card.textContent.toLowerCase().includes(normalizedQuery);
      card.hidden = !matches;
    });
  };

  const collectCapacityControls = (formData, prefix = "") => ({
    waitlistEnabled: formData.get(`${prefix}waitlist_enabled`) === "on",
    waitlistLimit: Number(formData.get(`${prefix}waitlist_limit`) || 0),
    autoPromoteWaitlist: formData.get(`${prefix}auto_promote_waitlist`) === "on",
    autoCloseWhenFull: formData.get(`${prefix}auto_close_when_full`) === "on",
    allowOverbooking: formData.get(`${prefix}allow_overbooking`) === "on",
    overbookingLimit: Number(formData.get(`${prefix}overbooking_limit`) || 0)
  });

  const fillCapacityControls = (prefix, session) => {
    const capacitySession = store?.normalizeSessionCapacitySettings?.(session) || session || {};
    adminCreateForm.elements[`${prefix}waitlist_enabled`].checked = Boolean(capacitySession.waitlistEnabled);
    adminCreateForm.elements[`${prefix}waitlist_limit`].value = capacitySession.waitlistLimit || 0;
    adminCreateForm.elements[`${prefix}auto_promote_waitlist`].checked = capacitySession.autoPromoteWaitlist !== false;
    adminCreateForm.elements[`${prefix}auto_close_when_full`].checked = capacitySession.autoCloseWhenFull !== false;
    adminCreateForm.elements[`${prefix}allow_overbooking`].checked = Boolean(capacitySession.allowOverbooking);
    adminCreateForm.elements[`${prefix}overbooking_limit`].value = capacitySession.overbookingLimit || 0;
  };

  const buildTimeOptionsMarkup = () => {
    const options = ['<option value="">Select a start time</option>'];
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const value = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        const suffix = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        const label = `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
        options.push(`<option value="${value}">${label}</option>`);
      }
    }
    return options.join("");
  };

  const initTimeSelects = () => {
    if (!timeSelects.length) {
      return;
    }

    const optionsMarkup = buildTimeOptionsMarkup();
    timeSelects.forEach((select) => {
      select.innerHTML = optionsMarkup;
    });
  };

  const getSectionPreview = (section) => section?.querySelector("[data-address-map-preview]") || null;

  const hideAddressSuggestions = () => {
    addressSuggestionsLists.forEach((list) => {
      list.innerHTML = "";
      list.classList.add("is-hidden");
    });
  };

  const updateAddressMapPreview = (previewElement, latitude, longitude) => {
    if (!previewElement) {
      return;
    }

    if (!latitude || !longitude) {
      previewElement.classList.add("is-empty");
      previewElement.innerHTML = "Select an address to preview the map.";
      return;
    }

    const lat = Number(latitude);
    const lon = Number(longitude);
    const delta = 0.01;
    const left = encodeURIComponent(String(lon - delta));
    const bottom = encodeURIComponent(String(lat - delta));
    const right = encodeURIComponent(String(lon + delta));
    const top = encodeURIComponent(String(lat + delta));
    const markerLat = encodeURIComponent(String(lat));
    const markerLon = encodeURIComponent(String(lon));

    previewElement.classList.remove("is-empty");
    previewElement.innerHTML = `
      <iframe
        title="Address map preview"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${markerLat}%2C${markerLon}"
      ></iframe>
    `;
  };

  const renderAddressSuggestions = (targetInput, results) => {
    const autocomplete = targetInput?.closest(".address-autocomplete");
    const suggestionsElement = autocomplete?.querySelector("[data-address-suggestions]");
    if (!suggestionsElement) {
      return;
    }

    if (!results.length) {
      suggestionsElement.innerHTML = "";
      suggestionsElement.classList.add("is-hidden");
      return;
    }

    suggestionsElement.innerHTML = results
      .map(
        (result) => `
          <button
            type="button"
            class="address-suggestion"
            data-address-select='${JSON.stringify({
              label: result.display_name,
              lat: result.lat,
              lon: result.lon
            }).replace(/'/g, "&apos;")}'
          >
            ${result.display_name}
          </button>
        `
      )
      .join("");

    suggestionsElement.classList.remove("is-hidden");
  };

  const searchAddresses = async (targetInput, query) => {
    if (!query || query.trim().length < 3) {
      const autocomplete = targetInput?.closest(".address-autocomplete");
      autocomplete?.querySelector("[data-address-suggestions]")?.classList.add("is-hidden");
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=nz&limit=5&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept: "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Address lookup failed");
      }

      const data = await response.json();
      renderAddressSuggestions(targetInput, Array.isArray(data) ? data : []);
    } catch (error) {
      const autocomplete = targetInput?.closest(".address-autocomplete");
      autocomplete?.querySelector("[data-address-suggestions]")?.classList.add("is-hidden");
    }
  };

  const initAddressSearch = () => {
    if (!addressInputs.length) {
      return;
    }

    addressInputs.forEach((input) => {
      input.addEventListener("input", () => {
        const section = input.closest("[data-class-fields], [data-event-fields]");
        const latitudeField = section?.querySelector('input[name="latitude"], input[name="event_latitude"]');
        const longitudeField = section?.querySelector(
          'input[name="longitude"], input[name="event_longitude"]'
        );
        if (latitudeField) {
          latitudeField.value = "";
        }
        if (longitudeField) {
          longitudeField.value = "";
        }

        updateAddressMapPreview(getSectionPreview(section), "", "");
        window.clearTimeout(addressSearchTimeout);
        addressSearchTimeout = window.setTimeout(() => {
          searchAddresses(input, input.value);
        }, 250);
      });
    });

    addressSuggestionsLists.forEach((suggestionsElement) => {
      suggestionsElement.addEventListener("click", (event) => {
        const button = event.target.closest("[data-address-select]");
        if (!button) {
          return;
        }

        const payload = JSON.parse(button.dataset.addressSelect || "{}");
        const autocomplete = suggestionsElement.closest(".address-autocomplete");
        const input = autocomplete?.querySelector("[data-address-search]");
        const section = autocomplete?.closest("[data-class-fields], [data-event-fields]");
        const latitudeField = section?.querySelector(
          'input[name="latitude"], input[name="event_latitude"]'
        );
        const longitudeField = section?.querySelector(
          'input[name="longitude"], input[name="event_longitude"]'
        );

        if (input) {
          input.value = payload.label || "";
        }
        if (latitudeField) {
          latitudeField.value = payload.lat || "";
        }
        if (longitudeField) {
          longitudeField.value = payload.lon || "";
        }
        updateAddressMapPreview(getSectionPreview(section), payload.lat, payload.lon);
        hideAddressSuggestions();
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".address-autocomplete")) {
        hideAddressSuggestions();
      }
    });
  };

  const getSessionsForDate = (dateKey) =>
    loadSessions()
      .filter((session) => session.date === dateKey)
      .sort((left, right) => parseTimeValue(left.time) - parseTimeValue(right.time));

  const getSessionById = (id) => loadSessions().find((session) => session.id === id);

  const getBookedDateKeysForMonth = () => new Set(loadSessions().map((session) => session.date));

  const renderCalendar = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const firstVisibleDate = new Date(firstDayOfMonth);
    firstVisibleDate.setDate(firstVisibleDate.getDate() - firstDayOfMonth.getDay());
    const bookedDateKeys = getBookedDateKeysForMonth();

    monthLabel.textContent = visibleMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

    if (miniMonthLabel) {
      miniMonthLabel.textContent = monthLabel.textContent;
    }

    calendarGrid.innerHTML = "";
    if (miniCalendarGrid) {
      miniCalendarGrid.innerHTML = "";
    }

    for (let index = 0; index < 42; index += 1) {
      const cellDate = new Date(firstVisibleDate);
      cellDate.setDate(firstVisibleDate.getDate() + index);
      const dateKey = toDateKey(cellDate);
      const daySessions = cellDate.getMonth() === month ? getSessionsForDate(dateKey) : [];
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
      if (selectedAdminDateKey === dateKey) {
        dayCell.classList.add("is-selected");
      }

      const stackContent = daySessions.length
        ? daySessions
            .map(
              (session) => `
                <button
                  type="button"
                  class="calendar-event-item ${session.type === "event" ? "is-event" : ""}"
                  data-admin-session-id="${session.id}"
                >
                  <span class="calendar-event-time">${session.time}</span>
                  <span class="calendar-event-title">${session.title}</span>
                </button>
              `
            )
            .join("")
        : '<div class="calendar-event-placeholder"></div>';

      dayCell.innerHTML = `
        <div class="calendar-day-head">
          <span class="calendar-day-number">${cellDate.getDate()}</span>
        </div>
        <div class="calendar-event-stack">${stackContent}</div>
      `;

      calendarGrid.appendChild(dayCell);

      if (miniCalendarGrid) {
        const miniDayCell = document.createElement("button");
        miniDayCell.type = "button";
        miniDayCell.className = "mini-calendar-day";
        miniDayCell.textContent = cellDate.getDate();
        miniDayCell.dataset.date = dateKey;

        if (isOutsideMonth) {
          miniDayCell.classList.add("is-outside");
        } else if (bookedDateKeys.has(dateKey)) {
          miniDayCell.classList.add("is-selected");
        }

        if (isToday) {
          miniDayCell.classList.add("is-today");
        }

        miniCalendarGrid.appendChild(miniDayCell);
      }
    }
  };

  const renderDailyView = () => {
    if (!dailyLabel || !dailyGrid) {
      return;
    }

    const dateKey = toDateKey(visibleDay);
    const daySessions = getSessionsForDate(dateKey);
    const timeSlots = [
      "8:00 AM",
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
      "7:00 PM",
      "8:00 PM"
    ];
    dailyLabel.textContent = visibleDay.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    dailyGrid.innerHTML = timeSlots
      .map(
        (time) => {
          const session = daySessions.find((item) => item.time === time);
          return `
          <article class="daily-slot">
            <div class="daily-time">${time}</div>
            <div class="daily-lane ${selectedAdminSlotKey === `${dateKey}-${time}` ? "is-selected" : ""}" data-date="${dateKey}" data-slot-key="${dateKey}-${time}">
              ${
                session
                  ? `<button type="button" class="daily-event" data-admin-session-id="${session.id}">
                      <span class="daily-event-time">${session.type}</span>
                      <span class="daily-event-title">${session.title}</span>
                    </button>`
                  : '<span class="daily-event-empty">Available for bookings</span>'
              }
            </div>
          </article>
        `;
        }
      )
      .join("");
  };

  const renderWeeklyView = () => {
    if (!weeklyLabel || !weeklyTimes || !weeklyColumns) {
      return;
    }

    const weekStart = startOfWeek(visibleWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const sessions = loadSessions();
    const times = Array.from(
      new Set(
        sessions
          .map((session) => session.time)
          .filter(Boolean)
          .concat(["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"])
      )
    ).sort((left, right) => parseTimeValue(left) - parseTimeValue(right));

    weeklyLabel.textContent = `${weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })} - ${weekEnd.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })}`;

    weeklyTimes.innerHTML = times.map((time) => `<div class="weekly-time">${time}</div>`).join("");

    weeklyColumns.innerHTML = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateKey = toDateKey(date);
      const daySessions = getSessionsForDate(dateKey);
      const isToday = dateKey === toDateKey(today);

      return `
        <section class="weekly-column">
          <div class="weekly-day-header${isToday ? " is-today" : ""}">
            <span class="weekly-day-name">${date.toLocaleDateString("en-US", { weekday: "short" })}</span>
            <span class="weekly-day-date">${date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            })}</span>
          </div>
          ${times
            .map((time) => {
              const session = daySessions.find((item) => item.time === time);
              return `
                <div class="weekly-slot ${selectedAdminSlotKey === `${dateKey}-${time}` ? "is-selected" : ""}" data-date="${dateKey}" data-slot-key="${dateKey}-${time}">
                  ${
                    session
                      ? `<button type="button" class="weekly-event" data-admin-session-id="${session.id}">
                          <span class="weekly-event-time">${session.type}</span>
                          <span class="weekly-event-title">${session.title}</span>
                        </button>`
                      : ""
                  }
                </div>
              `;
            })
            .join("")}
        </section>
      `;
    }).join("");
  };

  const updateVisibleView = () => {
    if (!calendarLayout || !dailyLayout || !weeklyLayout || !viewSelects.length) {
      return;
    }

    const currentView =
      Array.from(viewSelects).find((select) => select.value)?.value || "monthly";

    viewSelects.forEach((select) => {
      if (select.value !== currentView) {
        select.value = currentView;
      }
    });

    calendarLayout.classList.toggle("is-hidden", currentView !== "monthly");
    dailyLayout.classList.toggle("is-hidden", currentView !== "daily");
    weeklyLayout.classList.toggle("is-hidden", currentView !== "weekly");
  };

  const clearAdminSelection = () => {
    selectedAdminDateKey = "";
    selectedAdminSlotKey = "";
  };

  const updateSessionTypeFields = () => {
    if (!sessionTypeSelect) {
      return;
    }

    const showClass = sessionTypeSelect.value === "class";
    const showEvent = sessionTypeSelect.value === "event";

    classFields?.classList.toggle("is-hidden", !showClass);
    eventFields?.classList.toggle("is-hidden", !showEvent);

    classFields
      ?.querySelectorAll("input, select, textarea")
      .forEach((field) => (field.disabled = !showClass));
    eventFields
      ?.querySelectorAll("input, select, textarea")
      .forEach((field) => (field.disabled = !showEvent));
  };

  const openAdminModal = () => {
    if (!adminModal) {
      return;
    }

    const dateField =
      adminCreateForm?.querySelector('input[name="date"]:not(:disabled)') ||
      adminCreateForm?.querySelector('input[name="event_date"]:not(:disabled)');
    if (dateField && !dateField.value) {
      dateField.value = toDateKey(visibleDay);
    }
    if (adminFormStatus && !editingSessionId) {
      adminFormStatus.textContent = "";
    }

    adminModal.classList.remove("is-hidden");
    adminModal.setAttribute("aria-hidden", "false");
  };

  const closeAdminModal = () => {
    if (!adminModal) {
      return;
    }

    adminModal.classList.add("is-hidden");
    adminModal.setAttribute("aria-hidden", "true");

    if (reopenDetailsOnModalClose && activeDetailsSessionId) {
      const session = getSessionById(activeDetailsSessionId);
      if (session) {
        openAdminDetailsModal(session);
      }
    }

    reopenDetailsOnModalClose = false;
  };

  const openAdminDetailsModal = (session) => {
    if (!adminDetailsModal || !adminDetailsTitle || !adminDetailsContent) {
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

    activeDetailsSessionId = session.id;
    adminDetailsTitle.textContent = session.title;
    adminDetailsContent.innerHTML = `
      <section class="public-modal-hero ${session.type === "event" ? "is-event" : ""}">
        <div>
          <span class="public-modal-type">${session.type}</span>
          <h3 class="public-summary-title">${session.title}</h3>
        </div>
        <div class="public-modal-time">${session.date} - ${session.time}</div>
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
          <span class="public-modal-value">${formatCapacityLabel(session)}</span>
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
        <span class="public-modal-label">Capacity Controls</span>
        ${formatCapacityRulesMarkup(session)}
      </section>
      ${
        session.type === "event"
          ? `<section class="public-modal-description">
              <span class="public-modal-label">Event Information</span>
              <p><strong>End Time:</strong> ${session.eventEndTime || "TBC"}</p>
              <p><strong>Dress Code:</strong> ${session.dressCode || "Not specified"}</p>
              <p><strong>What To Bring:</strong> ${session.whatToBring || "Not specified"}</p>
              <p><strong>Arrival Notes:</strong> ${session.arrivalNotes || "Not specified"}</p>
              <p><strong>Parking / Entry:</strong> ${session.parkingInfo || "Not specified"}</p>
              <p><strong>Refund Policy:</strong> ${session.refundPolicy || "Not specified"}</p>
            </section>`
          : ""
      }
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

    adminDetailsModal.classList.remove("is-hidden");
    adminDetailsModal.setAttribute("aria-hidden", "false");
  };

  const closeAdminDetailsModal = ({ preserveSession = false } = {}) => {
    if (!adminDetailsModal) {
      return;
    }

    if (!preserveSession) {
      activeDetailsSessionId = "";
    }
    adminDetailsModal.classList.add("is-hidden");
    adminDetailsModal.setAttribute("aria-hidden", "true");
  };

  const openAdminDeleteModal = (session) => {
    if (!adminDeleteModal) {
      return;
    }

    if (adminDeleteMessage) {
      adminDeleteMessage.textContent = `Delete "${session.title}" scheduled for ${session.date} at ${session.time}?`;
    }

    adminDeleteModal.classList.remove("is-hidden");
    adminDeleteModal.setAttribute("aria-hidden", "false");
  };

  const closeAdminDeleteModal = () => {
    if (!adminDeleteModal) {
      return;
    }

    adminDeleteModal.classList.add("is-hidden");
    adminDeleteModal.setAttribute("aria-hidden", "true");
  };

  const openAdminAttendeesModal = (session) => {
    if (!adminAttendeesModal || !adminAttendeesTitle || !adminAttendeesList) {
      return;
    }

    const bookings = [...getSessionSummary(session).bookings].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    );

    adminAttendeesTitle.textContent = `${session.title} Attendees`;
    if (adminAttendeesSearch) {
      adminAttendeesSearch.value = "";
    }
    adminAttendeesList.innerHTML = bookings.length
      ? bookings
          .map(
            (booking) => `
              <article class="admin-attendee-card ${booking.attended ? "is-attended" : ""}" data-booking-id="${booking.id}">
                <div class="admin-attendee-top">
                  <div>
                    <p class="admin-attendee-name">${booking.customerName}</p>
                    <div class="admin-attendee-email">${booking.customerEmail}</div>
                  </div>
                  ${getBookingStatusMarkup(booking.bookingStatus)}
                  <label class="admin-attendee-check">
                    <input type="checkbox" data-booking-attended="${booking.id}" ${booking.attended ? "checked" : ""} />
                    <span>Checked In</span>
                  </label>
                </div>
                <div class="admin-attendee-meta">${booking.sessionDate} - ${booking.sessionTime}</div>
                ${
                  booking.onsiteCode
                    ? `<div class="admin-attendee-code">On-Site Code: ${booking.onsiteCode}</div>`
                    : ""
                }
                <p class="admin-attendee-notes">${booking.notes || "No notes provided."}</p>
              </article>
            `
          )
          .join("")
      : '<p class="daily-event-empty">No attendees booked for this class yet.</p>';

    adminAttendeesModal.classList.remove("is-hidden");
    adminAttendeesModal.setAttribute("aria-hidden", "false");
  };

  const closeAdminAttendeesModal = () => {
    if (!adminAttendeesModal) {
      return;
    }

    adminAttendeesModal.classList.add("is-hidden");
    adminAttendeesModal.setAttribute("aria-hidden", "true");
  };

  const openAdminEventAttendeesModal = (session) => {
    if (!adminEventAttendeesModal || !adminEventAttendeesTitle || !adminEventAttendeesList) {
      return;
    }

    const bookings = [...getSessionSummary(session).bookings].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    );

    adminEventAttendeesTitle.textContent = `${session.title} Attendees`;
    if (adminEventAttendeesSearch) {
      adminEventAttendeesSearch.value = "";
    }
    adminEventAttendeesList.innerHTML = bookings.length
      ? bookings
          .map(
            (booking) => `
              <article class="admin-attendee-card ${booking.attended ? "is-attended" : ""}" data-booking-id="${booking.id}">
                <div class="admin-attendee-top">
                  <div>
                    <p class="admin-attendee-name">${booking.customerName}</p>
                    <div class="admin-attendee-email">${booking.customerEmail}</div>
                  </div>
                  ${getBookingStatusMarkup(booking.bookingStatus)}
                  <label class="admin-attendee-check">
                    <input type="checkbox" data-booking-attended="${booking.id}" ${booking.attended ? "checked" : ""} />
                    <span>Checked In</span>
                  </label>
                </div>
                <div class="admin-attendee-meta">${booking.sessionDate} - ${booking.sessionTime}</div>
                ${
                  booking.onsiteCode
                    ? `<div class="admin-attendee-code">On-Site Code: ${booking.onsiteCode}</div>`
                    : ""
                }
                <p class="admin-attendee-notes">${booking.notes || "No notes provided."}</p>
              </article>
            `
          )
          .join("")
      : '<p class="daily-event-empty">No attendees booked for this event yet.</p>';

    adminEventAttendeesModal.classList.remove("is-hidden");
    adminEventAttendeesModal.setAttribute("aria-hidden", "false");
  };

  const closeAdminEventAttendeesModal = () => {
    if (!adminEventAttendeesModal) {
      return;
    }

    adminEventAttendeesModal.classList.add("is-hidden");
    adminEventAttendeesModal.setAttribute("aria-hidden", "true");
  };

  const rerenderAll = () => {
    renderCalendar();
    renderDailyView();
    renderWeeklyView();
    renderCustomers();
    renderSessionTypeList(classList, "class");
    renderSessionTypeList(eventList, "event");
    updateVisibleView();
  };

  const renderCustomers = () => {
    if (!customerList) {
      return;
    }

    const sessions = loadSessions();
    const bookingsWithStatus = sessions.flatMap((session) => getSessionSummary(session).bookings);
    if (!bookingsWithStatus.length) {
      customerList.innerHTML = '<p class="daily-event-empty">No customer bookings yet.</p>';
      return;
    }

    const sorted = [...bookingsWithStatus].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    customerList.innerHTML = sorted
      .map(
        (booking) => `
          <article class="customer-card">
            <div class="customer-card-top">
              <div>
                <p class="customer-name">${booking.customerName}</p>
                <div class="customer-email">${booking.customerEmail}</div>
              </div>
              ${getBookingStatusMarkup(booking.bookingStatus)}
            </div>
            <div class="customer-meta">${booking.sessionDate} - ${booking.sessionTime}</div>
            <div class="customer-session">${booking.sessionTitle}</div>
            <p class="customer-notes">${booking.notes || "No notes provided."}</p>
          </article>
        `
      )
      .join("");
  };

  const renderSessionTypeList = (targetList, sessionType) => {
    if (!targetList) {
      return;
    }

    const sessions = loadSessions()
      .filter((session) => session.type === sessionType)
      .sort((left, right) => {
        const leftValue = `${left.date}-${String(parseTimeValue(left.time)).padStart(6, "0")}`;
        const rightValue = `${right.date}-${String(parseTimeValue(right.time)).padStart(6, "0")}`;
        return leftValue.localeCompare(rightValue);
      });

    if (!sessions.length) {
      targetList.innerHTML = `<p class="daily-event-empty">No ${
        sessionType === "class" ? "classes" : "events"
      } created yet.</p>`;
      return;
    }

    targetList.innerHTML = sessions
      .map(
        (session) => {
          const capacityLabel = formatCapacityLabel(session);

          return session.type === "class"
            ? `
          <article
            class="admin-session-card is-${session.type}"
            data-admin-session-id="${session.id}"
          >
            <span class="admin-session-type">${session.type}</span>
            <h3 class="admin-session-title">${session.title}</h3>
            <div class="admin-session-meta">${session.date} - ${session.time}</div>
            <div class="admin-session-location">${session.location || "TBC"}</div>
            <div class="admin-session-capacity">${capacityLabel}</div>
            <div class="admin-session-footer">
              <p class="admin-session-summary">${session.description || "No description provided."}</p>
              <div class="admin-session-actions">
                <button type="button" class="admin-session-button" data-admin-class-details="${session.id}">Class Details</button>
                <button type="button" class="admin-session-button" data-admin-class-attendees="${session.id}">Attendees</button>
              </div>
            </div>
          </article>
        `
            : `
          <article
            class="admin-session-card is-${session.type}"
            data-admin-session-id="${session.id}"
          >
            <span class="admin-session-type">${session.type}</span>
            <h3 class="admin-session-title">${session.title}</h3>
            <div class="admin-session-meta">${session.date} - ${session.time}</div>
            <div class="admin-session-location">${session.location || "TBC"}</div>
            <div class="admin-session-capacity">${capacityLabel}</div>
            <div class="admin-session-footer">
              <p class="admin-session-summary">${session.description || "No description provided."}</p>
              <div class="admin-session-actions">
                <button type="button" class="admin-session-button" data-admin-event-details="${session.id}">Event Details</button>
                <button type="button" class="admin-session-button" data-admin-event-attendees="${session.id}">Attendees</button>
              </div>
            </div>
          </article>
        `;
        }
      )
      .join("");
  };

  const setActiveAdminTab = (tabName) => {
    adminTabTriggers.forEach((trigger) => {
      const isActive = trigger.dataset.adminTabTrigger === tabName;
      trigger.classList.toggle("is-active", isActive);
      trigger.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    adminTabPanels.forEach((panel) => {
      panel.classList.toggle("is-hidden", panel.dataset.adminTabPanel !== tabName);
    });
  };

  const setActiveSettingsTab = (tabName) => {
    settingsTabTriggers.forEach((trigger) => {
      const isActive = trigger.dataset.settingsTabTrigger === tabName;
      trigger.classList.toggle("is-active", isActive);
      trigger.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    settingsTabPanels.forEach((panel) => {
      panel.classList.toggle("is-hidden", panel.dataset.settingsTabPanel !== tabName);
    });
  };

  const syncBrandingControls = () => {
    const branding = store?.loadBranding?.();
    if (!branding) {
      return;
    }

    brandingColorInputs.forEach((input) => {
      const key = input.dataset.brandingColor;
      if (key && branding[key]) {
        input.value = branding[key];
      }
    });

    brandingButtonStyleInputs.forEach((input) => {
      input.checked = input.value === branding.buttonStyle;
    });

    brandingThemeInputs.forEach((input) => {
      const isActive = input.value === branding.bookingTheme;
      input.checked = isActive;
      input.closest(".branding-theme-option")?.classList.toggle("is-active", isActive);
    });
  };

  const updateBranding = (nextPartialBranding = {}) => {
    const currentBranding = store?.loadBranding?.() || {};
    const nextBranding = { ...currentBranding, ...nextPartialBranding };
    store?.saveBranding?.(nextBranding);
    store?.applyBranding?.(nextBranding);
    syncBrandingControls();
  };

  const collectBrandingFromControls = () => {
    const branding = { ...(store?.loadBranding?.() || {}) };

    brandingColorInputs.forEach((input) => {
      const key = input.dataset.brandingColor;
      if (key) {
        branding[key] = input.value;
      }
    });

    const selectedButtonStyle = Array.from(brandingButtonStyleInputs).find((input) => input.checked);
    const selectedTheme = Array.from(brandingThemeInputs).find((input) => input.checked);

    if (selectedButtonStyle) {
      branding.buttonStyle = selectedButtonStyle.value;
    }
    if (selectedTheme) {
      branding.bookingTheme = selectedTheme.value;
    }

    return branding;
  };

  const paymentsFieldMap = {
    stripe_publishable_key: "stripePublishableKey",
    stripe_secret_key: "stripeSecretKey",
    stripe_webhook_secret: "stripeWebhookSecret",
    payment_public_notes: "paymentPublicNotes",
    payments_require_full_payment: "paymentsRequireFullPayment",
    payments_allow_pay_onsite: "paymentsAllowPayOnsite",
    transaction_surcharge: "transactionSurcharge",
    payment_due_notes: "paymentDueNotes",
    refund_rule: "refundRule",
    refund_cutoff: "refundCutoff",
    refund_amount: "refundAmount",
    refund_deposit_nonrefundable: "refundDepositNonrefundable",
    refund_policy_copy: "refundPolicyCopy"
  };

  const syncPaymentControls = () => {
    if (!paymentsPanel) {
      return;
    }

    const paymentSettings = store?.loadPaymentSettings?.();
    if (!paymentSettings) {
      return;
    }

    Object.entries(paymentsFieldMap).forEach(([fieldName, key]) => {
      const field = paymentsPanel.querySelector(`[name="${fieldName}"]`);
      if (!field) {
        return;
      }

      if (field.type === "checkbox") {
        field.checked = Boolean(paymentSettings[key]);
      } else {
        field.value = paymentSettings[key] ?? "";
      }
    });
  };

  const collectPaymentSettingsFromControls = () => {
    const paymentSettings = { ...(store?.loadPaymentSettings?.() || {}) };
    Object.entries(paymentsFieldMap).forEach(([fieldName, key]) => {
      const field = paymentsPanel?.querySelector(`[name="${fieldName}"]`);
      if (!field) {
        return;
      }

      paymentSettings[key] = field.type === "checkbox" ? field.checked : String(field.value || "").trim();
    });
    return paymentSettings;
  };

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.calendarNav === "next" ? 1 : -1;
      visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + direction, 1);
      renderCalendar();
    });
  });

  dailyNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.dailyNav === "next" ? 1 : -1;
      visibleDay = new Date(visibleDay.getFullYear(), visibleDay.getMonth(), visibleDay.getDate() + direction);
      selectedAdminDateKey = toDateKey(visibleDay);
      selectedAdminSlotKey = "";
      renderDailyView();
    });
  });

  weeklyNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.weeklyNav === "next" ? 7 : -7;
      visibleWeek = new Date(visibleWeek.getFullYear(), visibleWeek.getMonth(), visibleWeek.getDate() + direction);
      selectedAdminDateKey = toDateKey(startOfWeek(visibleWeek));
      selectedAdminSlotKey = "";
      renderWeeklyView();
    });
  });

  viewSelects.forEach((select) => {
    select.addEventListener("change", () => {
      viewSelects.forEach((otherSelect) => {
        otherSelect.value = select.value;
      });
      updateVisibleView();
    });
  });

  if (sessionTypeSelect) {
    sessionTypeSelect.addEventListener("change", updateSessionTypeFields);
  }

  currencyInputs.forEach((input) => {
    input.addEventListener("blur", () => {
      if (!String(input.value || "").trim()) {
        input.value = "";
        return;
      }
      input.value = formatCurrencyInputValue(input.value);
    });
  });

  adminTabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      setActiveAdminTab(trigger.dataset.adminTabTrigger || "bookings");
    });
  });

  settingsTabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      setActiveSettingsTab(trigger.dataset.settingsTabTrigger || "profile");
    });
  });

  brandingColorInputs.forEach((input) => {
    input.addEventListener("input", () => {
      updateBranding({ [input.dataset.brandingColor]: input.value });
    });
  });

  brandingButtonStyleInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        updateBranding({ buttonStyle: input.value });
      }
    });
  });

  brandingThemeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        updateBranding({ bookingTheme: input.value });
      }
    });
  });

  brandingDefaultButton?.addEventListener("click", () => {
    const defaults = store?.defaultBranding || {
      primary: "#49d10f",
      primaryText: "#ffffff",
      accent: "#0b130a",
      surface: "#ffffff",
      buttonStyle: "solid",
      bookingTheme: "clean-light"
    };
    store?.saveBranding?.(defaults);
    store?.applyBranding?.(defaults);
    syncBrandingControls();
    if (brandingStatus) {
      brandingStatus.textContent = "Branding reset to default.";
    }
  });

  brandingSaveButton?.addEventListener("click", () => {
    const branding = collectBrandingFromControls();
    store?.saveBranding?.(branding);
    store?.applyBranding?.(branding);
    syncBrandingControls();
    if (brandingStatus) {
      brandingStatus.textContent = "Branding saved successfully.";
    }
  });

  paymentsDefaultButton?.addEventListener("click", () => {
    const defaults = store?.defaultPaymentSettings || {};
    store?.savePaymentSettings?.(defaults);
    syncPaymentControls();
    if (paymentsStatus) {
      paymentsStatus.textContent = "Payments reset to default.";
    }
  });

  paymentsSaveButton?.addEventListener("click", () => {
    const paymentSettings = collectPaymentSettingsFromControls();
    store?.savePaymentSettings?.(paymentSettings);
    syncPaymentControls();
    if (paymentsStatus) {
      paymentsStatus.textContent = "Payments saved successfully.";
    }
  });

  if (createButton && adminModal) {
    createButton.addEventListener("click", () => {
      editingSessionId = "";
      if (adminCreateForm) {
        adminCreateForm.reset();
      }
      updateSessionTypeFields();
      addressMapPreviews.forEach((preview) => updateAddressMapPreview(preview, "", ""));
      hideAddressSuggestions();
      if (adminFormStatus) {
        adminFormStatus.textContent = "";
      }
      openAdminModal();
    });
  }

  adminModalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeAdminModal);
  });

  adminDetailsCloseButtons.forEach((button) => {
    button.addEventListener("click", closeAdminDetailsModal);
  });

  adminDeleteCloseButtons.forEach((button) => {
    button.addEventListener("click", closeAdminDeleteModal);
  });

  adminAttendeesCloseButtons.forEach((button) => {
    button.addEventListener("click", closeAdminAttendeesModal);
  });

  adminEventAttendeesCloseButtons.forEach((button) => {
    button.addEventListener("click", closeAdminEventAttendeesModal);
  });

  const handleAttendeeToggle = (event) => {
    const checkbox = event.target.closest("[data-booking-attended]");
    if (!checkbox) {
      return;
    }

    const bookingId = checkbox.dataset.bookingAttended;
    const updatedBooking = store?.updateBooking?.(bookingId, { attended: checkbox.checked });
    if (!updatedBooking) {
      return;
    }

    const card = checkbox.closest(".admin-attendee-card");
    card?.classList.toggle("is-attended", checkbox.checked);
    renderCustomers();
    renderSessionTypeList(classList, "class");
    renderSessionTypeList(eventList, "event");
  };

  adminAttendeesList?.addEventListener("change", handleAttendeeToggle);
  adminEventAttendeesList?.addEventListener("change", handleAttendeeToggle);
  adminAttendeesSearch?.addEventListener("input", () => {
    filterAttendeeList(adminAttendeesList, adminAttendeesSearch.value);
  });
  adminEventAttendeesSearch?.addEventListener("input", () => {
    filterAttendeeList(adminEventAttendeesList, adminEventAttendeesSearch.value);
  });

  if (adminCreateForm) {
    adminCreateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(adminCreateForm);
      const sessionType = String(formData.get("type") || "class");
      const isEvent = sessionType === "event";
      const session = {
        type: sessionType,
        title: String(formData.get(isEvent ? "event_name" : "name") || "").trim(),
        date: String(formData.get(isEvent ? "event_date" : "date") || "").trim(),
        time: normalizeTime(String(formData.get(isEvent ? "event_start_time" : "start_time") || "").trim()),
        location: String(formData.get(isEvent ? "event_location" : "location") || "").trim() || "TBC",
        address: String(formData.get(isEvent ? "event_address" : "address") || "").trim() || "TBC",
        latitude: String(formData.get(isEvent ? "event_latitude" : "latitude") || "").trim(),
        longitude: String(formData.get(isEvent ? "event_longitude" : "longitude") || "").trim(),
        spots: Number(formData.get(isEvent ? "event_capacity" : "capacity") || 0),
        ...collectCapacityControls(formData, isEvent ? "event_" : ""),
        price: `$${extractCurrencyNumber(formData.get(isEvent ? "event_price" : "price")).toFixed(2)}`,
        ageGroup: !isEvent ? String(formData.get("age_group") || "").trim() || "All ages" : "",
        duration: !isEvent ? String(formData.get("duration") || "").trim() || "60 mins" : "",
        instructor: String(formData.get(isEvent ? "event_instructor" : "instructor") || "").trim() || "TBC",
        description:
          String(formData.get(isEvent ? "event_description" : "description") || "").trim() ||
          "No description provided.",
        notes: String(formData.get(isEvent ? "event_notes" : "notes") || "").trim(),
        eventEndTime: isEvent ? normalizeTime(String(formData.get("event_end_time") || "").trim()) : "",
        dressCode: sessionType === "event" ? String(formData.get("dress_code") || "").trim() : "",
        whatToBring:
          sessionType === "event" ? String(formData.get("what_to_bring") || "").trim() : "",
        arrivalNotes:
          sessionType === "event" ? String(formData.get("arrival_notes") || "").trim() : "",
        parkingInfo:
          sessionType === "event" ? String(formData.get("parking_info") || "").trim() : "",
        refundPolicy:
          sessionType === "event" ? String(formData.get("refund_policy") || "").trim() : ""
      };
      const savedSession = editingSessionId
        ? store?.updateSession(editingSessionId, session)
        : store?.addSession({ ...session, id: `session-${Date.now()}` });

      if (!savedSession) {
        return;
      }

      visibleMonth = new Date(savedSession.date);
      visibleMonth.setDate(1);
      visibleDay = new Date(savedSession.date);
      visibleWeek = new Date(savedSession.date);
      selectedAdminDateKey = savedSession.date;
      selectedAdminSlotKey = "";

      rerenderAll();

      if (adminFormStatus) {
        adminFormStatus.textContent = `${savedSession.type === "event" ? "Event" : "Class"} "${savedSession.title}" ${editingSessionId ? "updated" : "saved"} for ${savedSession.date} at ${savedSession.time}.`;
      }

      editingSessionId = "";
      reopenDetailsOnModalClose = false;
      adminCreateForm.reset();
      updateSessionTypeFields();
      addressMapPreviews.forEach((preview) => updateAddressMapPreview(preview, "", ""));
      hideAddressSuggestions();
    });
  }

  if (adminEditSessionButton) {
    adminEditSessionButton.addEventListener("click", () => {
      const session = getSessionById(activeDetailsSessionId);
      if (!session || !adminCreateForm) {
        return;
      }

      editingSessionId = session.id;
      adminCreateForm.reset();
      adminCreateForm.elements.type.value = session.type || "class";
      updateSessionTypeFields();

      if (session.type === "event") {
        adminCreateForm.elements.event_name.value = session.title || "";
        adminCreateForm.elements.event_price.value = formatCurrencyInputValue(session.price || "");
        adminCreateForm.elements.event_capacity.value = session.spots || "";
        fillCapacityControls("event_", session);
        adminCreateForm.elements.event_date.value = session.date || "";
        adminCreateForm.elements.event_start_time.value = toTimeInputValue(session.time);
        adminCreateForm.elements.event_instructor.value = session.instructor || "";
        adminCreateForm.elements.event_location.value = session.location || "";
        adminCreateForm.elements.event_address.value = session.address || "";
        adminCreateForm.elements.event_latitude.value = session.latitude || "";
        adminCreateForm.elements.event_longitude.value = session.longitude || "";
        adminCreateForm.elements.event_description.value = session.description || "";
        adminCreateForm.elements.event_notes.value = session.notes || "";
      } else {
        adminCreateForm.elements.name.value = session.title || "";
        adminCreateForm.elements.price.value = formatCurrencyInputValue(session.price || "");
        adminCreateForm.elements.age_group.value = session.ageGroup || "";
        adminCreateForm.elements.capacity.value = session.spots || "";
        fillCapacityControls("", session);
        adminCreateForm.elements.date.value = session.date || "";
        adminCreateForm.elements.start_time.value = toTimeInputValue(session.time);
        adminCreateForm.elements.duration.value = session.duration || "";
        adminCreateForm.elements.instructor.value = session.instructor || "";
        adminCreateForm.elements.location.value = session.location || "";
        adminCreateForm.elements.address.value = session.address || "";
        adminCreateForm.elements.latitude.value = session.latitude || "";
        adminCreateForm.elements.longitude.value = session.longitude || "";
        adminCreateForm.elements.description.value = session.description || "";
        adminCreateForm.elements.notes.value = session.notes || "";
      }

      adminCreateForm.elements.event_end_time.value = toTimeInputValue(session.eventEndTime || "");
      adminCreateForm.elements.dress_code.value = session.dressCode || "";
      adminCreateForm.elements.what_to_bring.value = session.whatToBring || "";
      adminCreateForm.elements.arrival_notes.value = session.arrivalNotes || "";
      adminCreateForm.elements.parking_info.value = session.parkingInfo || "";
      adminCreateForm.elements.refund_policy.value = session.refundPolicy || "";
      addressMapPreviews.forEach((preview) => updateAddressMapPreview(preview, "", ""));
      updateAddressMapPreview(
        getSectionPreview(session.type === "event" ? eventFields : classFields),
        session.latitude || "",
        session.longitude || ""
      );
      if (adminFormStatus) {
        adminFormStatus.textContent = `Editing "${session.title}". Save item when finished.`;
      }
      hideAddressSuggestions();
      reopenDetailsOnModalClose = true;
      closeAdminDetailsModal({ preserveSession: true });
      openAdminModal();
    });
  }

  if (adminDeleteSessionButton) {
    adminDeleteSessionButton.addEventListener("click", () => {
      if (!activeDetailsSessionId) {
        return;
      }
      const session = getSessionById(activeDetailsSessionId);
      if (!session) {
        return;
      }
      openAdminDeleteModal(session);
    });
  }

  if (adminDeleteConfirmButton) {
    adminDeleteConfirmButton.addEventListener("click", () => {
      if (!activeDetailsSessionId) {
        return;
      }
      const session = getSessionById(activeDetailsSessionId);
      if (!session) {
        return;
      }
      store?.deleteSession(activeDetailsSessionId);
      reopenDetailsOnModalClose = false;
      closeAdminDeleteModal();
      closeAdminDetailsModal();
      rerenderAll();
      if (adminFormStatus) {
        adminFormStatus.textContent = `"${session.title}" deleted.`;
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && adminModal && !adminModal.classList.contains("is-hidden")) {
      closeAdminModal();
    }
    if (
      event.key === "Escape" &&
      adminDetailsModal &&
      !adminDetailsModal.classList.contains("is-hidden")
    ) {
      closeAdminDetailsModal();
    }
    if (event.key === "Escape" && adminDeleteModal && !adminDeleteModal.classList.contains("is-hidden")) {
      closeAdminDeleteModal();
    }
    if (
      event.key === "Escape" &&
      adminAttendeesModal &&
      !adminAttendeesModal.classList.contains("is-hidden")
    ) {
      closeAdminAttendeesModal();
    }
    if (
      event.key === "Escape" &&
      adminEventAttendeesModal &&
      !adminEventAttendeesModal.classList.contains("is-hidden")
    ) {
      closeAdminEventAttendeesModal();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      (adminModal && !adminModal.classList.contains("is-hidden")) ||
      (adminDetailsModal && !adminDetailsModal.classList.contains("is-hidden")) ||
      (adminDeleteModal && !adminDeleteModal.classList.contains("is-hidden"))
    ) {
      return;
    }

    if (
      event.target.closest(".calendar-day") ||
      event.target.closest(".daily-lane") ||
      event.target.closest(".weekly-slot") ||
      event.target.closest(".calendar-event-item") ||
      event.target.closest(".daily-event") ||
      event.target.closest(".weekly-event") ||
      event.target.closest(".mini-calendar-day")
    ) {
      return;
    }

    if (!selectedAdminDateKey && !selectedAdminSlotKey) {
      return;
    }

    clearAdminSelection();
    rerenderAll();
  });

  const handleSessionOpen = (event) => {
    if (
      event.target.closest("[data-admin-class-details]") ||
      event.target.closest("[data-admin-class-attendees]") ||
      event.target.closest("[data-admin-event-details]") ||
      event.target.closest("[data-admin-event-attendees]")
    ) {
      return;
    }

    const trigger = event.target.closest("[data-admin-session-id]");
    if (!trigger) {
      return;
    }

    const session = getSessionById(trigger.dataset.adminSessionId);
    if (session) {
      selectedAdminDateKey = session.date;
      openAdminDetailsModal(session);
    }
  };

  calendarGrid.addEventListener("click", handleSessionOpen);
  calendarGrid.addEventListener("click", (event) => {
    const dayCell = event.target.closest(".calendar-day");
    if (!dayCell?.dataset.date) {
      return;
    }
    selectedAdminDateKey = dayCell.dataset.date;
    selectedAdminSlotKey = "";
    renderCalendar();
  });
  if (dailyGrid) {
    dailyGrid.addEventListener("click", handleSessionOpen);
    dailyGrid.addEventListener("click", (event) => {
      const lane = event.target.closest(".daily-lane");
      if (!lane?.dataset.date || !lane?.dataset.slotKey) {
        return;
      }
      selectedAdminDateKey = lane.dataset.date;
      selectedAdminSlotKey = lane.dataset.slotKey;
      renderDailyView();
    });
  }
  if (weeklyColumns) {
    weeklyColumns.addEventListener("click", handleSessionOpen);
    weeklyColumns.addEventListener("click", (event) => {
      const slot = event.target.closest(".weekly-slot");
      if (!slot?.dataset.date || !slot?.dataset.slotKey) {
        return;
      }
      selectedAdminDateKey = slot.dataset.date;
      selectedAdminSlotKey = slot.dataset.slotKey;
      renderWeeklyView();
    });
  }
  if (classList) {
    classList.addEventListener("click", (event) => {
      const detailsButton = event.target.closest("[data-admin-class-details]");
      if (detailsButton) {
        const session = getSessionById(detailsButton.dataset.adminClassDetails);
        if (session) {
          openAdminDetailsModal(session);
        }
        return;
      }

      const attendeesButton = event.target.closest("[data-admin-class-attendees]");
      if (attendeesButton) {
        const session = getSessionById(attendeesButton.dataset.adminClassAttendees);
        if (session) {
          openAdminAttendeesModal(session);
        }
      }
    });
  }
  if (eventList) {
    eventList.addEventListener("click", (event) => {
      const detailsButton = event.target.closest("[data-admin-event-details]");
      if (detailsButton) {
        const session = getSessionById(detailsButton.dataset.adminEventDetails);
        if (session) {
          openAdminDetailsModal(session);
        }
        return;
      }

      const attendeesButton = event.target.closest("[data-admin-event-attendees]");
      if (attendeesButton) {
        const session = getSessionById(attendeesButton.dataset.adminEventAttendees);
        if (session) {
          openAdminEventAttendeesModal(session);
        }
      }
    });
  }

  if (miniCalendarGrid) {
    miniCalendarGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".mini-calendar-day");
      if (!button?.dataset.date) {
        return;
      }

      const [year, month, day] = button.dataset.date.split("-").map(Number);
      visibleDay = new Date(year, month - 1, day);
      visibleWeek = new Date(year, month - 1, day);
      visibleMonth = new Date(year, month - 1, 1);
      selectedAdminDateKey = button.dataset.date;
      selectedAdminSlotKey = "";

      viewSelects.forEach((select) => {
        select.value = "daily";
      });

      rerenderAll();
    });
  }

  initAddressSearch();
  initTimeSelects();
  syncBrandingControls();
  syncPaymentControls();
  updateSessionTypeFields();
  const settingsHash = String(window.location.hash || "").replace("#", "").toLowerCase();
  const openPaymentsSettings = settingsHash === "payments";
  setActiveAdminTab(openPaymentsSettings ? "business" : "bookings");
  setActiveSettingsTab(openPaymentsSettings ? "payments" : "profile");
  rerenderAll();
}
