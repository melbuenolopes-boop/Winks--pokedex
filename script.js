const listaPokemons = [
    {
        id: 1,
        name: "Bulbasaur",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
        types: ["Grass", "Poison"],
        description: "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.",
        height: "0.7 m",
        weight: "6.9 kg",
        stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
        ability: ["Chlorophyll", "Overgrow"],
        evolutions: [
            { id: 1, name: "Bulbasaur", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" },
            { id: 2, name: "Ivysaur", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png", level: "Lv. 16" },
            { id: 3, name: "Venusaur", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png", level: "Lv. 32" }
        ]
    },
    {
        id: 6,
        name: "Charizard",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
        types: ["Fire", "Flying"],
        description: "It spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.",
        height: "1.7 m",
        weight: "90.5 kg",
        stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 },
        ability: ["Blaze", "Solar Power"],
        evolutions: [
            { id: 4, name: "Charmander", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" },
            { id: 5, name: "Charmeleon", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png", level: "Lv. 16" },
            { id: 6, name: "Charizard", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png", level: "Lv. 36" }
        ]
    },
    {
        id: 25,
        name: "Pikachu",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
        types: ["Electric"],
        description: "When several of these Pokémon gather, their electricity could build and cause lightning storms.",
        height: "0.4 m",
        weight: "6.0 kg",
        stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
        ability: ["Static", "Lightning Rod"],
        evolutions: [
            { id: 172, name: "Pichu", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/172.png" },
            { id: 25, name: "Pikachu", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", level: "Friendship" },
            { id: 26, name: "Raichu", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png", level: "Stone" }
        ]
    },
    {
        id: 132,
        name: "Ditto",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png",
        types: ["Normal"],
        description: "Capable of copying the form of any Pokémon by touching it.",
        height: "0.3 m",
        weight: "4.0 kg",
        stats: { hp: 48, attack: 48, defense: 48, spAtk: 48, spDef: 48, speed: 48 },
        ability: ["Limber", "Imposter"],
        evolutions: []
    }
];

const containerPrincipal = document.getElementById('pokemon-container');
const modal = document.getElementById('pokemon-modal');
const modalDetails = document.getElementById('modal-details-container');
const closeModalBtn = document.getElementById('close-modal');

let meusFavoritos = [];

function alternarFavorito(event, id) {
    event.stopPropagation(); 

    if (meusFavoritos.includes(id)) {
        meusFavoritos = meusFavoritos.filter(favId => favId !== id);
    } else {
        meusFavoritos.push(id);
    }
    
    renderizarTelaInicial(listaPokemons);
}

function renderizarTelaInicial(lista) {
    containerPrincipal.innerHTML = ''; 

    lista.forEach(pokemon => {
        const idFormatado = String(pokemon.id).padStart(3, '0');
        
        const tiposHTML = pokemon.types.map(tipo => {
            const classeTipo = `type-${tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`;
            return `<span class="type-badge ${classeTipo}">${tipo}</span>`;
        }).join('');

        const isFavorito = meusFavoritos.includes(pokemon.id);
        
        const iconeCoracao = isFavorito 
            ? '<i class="fas fa-heart heart-active"></i>' 
            : '<i class="far fa-heart"></i>';
            
        const classeBotaoBase = isFavorito ? 'btn-fav active' : 'btn-fav';
        const textoBotao = isFavorito ? 'Favoritado' : '+ Favoritar';

        const card = document.createElement('div');
        card.className = 'poke-card';
        card.onclick = () => abrirDetalhes(pokemon.id);

        card.innerHTML = `
            <div class="card-header">   
              <span class="poke-id">#${idFormatado}</span>
            </div>
            
            <div class="img-container">
              <img src="${pokemon.image}" alt="${pokemon.name}">
            </div>
            
            <div class="poke-info-container">
              <h3 class="poke-title">${pokemon.name}</h3>
              <div class="types-wrapper">
                ${tiposHTML}
              </div>
              
              <button class="${classeBotaoBase}" onclick="alternarFavorito(event, ${pokemon.id})">
                  ${iconeCoracao} ${textoBotao}
              </button>
            </div>
        `;

        containerPrincipal.appendChild(card);
    });
}

renderizarTelaInicial(listaPokemons);

function calcularBarra(valor) {
    return Math.min((valor / 150) * 100, 100);
}

function abrirDetalhes(id) {
    const pokemon = listaPokemons.find(p => p.id === id);
    if (!pokemon) return;

    const idFormatado = String(pokemon.id).padStart(3, '0');
    
    const tiposHTML = pokemon.types.map(tipo => {
        const classeTipo = `type-${tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`;
        return `<span class="type-badge ${classeTipo}">${tipo}</span>`;
    }).join('');

    const habilidadesHTML = pokemon.ability.map(hab => 
        `<div style="background: #05070a; padding: 10px 15px; border-radius: 8px; border: 1px solid #1e293b; font-size: 13px; flex:1; text-align:center; color: #fff;">${hab}</div>`
    ).join('');

    const evolucoesHTML = pokemon.evolutions.map((evo, index) => {
        const proximoTemSeta = index < pokemon.evolutions.length - 1;
        return `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="background: #05070a; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; text-align: center; width: 110px;">
                    <img src="${evo.image}" alt="${evo.name}" style="width: 70px; height: 70px; object-fit: contain;">
                    <p style="font-size: 13px; font-weight: 600; margin-top: 6px; color: #fff;">${evo.name}</p>
                    <span style="font-size: 11px; color: #64748b;">${evo.level || ''}</span>
                </div>
                ${proximoTemSeta ? `<span style="color: #64748b; font-size: 18px; font-weight: bold;">➔</span>` : ''}
            </div>
        `;
    }).join('');

    modalDetails.innerHTML = `
        <div class="detail-card">
            
            <div class="profile-card">
                <div class="profile-image">
                    <img src="${pokemon.image}" alt="${pokemon.name}">
                </div>
                
                <div class="profile-info">
                    <div class="profile-header">
                        <span class="poke-id">#${idFormatado}</span>
                    </div>
                    
                    <h2>${pokemon.name}</h2>
                    <div class="types-wrapper" style="justify-content: flex-start;">${tiposHTML}</div>
                    <p class="poke-desc">${pokemon.description}</p>
                </div>
            </div>

            <div class="measurements" style="margin-top: 30px;">
                <div class="measure-box">
                    <span class="measure-label"><i class="fas fa-ruler"></i> Height</span>
                    <span class="measure-val">${pokemon.height}</span>
                </div>
                <div class="measure-box">
                    <span class="measure-label"><i class="fas fa-weight-hanging"></i> Weight</span>
                    <span class="measure-val">${pokemon.weight}</span>
                </div>
            </div>
        </div>

        <div class="detail-card stats-card">
            <h3>Status Base</h3>
            <div class="stats-row">
                <span class="stat-label">HP</span>
                <div class="stats-bar-container"><div class="stats-bar-fill" style="width: ${calcularBarra(pokemon.stats.hp)}%; background-color: #ef4444;"></div></div>
                <span class="stat-val">${pokemon.stats.hp}</span>
            </div>
            <div class="stats-row">
                <span class="stat-label">Attack</span>
                <div class="stats-bar-container"><div class="stats-bar-fill" style="width: ${calcularBarra(pokemon.stats.attack)}%; background-color: #ef4444;"></div></div>
                <span class="stat-val">${pokemon.stats.attack}</span>
            </div>
            <div class="stats-row">
                <span class="stat-label">Defense</span>
                <div class="stats-bar-container"><div class="stats-bar-fill" style="width: ${calcularBarra(pokemon.stats.defense)}%; background-color: #ef4444;"></div></div>
                <span class="stat-val">${pokemon.stats.defense}</span>
            </div>
            <div class="stats-row">
                <span class="stat-label">Sp. Atk</span>
                <div class="stats-bar-container"><div class="stats-bar-fill" style="width: ${calcularBarra(pokemon.stats.spAtk)}%; background-color: #f97316;"></div></div>
                <span class="stat-val">${pokemon.stats.spAtk}</span>
            </div>
            <div class="stats-row">
                <span class="stat-label">Sp. Def</span>
                <div class="stats-bar-container"><div class="stats-bar-fill" style="width: ${calcularBarra(pokemon.stats.spDef)}%; background-color: #f97316;"></div></div>
                <span class="stat-val">${pokemon.stats.spDef}</span>
            </div>
            <div class="stats-row">
                <span class="stat-label">Speed</span>
                <div class="stats-bar-container"><div class="stats-bar-fill" style="width: ${calcularBarra(pokemon.stats.speed)}%; background-color: #ef4444;"></div></div>
                <span class="stat-val">${pokemon.stats.speed}</span>
            </div>
        </div>

        <div class="detail-card">
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 20px; color: #fff;">Abilities</h3>
            <div style="display: flex; gap: 10px;">
                ${habilidadesHTML}
            </div>
        </div>

        ${pokemon.evolutions.length > 0 ? `
            <div class="detail-card">
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 25px; color: #fff;">Evolution Chain</h3>
                <div style="display: flex; justify-content: flex-start; align-items: center; gap: 12px; overflow-x: auto; padding-bottom: 10px;">
                    ${evolucoesHTML}
                </div>
            </div>
        ` : ''}
    `;

    modal.style.display = 'flex';
}

if (closeModalBtn) {
    closeModalBtn.onclick = () => { modal.style.display = 'none'; };
}
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};