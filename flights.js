/**
 * Flights Logic
 * Handles searching, filtering, and rendering flights
 */

document.addEventListener("DOMContentLoaded", () => {
  const allFlights = allFlightsData;

  // 1. DOM Elements
  const searchForm = document.getElementById("searchForm");
  const originInput = document.getElementById("origin");
  const destinationSelect = document.getElementById("destination");
  const dateInput = document.getElementById("fromDate");
  const airlineFilter = document.getElementById("airlineFilter");
  const sortSelect = document.getElementById("sortSelect");
  const flightsContainer = document.getElementById("flightsContainer");
  const searchTitle = document.getElementById("searchTitle");
  const searchSubtitle = document.getElementById("searchSubtitle");

  // 2. Read URL Parameters
  const params = new URLSearchParams(window.location.search);
  const destinationParam = params.get("destination");
  const fromDateParam = params.get("fromDate");

  /**
   * Populates the airline filter dropdown dynamically
   */
  const populateAirlines = () => {
    const airlines = [...new Set(allFlights.map((f) => f.airline))].sort();
    airlineFilter.innerHTML = '<option value="all">All Airlines</option>';
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
                    <p class="text-muted">Try adjusting your search or filters.</p>
                </div>
            `;
      return;
    }

    flights.forEach((flight) => {
      const flightCard = document.createElement("div");
      flightCard.className = "flight-card mb-3";

      const hours = Math.floor(flight.durationMinutes / 60);
      const mins = flight.durationMinutes % 60;

      flightCard.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-2 mb-3 mb-md-0">
                        <div class="d-flex align-items-center">
                            <div class="airline-logo me-2" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
                                <img src="${flight.logo}" alt="${flight.airline}" 
                                     style="width: 50px; height: 50px; object-fit: contain;"
                                     onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'small fw-bold text-center\' style=\'font-size: 10px; line-height: 1.1;\'>${flight.airline}</div>'">
                            </div>
                            <div>
                                <div class="fw-bold small text-uppercase">${flight.airline}</div>
                                <div class="text-muted small">${flight.flightNumber}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-5 mb-3 mb-md-0">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="text-center">
                                <div class="flight-time h5 mb-0" style="font-weight: 700;">${flight.departureTime}</div>
                                <div class="flight-route small">
                                    <img src="${flight.originFlag}" alt="SG" class="me-1" style="width: 20px; vertical-align: middle;">
                                    ${flight.originCode}
                                </div>
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
                                <div class="flight-time h5 mb-0" style="font-weight: 700;">${flight.arrivalTime}</div>
                                <div class="flight-route small">
                                    <img src="${flight.destinationFlag}" alt="Flag" class="me-1" style="width: 20px; vertical-align: middle;">
                                    ${flight.destinationCode}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 text-center mb-3 mb-md-0">
                        <div class="flight-price h4 mb-0" style="color: var(--accent-gold); font-weight: 700;">S$ ${flight.pricePerPerson}</div>
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
          passengerCount: 1, // Default to 1
        };
        localStorage.setItem("selectedFlight", JSON.stringify(bookingInfo));
        window.location.href = "booking.html";
      });
    });
  };

  /**
   * Debounce helper
   */
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  /**
   * Filters and sorts the master list
   */
  const updateResults = () => {
    const dest = destinationSelect.value;
    const date = dateInput.value;
    const airline = airlineFilter.value;
    const sort = sortSelect.value;

    let filtered = allFlights;

    // Filter by Destination
    if (dest) {
      filtered = filtered.filter(f => f.destination === dest);
    }

    // Filter by Date
    if (date) {
      filtered = filtered.filter(f => f.date === date);
    }

    // Filter by Airline
    if (airline !== "all") {
      filtered = filtered.filter((f) => f.airline === airline);
    }

    // Apply Sort
    if (sort === "priceLow") {
      filtered.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    } else if (sort === "priceHigh") {
      filtered.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
    } else if (sort === "timeEarly") {
      filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    } else if (sort === "timeLate") {
      filtered.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
    }

    renderFlights(filtered);
    
    // Update labels
    searchTitle.innerText = dest ? `Flights to ${dest}` : "All Available Flights";
    
    let subtitleParts = [];
    subtitleParts.push(date ? date : "all dates");
    subtitleParts.push(airline !== "all" ? airline : "all airlines");
    
    searchSubtitle.innerText = `Showing ${filtered.length} flight(s) (${subtitleParts.join(', ')})`;
  };

  // Initial load logic
  populateAirlines();

  if (destinationParam) destinationSelect.value = destinationParam;
  if (fromDateParam) dateInput.value = fromDateParam;
  
  // Show all or filtered results immediately on load
  updateResults();

  // Event listeners for auto-search
  const debouncedSearch = debounce(updateResults, 300);

  destinationSelect.addEventListener("change", updateResults);
  dateInput.addEventListener("input", debouncedSearch);
  airlineFilter.addEventListener("change", updateResults);
  sortSelect.addEventListener("change", updateResults);

  // Prevent form submission
  searchForm.addEventListener("submit", (e) => e.preventDefault());
});

