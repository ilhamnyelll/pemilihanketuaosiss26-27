const SUPABASE_URL =
  "GANTI_DENGAN_PROJECT_URL";

const SUPABASE_KEY =
  "GANTI_DENGAN_PUBLISHABLE_KEY";


const db =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


const candidates = [
  {
    no: 1,
    foto: "paslon1.png"
  },

  {
    no: 2,
    foto: "https://placehold.co/500x500?text=Paslon+2"
  },

  {
    no: 3,
    foto: "https://placehold.co/500x500?text=Paslon+3"
  }
];


let currentVoter = null;

let selectedCandidate = null;


// ==============================
// ABSEN 1 - 36
// ==============================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const select =
      document.getElementById(
        "voterAbsent"
      );


    for (
      let i = 1;
      i <= 36;
      i++
    ) {

      const option =
        document.createElement(
          "option"
        );

      option.value = i;

      option.textContent =
        `Absen ${i}`;

      select.appendChild(
        option
      );

    }

  }
);


// ==============================
// LOGIN
// ==============================

async function loginVoter() {

  const name =
    document
      .getElementById("voterName")
      .value
      .trim();


  const className =
    document
      .getElementById("voterClass")
      .value;


  const absent =
    document
      .getElementById("voterAbsent")
      .value;


  const msg =
    document.getElementById(
      "loginMsg"
    );


  msg.textContent = "";


  if (!name) {

    msg.textContent =
      "Nama siswa wajib diisi.";

    return;

  }


  if (!className) {

    msg.textContent =
      "Pilih kelas.";

    return;

  }


  if (!absent) {

    msg.textContent =
      "Pilih nomor absen.";

    return;

  }


  const button =
    document.getElementById(
      "startButton"
    );


  button.disabled = true;

  button.textContent =
    "Memeriksa...";


  try {

    const {
      data,
      error
    } = await db
      .from("votes")
      .select("id")
      .eq(
        "class_name",
        className
      )
      .eq(
        "absent",
        Number(absent)
      )
      .limit(1);


    if (error) {
      throw error;
    }


    if (
      data &&
      data.length > 0
    ) {

      msg.textContent =
        "Kelas dan nomor absen ini sudah melakukan voting.";

      return;

    }


    currentVoter = {

      name,

      className,

      absent:
        Number(absent)

    };


    document
      .getElementById(
        "loginPage"
      )
      .classList.add(
        "d-none"
      );


    document
      .getElementById(
        "votePage"
      )
      .classList.remove(
        "d-none"
      );


    renderCandidates();


  } catch (error) {

    console.error(error);

    msg.textContent =
      "Tidak dapat terhubung ke database.";

  } finally {

    button.disabled = false;

    button.textContent =
      "Mulai Voting";

  }

}


// ==============================
// PASLON
// ==============================

function renderCandidates() {

  const box =
    document.getElementById(
      "candidateList"
    );


  box.innerHTML =
    candidates.map(
      candidate => `

        <div class="col-12 col-md-4">

          <div
            class="card candidate-card shadow-sm p-3"
          >

            <img
              src="${escapeHTML(candidate.foto)}"
              class="candidate-photo"
              alt="Paslon ${candidate.no}"
            >

            <h3 class="text-center mt-3">
              Paslon ${candidate.no}
            </h3>

            <button
              class="btn btn-primary btn-lg w-100"
              onclick="openConfirm(${candidate.no})"
            >
              Pilih Paslon ${candidate.no}
            </button>

          </div>

        </div>

      `
    ).join("");

}


// ==============================
// KONFIRMASI
// ==============================

function openConfirm(no) {

  selectedCandidate =
    candidates.find(
      candidate =>
        candidate.no === no
    );


  document.getElementById(
    "confirmText"
  ).innerHTML = `

    <p>
      Anda memilih:
    </p>

    <h2 class="text-primary">
      PASLON ${no}
    </h2>

    <p class="text-danger">
      Pilihan tidak dapat diubah.
    </p>

  `;


  bootstrap.Modal
    .getOrCreateInstance(
      document.getElementById(
        "confirmModal"
      )
    )
    .show();

}


// ==============================
// SIMPAN SUARA
// ==============================

async function confirmVote() {

  if (
    !currentVoter ||
    !selectedCandidate
  ) {
    return;
  }


  const button =
    document.getElementById(
      "confirmButton"
    );


  button.disabled = true;

  button.textContent =
    "Menyimpan...";


  try {

    const {
      error
    } = await db
      .from("votes")
      .insert({

        name:
          currentVoter.name,

        class_name:
          currentVoter.className,

        absent:
          currentVoter.absent,

        candidate:
          selectedCandidate.no

      });


    if (error) {

      if (
        error.code ===
        "23505"
      ) {

        alert(
          "Kelas dan nomor absen tersebut sudah voting."
        );

      } else {

        console.error(error);

        alert(
          "Suara gagal disimpan."
        );

      }

      return;

    }


    const modal =
      bootstrap.Modal
        .getInstance(
          document.getElementById(
            "confirmModal"
          )
        );


    if (modal) {
      modal.hide();
    }


    document
      .getElementById(
        "votePage"
      )
      .classList.add(
        "d-none"
      );


    document
      .getElementById(
        "thankPage"
      )
      .classList.remove(
        "d-none"
      );


    currentVoter = null;

    selectedCandidate = null;


  } catch (error) {

    console.error(error);

    alert(
      "Terjadi kesalahan koneksi."
    );

  } finally {

    button.disabled = false;

    button.textContent =
      "Ya, Pilih";

  }

}


// ==============================
// KEAMANAN HTML
// ==============================

function escapeHTML(value) {

  return String(value)
    .replace(
      /[&<>"']/g,

      character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

      })[character]
    );

}
