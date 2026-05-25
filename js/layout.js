function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getCurrentUserSafe() {
    try {
        if (typeof getUser === "function") {
            return getUser();
        }

        return JSON.parse(localStorage.getItem("cefiret_user") || "null");
    } catch (error) {
        return null;
    }
}

function getUserName(user) {
    if (!user) return "Usuario";

    return [
        user.nombre || "",
        user.apaterno || "",
        user.amaterno || ""
    ].join(" ").trim() || "Usuario";
}

function isPaciente(user) {
    return Number(user?.id_tipo_usuario || 0) === 3;
}

function isAdminOFisio(user) {
    const tipo = Number(user?.id_tipo_usuario || 0);
    return tipo === 1 || tipo === 2;
}

function getHomeByRole(user) {
    if (isPaciente(user)) {
        return "../paciente/perfil.html";
    }

    return "../dashboard/index.html";
}

function renderNavbar(active = "") {
    const nav = document.getElementById("appNavbar");

    if (!nav) return;

    const user = getCurrentUserSafe();
    const nombreUsuario = getUserName(user);
    const homeUrl = getHomeByRole(user);

    const pacienteMenu = `
        <li class="nav-item">
            <a class="nav-link ${active === "mi-info" ? "active" : ""}" href="../paciente/perfil.html">
                <i class="bi bi-person-circle"></i> Mi información
            </a>
        </li>

        <li class="nav-item">
            <a class="nav-link ${active === "rutinas" ? "active" : ""}" href="../paciente/rutinas.html">
                <i class="bi bi-activity"></i> Mis rutinas
            </a>
        </li>

        <li class="nav-item">
            <a class="nav-link ${active === "citas" ? "active" : ""}" href="../paciente/citas.html">
                <i class="bi bi-calendar-event"></i> Mis citas
            </a>
        </li>
    `;

    const adminMenu = `
        <li class="nav-item">
            <a class="nav-link ${active === "dashboard" ? "active" : ""}" href="../dashboard/index.html">
                <i class="bi bi-house-door"></i> Inicio
            </a>
        </li>

        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle ${["usuarios", "expedientes", "rutinas", "citas"].includes(active) ? "active" : ""}" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-grid"></i> Servicios
            </a>

            <ul class="dropdown-menu">
                <li>
                    <a class="dropdown-item" href="../usuarios/crear.html">
                        <i class="bi bi-person-plus"></i> Registrar usuario
                    </a>
                </li>

                <li>
                    <a class="dropdown-item" href="../usuarios/buscar.html">
                        <i class="bi bi-pencil-square"></i> Actualizar datos
                    </a>
                </li>

                <li>
                    <a class="dropdown-item" href="../expedientes/buscar.html">
                        <i class="bi bi-file-medical"></i> Consultar expediente
                    </a>
                </li>

                <li>
                    <a class="dropdown-item" href="../rutinas/index.html">
                        <i class="bi bi-activity"></i> Rutinas
                    </a>
                </li>

                <li>
                    <a class="dropdown-item" href="../citas/index.html">
                        <i class="bi bi-calendar-event"></i> Citas
                    </a>
                </li>
            </ul>
        </li>
    `;

    nav.innerHTML = `
        <div class="header">
            <div class="container">
                <div class="text-center">
                    <h3>CENTRO DE FISIOTERAPIA Y REHABILITACIÓN</h3>
                </div>
            </div>
        </div>

        <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
            <div class="container">
                <a class="navbar-brand fw-bold" href="${homeUrl}">
                    CEFIRET
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        ${isPaciente(user) ? pacienteMenu : ""}
                        ${isAdminOFisio(user) ? adminMenu : ""}
                    </ul>

                    ${user ? `
                        <div class="d-flex align-items-center gap-3">
                            <div class="dropdown">
                                <button class="btn btn-outline-secondary btn-sm position-relative" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="btnNotificaciones">
                                    <i class="bi bi-bell"></i>
                                    <span id="notificacionBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none">
                                        0
                                    </span>
                                </button>

                                <div class="dropdown-menu dropdown-menu-end shadow" style="width: 340px; max-height: 420px; overflow-y: auto;">
                                    <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                                        <strong>Notificaciones</strong>
                                        <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none" id="btnMarcarTodas">
                                            Marcar todas
                                        </button>
                                    </div>

                                    <div id="listaNotificaciones">
                                        <div class="text-center text-muted p-3">
                                            Cargando...
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <span class="text-muted small d-none d-md-inline">
                                ${escapeHtml(nombreUsuario)}
                            </span>

                            <button id="logoutBtn" class="btn btn-outline-danger btn-sm">
                                Salir
                            </button>
                        </div>
                    ` : ""}
                </div>
            </div>
        </nav>
    `;

    configurarLogout();
    cargarNotificaciones();

    setInterval(() => {
        cargarNotificaciones(false);
    }, 30000);
}

