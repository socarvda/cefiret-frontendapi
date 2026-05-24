function renderNavbar(active = "") {
  const user = getUser();
  const nav = document.getElementById("appNavbar");

  if (!nav) return;

  nav.innerHTML = `
    <div class="header">
      <div class="container">
        <div class="text-center">
          <h3>CENTRO DE FISIOTERAPIA Y REHABILITACION</h3>
        </div>
      </div>
    </div>

    <nav class="navbar navbar-expand-lg navbar-light">
      <div class="container">
        <a class="navbar-brand fw-bold" href="../dashboard/index.html">CEFIRET</a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link ${active === "dashboard" ? "active" : ""}" href="../dashboard/index.html">
                Inicio
              </a>
            </li>

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                Servicios
              </a>

              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" href="../usuarios/crear.html">
                    Registrar usuario
                  </a>
                </li>

                <li>
                  <a class="dropdown-item" href="../usuarios/buscar.html">
                    Actualizar datos
                  </a>
                </li>

                <li>
                  <a class="dropdown-item" href="../expedientes/buscar.html">
                    Consultar expediente
                  </a>
                </li>

                <li>
                  <a class="dropdown-item" href="../rutinas/index.html">
                    Rutinas
                  </a>
                </li>

                <li>
                  <a class="dropdown-item" href="../citas/index.html">
                    Citas
                  </a>
                </li>
              </ul>
            </li>
          </ul>

          ${
            user
              ? `
                <div class="dropdown me-2">
                  <button
                    class="btn btn-outline-secondary position-relative"
                    type="button"
                    id="notificacionesDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    title="Notificaciones">
                    <i class="bi bi-bell"></i>

                    <span
                      id="notificacionesBadge"
                      class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style="display:none;">
                      0
                    </span>
                  </button>

                  <div
                    class="dropdown-menu dropdown-menu-end shadow"
                    aria-labelledby="notificacionesDropdown"
                    style="width: 360px; max-height: 450px; overflow-y: auto;">

                    <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                      <strong>Notificaciones</strong>

                      <button
                        id="marcarTodasNotificacionesBtn"
                        class="btn btn-sm btn-link text-decoration-none">
                        Marcar leídas
                      </button>
                    </div>

                    <div id="notificacionesLista">
                      <div class="text-center text-muted py-3">
                        Cargando...
                      </div>
                    </div>
                  </div>
                </div>

                <button id="logoutBtn" class="btn btn-outline-danger">
                  Salir
                </button>
              `
              : ""
          }
        </div>
      </div>
    </nav>
  `;

  const btn = document.getElementById("logoutBtn");

  if (btn) {
    btn.addEventListener("click", async () => {
      try {
        await apiFetch("/api/logout", {
          method: "POST",
          body: JSON.stringify({}),
        });
      } catch (error) {
        console.warn("No se pudo cerrar sesión en el servidor:", error);
      }

      clearSession();

      window.location.href = ROUTES?.login || "../auth/login.html";
    });
  }

  if (user) {
    inicializarNotificacionesNavbar();
  }
}

async function inicializarNotificacionesNavbar() {
  await cargarNotificacionesNavbar();

  const marcarTodasBtn = document.getElementById("marcarTodasNotificacionesBtn");

  if (marcarTodasBtn) {
    marcarTodasBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await apiFetch("/api/notificaciones/marcar-todas-leidas", {
          method: "PUT",
          body: JSON.stringify({}),
        });

        await cargarNotificacionesNavbar();
      } catch (error) {
        console.error("Error al marcar todas como leídas:", error);
      }
    });
  }

  setInterval(cargarNotificacionesNavbar, 30000);
}

async function cargarNotificacionesNavbar() {
  const lista = document.getElementById("notificacionesLista");
  const badge = document.getElementById("notificacionesBadge");

  if (!lista || !badge) return;

  try {
    const data = await apiFetch("/api/notificaciones");

    const notificaciones = data.notificaciones || [];
    const noLeidas = Number(data.no_leidas || 0);

    if (noLeidas > 0) {
      badge.textContent = noLeidas > 99 ? "99+" : noLeidas;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }

    if (!notificaciones.length) {
      lista.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="bi bi-bell-slash fs-3 d-block mb-2"></i>
          No tienes notificaciones.
        </div>
      `;
      return;
    }

    lista.innerHTML = notificaciones.slice(0, 10).map((noti) => {
      const leida = Number(noti.leida) === 1;

      return `
        <button
          type="button"
          class="dropdown-item text-wrap py-3 border-bottom ${leida ? "" : "bg-light"}"
          onclick="marcarNotificacionLeida(${noti.id_notificacion})">

          <div class="d-flex gap-2">
            <div>
              <i class="bi ${leida ? "bi-bell" : "bi-bell-fill"} ${leida ? "text-muted" : "text-primary"}"></i>
            </div>

            <div class="flex-grow-1">
              <div class="${leida ? "text-muted" : "fw-semibold"}" style="white-space: normal;">
                ${escapeHtml(noti.mensaje)}
              </div>

              <small class="text-muted">
                ${formatDateTime(noti.fecha)}
              </small>
            </div>
          </div>
        </button>
      `;
    }).join("");
  } catch (error) {
    console.error("Error al cargar notificaciones:", error);

    lista.innerHTML = `
      <div class="text-center text-danger py-3">
        Error al cargar notificaciones.
      </div>
    `;
  }
}

async function marcarNotificacionLeida(id) {
  try {
    await apiFetch(`/api/notificaciones/${id}/leida`, {
      method: "PUT",
      body: JSON.stringify({}),
    });

    await cargarNotificacionesNavbar();
  } catch (error) {
    console.error("Error al marcar notificación:", error);
  }
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value).replace(" ", "T"));

  if (isNaN(date)) {
    return value;
  }

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}