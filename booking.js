/**
 * Booking Logic
 * Handles flight summary display, real-time price calculation, and form submission
 */

document.addEventListener("DOMContentLoaded", () => {
  // baca data flight yang disimpan flights.js saat user klik "Book Now"
  // JSON.parse karena localStorage hanya bisa simpan string — jadi objek harus dikonversi balik
  const selectedFlight = JSON.parse(localStorage.getItem("selectedFlight"));

  // kalau user buka booking.html langsung tanpa lewat flights.html, data tidak ada — lempar balik ke home
  if (!selectedFlight) {
    window.location.href = "index.html";
    return;
  }

  // ambil semua elemen HTML yang akan dimanipulasi di halaman ini
  const flightSummary = document.getElementById("flightSummary");
  const bookingForm = document.getElementById("bookingForm");
  const seatClass = document.getElementById("seatClass");
  const numPassengers = document.getElementById("numPassengers");
  const totalPriceDisplay = document.getElementById("totalPrice");
  const priceBreakdown = document.getElementById("priceBreakdown");
  const passengerLabel = document.getElementById("passengerLabel");
  const leadSubtitle = document.getElementById("leadSubtitle");
  const phoneCode = document.getElementById("phoneCode");

  // elemen untuk halaman konfirmasi yang muncul setelah booking berhasil
  const mainContent = document.getElementById("mainBookingContent");
  const confirmationCard = document.getElementById("confirmationCard");
  const confRef = document.getElementById("confRef");
  const confName = document.getElementById("confName");
  const confNameLabel = document.getElementById("confNameLabel");
  const confCount = document.getElementById("confCount");
  const confRoute = document.getElementById("confRoute");
  const confDepartureTime = document.getElementById("confDepartureTime");
  const confDepartureDate = document.getElementById("confDepartureDate");
  const confPrice = document.getElementById("confPrice");

  // elemen modal konfirmasi yang muncul sebelum booking final diproses
  const confirmModalEl = document.getElementById("confirmModal");
  const confirmModal = new bootstrap.Modal(confirmModalEl); // inisialisasi Bootstrap modal via JS
  const modalSummary = document.getElementById("modalSummary");
  const modalPriceBreakdown = document.getElementById("modalPriceBreakdown");
  const finalConfirmBtn = document.getElementById("finalConfirmBtn");

  // elemen tooltip hover untuk detail kelas kursi
  const seatTooltip = document.getElementById("seatTooltip");
  const tooltipIcon = document.getElementById("tooltipIcon");
  const tooltipTitle = document.getElementById("tooltipTitle");
  const tooltipBenefits = document.getElementById("tooltipBenefits");

  // data tiap kelas kursi — multiplier dipakai untuk kalkulasi harga, sisanya untuk tooltip
  // economy = harga asli (×1.0), first class = 6x lipat harga economy
  const seatData = {
    economy: {
      title: "Economy",
      multiplier: 1.0,
      icon: `<svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M4,18v3h3v-3h10v3h3v-3c1.1,0,2-0.9,2-2V7c0-1.1-0.9-2-2-2H4C2.9,5,2,5.9,2,7v9C2,17.1,2.9,18,4,18z M4,7h16v9H4V7z M6,9h12v2H6V9z"/></svg>`,
      benefits: ["Standard recline", '30" pitch', "Complimentary meal"],
    },
    premium: {
      title: "Premium Economy",
      multiplier: 1.8,
      icon: `<svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M4,18v3h3v-3h10v3h3v-3c1.1,0,2-0.9,2-2V7c0-1.1-0.9-2-2-2H4C2.9,5,2,5.9,2,7v9C2,17.1,2.9,18,4,18z M4,7h16v9H4V7z M6,9h12v4H6V9z"/></svg>`,
      benefits: [
        "Extra legroom",
        '38" pitch',
        "Priority boarding",
        "Enhanced meal",
      ],
    },
    business: {
      title: "Business",
      multiplier: 3.5,
      icon: `<svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M19,15h3v3h-3V15z M4,15h3v3H4V15z M2,11v2h20v-2H2z M7,5h10v2H7V5z M4,7h16v2H4V7z M4,13h16v2H4V13z"/></svg>`,
      benefits: [
        "Lie-flat seat",
        '60" pitch',
        "Lounge access",
        "Premium dining",
      ],
    },
    first: {
      title: "First Class",
      multiplier: 6.0,
      icon: `<svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M2,17h20v2H2V17z M3,13h18v2H3V13z M4,9h16v2H4V9z M5,5h14v2H5V5z M2,19h20v2H2V19z"/></svg>`,
      benefits: [
        "Private suite",
        "Full-flat bed",
        "Dedicated butler",
        "Fine dining",
      ],
    },
  };

  // set jumlah penumpang awal dari data yang dikirim flights.js
  numPassengers.value = selectedFlight.passengerCount;

  // pulihkan data form jika ada di sessionStorage (agar tidak hilang saat refresh)
  const savedForm = JSON.parse(sessionStorage.getItem("bookingFormData"));
  if (savedForm) {
    if (savedForm.fullName)
      document.getElementById("fullName").value = savedForm.fullName;
    if (savedForm.email)
      document.getElementById("email").value = savedForm.email;
    if (savedForm.phoneCode)
      document.getElementById("phoneCode").value = savedForm.phoneCode;
    if (savedForm.phone)
      document.getElementById("phone").value = savedForm.phone;
    if (savedForm.seatClass) seatClass.value = savedForm.seatClass;
    if (savedForm.numPassengers) numPassengers.value = savedForm.numPassengers;
    if (savedForm.mealPreference)
      document.getElementById("mealPreference").value =
        savedForm.mealPreference;
  }

  // simpan otomatis form data ke sessionStorage setiap kali ada perubahan
  const saveFormData = () => {
    const data = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phoneCode: document.getElementById("phoneCode").value,
      phone: document.getElementById("phone").value,
      seatClass: seatClass.value,
      numPassengers: numPassengers.value,
      mealPreference: document.getElementById("mealPreference").value,
    };
    sessionStorage.setItem("bookingFormData", JSON.stringify(data));
  };

  bookingForm.addEventListener("input", saveFormData);
  bookingForm.addEventListener("change", saveFormData);

  /**
   * cetak ringkasan flight di bagian atas form booking
   * data diambil dari selectedFlight yang sudah dibaca dari localStorage di atas
   */
  const renderSummary = () => {
    flightSummary.innerHTML = `
      <div class="row align-items-center">
        <div class="col-sm-6">
          <div class="h4 mb-1">${selectedFlight.airline}</div>
          <div class="text-muted small">${selectedFlight.flightNumber}</div>
        </div>
        <div class="col-sm-6 text-sm-end mt-3 mt-sm-0">
          <div class="h5 mb-2">${selectedFlight.originCode} (${selectedFlight.origin}) → ${selectedFlight.destinationCode} (${selectedFlight.destination})</div>
          <div class="text-muted small mb-2">Departure: ${selectedFlight.date} | ${selectedFlight.departureTime}</div>
          <div class="text-muted small mb-2">Arrival: ${selectedFlight.arrivalDate || selectedFlight.date} | ${selectedFlight.arrivalTime}</div>
          <div class="text-muted small mt-2">${selectedFlight.stopLabel}</div>
        </div>
      </div>
    `;
  };

  /**
   * hitung total harga dan update tampilannya setiap kali kelas atau jumlah penumpang berubah
   * rumus: harga dasar × multiplier kelas × jumlah penumpang
   * return objek berisi semua nilai kalkulasi — dipakai ulang oleh completeBooking dan modal
   */
  const updateTotalPrice = () => {
    const count = parseInt(numPassengers.value) || 1;
    const selectedClass = seatClass.value;
    const multiplier = seatData[selectedClass].multiplier;
    const basePrice = selectedFlight.pricePerPerson;
    const total = basePrice * multiplier * count;
    const classLabel = seatData[selectedClass].title;

    // tampilan label dan breakdown berbeda tergantung jumlah penumpang
    if (count > 1) {
      passengerLabel.innerText = "Lead Passenger Name";
      leadSubtitle.classList.remove("d-none"); // tampilkan keterangan "booking atas nama..."
      if (selectedClass === "economy") {
        priceBreakdown.innerHTML = `${count} passengers &times; S$ ${basePrice.toLocaleString()}`;
      } else {
        priceBreakdown.innerHTML = `${count} passengers &times; S$ ${basePrice.toLocaleString()} &times; ${multiplier} (${classLabel})`;
      }
    } else {
      passengerLabel.innerText = "Full Name (as in Passport)";
      leadSubtitle.classList.add("d-none"); // sembunyikan keterangan lead passenger kalau cuma 1 orang
      if (selectedClass === "economy") {
        priceBreakdown.innerText = `S$ ${total.toLocaleString()} total`;
      } else {
        priceBreakdown.innerText = `S$ ${total.toLocaleString()} total (×${multiplier} ${classLabel})`;
      }
    }

    totalPriceDisplay.innerText = `S$ ${total.toLocaleString()}`;

    // return semua nilai agar bisa dipakai ulang tanpa hitung ulang
    return {
      total,
      breakdown: priceBreakdown.innerText,
      count,
      multiplier,
      basePrice,
      classLabel,
    };
  };

  /**
   * tampilkan tooltip detail kelas kursi saat user hover dropdown
   * isi tooltip diambil dari seatData berdasarkan nilai dropdown yang sedang aktif
   */
  const showTooltip = (val) => {
    const data = seatData[val];
    tooltipTitle.innerText = data.title;
    tooltipIcon.innerHTML = data.icon;
    tooltipBenefits.innerHTML = data.benefits
      .map((b) => `<li>${b}</li>`)
      .join("");

    seatTooltip.classList.remove("d-none");
    void seatTooltip.offsetWidth; // paksa browser hitung ulang layout agar transisi CSS berjalan dari awal
    seatTooltip.classList.add("show");
  };

  const hideTooltip = () => {
    seatTooltip.classList.remove("show");
    // tunggu animasi fade-out selesai (300ms) sebelum benar-benar disembunyikan dari DOM
    setTimeout(() => {
      if (!seatTooltip.classList.contains("show")) {
        seatTooltip.classList.add("d-none");
      }
    }, 300);
  };

  // tooltip muncul saat hover masuk, hilang saat hover keluar, update isinya saat pilihan berubah
  seatClass.addEventListener("mouseenter", () => showTooltip(seatClass.value));
  seatClass.addEventListener("mouseleave", hideTooltip);
  seatClass.addEventListener("change", () => {
    updateTotalPrice();
    showTooltip(seatClass.value);
  });

  /**
   * buat kode booking acak 6 karakter dengan prefix "CHG-"
   * tidak ada logika validasi di sini — murni untuk tampilan dummy
   */
  const generateRef = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "CHG-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // jalankan render awal saat halaman pertama dibuka
  renderSummary();
  updateTotalPrice();

  // update harga otomatis setiap kali jumlah penumpang berubah
  numPassengers.addEventListener("input", updateTotalPrice);

  // fitur reset form: membersihkan input, validasi, dan sessionStorage
  const resetFormBtn = document.getElementById("resetFormBtn");
  if (resetFormBtn) {
    resetFormBtn.addEventListener("click", () => {
      bookingForm.reset();
      // Kembalikan ke jumlah penumpang default dari pilihan flight sebelumnya
      numPassengers.value = selectedFlight.passengerCount;
      // Hapus data yang disimpan
      sessionStorage.removeItem("bookingFormData");
      // Hapus styling error validasi
      const fields = ["fullName", "email", "phone"];
      fields.forEach((fieldId) => {
        const el = document.getElementById(fieldId);
        el.classList.remove("is-invalid", "shake");
        if (fieldId === "phone") {
          const group = el.closest(".unified-phone-input");
          if (group) group.classList.remove("is-invalid", "shake");
        }
      });
      // Hitung ulang harga sesuai state form yang sudah reset
      updateTotalPrice();
    });
  }

  /**
   * Phone Code Dropdown: Show full name in list, show only code when selected.
   */
  const fullPhoneLabels = {
    "+65": "🇸🇬 +65 Singapore",
    "+62": "🇮🇩 +62 Indonesia",
    "+61": "🇦🇺 +61 Australia",
  };

  const updatePhoneCodeDisplay = (isFull) => {
    Array.from(phoneCode.options).forEach((opt) => {
      opt.text = isFull ? fullPhoneLabels[opt.value] : opt.value;
    });
  };

  // When focused/clicked, show full text so the list is readable
  phoneCode.addEventListener("mousedown", () => updatePhoneCodeDisplay(true));
  phoneCode.addEventListener("focus", () => updatePhoneCodeDisplay(true));

  // When changed or blurred, show only the short code
  phoneCode.addEventListener("change", () => updatePhoneCodeDisplay(false));
  phoneCode.addEventListener("blur", () => updatePhoneCodeDisplay(false));

  // Initial state: short
  updatePhoneCodeDisplay(false);

  /**
   * eksekusi final setelah user klik "Confirm Booking" di dalam modal
   * urutan: ambil semua data form → simpan ke localStorage history → tampilkan halaman konfirmasi
   */
  const completeBooking = () => {
    const priceData = updateTotalPrice();
    const reference = generateRef();
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phoneCode = document.getElementById("phoneCode").value;
    const phoneInput = document.getElementById("phone").value;
    const combinedPhone = `${phoneCode} ${phoneInput}`;
    const mealPreference = document.getElementById("mealPreference").value;

    // susun satu objek booking lengkap yang akan disimpan ke riwayat
    const bookingRecord = {
      reference,
      passengerName: fullName,
      email,
      phone: combinedPhone,
      seatClass: seatClass.value,
      passengerCount: priceData.count,
      mealPreference,
      route: `${selectedFlight.originCode} (${selectedFlight.origin}) → ${selectedFlight.destinationCode} (${selectedFlight.destination})`,
      date: selectedFlight.date,
      totalPrice: priceData.total,
      priceBreakdown: priceData.breakdown,
      airline: selectedFlight.airline,
      flightNumber: selectedFlight.flightNumber,
      departureTime: selectedFlight.departureTime,
      arrivalTime: selectedFlight.arrivalTime,
      arrivalDate: selectedFlight.arrivalDate || selectedFlight.date,
      stops: selectedFlight.stops,
      stopLabel: selectedFlight.stopLabel,
      timestamp: new Date().toISOString(), // waktu booking dibuat, ditampilkan di history.html
    };

    // ambil history yang sudah ada (kalau ada), tambahkan booking baru, simpan ulang
    // || [] artinya: kalau belum ada history sama sekali, mulai dengan array kosong
    const history = JSON.parse(localStorage.getItem("bookingHistory")) || [];
    history.push(bookingRecord);
    localStorage.setItem("bookingHistory", JSON.stringify(history));

    // isi halaman konfirmasi dengan data booking yang baru saja dibuat
    confRef.innerText = reference;
    confName.innerText = fullName;
    confNameLabel.innerText =
      priceData.count > 1 ? "Lead Passenger:" : "Passenger:";
    confRoute.innerHTML = `${selectedFlight.originCode} (${selectedFlight.origin}) → ${selectedFlight.destinationCode} (${selectedFlight.destination})`;
    document.getElementById("confStopLabel").innerText =
      selectedFlight.stopLabel;
    document.getElementById("confDepartureFull").innerText =
      `${selectedFlight.date} | ${selectedFlight.departureTime}`;
    document.getElementById("confArrivalFull").innerText =
      `${selectedFlight.arrivalDate || selectedFlight.date} | ${selectedFlight.arrivalTime}`;
    confPrice.innerText = `S$ ${priceData.total.toLocaleString()}`;

    // sembunyikan form, tampilkan kartu konfirmasi
    mainContent.classList.add("d-none");
    confirmationCard.classList.remove("d-none");

    // hapus data flight terpilih dari localStorage — sudah tidak dibutuhkan setelah booking selesai
    localStorage.removeItem("selectedFlight");

    // hapus data form dari session storage agar form kosong untuk booking berikutnya
    sessionStorage.removeItem("bookingFormData");

    window.scrollTo({ top: 0, behavior: "smooth" });
    confirmModal.hide();
  };

  // tangkap submit form — validasi dulu sebelum tampilkan modal konfirmasi
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault(); // cegah reload halaman default dari browser

    let isValid = true;
    let firstInvalid = null;
    const fields = ["fullName", "email", "phone"];

    fields.forEach((fieldId) => {
      const el = document.getElementById(fieldId);
      el.classList.remove("is-invalid", "shake");
      if (fieldId === "phone") {
        const group = el.closest(".unified-phone-input");
        if (group) group.classList.remove("is-invalid", "shake");
      }

      let isFieldValid = true;

      if (!el.value) {
        isFieldValid = false;
      } else if (fieldId === "email" && !el.value.includes("@")) {
        isFieldValid = false;
      } else if (fieldId === "phone") {
        // strip all characters except digits
        const strippedPhone = el.value.replace(/\D/g, "");
        const digitCount = strippedPhone.length;
        if (digitCount < 7 || digitCount > 12) {
          isFieldValid = false;
        }
      }

      if (!isFieldValid) {
        if (fieldId === "phone") {
          const group = el.closest(".unified-phone-input");
          if (group) group.classList.add("is-invalid", "shake");
          const errorMsg = group?.nextElementSibling;
          if (errorMsg?.classList.contains("error-message")) {
            errorMsg.innerText = "Please enter a valid phone number";
          }
          setTimeout(() => group?.classList.remove("shake"), 500);
        } else {
          el.classList.add("is-invalid", "shake");
          setTimeout(() => el.classList.remove("shake"), 500);
        }

        isValid = false;
        if (!firstInvalid) firstInvalid = el;
      }
    });

    // ERROR INVALID LANGSUNG DICARI DI FORM NY
    if (!isValid) {
      // scroll otomatis ke field yang bermasalah agar user langsung tahu harus isi apa
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // validasi lolos — susun isi modal konfirmasi sebelum ditampilkan
    const priceData = updateTotalPrice();
    const fullName = document.getElementById("fullName").value;

    modalSummary.innerHTML = `
      <div class="row g-2 small">
        <div class="col-6 text-muted">${priceData.count > 1 ? "Lead Passenger:" : "Full Name:"}</div>
        <div class="col-6 text-end fw-bold">${fullName}</div>
        <div class="col-6 text-muted">Route:</div>
        <div class="col-6 text-end fw-bold">${selectedFlight.originCode} (${selectedFlight.origin}) → ${selectedFlight.destinationCode} (${selectedFlight.destination})</div>
        <div class="col-6 text-muted">Route Type:</div>
        <div class="col-6 text-end fw-bold">${selectedFlight.stopLabel}</div>
        <div class="col-6 text-muted">Departure:</div>
        <div class="col-6 text-end fw-bold">${selectedFlight.date} | ${selectedFlight.departureTime}</div>
        <div class="col-6 text-muted">Arrival:</div>
        <div class="col-6 text-end fw-bold">${selectedFlight.arrivalDate || selectedFlight.date} | ${selectedFlight.arrivalTime}</div>
      </div>
    `;

    modalPriceBreakdown.innerHTML = `
      <table class="table table-sm table-borderless mb-0 small">
        <tbody>
          <tr>
            <td class="text-muted">Base price per person</td>
            <td class="text-end fw-bold">S$ ${priceData.basePrice.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="text-muted">Seat class multiplier (${priceData.classLabel})</td>
            <td class="text-end fw-bold">×${priceData.multiplier}</td>
          </tr>
          <tr>
            <td class="text-muted">Number of passengers</td>
            <td class="text-end fw-bold">${priceData.count}</td>
          </tr>
          <tr class="border-top">
            <td class="pt-2 fw-bold">Total</td>
            <td class="pt-2 text-end fw-bold text-gold h5 mb-0">S$ ${priceData.total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    `;

    confirmModal.show(); // tampilkan modal — user harus klik "Confirm Booking" untuk lanjut ke completeBooking
  });

  // tombol "Confirm Booking" di dalam modal — baru eksekusi booking setelah user yakin
  finalConfirmBtn.addEventListener("click", completeBooking);
});
