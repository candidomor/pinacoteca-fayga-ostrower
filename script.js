let images = [];

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');

    // Shared Navbar Logic
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Fetch Fake Basic Database
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            if(data && data.obras) {
                images = data.obras;
                
                // Route to correct init
                if (window.location.pathname.includes('obra.html') || window.location.search.includes('?id=')) {
                    initObraPage();
                } else {
                    initGalleryPage();
                }
            }
        })
        .catch(err => {
            console.error("Erro ao carregar o banco de dados básico:", err);
            const mainContainer = document.getElementById('obra-main-container') || document.getElementById('gallery');
            if (mainContainer) {
                mainContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">Erro ao carregar o acervo. Tente novamente mais tarde.</div>';
            }
        });

    // Helper to create a single card element
    function createCard(item) {
        const card = document.createElement('a');
        card.className = 'card';
        card.href = `obra.html?id=${item.id}`;
        card.style.textDecoration = 'none';
        card.innerHTML = `
            <div class="card-image">
                <img src="${item.src}" alt="${item.title}" loading="lazy">
                ${item.similarityMsg ? `<div class="similarity-overlay">${item.similarityMsg}</div>` : ''}
            </div>
            <div class="card-info">
                <div class="card-title">${item.title}</div>
                <div class="card-meta">
                    <span><i class="fas fa-palette" style="opacity: 0.7; width: 16px;"></i> <b>Autoria:</b> Fayga Ostrower</span>
                    <span><i class="fas fa-layer-group" style="opacity: 0.7; width: 16px;"></i> <b>Técnica:</b> ${item.technique}</span>
                    <span><i class="fas fa-calendar-alt" style="opacity: 0.7; width: 16px;"></i> <b>Ano:</b> ${item.year}</span>
                    <span><i class="fas fa-map-marker-alt" style="opacity: 0.7; width: 16px;"></i> <b>Local:</b> ${item.city || 'São Paulo'}</span>
                </div>
                <div style="margin-top: 1rem; text-align: right;">
                    <span class="btn-ghost" style="border-radius: 4px; font-size: 0.85rem; padding: 6px 10px;">Ver Obra <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        `;
        return card;
    }

    // Pagination state for the main gallery
    let paginationState = {
        allItems: [],
        visibleCount: 0,
        initialCount: 4,
        increment: 6,
        isSearchActive: false
    };

    // Render paginated gallery (with load-more controls)
    function renderGalleryPaginated(items, reset = true) {
        const gallery = document.getElementById('gallery');
        if (!gallery) return;

        if (reset) {
            paginationState.allItems = items;
            paginationState.visibleCount = paginationState.initialCount;
            gallery.innerHTML = '';
        }

        if (paginationState.allItems.length === 0) {
            gallery.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">Nenhuma obra encontrada.</div>';
            updateLoadMoreControls();
            return;
        }

        const toShow = paginationState.allItems.slice(0, paginationState.visibleCount);

        // On reset, clear and render all visible cards
        if (reset) {
            toShow.forEach(item => gallery.appendChild(createCard(item)));
        } else {
            // Append only newly added cards
            const prevCount = gallery.querySelectorAll('.card').length;
            toShow.slice(prevCount).forEach(item => gallery.appendChild(createCard(item)));
        }

        updateLoadMoreControls();
        updateResultsCount();
    }

    function updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (!resultsCount) return;
        const total = paginationState.allItems.length;
        const visible = Math.min(paginationState.visibleCount, total);
        if (paginationState.isSearchActive) {
            resultsCount.textContent = `Exibindo ${total} resultado${total !== 1 ? 's' : ''}`;
        } else {
            resultsCount.textContent = `Exibindo ${visible} de ${total} obras`;
        }
    }

    function updateLoadMoreControls() {
        let controls = document.getElementById('load-more-controls');
        const gallery = document.getElementById('gallery');
        if (!gallery) return;

        const total = paginationState.allItems.length;
        const visible = paginationState.visibleCount;
        const hasMore = visible < total && total > 0;

        // Remove controls if search is active or nothing to paginate
        if (paginationState.isSearchActive || total <= paginationState.initialCount) {
            if (controls) controls.remove();
            return;
        }

        if (!controls) {
            controls = document.createElement('div');
            controls.id = 'load-more-controls';
            controls.className = 'load-more-controls';
            gallery.parentNode.insertBefore(controls, gallery.nextSibling);
        }

        controls.innerHTML = hasMore ? `
            <button id="btn-load-more" class="btn btn-secondary load-more-btn">
                <i class="fas fa-plus-circle"></i> Ver mais
                <span class="load-more-badge">${Math.min(paginationState.increment, total - visible)} obras</span>
            </button>
            <button id="btn-expand-all" class="btn btn-ghost load-expand-btn">
                <i class="fas fa-expand-alt"></i> Expandir tudo
                <span style="opacity:0.6; font-size:0.8rem;">(${total - visible} restantes)</span>
            </button>
        ` : `
            <div class="load-more-done">
                <i class="fas fa-check-circle"></i> Todas as ${total} obras exibidas
                <button id="btn-collapse" class="btn btn-ghost" style="margin-left:1rem; font-size:0.85rem;">
                    <i class="fas fa-compress-alt"></i> Recolher
                </button>
            </div>
        `;

        // Bind buttons
        const btnMore = document.getElementById('btn-load-more');
        if (btnMore) {
            btnMore.addEventListener('click', () => {
                paginationState.visibleCount += paginationState.increment;
                renderGalleryPaginated(null, false);
            });
        }
        const btnExpand = document.getElementById('btn-expand-all');
        if (btnExpand) {
            btnExpand.addEventListener('click', () => {
                paginationState.visibleCount = total;
                renderGalleryPaginated(null, false);
            });
        }
        const btnCollapse = document.getElementById('btn-collapse');
        if (btnCollapse) {
            btnCollapse.addEventListener('click', () => {
                paginationState.visibleCount = paginationState.initialCount;
                renderGalleryPaginated(paginationState.allItems, true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // Helper to render gallery (non-paginated, for related works etc.)
    function renderGallery(items, containerId = 'gallery') {
        if (containerId === 'gallery') {
            // Main gallery: use paginated render if no active search state override
            renderGalleryPaginated(items, true);
            return;
        }
        const gallery = document.getElementById(containerId);
        if (!gallery) return;
        gallery.innerHTML = '';
        if (items.length === 0) {
            gallery.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">Nenhuma obra encontrada.</div>';
            return;
        }
        items.forEach(item => gallery.appendChild(createCard(item)));
    }

    function initGalleryPage() {
        const searchInput = document.getElementById('searchInput');
        const advForm = document.getElementById('advancedSearchForm');

        if (searchInput) {
            // Initial load: paginated
            paginationState.isSearchActive = false;
            renderGalleryPaginated(images, true);

            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                // When searching, show all results without pagination
                paginationState.isSearchActive = searchTerm.length > 0;

                const filtered = images.filter(img => {
                    return (img.title && img.title.toLowerCase().includes(searchTerm)) || 
                           (img.year && img.year.includes(searchTerm)) || 
                           (img.technique && img.technique.toLowerCase().includes(searchTerm)) ||
                           (img.inv && img.inv.toLowerCase().includes(searchTerm)) ||
                           (img.tags && img.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
                });

                if (paginationState.isSearchActive) {
                    // Show all search results without pagination controls
                    const gallery = document.getElementById('gallery');
                    if (gallery) {
                        gallery.innerHTML = '';
                        if (filtered.length === 0) {
                            gallery.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">Nenhuma obra encontrada.</div>';
                        } else {
                            filtered.forEach(item => gallery.appendChild(createCard(item)));
                        }
                    }
                    paginationState.allItems = filtered;
                    updateResultsCount();
                    updateLoadMoreControls();
                } else {
                    // Empty search: restore paginated view
                    renderGalleryPaginated(images, true);
                }
            });
        }

        if (advForm) {
            renderGallery(images);
            
            const spCities = ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'São José dos Campos', 'Piracicaba', 'Sorocaba', 'Jundiaí', 'Bauru', 'Franca'];
            let selectedCities = [];

            const renderCityChips = () => {
                const container = document.getElementById('selectedCitiesContainer');
                if(!container) return;
                container.innerHTML = selectedCities.map(city => 
                    `<span class="city-chip">${city} <i class="fas fa-times" onclick="removeCity('${city}')"></i></span>`
                ).join('');
                
                document.querySelectorAll('.city-dot').forEach(dot => {
                    if(selectedCities.includes(dot.getAttribute('data-city'))) {
                        dot.classList.add('selected');
                        dot.setAttribute('aria-pressed', 'true');
                    } else {
                        dot.classList.remove('selected');
                        dot.setAttribute('aria-pressed', 'false');
                    }
                });
                updateFilters();
            };

            window.removeCity = (city) => {
                selectedCities = selectedCities.filter(c => c !== city);
                renderCityChips();
            };
            
            window.addCity = (city) => {
                if(!selectedCities.includes(city)) selectedCities.push(city);
                const cityInput = document.getElementById('citySearchInput');
                if(cityInput) cityInput.value = '';
                const cityAutocomplete = document.getElementById('cityAutocomplete');
                if(cityAutocomplete) cityAutocomplete.classList.add('hidden');
                renderCityChips();
            };

            document.querySelectorAll('.city-dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const city = e.target.getAttribute('data-city');
                    if(selectedCities.includes(city)) window.removeCity(city);
                    else window.addCity(city);
                });
                dot.addEventListener('keydown', (e) => {
                    if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dot.click(); }
                });
            });

            const cityInput = document.getElementById('citySearchInput');
            const cityAutocomplete = document.getElementById('cityAutocomplete');
            
            if(cityInput && cityAutocomplete) {
                cityInput.addEventListener('input', (e) => {
                    const val = e.target.value.toLowerCase().trim();
                    if(!val) return cityAutocomplete.classList.add('hidden');
                    const matches = spCities.filter(c => c.toLowerCase().includes(val) && !selectedCities.includes(c));
                    if(matches.length > 0) {
                        cityAutocomplete.innerHTML = matches.map(m => `<div class="autocomplete-item" onclick="addCity('${m}')">${m}</div>`).join('');
                        cityAutocomplete.classList.remove('hidden');
                    } else { cityAutocomplete.classList.add('hidden'); }
                });
                /* Timeout to allow click on autocomplete element */
                cityInput.addEventListener('blur', () => { setTimeout(() => cityAutocomplete.classList.add('hidden'), 200); });
            }

            const updateFilters = () => {
                const yearMinEl = document.getElementById('filterYearMin');
                const yearMaxEl = document.getElementById('filterYearMax');
                const yearMin = yearMinEl ? parseInt(yearMinEl.value) : 1930;
                const yearMax = yearMaxEl ? parseInt(yearMaxEl.value) : 1990;
                
                const technique = document.getElementById('filterTechnique') ? document.getElementById('filterTechnique').value : '';
                
                const toneMinEl = document.getElementById('filterToneMin');
                const toneMaxEl = document.getElementById('filterToneMax');
                const toneMin = toneMinEl ? parseInt(toneMinEl.value) : 0;
                const toneMax = toneMaxEl ? parseInt(toneMaxEl.value) : 100;
                
                const tagField = document.getElementById('filterTag');
                const tag = tagField ? tagField.value.toLowerCase() : '';

                const actualYearMin = Math.min(yearMin, yearMax);
                const actualYearMax = Math.max(yearMin, yearMax);
                const actualToneMin = Math.min(toneMin, toneMax);
                const actualToneMax = Math.max(toneMin, toneMax);

                if(document.getElementById('yearMinVal')) document.getElementById('yearMinVal').textContent = actualYearMin;
                if(document.getElementById('yearMaxVal')) document.getElementById('yearMaxVal').textContent = actualYearMax;
                if(document.getElementById('toneRangeLabel')) document.getElementById('toneRangeLabel').textContent = `${actualToneMin}% - ${actualToneMax}%`;

                const filtered = images.filter(img => {
                    const imgYear = parseInt(img.year);
                    const matchYear = imgYear >= actualYearMin && imgYear <= actualYearMax;
                    const matchTechnique = technique === '' || img.technique === technique;
                    const matchTone = img.tone >= actualToneMin && img.tone <= actualToneMax;
                    const matchLocation = selectedCities.length === 0 || (img.city && selectedCities.includes(img.city));
                    const matchTag = tag === '' || 
                                     (img.tags && img.tags.some(t => t.toLowerCase().includes(tag))) || 
                                     (img.title && img.title.toLowerCase().includes(tag)) ||
                                     (img.technique && img.technique.toLowerCase().includes(tag)) ||
                                     (img.city && img.city.toLowerCase().includes(tag));

                    return matchYear && matchTechnique && matchTone && matchLocation && matchTag;
                });

                renderGallery(filtered);
            };

            ['filterYearMin', 'filterYearMax', 'filterTechnique', 'filterToneMin', 'filterToneMax', 'filterTag'].forEach(id => {
                const el = document.getElementById(id);
                if(el) {
                    el.addEventListener('input', updateFilters);
                    el.addEventListener('change', updateFilters);
                }
            });

            // --- Visual Search Mock Logic ---
            const uploadArea = document.getElementById('uploadArea');
            const visualSearchInput = document.getElementById('visualSearchInput');
            const uploadPreviewContainer = document.getElementById('uploadPreviewContainer');
            const uploadPreview = document.getElementById('uploadPreview');
            const btnRemoveUpload = document.getElementById('btnRemoveUpload');
            const processingOverlay = document.getElementById('processingOverlay');

            if (uploadArea && visualSearchInput) {
                uploadArea.addEventListener('click', () => {
                    visualSearchInput.click();
                });

                visualSearchInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            uploadPreview.src = event.target.result;
                            uploadPreviewContainer.style.display = 'block';
                            document.querySelector('.upload-icon').style.display = 'none';
                            document.querySelector('.upload-text').style.display = 'none';
                            
                            // Simulate AI Processing
                            processingOverlay.style.display = 'flex';
                            uploadArea.classList.add('is-scanning');
                            
                            setTimeout(() => {
                                processingOverlay.style.display = 'none';
                                uploadArea.classList.remove('is-scanning');
                                
                                // Mock Refined Results
                                const shuffled = [...images].sort(() => 0.5 - Math.random());
                                const visualMatches = shuffled.slice(0, 6).map((img, idx) => ({
                                    ...img,
                                    similarityMsg: `<span class='similarity-badge'>${98 - idx}% Correspondência Visual</span>`
                                }));
                                renderGallery(visualMatches);
                                
                                const resultsCount = document.getElementById('resultsCount');
                                if (resultsCount) {
                                    resultsCount.innerHTML = `<strong>Resultados da Busca Visual:</strong> 6 obras encontradas com padrões semelhantes`;
                                }
                            }, 2500);
                        };
                        reader.readAsDataURL(file);
                    }
                });

                if (btnRemoveUpload) {
                    btnRemoveUpload.addEventListener('click', (e) => {
                        e.stopPropagation();
                        visualSearchInput.value = '';
                        uploadPreviewContainer.style.display = 'none';
                        document.querySelector('.upload-icon').style.display = 'block';
                        document.querySelector('.upload-text').style.display = 'block';
                        renderGallery(images);
                    });
                }

                // Drag and Drop
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    uploadArea.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }, false);
                });

                uploadArea.addEventListener('dragover', () => uploadArea.classList.add('dragover'));
                uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
                uploadArea.addEventListener('drop', (e) => {
                    uploadArea.classList.remove('dragover');
                    const dt = e.dataTransfer;
                    const files = dt.files;
                    visualSearchInput.files = files;
                    const event = new Event('change');
                    visualSearchInput.dispatchEvent(event);
                });
            }
        }
    }

    function initObraPage() {
        const params = new URLSearchParams(window.location.search);
        const obraId = params.get('id');
        const mainContainer = document.getElementById('obra-main-container');
        
        if(!mainContainer) return;

        const obra = images.find(img => img.id === obraId);
        
        if(!obra) {
            mainContainer.innerHTML = '<div style="text-align: center; padding: 10rem 0;">Obra não encontrada. <br><br><a href="index.html" class="author-chip" style="font-size: 1rem;">Voltar ao acervo</a></div>';
            return;
        }

        // Compute similarity and pick related works
        let relatedWorksPool = [];
        images.forEach(img => {
            if(img.id === obra.id) return;
            let simPoints = [];
            if(img.technique === obra.technique) simPoints.push('Técnica');
            if(Math.abs(parseInt(img.year) - parseInt(obra.year)) <= 5) simPoints.push('Data');
            if(Math.abs(img.tone - obra.tone) <= 20) simPoints.push('Tom Afetivo');
            if(img.city && img.city === obra.city) simPoints.push('Localidade');
            
            if(simPoints.length === 0) {
                const conceptuals = ['Estética', 'Contexto Histórico', 'Composição'];
                simPoints.push(conceptuals[Math.floor(Math.random() * conceptuals.length)]);
            }
            img._simScore = simPoints.length + Math.random(); // random factor for variety
            img.similarityMsg = `<i class="fas fa-link"></i> Similaridade: ${simPoints.join(', ')}`;
            relatedWorksPool.push(img);
        });
        
        const relatedWorks = relatedWorksPool.sort((a,b) => b._simScore - a._simScore).slice(0, 4);
        
        let authorsHtml = (obra.relatedAuthors || []).map(author => `<span class="author-chip">${author}</span>`).join('');

        // Fake Comments logic
        const fakeUsers = [
            { name: "Maria Silva", role: "Pesquisadora", initial: "M", color: "#4CAF50" },
            { name: "João Pedro", role: "Estudante", initial: "J", color: "#2196F3" },
            { name: "Ana Clara", role: "Curadora", initial: "A", color: "#E91E63" },
            { name: "Carlos Eduardo", role: "Conservador", initial: "C", color: "#FF9800" },
            { name: "Beatriz M.", role: "Visitante", initial: "B", color: "#9C27B0" }
        ];

        const fakeCommentsList = [
            "Acredito que essa técnica específica de gravura tenha sido influenciada pelo período pós-guerra.",
            "Esta transcrição das anotações no verso parece ter um pequeno erro na segunda linha. Sugiro revisar.",
            "Incrível o uso de texturas nesta obra. Lembra muito os trabalhos iniciais de artistas do mesmo período.",
            "Alguém sabe dizer em qual exposição essa obra foi exibida pela primeira vez?",
            "Concordo com a análise do contexto. O uso do espaço negativo aqui é excepcional.",
            "Notei uma pequena mancha no canto superior direito que não aparece no catálogo raisonné.",
            "Essa obra faz um belo par conceptual com outras do mesmo ano."
        ];

        let seed = 0;
        for(let i=0; i<obra.id.length; i++) seed += obra.id.charCodeAt(i);
        
        let numComments = (seed % 10 < 7) ? (seed % 2 + 1) : (seed % 2 + 3); // 70% 1-2, 30% 3-4
        
        let commentsHtml = '';
        for(let i=0; i<numComments; i++) {
            const userIndex = (seed + i) % fakeUsers.length;
            const commentIndex = (seed + i * 3) % fakeCommentsList.length;
            const user = fakeUsers[userIndex];
            const dateStr = `Há ${((seed*i)%30)+1} d`;
            
            commentsHtml += `
                <div class="comment-item">
                    <div class="comment-avatar" style="background-color: ${user.color}">${user.initial}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${user.name}</span>
                            <span class="comment-role">${user.role}</span>
                            <span class="comment-date">${dateStr}</span>
                        </div>
                        <p class="comment-text">${fakeCommentsList[commentIndex]}</p>
                        <div class="comment-actions">
                            <button class="btn-ghost" style="padding:4px 8px; font-size: 0.8rem;"><i class="fas fa-thumbs-up" style="margin-right:4px;"></i> Útil (${((seed+i)%15)})</button>
                            <button class="btn-ghost" style="padding:4px 8px; font-size: 0.8rem;" title="Denunciar"><i class="fas fa-flag" style="opacity: 0.7;"></i></button>
                            <button class="btn-ghost" style="padding:4px 8px; font-size: 0.8rem;"><i class="fas fa-reply" style="margin-right:4px;"></i> Responder</button>
                        </div>
                    </div>
                </div>
            `;
        }

        mainContainer.innerHTML = `
            <div class="obra-detail-container">
                <div class="obra-image-container">
                    <div class="passe-partout">
                        <img src="${obra.src}" alt="${obra.title}">
                    </div>
                </div>
                <div class="obra-info">
                    <a href="javascript:history.back()" class="btn btn-ghost" style="margin-bottom:1rem; padding-left:0;">
                        <i class="fas fa-arrow-left" style="margin-right: 0.5rem;"></i> Voltar
                    </a>
                    <h1>${obra.title}</h1>
                    <div class="obra-meta ficha-catalografica">
                        <span><i class="fas fa-palette" style="opacity:0.7; width:16px;"></i> <b>Autoria:</b> Fayga Ostrower</span>
                        <span><i class="fas fa-layer-group" style="opacity:0.7; width:16px;"></i> <b>Técnica:</b> ${obra.technique}</span>
                        <span><i class="fas fa-calendar-alt" style="opacity:0.7; width:16px;"></i> <b>Ano:</b> ${obra.year}</span>
                        <span><i class="fas fa-map-marker-alt" style="opacity:0.7; width:16px;"></i> <b>Local:</b> ${obra.city || 'São Paulo'}</span>
                        <span><i class="fas fa-ticket-alt" style="opacity:0.7; width:16px;"></i> <b>Inventário:</b> <span class="monospace-inv">${obra.inv}</span></span>
                    </div>
                    
                    <h2 class="obra-section-title">Descrição</h2>
                    <p class="obra-text">${obra.description}</p>
                    
                    <h2 class="obra-section-title">Contexto Histórico</h2>
                    <p class="obra-text">${obra.context}</p>

                    <h2 class="obra-section-title">Nesta obra (Palavras-chave)</h2>
                    <div class="author-chips" style="margin-bottom: 2rem;">
                        ${(obra.tags || []).map(t => `<span class="author-chip" style="background:#f0f0f0; color:#333;">${t}</span>`).join('')}
                    </div>

                    <h2 class="obra-section-title">Autores Relacionados</h2>
                    <div class="author-chips">
                        ${authorsHtml}
                    </div>
                </div>
            </div>

            <div class="comments-section" style="margin-bottom: 4rem;">
                <div class="section-header" style="margin-bottom: 1.5rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h2 style="font-size: 1.8rem; margin:0;"><i class="fas fa-comments" style="margin-right: 0.5rem; color: var(--accent-color);"></i> Anotações Colaborativas</h2>
                    <span class="author-chip" style="margin:0;">${numComments} comentários</span>
                </div>
                
                <div class="add-comment-box">
                    <div class="comment-avatar" style="background-color: #ccc; flex-shrink: 0; display:flex; justify-content:center; align-items:center;">
                        <i class="fas fa-user" style="color: white; font-size: 1.2rem;"></i>
                    </div>
                    <div style="flex-grow: 1;">
                        <textarea placeholder="Adicione uma transcrição, correção ou comentário colaborativo sobre esta obra... (Faça login para interagir)" style="width: 100%; border: 1px solid #ddd; border-radius: 4px; padding: 1rem; font-family: 'Inter', sans-serif; resize: vertical; min-height: 80px;" disabled></textarea>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                            <span style="font-size: 0.85rem; color: var(--text-light);"><i class="fas fa-info-circle"></i> O Crowdsourcing ajuda a enriquecer o acervo.</span>
                            <button class="btn btn-primary" disabled style="opacity: 0.6;"><i class="fas fa-paper-plane"></i> Enviar contribuição</button>
                        </div>
                    </div>
                </div>

                <div class="comments-list">
                    ${commentsHtml}
                </div>
            </div>

            <!-- Visual Search Interaction Section -->
            <div class="visual-search-banner">
                <div>
                    <h3><i class="fas fa-eye"></i> Busca por Similaridade Visual</h3>
                    <p>Detectar padrões estéticos, traços e paletas de cores automagicamente.</p>
                </div>
                <button class="btn btn-vision" id="btnSeekSimilar">
                    <i class="fas fa-search"></i> Buscar Obras Semelhantes
                </button>
            </div>

            <div class="section-header" style="margin-bottom: 1.5rem;">
                <h2 id="related-title">Obras Relacionadas do Acervo</h2>
            </div>
            <div id="related-gallery" class="gallery-grid"></div>
        `;

        renderGallery(relatedWorks, 'related-gallery');

        const btnSeekSimilar = document.getElementById('btnSeekSimilar');
        if (btnSeekSimilar) {
            btnSeekSimilar.addEventListener('click', () => {
                btnSeekSimilar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
                btnSeekSimilar.classList.add('disabled');
                
                setTimeout(() => {
                    const shuffled = [...images].filter(img => img.id !== obra.id).sort(() => 0.5 - Math.random());
                    const topMatches = shuffled.slice(0, 4).map((img, idx) => ({
                        ...img,
                        similarityMsg: `<span class='similarity-badge'>AI Match: ${99 - idx}%</span>`
                    }));
                    
                    const relatedTitle = document.getElementById('related-title');
                    if(relatedTitle) relatedTitle.innerHTML = '<i class="fas fa-magic" style="color:var(--accent-color)"></i> Correspondências Visuais Encontradas';
                    
                    renderGallery(topMatches, 'related-gallery');
                    
                    document.getElementById('related-gallery').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    btnSeekSimilar.innerHTML = '<i class="fas fa-check"></i> Busca Finalizada';
                }, 1500);
            });
        }
    }
});

// Chatbot logic
document.addEventListener('DOMContentLoaded', () => {
    const chatTrigger = document.querySelector('.chat-trigger');
    const chatPanel = document.querySelector('.chat-panel');
    const chatClose = document.querySelector('.chat-panel-close');

    if (chatTrigger && chatPanel) {
        chatTrigger.addEventListener('click', () => {
            chatPanel.classList.toggle('open');
        });
    }

    if (chatClose && chatPanel) {
        chatClose.addEventListener('click', () => {
            chatPanel.classList.remove('open');
        });
    }
});
