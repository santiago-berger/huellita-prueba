document.getElementById('btn-guardar').addEventListener('click', async (e) => {
  e.preventDefault();

  const especie = document.getElementById('especie').value;
  const zona = document.getElementById('zona').value;
  const fecha = document.getElementById('fecha').value;

  console.log("DEBUG INPUTS:", { especie, zona, fecha });

  if (!especie || !zona || !fecha) {
    alert("Faltan datos");
    return;
  }

  const formData = new FormData();

  for (let [k, v] of [
    ["nombre_mascota", document.getElementById('nombre_mascota').value],
    ["especie", especie],
    ["raza", document.getElementById('raza').value],
    ["color", document.getElementById('color').value],
    ["tamano", document.getElementById('tamano').value],
    ["zona", zona],
    ["fecha", fecha],
    ["comentario", document.getElementById('comentario').value],
    ["estado", document.getElementById('tipo').value],
    ["latitud", lat],
    ["longitud", lng],
  ]) {
    formData.append(k, v);
  }

  const foto = document.getElementById('foto').files[0];
  if (foto) formData.append('foto', foto);

  const resp = await fetch('/reportes', {
    method: 'POST',
    body: formData
  });

  const data = await resp.json();

  console.log("RESPUESTA BACKEND:", data);

  if (!resp.ok) {
    alert(JSON.stringify(data));
    return;
  }

  alert("Publicado OK");
  window.location.href = "reportes.html";
});