function configurarLogout() {
    const btn = document.getElementById("logoutBtn");

    if (!btn) return;

    btn.addEventListener("click", async () => {
        try {
            await apiFetch("/api/logout", {
                method: "POST"
            });
        } catch (error) {
            console.warn("No se pudo cerrar sesión en backend:", error);
        }

        clearSession();
        window.location.href = "../auth/login.html";
    });
}

async function cargarNotificaciones(mostrarCarga = true) {
    const lista = document.getElementById("listaNotificaciones");
    const badge = document.getElementById("notificacionBadge");
    const btnMarcarTodas = document.getElementById("btnMarcarTodas");

    if (!lista || !badge) return;

    if (mostrarCarga) {
        lista.innerHTML = `
            <div class="text-center text-muted p-3">
                Cargando...
            </div>
        `;
    }

    try {
        const data = await apiFetch("/api/notificaciones");

        const notificaciones = data.notificaciones || [];
        const noLeidas = Number(data.no_leidas || 0);

        if (noLeidas > 0) {
            badge.textContent = noLeidas > 99 ? "99+" : noLeidas;
            badge.classList.remove("d-none");
        } else {
            badge.classList.add("d-none");
        }

        if (btnMarcarTodas) {
            btnMarcarTodas.onclick = async () => {
                await marcarTodasNotificaciones();
            };
        }

        if (notificaciones.length === 0) {
            lista.innerHTML = `
                <div class="text-center text-muted p-3">
                    No tienes notificaciones.
                </div>
            `;
            return;
        }

        lista.innerHTML = notificaciones.map((notificacion) => {
            const leida = Number(notificacion.leida || 0) === 1;

            return `
                <div class="px-3 py-2 border-bottom ${leida ? "" : "bg-light"}">
                    <div class="d-flex justify-content-between gap-2">
                        <div>
                            <div class="small ${leida ? "text-muted" : "fw-bold"}">
                                ${escapeHtml(notificacion.mensaje || "")}
                            </div>

                            <div class="text-muted" style="font-size: 12px;">
                                ${escapeHtml(notificacion.fecha || "")}
                            </div>
                        </div>

                        ${!leida ? `
                            <button class="btn btn-link btn-sm p-0 text-decoration-none" onclick="marcarNotificacionLeida(${Number(notificacion.id_notificacion)})">
                                Leída
                            </button>
                        ` : ""}
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        lista.innerHTML = `
            <div class="text-center text-danger p-3">
                No se pudieron cargar las notificaciones.
            </div>
        `;
    }
}

async function marcarNotificacionLeida(id) {
    try {
        await apiFetch(`/api/notificaciones/${id}/leida`, {
            method: "PUT"
        });

        await cargarNotificaciones(false);
    } catch (error) {
        console.error("Error al marcar notificación como leída:", error);
    }
}

async function marcarTodasNotificaciones() {
    try {
        await apiFetch("/api/notificaciones/marcar-todas-leidas", {
            method: "PUT"
        });

        await cargarNotificaciones(false);
    } catch (error) {
        console.error("Error al marcar todas las notificaciones:", error);
    }
}

function protegerPaginaAdminOFisio() {
    const user = getCurrentUserSafe();

    if (!user) {
        window.location.href = "../auth/login.html";
        return;
    }

    if (!isAdminOFisio(user)) {
        window.location.href = "../paciente/perfil.html";
    }
}

function protegerPaginaPaciente() {
    const user = getCurrentUserSafe();

    if (!user) {
        window.location.href = "../auth/login.html";
        return;
    }

    if (!isPaciente(user)) {
        window.location.href = "../dashboard/index.html";
    }
}