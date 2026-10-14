const btnBack = document.querySelector('.btn-back');
btnBack.addEventListener('click', () => window.location.href = 'index.html');

if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
}

const typeColors = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC'
};

const urlParams = new URLSearchParams(window.location.search);
const pokeId = urlParams.get('id');

if (!pokeId) window.location.href = 'index.html';

async function loadPokemonDetails() {
  try {
    const resPoke = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
    const pokemon = await resPoke.json();

    const resSpecies = await fetch(pokemon.species.url);
    const species = await resSpecies.json();

    renderBasicInfo(pokemon, species);
    renderStats(pokemon.stats);
    renderAbilities(pokemon.abilities);

    await renderEvolutions(species.evolution_chain.url, pokemon.name);

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

  const entry = species.flavor_text_entries.find(f => f.language.name === 'en');
  document.getElementById('poke-desc').innerText = entry ? entry.flavor_text.replace(/\f|\n/g, ' ') : "Descrição não encontrada.";

  const typesContainer = document.getElementById('poke-types');
  pokemon.types.forEach(t => {
    const span = document.createElement('span');
    span.className = 'type';
    span.style.backgroundColor = typeColors[t.type.name];
    span.style.color = (t.type.name === 'electric' || t.type.name === 'ice' || t.type.name === 'grass' || t.type.name === 'fairy') ? '#111' : '#fff';
    span.innerText = t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1);
    typesContainer.appendChild(span);
  });
}

function renderStats(stats) {
  const container = document.getElementById('poke-stats-container');
  const maxStat = 255; 

  stats.forEach(s => {
    const statName = s.stat.name.toUpperCase().replace('SPECIAL-ATTACK', 'SP. ATK').replace('SPECIAL-DEFENSE', 'SP. DEF');
    const width = (s.base_stat / maxStat) * 100;
    
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
  container.innerHTML = '';
  abilities.forEach(a => {
    container.innerHTML += `
      <div class="ability-box">
        <span class="ability-name" style="text-transform: capitalize;">${a.ability.name.replace('-', ' ')}</span>
        ${a.is_hidden ? '<span class="ability-hidden">(Hidden Ability)</span>' : ''}
      </div>
    `;
  });
}

async function renderEvolutions(url, currentName) {
  const res = await fetch(url);
  const evoData = await res.json();
  const chain = [];
  
  function extractChain(node) {
    const id = node.species.url.split('/').filter(Boolean).pop();
    const details = node.evolution_details[0];
    
    let triggerText = '';
    if (details) {
      if (details.min_level) triggerText = `Level ${details.min_level}`;
      else if (details.item) triggerText = `Use ${details.item.name.replace('-', ' ')}`;
      else if (details.min_happiness) triggerText = `Friendship`;
      else triggerText = `Special`;
    }

    chain.push({
      name: node.species.name,
      id: id,
      trigger: triggerText
    });

    node.evolves_to.forEach(nextNode => extractChain(nextNode));
  }

  extractChain(evoData.chain);

  const container = document.getElementById('evo-chain');
  container.innerHTML = '';

  chain.forEach((stage, index) => {
    const isCurrent = stage.name === currentName;
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${stage.id}.png`;
    
    let html = `
      <div class="evo-stage ${isCurrent ? 'highlighted' : ''}" onclick="window.location.href='detalhes.html?id=${stage.id}'">
        <div class="evo-img-box"><img src="${imgUrl}" alt="${stage.name}"></div>
        <span class="evo-name">${stage.name}</span>
        ${stage.trigger ? `<span class="evo-level" style="text-transform: capitalize;">${stage.trigger}</span>` : ''}
      </div>
    `;

    if (index < chain.length - 1) {
      html += `<div class="evo-arrow"><i class="ph ph-caret-right"></i></div>`;
    }

    container.innerHTML += html;
  });
}

loadPokemonDetails();