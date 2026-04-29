/**
 * Flights Logic
 * Handles dynamic flight generation, filtering, sorting, and rendering
 */

document.addEventListener("DOMContentLoaded", () => {
  const allFlights = allFlightsData;

  // 2. Read URL Parameters
  const params = new URLSearchParams(window.location.search);
  const destinationParam = params.get("destination");
  const fromDateParam = params.get("fromDate");
  const toDateParam = params.get("toDate");
  const passengersParam = parseInt(params.get("passengers")) || 1;

  // 3. DOM Elements
  const flightsContainer = document.getElementById("flightsContainer");
  const searchTitle = document.getElementById("searchTitle");
  const searchSubtitle = document.getElementById("searchSubtitle");

  const filterFromDate = document.getElementById("filterFromDate");
  const filterToDate = document.getElementById("filterToDate");
  const airlineFilter = document.getElementById("airlineFilter");
  const sortSelect = document.getElementById("sortSelect");

  // Set initial filter values from URL
  if (fromDateParam) filterFromDate.value = fromDateParam;
  if (toDateParam) filterToDate.value = toDateParam;
  if (destinationParam) {
    searchTitle.innerText = `Flights to ${destinationParam}`;
  }

  /**
   * Populates the airline filter dropdown dynamically
   */
  const populateAirlines = () => {
    const airlines = [...new Set(allFlights.map((f) => f.airline))].sort();
    airlines.forEach((airline) => {
      const option = document.createElement("option");
      option.value = airline;
      option.innerText = airline;
      airlineFilter.appendChild(option);
    });
  };

  /**
   * Renders flight objects into the container
   */
  const renderFlights = (flights) => {
    flightsContainer.innerHTML = "";

    if (flights.length === 0) {
      flightsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-plane-slash display-1 text-muted mb-4"></i>
                    <h3>No flights found</h3>
                    <p class="text-muted">Try adjusting your filters or search criteria.</p>
                </div>
            `;
      return;
    }

    flights.forEach((flight) => {
      const flightCard = document.createElement("div");
      flightCard.className = "flight-card";

      const hours = Math.floor(flight.durationMinutes / 60);
      const mins = flight.durationMinutes % 60;

      flightCard.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-2 mb-3 mb-md-0">
                        <div class="d-flex align-items-center">
                            <div class="airline-logo me-2">${flight.airline.charAt(0)}</div>
                            <div>
                                <div class="fw-bold small text-uppercase">${flight.airline}</div>
                                <div class="text-muted small">${flight.flightNumber}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-5 mb-3 mb-md-0">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="text-center">
                                <div class="flight-time">${flight.departureTime}</div>
                                <div class="flight-route">${flight.originCode}</div>
                                <div class="small text-muted">${flight.date}</div>
                            </div>
                            <div class="flex-grow-1 mx-3 text-center">
                                <div class="small text-muted mb-1">${hours}h ${mins}m</div>
                                <div class="border-bottom w-100 position-relative">
                                    <i class="fas fa-plane position-absolute top-50 start-50 translate-middle bg-white px-2"></i>
                                </div>
                                <div class="small text-muted mt-1">Non-stop</div>
                            </div>
                            <div class="text-center">
                                <div class="flight-time">${flight.arrivalTime}</div>
                                <div class="flight-route">${flight.destinationCode}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 text-center mb-3 mb-md-0">
                        <div class="flight-price">S$ ${flight.pricePerPerson}</div>
                        <div class="text-muted small">per person</div>
                    </div>
                    <div class="col-md-2 text-center">
                        <button class="btn btn-gold w-100 book-btn" data-id="${flight.id}">
                            Book Now
                        </button>
                    </div>
                </div>
            `;
      flightsContainer.appendChild(flightCard);
    });

    // Add event listeners to "Book Now" buttons
    document.querySelectorAll(".book-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const flightId = parseInt(e.target.dataset.id);
        const selectedFlight = allFlights.find((f) => f.id === flightId);

        const bookingInfo = {
          ...selectedFlight,
          passengerCount: passengersParam,
        };
        localStorage.setItem("selectedFlight", JSON.stringify(bookingInfo));
        window.location.href = "booking.html";
      });
    });
  };

  /**
   * Filters and sorts the master list
   */
  const updateResults = () => {
    let filtered = allFlights;

    // Apply Destination (from URL only for now)
    if (destinationParam) {
      filtered = filtered.filter((f) => f.destination === destinationParam);
    }

    // Apply Date Range
    const start = filterFromDate.value;
    const end = filterToDate.value;
    if (start) {
      filtered = filtered.filter((f) => f.date >= start);
    }
    if (end) {
      filtered = filtered.filter((f) => f.date <= end);
    }

    // Apply Airline
    const airline = airlineFilter.value;
    if (airline !== "all") {
      filtered = filtered.filter((f) => f.airline === airline);
    }

    // Apply Sort
    const sort = sortSelect.value;
    if (sort === "priceLow") {
      filtered.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    } else if (sort === "priceHigh") {
      filtered.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
    } else if (sort === "timeEarly") {
      filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    } else if (sort === "timeLate") {
      filtered.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
    }

    // Limit results for performance (e.g., top 100)
    renderFlights(filtered.slice(0, 50));

    searchSubtitle.innerText = `Showing ${filtered.length} flight(s) matching your criteria`;
  };

  // Initial load
  populateAirlines();
  updateResults();

  // Event listeners for filters
  [filterFromDate, filterToDate, airlineFilter, sortSelect].forEach((el) => {
    el.addEventListener("change", updateResults);
  });
});
