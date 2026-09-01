const btnBack = document.querySelector('.btn-back');
const btnTheme = document.querySelector('.btn-theme');
const themeIcon = document.querySelector('.btn-theme i');

btnBack.addEventListener('click', () => window.location.href = 'index.html');

btnTheme.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  themeIcon.classList.replace(
    document.body.classList.contains('light-mode') ? 'ph-sun' : 'ph-moon',
    document.body.classList.contains('light-mode') ? 'ph-moon' : 'ph-sun'
  );
});

// Dicionário de cores e traduções para o CSS dinâmico
const typeColors = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC'
};

const typeNamesPt = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', electric: 'Elétrico',
  grass: 'Planta', ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno',
  ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
  steel: 'Aço', fairy: 'Fada'
};

// 1. PEGAR O ID DA URL (Ex: detalhes.html?id=6)
const urlParams = new URLSearchParams(window.location.search);
const pokeId = urlParams.get('id');

// Se alguém abrir a tela sem ID, manda de volta pra home
if (!pokeId) window.location.href = 'index.html';

// 2. FUNÇÃO PRINCIPAL PARA CARREGAR TUDO
async function loadPokemonDetails() {
  try {
    // Busca dados principais
    const resPoke = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
    const pokemon = await resPoke.json();

    // Busca dados da espécie (texto descritivo e URL da evolução)
    const resSpecies = await fetch(pokemon.species.url);
    const species = await resSpecies.json();

    // Renderiza Info Básica
    renderBasicInfo(pokemon, species);
    renderStats(pokemon.stats);
    renderAbilities(pokemon.abilities);

    // Renderiza Compatibilidade de Tipos e Cadeia Evolutiva
    await renderTypeCompatibilities(pokemon.types);
    await renderEvolutions(species.evolution_chain.url, pokemon.name);

    // Mostra a tela
    document.getElementById('loading-details').style.display = 'none';
    document.getElementById('main-content').style.display = 'flex';

  } catch (error) {
    console.error("Erro ao carregar detalhes", error);
    document.getElementById('loading-details').innerText = "Erro ao carregar os dados. Tente novamente.";
  }
}

