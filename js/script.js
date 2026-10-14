
const pokedexGrid = document.getElementById('pokedex-grid');
const searchInput = document.getElementById('search-input');
const btnSearch = document.getElementById('btn-search');
const btnShowFavs = document.getElementById('btn-show-favs');

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');

const TOTAL_POKEMONS = 1025; 
const ITEMS_PER_PAGE = 8;    
let currentPage = 1;         

let allPokemons = [];        
let currentDisplayList = []; 
let showingOnlyFavs = false; 


const fetchInitialList = async () => {
  pokedexGrid.innerHTML = '<p class="loading">Initializing the Pokédex...</p>';
  
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMONS}`);
  const data = await res.json();
  
  allPokemons = data.results.map(pokemon => {
    const urlParts = pokemon.url.split('/');
    const id = parseInt(urlParts[urlParts.length - 2]);
    return { name: pokemon.name, id: id };
  });
  
  currentDisplayList = [...allPokemons];
  
  renderPage();
};

const renderPage = async () => {
  pokedexGrid.innerHTML = '<p class="loading">Loading page...</p>';
  
  const totalPages = Math.ceil(currentDisplayList.length / ITEMS_PER_PAGE) || 1;
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = currentDisplayList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (pageItems.length === 0) {
    pokedexGrid.innerHTML = '<p class="loading">No Pokémon found.</p>';
    updatePaginationControls(totalPages);
    return;
  }

  const promises = pageItems.map(item => fetch(`https://pokeapi.co/api/v2/pokemon/${item.id}`).then(res => res.json()));
  const detailedPokemons = await Promise.all(promises);

  pokedexGrid.innerHTML = '';
  detailedPokemons.forEach(pokemon => createPokemonCard(pokemon));

  updatePaginationControls(totalPages);
};

const updatePaginationControls = (totalPages) => {
  pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;

  btnPrev.disabled = currentPage === 1;
  
  btnNext.disabled = currentPage === totalPages || currentDisplayList.length === 0;
};

btnPrev.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

btnNext.addEventListener('click', () => {
  const totalPages = Math.ceil(currentDisplayList.length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});

const createPokemonCard = (pokemon) => {
  const idFormatado = pokemon.id.toString().padStart(3, '0');
  const nomeFormatado = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  const typesHtml = pokemon.types.map(t => {
    const typeName = t.type.name; 
    const typeCapitalized = typeName.charAt(0).toUpperCase() + typeName.slice(1); 
    return `<span class="type type-${typeName}">${typeCapitalized}</span>`;
  }).join('');

  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const isFav = favoritos.includes(pokemon.id);

  const pokemonEl = document.createElement('div');
  pokemonEl.classList.add('pokemon-card'); // Usa a nova classe principal
  
  pokemonEl.innerHTML = `
    <span class="pokemon-id">#${idFormatado}</span>
    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" alt="${nomeFormatado}" class="pokemon-image" loading="lazy">
    <h2 class="pokemon-name">${nomeFormatado}</h2>
    
    <div class="pokemon-types">
      ${typesHtml}
    </div>
    
    <button class="btn-favorite ${isFav ? 'active' : ''}">
        ${isFav ? ' Favorite' : ' Favorite'}
    </button>
  `;

  const btnFav = pokemonEl.querySelector('.btn-favorite');
  btnFav.addEventListener('click', (e) => {
    e.stopPropagation(); 
    favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    
    if (favoritos.includes(pokemon.id)) {
      favoritos = favoritos.filter(id => id !== pokemon.id);
      btnFav.classList.remove('active');
      btnFav.innerText = '♡ Favorite';
      if(showingOnlyFavs) aplicarFiltros(); 
    } else {
      favoritos.push(pokemon.id);
      btnFav.classList.add('active');
      btnFav.innerText = '♥ Favorite';
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  });

  pokemonEl.addEventListener('click', () => {
    window.location.href = `detalhes.html?id=${pokemon.id}`;
  });

  pokedexGrid.appendChild(pokemonEl);
};

function aplicarFiltros() {
  const termo = searchInput.value.toLowerCase();
  
  const termoLimpo = termo.replace('#', ''); 
  
  const termoNumero = parseInt(termoLimpo, 10);
  
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

  currentDisplayList = allPokemons.filter(pokemon => {
    
    const buscaNome = pokemon.name.toLowerCase().includes(termo);
    
    const buscaId = pokemon.id === termoNumero;
                        
    const atendeBusca = buscaNome || buscaId;
    const atendeFav = showingOnlyFavs ? favoritos.includes(pokemon.id) : true;
    
    return atendeBusca && atendeFav;
  });

  currentPage = 1;
  renderPage();
}

searchInput.addEventListener('input', aplicarFiltros);

btnSearch.addEventListener('click', aplicarFiltros);

btnShowFavs.addEventListener('click', () => {
  showingOnlyFavs = !showingOnlyFavs;
  btnShowFavs.classList.toggle('active-filter');
  btnShowFavs.innerText = showingOnlyFavs ? '★ Mostrar Todos' : '★ Meus Favoritos';
  aplicarFiltros();
});

fetchInitialList();