function renderNavbar(active = "") {
  const user = getUser();
  const nav = document.getElementById("appNavbar");
  if (!nav) return;
  nav.innerHTML = `
 <div class="header"><div class="container"><div class="text-center"><h3>CENTRO DE FISIOTERAPIA Y REHABILITACION</h3></div></div></div>
 <nav class="navbar navbar-expand-lg navbar-light"><div class="container">
 <a class="navbar-brand fw-bold" href="../dashboard/index.html">CEFIRET</a>
 <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span class="navbar-toggler-icon"></span></button>
 <div class="collapse navbar-collapse" id="navbarNav"><ul class="navbar-nav me-auto">
 <li class="nav-item"><a class="nav-link ${active === "dashboard" ? "active" : ""}" href="../dashboard/index.html">Inicio</a></li>
 <li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Servicios</a>
 <ul class="dropdown-menu">
 <li><a class="dropdown-item" href="../usuarios/crear.html">Registrar usuario</a></li>
 <li><a class="dropdown-item" href="../usuarios/buscar.html">Actualizar datos</a></li>
 <li><a class="dropdown-item" href="../expedientes/buscar.html">Consultar expediente</a></li>
 <li><a class="dropdown-item" href="../rutinas/index.html">Rutinas</a></li>
 <li><a class="dropdown-item" href="../citas/index.html">Citas</a></li>
 </ul></li></ul>${user ? '<button id="logoutBtn" class="btn btn-outline-danger">Salir</button>' : ""}</div></div></nav>`;
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", async () => {
      try {
        await apiFetch("/api/logout", {
          method: "POST",
          body: JSON.stringify({}),
        });
      } catch (e) {}
      clearSession();
      window.location.href = "../auth/login.html";
    });
  }
}