function renderBasicInfo(pokemon, species) {
  document.getElementById('poke-id').innerText = `#${pokemon.id.toString().padStart(3, '0')}`;
  document.getElementById('poke-name').innerText = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  document.getElementById('poke-img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  document.getElementById('poke-height').innerText = `${pokemon.height / 10} m`;
  document.getElementById('poke-weight').innerText = `${pokemon.weight / 10} kg`;

  // Pega a primeira descrição em inglês (a API não tem descrições consistentes em PT-BR para todos)
  const entry = species.flavor_text_entries.find(f => f.language.name === 'en');
  document.getElementById('poke-desc').innerText = entry ? entry.flavor_text.replace(/\f|\n/g, ' ') : "Descrição não encontrada.";

  // Desenha as pílulas de tipos
  const typesContainer = document.getElementById('poke-types');
  pokemon.types.forEach(t => {
    const span = document.createElement('span');
    span.className = 'type';
    span.style.backgroundColor = typeColors[t.type.name];
    span.style.color = (t.type.name === 'electric' || t.type.name === 'ice' || t.type.name === 'grass' || t.type.name === 'fairy') ? '#111' : '#fff';
    span.innerText = typeNamesPt[t.type.name] || t.type.name;
    typesContainer.appendChild(span);
  });
}

function renderStats(stats) {
  const container = document.getElementById('poke-stats-container');
  const maxStat = 255; // Base máxima (Blissey HP)

  stats.forEach(s => {
    const statName = s.stat.name.toUpperCase().replace('SPECIAL-ATTACK', 'SP. ATK').replace('SPECIAL-DEFENSE', 'SP. DEF');
    const width = (s.base_stat / maxStat) * 100;
    
    // Escolhe a cor baseada no valor
    let color = '#ff4d4d'; // Vermelho (baixo)
    if(s.base_stat > 60) color = '#f39c12'; // Laranja (médio)
    if(s.base_stat > 90) color = '#2ecc71'; // Verde (alto)

    container.innerHTML += `
      <div class="stat-row">
        <span class="stat-name">${statName}</span>
        <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${width}%; background-color: ${color};"></div></div>
        <span class="stat-num">${s.base_stat}</span>
      </div>
    `;
  });
}

function renderAbilities(abilities) {
  const container = document.getElementById('poke-abilities');
  abilities.forEach(a => {
    container.innerHTML += `
      <div class="ability-box">
        <span class="ability-name" style="text-transform: capitalize;">${a.ability.name.replace('-', ' ')}</span>
        ${a.is_hidden ? '<span class="ability-hidden">(Habilidade Oculta)</span>' : ''}
      </div>
    `;
  });
}

// O MOTOR MATEMÁTICO DE FRAQUEZAS
async function renderTypeCompatibilities(types) {
  let damageMultiplier = {};
  const allTypes = Object.keys(typeColors);
  allTypes.forEach(t => damageMultiplier[t] = 1);

  // Busca as regras de dano de CADA tipo que o Pokémon tem na API
  for (let t of types) {
    const res = await fetch(t.type.url);
    const typeData = await res.json();
    
    typeData.damage_relations.double_damage_from.forEach(x => damageMultiplier[x.name] *= 2);
    typeData.damage_relations.half_damage_from.forEach(x => damageMultiplier[x.name] *= 0.5);
    typeData.damage_relations.no_damage_from.forEach(x => damageMultiplier[x.name] *= 0);
  }

  // Separa o que é fraqueza e o que é resistência
  const weaknesses = Object.entries(damageMultiplier).filter(([type, mult]) => mult > 1);
  const resistances = Object.entries(damageMultiplier).filter(([type, mult]) => mult < 1 && mult > 0);
  const immunities = Object.entries(damageMultiplier).filter(([type, mult]) => mult === 0);

  // Combina resistências e imunidades para exibição simplificada
  const allResists = [...resistances, ...immunities];

  document.getElementById('weakness-title').innerText = `Fraco para ( ${weaknesses.length} )`;
  document.getElementById('resistance-title').innerText = `Resistente a ( ${allResists.length} )`;

  const weakContainer = document.getElementById('poke-weaknesses');
  const resContainer = document.getElementById('poke-resistances');

  // Desenha os distintivos de Fraqueza
  weaknesses.forEach(([type, mult]) => {
    weakContainer.innerHTML += createBadgeHTML(type, mult, 'mult-red');
  });

  // Desenha os distintivos de Resistência/Imunidade
  allResists.forEach(([type, mult]) => {
    const multText = mult === 0 ? '0' : (mult === 0.5 ? '½' : '¼');
    resContainer.innerHTML += createBadgeHTML(type, multText, 'mult-green');
  });
}

function createBadgeHTML(type, multText, colorClass) {
  const bg = typeColors[type];
  const color = (type === 'electric' || type === 'ice' || type === 'grass' || type === 'fairy') ? '#111' : '#fff';
  return `
    <span class="type badge-container" style="background-color: ${bg}; color: ${color};">
      ${typeNamesPt[type] || type} <span class="multiplier ${colorClass}">${multText}</span>
    </span>
  `;
}

// O MOTOR DA ÁRVORE DE EVOLUÇÃO
async function renderEvolutions(url, currentName) {
  const res = await fetch(url);
  const evoData = await res.json();
  const chain = [];
  
  // Navega pela árvore de evolução da API
  let currentEvo = evoData.chain;
  do {
    const id = currentEvo.species.url.split('/').filter(Boolean).pop(); // Extrai o ID da URL da espécie
    chain.push({
      name: currentEvo.species.name,
      id: id,
      level: currentEvo.evolves_to[0]?.evolution_details[0]?.min_level || '?'
    });
    currentEvo = currentEvo.evolves_to[0]; // Vai para a próxima evolução
  } while (currentEvo && currentEvo.hasOwnProperty('evolves_to'));

  const container = document.getElementById('evo-chain');
  chain.forEach((stage, index) => {
    const isCurrent = stage.name === currentName;
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${stage.id}.png`;
    
    let html = `
      <div class="evo-stage ${isCurrent ? 'highlighted' : ''}" onclick="window.location.href='detalhes.html?id=${stage.id}'">
        <div class="evo-img-box"><img src="${imgUrl}" alt="${stage.name}"></div>
        <span class="evo-name" style="text-transform: capitalize;">${stage.name}</span>
        ${index > 0 ? `<span class="evo-level">Nível ${stage.level}</span>` : ''}
      </div>
    `;

    // Adiciona a setinha, menos no último Pokémon
    if (index < chain.length - 1) {
      html += `<div class="evo-arrow"><i class="ph ph-caret-right"></i></div>`;
    }

    container.innerHTML += html;
  });
}

// Dá a largada na página
loadPokemonDetails();