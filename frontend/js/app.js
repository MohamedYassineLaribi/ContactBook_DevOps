const API = '/api/contacts';
const modal = new bootstrap.Modal(document.getElementById('modal'));
const $ = (id) => document.getElementById(id);

function showError(msg) {
  const a = $('alert');
  a.textContent = msg;
  a.classList.toggle('d-none', !msg);
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

async function load() {
  try {
    const q = $('search').value.trim();
    const res = await fetch(q ? `${API}?search=${encodeURIComponent(q)}` : API);
    if (!res.ok) throw new Error();
    const contacts = await res.json();
    showError('');
    $('contacts').innerHTML = contacts.map((c) => `
      <tr>
        <td>${c.id}</td><td>${esc(c.nom)}</td><td>${esc(c.prenom)}</td>
        <td>${esc(c.email)}</td><td>${esc(c.telephone)}</td><td>${esc(c.adresse)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" onclick='editContact(${JSON.stringify(c).replace(/'/g, '&#39;')})'>Modifier</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteContact(${c.id})">Supprimer</button>
        </td>
      </tr>`).join('');
    $('empty').classList.toggle('d-none', contacts.length > 0);
  } catch {
    showError('Impossible de charger les contacts.');
  }
}

function openForm(c = {}) {
  $('modal-title').textContent = c.id ? 'Modifier le contact' : 'Nouveau contact';
  $('f-id').value = c.id || '';
  ['nom', 'prenom', 'email', 'telephone', 'adresse'].forEach((k) => { $('f-' + k).value = c[k] || ''; });
  modal.show();
}
window.editContact = openForm;

window.deleteContact = async (id) => {
  if (!confirm('Supprimer ce contact ?')) return;
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) showError('Suppression impossible.');
  load();
};

$('btn-add').addEventListener('click', () => openForm());

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('f-id').value;
  const body = {};
  ['nom', 'prenom', 'email', 'telephone', 'adresse'].forEach((k) => { body[k] = $('f-' + k).value; });
  const res = await fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    showError(data.error || "Erreur lors de l'enregistrement.");
  } else {
    showError('');
  }
  modal.hide();
  load();
});

let timer;
$('search').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(load, 250); });

load();
