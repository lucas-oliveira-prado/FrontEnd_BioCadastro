﻿// API Configuration
const API_BASE_URL = 'https://backendbiocadastro-production.up.railway.app';

// Data mappings for better readability
const SEXO_MAP = { 0: 'Macho', 1: 'Fêmea' };
const RACA_MAP = { 1: 'Angus', 2: 'Holstein', 3: 'Nelore', 4: 'Brahman', 5: 'Simmental' };
const STATUS_MAP = { 0: 'Inativo', 1: 'Ativo', 2: 'Vendido' };

// API utility function
async function apiRequest(endpoint, options = {}) {
    return await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    });
}

// Notification system - only show success messages
function showMessage(message, type = 'info') {
    // Only show success messages, ignore error messages
    if (type === 'error') return;
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        border-radius: 5px; color: white; font-weight: bold; z-index: 10000;
        max-width: 300px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        background-color: ${type === 'success' ? '#28a745' : '#17a2b8'};
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function calculateAge(birthDate) {
    const diffDays = Math.ceil((new Date() - new Date(birthDate)) / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) return `${years} ano${years > 1 ? 's' : ''}`;
    if (months > 0) return `${months} mes${months > 1 ? 'es' : ''}`;
    return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
}

// Animal management functions
async function loadAnimals() {
    const response = await apiRequest('/animals');
    const animals = await response.json();
    displayAnimals(animals);
}

function displayAnimals(animals) {
    const tableBody = document.querySelector('.animal-table tbody');
    if (!tableBody) return;

    if (animals.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum animal cadastrado</td></tr>';
        return;
    }

    tableBody.innerHTML = animals.map(animal => `
        <tr>
            <td>${animal.id}</td>
            <td>${animal.nome}</td>
            <td>Bovino</td>
            <td>${RACA_MAP[animal.raca] || 'Não informado'}</td>
            <td>${SEXO_MAP[animal.sexo] || 'Não informado'}</td>
            <td>${calculateAge(animal.data_nascimento)}</td>
            <td class="action-buttons">
                <button class="btn-icon" onclick="showVaccinations(${animal.id})" title="Vacinas">
                    <img src="assets/botaoVacina.png" alt="Vacinas">
                </button>
                <button class="btn-icon" onclick="showWeights(${animal.id})" title="Peso">
                    <img src="assets/botaoPeso.png" alt="Peso">
                </button>
                <button class="btn-icon" onclick="editAnimal(${animal.id})" title="Editar">
                    <img src="assets/botaoEditar.png" alt="Editar">
                </button>
                <button class="btn-icon" onclick="deleteAnimal(${animal.id})" title="Excluir" style="background-color: #dc3545;">❌</button>
            </td>
        </tr>
    `).join('');
}

function setupAnimalForm() {
    const form = document.getElementById('animalForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const animalData = {
            nome: formData.get('nome'),
            sexo: parseInt(formData.get('sexo')),
            raca: parseInt(formData.get('raca')),
            data_nascimento: formData.get('data_nascimento'),
            status: parseInt(formData.get('status')) || 1
        };

        const response = await apiRequest('/animals', { method: 'POST', body: JSON.stringify(animalData) });
        showMessage('Animal cadastrado com sucesso!', 'success');
        form.reset();
        document.getElementById('cadastroAnimalModal').style.display = 'none';
    });
}

async function editAnimal(animalId) {
    const response = await apiRequest(`/animals/${animalId}`);
    const animal = await response.json();
    const modalContent = `
            <form id="editAnimalForm">
                <div class="form-group">
                    <label for="editNome">Nome</label>
                    <input type="text" id="editNome" name="nome" value="${animal.nome}">
                </div>
                <div class="form-group">
                    <label for="editSexo">Sexo</label>
                    <select id="editSexo" name="sexo">
                        <option value="0" ${animal.sexo === 0 ? 'selected' : ''}>Macho</option>
                        <option value="1" ${animal.sexo === 1 ? 'selected' : ''}>Fêmea</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editRaca">Raça</label>
                    <select id="editRaca" name="raca">
                        <option value="1" ${animal.raca === 1 ? 'selected' : ''}>Angus</option>
                        <option value="2" ${animal.raca === 2 ? 'selected' : ''}>Holstein</option>
                        <option value="3" ${animal.raca === 3 ? 'selected' : ''}>Nelore</option>
                        <option value="4" ${animal.raca === 4 ? 'selected' : ''}>Brahman</option>
                        <option value="5" ${animal.raca === 5 ? 'selected' : ''}>Simmental</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editDataNascimento">Data de Nascimento</label>
                    <input type="datetime-local" id="editDataNascimento" name="data_nascimento" 
                           value="${animal.data_nascimento.slice(0, 16)}">
                </div>
                <div class="form-group">
                    <label for="editStatus">Status</label>
                    <select id="editStatus" name="status">
                        <option value="0" ${animal.status === 0 ? 'selected' : ''}>Inativo</option>
                        <option value="1" ${animal.status === 1 ? 'selected' : ''}>Ativo</option>
                        <option value="2" ${animal.status === 2 ? 'selected' : ''}>Vendido</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('animalModal')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `;
        
        showModal('animalModal', 'Editar Animal', modalContent);
        
        document.getElementById('editAnimalForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updateData = {
                nome: formData.get('nome'),
                sexo: parseInt(formData.get('sexo')),
                raca: parseInt(formData.get('raca')),
                data_nascimento: formData.get('data_nascimento'),
                status: parseInt(formData.get('status'))
            };

            await apiRequest(`/animals/${animalId}`, { method: 'PUT', body: JSON.stringify(updateData) });
            showMessage('Animal atualizado!', 'success');
            closeModal('animalModal');
            loadAnimals();
        });
}

