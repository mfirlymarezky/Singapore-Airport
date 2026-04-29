/**
 * Booking Logic
 * Handles flight summary display, real-time price calculation, and form submission
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Get flight data from localStorage
  const selectedFlight = JSON.parse(localStorage.getItem("selectedFlight"));

  if (!selectedFlight) {
    // Redirect back to search if no flight is selected
    window.location.href = "index.html";
    return;
  }

  // 2. DOM Elements
  const flightSummary = document.getElementById("flightSummary");
  const bookingForm = document.getElementById("bookingForm");
  const seatClass = document.getElementById("seatClass");
  const numPassengers = document.getElementById("numPassengers");
  const totalPriceDisplay = document.getElementById("totalPrice");

  // Confirmation elements
  const mainContent = document.getElementById("mainBookingContent");
  const confirmationCard = document.getElementById("confirmationCard");
  const confRef = document.getElementById("confRef");
  const confName = document.getElementById("confName");
  const confRoute = document.getElementById("confRoute");
  const confPrice = document.getElementById("confPrice");

  // Set initial values from search
  numPassengers.value = selectedFlight.passengerCount;

  /**
   * Renders the flight summary card
   */
  const renderSummary = () => {
    flightSummary.innerHTML = `
            <div class="row align-items-center">
                <div class="col-sm-6">
                    <div class="h4 mb-1">${selectedFlight.airline}</div>
                    <div class="text-muted small">${selectedFlight.flightNumber}</div>
                </div>
                <div class="col-sm-6 text-sm-end mt-3 mt-sm-0">
                    <div class="h5 mb-0">${selectedFlight.origin} (${selectedFlight.originCode}) &rarr; ${selectedFlight.destination} (${selectedFlight.destinationCode})</div>
                    <div class="text-muted small">Date: ${selectedFlight.date} | Departure: ${selectedFlight.departureTime}</div>
                </div>
            </div>
        `;
  };

  /**
   * Calculates and updates the total price based on seat class and passenger count
   */
  const updateTotalPrice = () => {
    const count = parseInt(numPassengers.value) || 0;
    const multiplier = seatClass.value === "business" ? 2 : 1;
    const total = selectedFlight.pricePerPerson * multiplier * count;

    totalPriceDisplay.innerText = `S$ ${total.toLocaleString()}`;
    return total;
  };

  /**
   * Generates a random alphanumeric booking reference
   */
  const generateRef = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "CHG-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Initialize
  renderSummary();
  updateTotalPrice();

  // Event listeners for real-time price update
  seatClass.addEventListener("change", updateTotalPrice);
  numPassengers.addEventListener("input", updateTotalPrice);

  // Form Submission
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Simple Validation
    let isValid = true;
    const fields = ["fullName", "email", "phone", "passport"];

    fields.forEach((fieldId) => {
      const el = document.getElementById(fieldId);
      el.classList.remove("is-invalid");
      if (!el.value || (fieldId === "email" && !el.value.includes("@"))) {
        el.classList.add("is-invalid");
        isValid = false;
      }
    });

    if (isValid) {
      // Show confirmation
      const finalTotal = updateTotalPrice();
      const reference = generateRef();
      const fullName = document.getElementById("fullName").value;

      // Save to History
      const bookingRecord = {
        reference: reference,
        passengerName: fullName,
        route: `${selectedFlight.originCode} to ${selectedFlight.destinationCode}`,
        date: selectedFlight.date,
        seatClass: seatClass.value,
        totalPrice: finalTotal,
        timestamp: new Date().toISOString(),
      };

      const history = JSON.parse(localStorage.getItem("bookingHistory")) || [];
      history.push(bookingRecord);
      localStorage.setItem("bookingHistory", JSON.stringify(history));

      confRef.innerText = reference;
      confName.innerText = fullName;
      confRoute.innerText = `${selectedFlight.originCode} to ${selectedFlight.destinationCode}`;
      confPrice.innerText = `S$ ${finalTotal.toLocaleString()}`;

      // Hide form, show confirmation
      mainContent.classList.add("d-none");
      confirmationCard.classList.remove("d-none");

      // Clear current selection
      localStorage.removeItem("selectedFlight");

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});
