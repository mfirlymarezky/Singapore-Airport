/**
 * Flights Logic
 * Handles searching, filtering, and rendering flights
 */
// ga pake alert tapi pakek innerhtml for notif jadi biso muncul tampilan static gitu di file itula tanpa libatke browser eksplisit
// begitu dom content sudah di load which is thats why kito jugo taruh element script mepet diatas closing tag body yolah untuk tujuan ini, nah dari situ baru jalankan yang didalem kurung kurawal itu
document.addEventListener("DOMContentLoaded", () => {
  // ambil semua data penerbangan dari flights-data.js — file itu diload duluan di HTML makanya bisa langsung diakses disini
  const allFlights = allFlightsData;

  // ambil elemen HTML berdasarkan atribut id-nya — id di JS harus persis sama dengan id="..." yang ada di HTML
  // disimpan ke variabel biar ga perlu query ulang tiap kali butuh
  const searchForm = document.getElementById("searchForm");
  const destinationSelect = document.getElementById("destination");
  const dateInput = document.getElementById("fromDate");
  const sortSelect = document.getElementById("sortSelect");
  const flightsContainer = document.getElementById("flightsContainer");
  const searchTitle = document.getElementById("searchTitle");
  const searchSubtitle = document.getElementById("searchSubtitle");
  const popularRoutesPanel = document.getElementById("popularRoutesPanel");
  const popularRoutesContainer = document.getElementById("popularRoutesContainer");



  /**
   * terima array flight atau penerbangan, lalu cetak ke layar sebagai flight card
   * fungsi ini tidak tahu soal CETAK filter — tugasnya murni render apa yang dikasih (terpisah dari fungsi filter)
   */
  const renderFlights = (flights) => {
    // kosongkan container filter dulu sebelum isi ulang, biar hasil lama ga numpuk
    flightsContainer.innerHTML = "";

    // kalau hasil filter kosong, tampilkan pesan "tidak ada penerbangan"
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

    // looping tiap data flight, buat card HTML-nya, lalu tempel ke container
    flights.forEach((flight) => {
      const flightCard = document.createElement("div");
      flightCard.className = "flight-card mb-3";

      // hitung durasi dari menit jadi format jam + menit untuk ditampilkan
      const hours = Math.floor(flight.durationMinutes / 60);
      const mins = flight.durationMinutes % 60;

      // isi HTML card dengan data dari objek flight — pakai template literal biar rapi
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
                  ${flight.originCode} (${flight.origin})
                </div>
                <div class="small text-muted">${flight.date}</div>
              </div>
              <div class="flex-grow-1 mx-3 text-center">
                <div class="small text-muted mb-1">${hours}h ${mins}m</div>
                <div class="border-bottom w-100 position-relative">
                  <i class="fas fa-plane position-absolute top-50 start-50 translate-middle bg-white px-2"></i>
                </div>
                <div class="small text-muted mt-1">${flight.stopLabel}</div>
              </div>
              <div class="text-center">
                <div class="flight-time h5 mb-0" style="font-weight: 700;">${flight.arrivalTime}</div>
                <div class="flight-route small">
                  <img src="${flight.destinationFlag}" alt="Flag" class="me-1" style="width: 20px; vertical-align: middle;">
                  ${flight.destinationCode} (${flight.destination})
                </div>
                <div class="small text-muted">${flight.date}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 text-center mb-3 mb-md-0">
            ${
              flight.badge 
                ? `<div class="mb-2"><span class="badge badge-${flight.badge.toLowerCase().replace(/\s+/g, '-')} px-3 py-2 rounded-pill">${flight.badge}</span></div>` 
                : ""
            }
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

    // pasang event listener ke semua tombol "Book Now" yang baru saja dibuat
    // kenapa di sini dan bukan di luar? karena tombol ini dibuat dinamis — belum ada saat halaman pertama load
    document.querySelectorAll(".book-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // ambil id flight dari atribut data-id di tombol yang diklik
        const flightId = parseInt(e.target.dataset.id);
        // cari objek flight yang cocok dari master data
        const selectedFlight = allFlights.find((f) => f.id === flightId);

        // simpan flight yang dipilih ke localStorage — ini cara "kirim data" ke halaman booking.html
        // booking.html nanti akan baca ini saat pertama kali dibuka
        const bookingInfo = {
          // ambil segala rincian data
          ...selectedFlight,
          passengerCount: 1,
        };
        // nyimpen di browser data dk ilang walau di refresh
        // json string untuk simpen dlm format string krn  localStorage cmn bs simpn string
        localStorage.setItem("selectedFlight", JSON.stringify(bookingInfo));
        window.location.href = "booking.html";
      });
    });
  };

  /**
   * Render Popular Routes (teaser cards)
   */
  const renderPopularRoutes = () => {
    const routes = [
      {
        airline: "Qatar Airways",
        logo: "https://img.favpng.com/10/19/15/qatar-airways-logo-airline-oryx-png-favpng-zzxmSycnu1dVBAvCSCDZEpwGU.jpg",
        flightNumber: "QR947",
        badge: "Most Booked",
        badgeClass: "badge-most-booked",
        originCode: "SIN",
        originFlag: "https://flagcdn.com/w20/sg.png",
        destCode: "CGK",
        destFlag: "https://flagcdn.com/w20/id.png",
        price: 310,
        destName: "Indonesia"
      },
      {
        airline: "Singapore Airlines",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/250px-Singapore_Airlines_Logo_2.svg.png",
        flightNumber: "SQ211",
        badge: "Best Deal",
        badgeClass: "badge-best-deal",
        originCode: "SIN",
        originFlag: "https://flagcdn.com/w20/sg.png",
        destCode: "SYD",
        destFlag: "https://flagcdn.com/w20/au.png",
        price: 1050,
        destName: "Australia"
      }
    ];

    popularRoutesContainer.innerHTML = routes.map(route => `
      <div class="col-md-6">
        <div class="card h-100 border-0 bg-light rounded-4 popular-route-card transition-hover overflow-hidden shadow-none border">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center">
                <img src="${route.logo}" alt="Airline" width="25" class="me-2 rounded">
                <div>
                  <div class="fw-bold" style="font-size: 11px;">${route.airline}</div>
                  <div class="text-muted" style="font-size: 10px;">${route.flightNumber}</div>
                </div>
              </div>
              <span class="badge ${route.badgeClass} rounded-pill" style="font-size: 9px; padding: 5px 10px;">${route.badge}</span>
            </div>
            
            <div class="d-flex justify-content-between align-items-center my-3">
              <div class="text-center">
                <div class="fw-bold small">${route.originCode}</div>
                <img src="${route.originFlag}" alt="SIN" style="width: 16px;">
              </div>
              <div class="flex-grow-1 mx-2 text-center position-relative">
                <div class="border-bottom w-100"></div>
                <i class="fas fa-plane position-absolute top-50 start-50 translate-middle bg-light px-1 text-muted" style="font-size: 10px;"></i>
              </div>
              <div class="text-center">
                <div class="fw-bold small">${route.destCode}</div>
                <img src="${route.destFlag}" alt="Dest" style="width: 16px;">
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                <span class="text-muted" style="font-size: 10px; display: block;">from</span>
                <span class="fw-bold text-gold" style="color: var(--accent-gold); font-size: 1.1rem;">S$ ${route.price}</span>
              </div>
              <button class="btn btn-sm btn-gold rounded-pill px-3 py-1 popular-view-btn" data-dest="${route.destName}">View</button>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    // Add click listeners for "View" buttons
    document.querySelectorAll(".popular-view-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        destinationSelect.value = btn.dataset.dest;
        updateResults();
      });
    });
  };

  /**
   * debounce: tunda eksekusi fungsi sampai user berhenti mengetik selama X milidetik
   * tanpa ini, setiap ketikan satu huruf langsung trigger filter — boros dan lambat
   */
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  /**
   * inti dari halaman ini — baca semua nilai filter aktif, saring data, lalu render hasilnya
   * dipanggil setiap kali user ubah filter apapun
   */
  const updateResults = () => {
    const dest = destinationSelect.value;
    const date = dateInput.value;
    const sort = sortSelect.value;

    // mulai dari semua data, lalu kurangi satu per satu berdasarkan filter yang aktif
    let filtered = allFlights;

    // kalau user pilih destinasi tertentu, saring hanya yang cocok
    if (dest) {
      filtered = filtered.filter((f) => f.destination === dest);
    }

    // kalau user pilih tanggal tertentu, saring hanya yang tanggalnya sama persis
    if (date) {
      filtered = filtered.filter((f) => f.date === date);
    }



    // urutkan hasil sesuai pilihan sort — sort() langsung modifikasi array filtered
    if (sort === "priceLow") {
      // a - b (Murah ke Mahal): Jika hasilnya negatif, a (murah) akan ditaruh di depan.
      filtered.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
      // b - a (Mahal ke Murah): Kebalikannya, ini akan menaruh angka yang lebih besar di awal daftar.
    } else if (sort === "timeEarly") {
      filtered.sort((a, b) => {
        const timeA = a.date + "T" + a.departureTime;
        const timeB = b.date + "T" + b.departureTime;
        return timeA.localeCompare(timeB);
      });
    }

    // kirim hasil filter ke fungsi render — dari sini tugasnya updateResults selesai
    renderFlights(filtered);

    // update teks judul dan subtitle sesuai filter aktif angko data real time sesuai pilihan di form flight
    if (searchTitle) {
      searchTitle.innerText = dest
        ? `Flights to ${dest}`
        : "All Available Flights";
    }

    // Panel disappears automatically once any filter is applied
    const hasFilter = dest || date;
    if (popularRoutesPanel) {
      if (hasFilter) {
        popularRoutesPanel.classList.add("d-none");
      } else {
        popularRoutesPanel.classList.remove("d-none");
        if (popularRoutesContainer && popularRoutesContainer.innerHTML === "") {
          renderPopularRoutes();
        }
      }
    }

    let subtitleParts = [];
    if (date) subtitleParts.push(date);
    else subtitleParts.push("all dates");

    if (searchSubtitle) {
      searchSubtitle.innerText = `Showing ${filtered.length} flight(s) (${subtitleParts.join(", ")})`;
    }
  };



  // Handle query parameters (e.g. ?destination=Indonesia)
  const urlParams = new URLSearchParams(window.location.search);
  const destParam = urlParams.get("destination");
  if (destParam) {
    destinationSelect.value = destParam;
  }

  // langsung tampilkan semua flight saat halaman pertama dibuka
  updateResults();

  // bungkus updateResults dengan debounce khusus untuk input tanggal yang diketik manual
  const debouncedSearch = debounce(updateResults, 300);

  // pasang listener ke setiap filter — setiap berubah langsung trigger updateResults tanpa perlu tombol search
  destinationSelect.addEventListener("change", updateResults);
  dateInput.addEventListener("input", debouncedSearch);

  sortSelect.addEventListener("change", updateResults);

  // safety net: blokir submit default browser yang akan reload halaman kalau user tekan Enter di dalam form
  searchForm.addEventListener("submit", (e) => e.preventDefault());
});