async function deleteAnimal(animalId) {
    if (!confirm('Excluir este animal?')) return;
    await apiRequest(`/animals/${animalId}`, { method: 'DELETE' });
    showMessage('Animal excluído!', 'success');
    loadAnimals();
}

// Add animal modal function
function showAddAnimalModal() {
    const modalContent = `
        <form id="addAnimalForm">
            <div class="form-row">
                <div class="form-group">
                    <label for="addNome">Nome do Animal</label>
                    <input type="text" id="addNome" name="nome">
                </div>
                
                <div class="form-group">
                    <label for="addSexo">Sexo</label>
                    <select id="addSexo" name="sexo">
                        <option value="">Selecione o sexo</option>
                        <option value="0">Macho</option>
                        <option value="1">Fêmea</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="addRaca">Raça</label>
                    <select id="addRaca" name="raca">
                        <option value="">Selecione a raça</option>
                        <option value="1">Angus</option>
                        <option value="2">Holstein</option>
                        <option value="3">Nelore</option>
                        <option value="4">Brahman</option>
                        <option value="5">Simmental</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="addDataNascimento">Data de Nascimento</label>
                    <input type="datetime-local" id="addDataNascimento" name="data_nascimento">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="addStatus">Status</label>
                    <select id="addStatus" name="status">
                        <option value="1">Ativo</option>
                        <option value="0">Inativo</option>
                        <option value="2">Vendido</option>
                    </select>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal('animalModal')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Cadastrar Animal</button>
            </div>
        </form>
    `;
    
    showModal('animalModal', 'Adicionar Animal', modalContent);
    
    document.getElementById('addAnimalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const animalData = {
            nome: formData.get('nome'),
            sexo: parseInt(formData.get('sexo')),
            raca: parseInt(formData.get('raca')),
            data_nascimento: formData.get('data_nascimento'),
            status: parseInt(formData.get('status')) || 1
        };

        const response = await apiRequest('/animals', { method: 'POST', body: JSON.stringify(animalData) });
        showMessage('Animal cadastrado com sucesso!', 'success');
        closeModal('animalModal');
        loadAnimals(); // Recarrega a lista de animais
    });
}

// Vaccination functions
async function showVaccinations(animalId) {
    const response = await apiRequest(`/animals/${animalId}/vaccinations`);
    const vaccinations = await response.json();
    let content = `
        <button class="btn btn-primary" onclick="addVaccination(${animalId})" style="margin-bottom: 20px;">+ Nova Vacinação</button>
        <h3>Histórico de Vacinações</h3>
    `;
    
    if (vaccinations.length === 0) {
        content += '<p>Nenhuma vacinação registrada.</p>';
    } else {
        content += '<table class="history-table"><thead><tr><th>Data</th><th>Nome</th><th>Ações</th></tr></thead><tbody>';
        vaccinations.forEach(vacc => {
            content += `
                <tr>
                    <td>${formatDate(vacc.data)}</td>
                    <td>${vacc.nome}</td>
                    <td><button onclick="deleteVaccination(${vacc.id}, ${animalId})">❌</button></td>
                </tr>
            `;
        });
        content += '</tbody></table>';
    }
    
    showModal('animalModal', 'Vacinações', content);
}

async function addVaccination(animalId) {
    const content = `
        <form id="vaccinationForm">
            <div class="form-group">
                <label for="nome">Nome da Vacina</label>
                <input type="text" id="nome" name="nome">
            </div>
            <div class="form-group">
                <label for="data">Data</label>
                <input type="datetime-local" id="data" name="data">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="showVaccinations(${animalId})">Voltar</button>
                <button type="submit" class="btn btn-primary">Registrar</button>
            </div>
        </form>
    `;
    
    showModal('animalModal', 'Nova Vacinação', content);
    
    document.getElementById('vaccinationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const vaccinationData = {
            animal_id: animalId,
            nome: formData.get('nome'),
            data: formData.get('data')
        };

        await apiRequest('/vaccinations', { method: 'POST', body: JSON.stringify(vaccinationData) });
        showMessage('Vacinação registrada!', 'success');
        showVaccinations(animalId);
    });
}

