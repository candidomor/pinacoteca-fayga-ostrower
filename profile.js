/**
 * Sistema de Perfis Adaptativos — Pinacoteca Fayga Ostrower
 * Gerencia onboarding, seleção de perfil e badge na navbar.
 * Dados persistidos em localStorage. Sem backend.
 */

(function () {
    'use strict';

    const PROFILES = [
        {
            id: 'visitor',
            icon: '👁️',
            name: 'Visitante',
            desc: 'Quero explorar o acervo livremente, descobrindo obras e aprendendo mais sobre a artista.',
        },
        {
            id: 'researcher',
            icon: '🔬',
            name: 'Pesquisador',
            desc: 'Preciso de informações técnicas detalhadas: fichas catalográficas, inventário e referências.',
        },
        {
            id: 'student',
            icon: '🎓',
            name: 'Estudante',
            desc: 'Estou estudando a obra de Fayga Ostrower e busco contexto histórico e materiais de apoio.',
        },
        {
            id: 'curator',
            icon: '🏛️',
            name: 'Curador',
            desc: 'Trabalho com gestão de acervos e preciso de acesso a metadados completos e ferramentas curatoriais.',
        },
    ];

    // ---------------------------------------------------
    //  Helpers
    // ---------------------------------------------------
    function getProfile() {
        try { return JSON.parse(localStorage.getItem('pinacotecaProfile')); }
        catch(e) { return null; }
    }

    function saveProfile(profile) {
        try { localStorage.setItem('pinacotecaProfile', JSON.stringify(profile)); }
        catch(e) {}
    }

    function clearProfile() {
        try { localStorage.removeItem('pinacotecaProfile'); }
        catch(e) {}
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'profile-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // ---------------------------------------------------
    //  Onboarding Overlay (first visit)
    // ---------------------------------------------------
    function showOnboarding() {
        const cardsHtml = PROFILES.map(p => `
            <button class="profile-card" data-profile-id="${p.id}" aria-label="Selecionar perfil ${p.name}">
                <span class="profile-card-icon">${p.icon}</span>
                <div class="profile-card-name">${p.name}</div>
                <div class="profile-card-desc">${p.desc}</div>
            </button>
        `).join('');

        const overlayHtml = `
            <div class="profile-overlay" id="profileOverlay" role="dialog" aria-modal="true" aria-label="Selecione seu perfil">
                <div class="profile-onboarding">
                    <div class="profile-onboarding-header">
                        <button class="profile-onboarding-skip" id="profileOnboardingSkip" aria-label="Ignorar e continuar sem perfil">
                            Ignorar ✕
                        </button>
                        <h2>Bem-vindo(a) ao Acervo</h2>
                        <p>Para personalizar sua experiência, selecione o perfil que melhor descreve você.</p>
                    </div>
                    <div class="profile-cards-grid">
                        ${cardsHtml}
                    </div>
                    <div class="profile-onboarding-footer">
                        <button class="profile-skip-link" id="profileSkipLink">
                            Continuar sem selecionar um perfil
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', overlayHtml);

        const overlay = document.getElementById('profileOverlay');

        function dismissOverlay() {
            overlay.style.transition = 'opacity 0.3s';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 350);
        }

        // Skip buttons
        document.getElementById('profileOnboardingSkip').addEventListener('click', () => {
            saveProfile({ id: 'none', name: 'Sem perfil', icon: '👤' });
            dismissOverlay();
            renderBadge();
        });

        document.getElementById('profileSkipLink').addEventListener('click', () => {
            saveProfile({ id: 'none', name: 'Sem perfil', icon: '👤' });
            dismissOverlay();
            renderBadge();
        });

        // Close on overlay backdrop click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                saveProfile({ id: 'none', name: 'Sem perfil', icon: '👤' });
                dismissOverlay();
                renderBadge();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape' && document.getElementById('profileOverlay')) {
                saveProfile({ id: 'none', name: 'Sem perfil', icon: '👤' });
                dismissOverlay();
                renderBadge();
                document.removeEventListener('keydown', escHandler);
            }
        });

        // Profile card selection
        overlay.querySelectorAll('.profile-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-profile-id');
                const profile = PROFILES.find(p => p.id === id);
                if (profile) {
                    saveProfile(profile);
                    dismissOverlay();
                    renderBadge();
                    showToast(`${profile.icon} Perfil "${profile.name}" ativado!`);
                }
            });
        });
    }

    // ---------------------------------------------------
    //  Navbar Badge + Dropdown
    // ---------------------------------------------------
    function renderBadge() {
        // Remove previous badge if any
        const existing = document.getElementById('profileNavBadge');
        if (existing) existing.remove();

        const profile = getProfile();
        if (!profile) return;

        const displayIcon = profile.icon || '👤';
        const displayName = profile.id === 'none' ? 'Sem perfil' : profile.name;

        const badgeHtml = `
            <li class="profile-badge" id="profileNavBadge" role="button" tabindex="0"
                aria-haspopup="true" aria-expanded="false" aria-label="Perfil ativo: ${displayName}. Clique para trocar">
                <span class="profile-badge-avatar">${displayIcon}</span>
                <span class="profile-badge-label">${displayName}</span>
                <i class="fas fa-chevron-down profile-badge-chevron"></i>

                <div class="profile-dropdown" id="profileDropdown" role="menu">
                    <div class="profile-dropdown-header">Trocar perfil</div>
                    ${PROFILES.map(p => `
                        <button class="profile-dropdown-item ${profile.id === p.id ? 'active' : ''}"
                            data-switch-profile="${p.id}" role="menuitem">
                            <span class="item-icon">${p.icon}</span>
                            <span>${p.name}</span>
                            <i class="fas fa-check item-check"></i>
                        </button>
                    `).join('')}
                    <button class="profile-dropdown-item ${profile.id === 'none' ? 'active' : ''}"
                        data-switch-profile="none" role="menuitem">
                        <span class="item-icon">👤</span>
                        <span>Sem perfil</span>
                        <i class="fas fa-check item-check"></i>
                    </button>
                    <div class="profile-dropdown-footer">
                        <button class="profile-dropdown-reset" id="profileResetBtn">
                            <i class="fas fa-undo"></i> Redefinir (ver onboarding)
                        </button>
                    </div>
                </div>
            </li>
        `;

        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;
        navLinks.insertAdjacentHTML('beforeend', badgeHtml);

        const badge = document.getElementById('profileNavBadge');
        const dropdown = document.getElementById('profileDropdown');

        // Toggle dropdown
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('open');
            badge.classList.toggle('open', isOpen);
            badge.setAttribute('aria-expanded', isOpen);
        });

        badge.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                badge.click();
            }
        });

        // Close on outside click
        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
            badge.classList.remove('open');
            badge.setAttribute('aria-expanded', 'false');
        });

        // Switch profile from dropdown
        dropdown.querySelectorAll('[data-switch-profile]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-switch-profile');
                if (id === 'none') {
                    saveProfile({ id: 'none', name: 'Sem perfil', icon: '👤' });
                    renderBadge();
                    showToast('👤 Navegando sem perfil selecionado');
                } else {
                    const p = PROFILES.find(x => x.id === id);
                    if (p) {
                        saveProfile(p);
                        renderBadge();
                        showToast(`${p.icon} Perfil alterado para "${p.name}"`);
                    }
                }
            });
        });

        // Reset → clear storage and show onboarding again
        const resetBtn = document.getElementById('profileResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearProfile();
                renderBadge();
                showOnboarding();
            });
        }
    }

    // ---------------------------------------------------
    //  Init
    // ---------------------------------------------------
    function init() {
        const profile = getProfile();

        if (!profile) {
            // First visit: show onboarding
            showOnboarding();
        } else {
            // Returning visit: just render the badge
            renderBadge();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
