/**
 * Flights Logic
 * Handles searching, filtering, and rendering flights
 */

// begitu dom content sudah di load which is thats why kito jugo taruh element script mepet diatas closing tag body yolah untuk tujuan ini, nah dari situ baru jalankan yang didalem kurung kurawal itu
document.addEventListener("DOMContentLoaded", () => {
  // ambil semua data penerbangan dari flights-data.js — file itu diload duluan di HTML makanya bisa langsung diakses disini
  const allFlights = allFlightsData;

  // ambil elemen HTML berdasarkan atribut id-nya — id di JS harus persis sama dengan id="..." yang ada di HTML
  // disimpan ke variabel biar ga perlu query ulang tiap kali butuh
  const searchForm = document.getElementById("searchForm");
  const destinationSelect = document.getElementById("destination");
  const dateInput = document.getElementById("fromDate");
  const airlineFilter = document.getElementById("airlineFilter");
  const sortSelect = document.getElementById("sortSelect");
  const flightsContainer = document.getElementById("flightsContainer");
  const searchTitle = document.getElementById("searchTitle");
  const searchSubtitle = document.getElementById("searchSubtitle");

  /**
   * isi dropdown maskapai secara dinamis dari data yang ada
   * kenapa dinamis? biar kalau data berubah, dropdown ikut otomatis — ga perlu edit HTML manual
   */
  const populateAirlines = () => {
    // Set() dipakai untuk hapus duplikat — kalau Qatar muncul 4x di data, dropdown tetap tampil sekali
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
   * terima array flight, lalu cetak ke layar sebagai card HTML
   * fungsi ini tidak tahu soal filter — tugasnya murni render apa yang dikasih
   */
  const renderFlights = (flights) => {
    // kosongkan container dulu sebelum isi ulang, biar hasil lama ga numpuk
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
          ...selectedFlight,
          passengerCount: 1,
        };
        localStorage.setItem("selectedFlight", JSON.stringify(bookingInfo));
        window.location.href = "booking.html";
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
    const airline = airlineFilter.value;
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

    // kalau bukan "all", saring berdasarkan maskapai
    if (airline !== "all") {
      filtered = filtered.filter((f) => f.airline === airline);
    }

    // urutkan hasil sesuai pilihan sort — sort() langsung modifikasi array filtered
    if (sort === "priceLow") {
      filtered.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    } else if (sort === "priceHigh") {
      filtered.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
    } else if (sort === "timeEarly") {
      filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    } else if (sort === "timeLate") {
      filtered.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
    }

    // kirim hasil filter ke fungsi render — dari sini tugasnya updateResults selesai
    renderFlights(filtered);

    // update teks judul dan subtitle sesuai filter aktif
    searchTitle.innerText = dest
      ? `Flights to ${dest}`
      : "All Available Flights";

    let subtitleParts = [];
    subtitleParts.push(date ? date : "all dates");
    subtitleParts.push(airline !== "all" ? airline : "all airlines");

    searchSubtitle.innerText = `Showing ${filtered.length} flight(s) (${subtitleParts.join(", ")})`;
  };

  // jalankan setup awal: isi dropdown maskapai
  populateAirlines();

  // langsung tampilkan semua flight saat halaman pertama dibuka
  updateResults();

  // bungkus updateResults dengan debounce khusus untuk input tanggal yang diketik manual
  const debouncedSearch = debounce(updateResults, 300);

  // pasang listener ke setiap filter — setiap berubah langsung trigger updateResults tanpa perlu tombol search
  destinationSelect.addEventListener("change", updateResults);
  dateInput.addEventListener("input", debouncedSearch);
  airlineFilter.addEventListener("change", updateResults);
  sortSelect.addEventListener("change", updateResults);

  // safety net: blokir submit default browser yang akan reload halaman kalau user tekan Enter di dalam form
  searchForm.addEventListener("submit", (e) => e.preventDefault());
});