async function deleteVaccination(vaccinationId, animalId) {
    if (!confirm('Excluir vacinação?')) return;
    await apiRequest(`/vaccinations/${vaccinationId}`, { method: 'DELETE' });
    showMessage('Vacinação excluída!', 'success');
    showVaccinations(animalId);
}

// Weight functions
async function showWeights(animalId) {
    const response = await apiRequest(`/animals/${animalId}/weights`);
    const weights = await response.json();
    let content = `
        <button class="btn btn-primary" onclick="addWeight(${animalId})" style="margin-bottom: 20px;">+ Nova Pesagem</button>
        <h3>Histórico de Pesagens</h3>
    `;
    
    if (weights.length === 0) {
        content += '<p>Nenhuma pesagem registrada.</p>';
    } else {
        content += '<table class="history-table"><thead><tr><th>Data</th><th>Peso (kg)</th><th>Ações</th></tr></thead><tbody>';
        weights.forEach(weight => {
            content += `
                <tr>
                    <td>${formatDate(weight.data)}</td>
                    <td>${weight.peso}</td>
                    <td><button onclick="deleteWeight(${weight.id}, ${animalId})">❌</button></td>
                </tr>
            `;
        });
        content += '</tbody></table>';
    }
    
    showModal('animalModal', 'Pesagens', content);
}

async function addWeight(animalId) {
    const content = `
        <form id="weightForm">
            <div class="form-group">
                <label for="peso">Peso (kg)</label>
                <input type="number" id="peso" name="peso" step="0.1" min="0">
            </div>
            <div class="form-group">
                <label for="data">Data</label>
                <input type="datetime-local" id="data" name="data">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="showWeights(${animalId})">Voltar</button>
                <button type="submit" class="btn btn-primary">Registrar</button>
            </div>
        </form>
    `;
    
    showModal('animalModal', 'Nova Pesagem', content);
    
    document.getElementById('weightForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const weightData = {
            id_animal: animalId,
            peso: parseFloat(formData.get('peso')),
            data: formData.get('data')
        };

        await apiRequest('/weights', { method: 'POST', body: JSON.stringify(weightData) });
        showMessage('Pesagem registrada!', 'success');
        showWeights(animalId);
    });
}

async function deleteWeight(weightId, animalId) {
    if (!confirm('Excluir pesagem?')) return;
    await apiRequest(`/weights/${weightId}`, { method: 'DELETE' });
    showMessage('Pesagem excluída!', 'success');
    showWeights(animalId);
}

// Modal system
function showModal(modalId, title, content) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = content;
    modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    setupExistingModals();
    setupAnimalForm();
    if (document.querySelector('.animal-table')) loadAnimals();
    
    const btnAdicionarAnimal = document.getElementById('btnAdicionarAnimal');
    if (btnAdicionarAnimal) {
        btnAdicionarAnimal.addEventListener('click', () => {
            showAddAnimalModal();
        });
    }
});

function setupExistingModals() {
    const sobreModal = document.getElementById('sobreModal');
    const contatoModal = document.getElementById('contatoModal');
    const animalModal = document.getElementById('animalModal');
    
    // Modal triggers
    document.getElementById('btnSobre')?.addEventListener('click', (e) => {
        e.preventDefault();
        sobreModal.style.display = 'block';
    });
    
    document.getElementById('btnContato')?.addEventListener('click', (e) => {
        e.preventDefault();
        contatoModal.style.display = 'block';
    });

    document.getElementById('btnCadastroAnimal')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('cadastroAnimalModal').style.display = 'block';
    });

    // Close buttons
    document.getElementById('closeSobre')?.addEventListener('click', () => {
        sobreModal.style.display = 'none';
    });
    
    document.getElementById('closeContato')?.addEventListener('click', () => {
        contatoModal.style.display = 'none';
    });

    document.getElementById('closeCadastroAnimal')?.addEventListener('click', () => {
        document.getElementById('cadastroAnimalModal').style.display = 'none';
    });

    document.getElementById('cancelarCadastro')?.addEventListener('click', () => {
        document.getElementById('cadastroAnimalModal').style.display = 'none';
    });
    
    document.getElementById('closeAnimalModal')?.addEventListener('click', () => {
        animalModal.style.display = 'none';
    });

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === sobreModal) sobreModal.style.display = 'none';
        if (e.target === contatoModal) contatoModal.style.display = 'none';
        if (e.target === animalModal) animalModal.style.display = 'none';
        if (e.target === document.getElementById('cadastroAnimalModal')) {
            document.getElementById('cadastroAnimalModal').style.display = 'none';
        }
    });

    // Contact form
    document.getElementById('contatoForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showMessage('Mensagem enviada!', 'success');
        contatoModal.style.display = 'none';
        e.target.reset();
    });
}
