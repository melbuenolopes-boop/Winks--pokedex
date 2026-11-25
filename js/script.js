// Captura elementos do HTML para manipulação via JavaScript -------> 1
const pokedexGrid = document.getElementById('pokedex-grid');
const searchInput = document.getElementById('search-input');
const btnHome = document.getElementById('btn-home');
const btnSearch = document.getElementById('btn-search');
const btnShowFavs = document.getElementById('btn-show-favs');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info'); // <--------1

//Config. Iniciais ----------------> 2
//Total  de pokemon que possue na API
const TOTAL_POKEMONS = 1025;

//Quantidade mostrada por página
const ITEMS_PER_PAGE = 32;

//Página atual
let currentPage = 1; 

//Lista com todos os pokemon
let allPokemons = [];

//Lista atualmente exibida(filtrada ou não)
let currentDisplayList = []; 

//Controla se somente os favoritos forem exibidos 
let showingOnlyFavs = false; 
// <----------------- 2


//Função que carrega a pokédex -------------> 3
const fetchInitialList = async () => {

  //Exibi mensangem de carregamento 
  pokedexGrid.innerHTML = '<p class="loading">Initializing the Pokédex...</p>';
  
  //Busca todos os pokemon da API
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMONS}`);
  //Converte para JSON
  const data = await res.json();
  
  //Cria uma lista contendo somente o nome e ID
  allPokemons = data.results.map(pokemon => {
    const urlParts = pokemon.url.split('/');
    const id = parseInt(urlParts[urlParts.length - 2]);
    return { name: pokemon.name, id: id };
  });
  
  //Inicia exibindo todos os pokemon
  currentDisplayList = [...allPokemons];
  
  //Renderiza a pagina 
  renderPage();
}; //<------------------ 3

//Render página -------------> 4
const renderPage = async () => {
  pokedexGrid.innerHTML = '<p class="loading">Loading page...</p>';
  
  //Total de paginas 
  const totalPages = Math.ceil(currentDisplayList.length / ITEMS_PER_PAGE) || 1;
  
  //Indice inicial
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  //Pokemon da pagina atual
  const pageItems = currentDisplayList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  //Caso não exista resultado
  if (pageItems.length === 0) {
    pokedexGrid.innerHTML = '<p class="loading">No Pokémon found.</p>';
    updatePaginationControls(totalPages);
    return;
  }

  //Busca detalhes completos dos Pokémon
  const promises = pageItems.map(item => fetch(`https://pokeapi.co/api/v2/pokemon/${item.id}`).then(res => res.json()));
  const detailedPokemons = await Promise.all(promises);

  pokedexGrid.innerHTML = '';

  //Cria os cards 
  detailedPokemons.forEach(pokemon => createPokemonCard(pokemon));

  updatePaginationControls(totalPages);
}; // <----------------- 4

//Atual. controle páginas -------> 5 
const updatePaginationControls = (totalPages) => {  
  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;

  //Desabilita o botão anterior na primeira página 
  btnPrev.disabled = currentPage === 1;
  //Desabilita próximo na última página 
  btnNext.disabled = currentPage === totalPages || currentDisplayList.length === 0;
}; // <------------- 5

// Navengação Páginas ------> 6
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
  // <------- 6
});

// Criação card ----> 7
const createPokemonCard = (pokemon) => {

  //Formata o ID para 001, 025 etc
  const idFormatado = pokemon.id.toString().padStart(3, '0');

  //Primeira letra maiuscula
  const nomeFormatado = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  //Cria HTML dos tipos
  const typesHtml = pokemon.types.map(t => {
    const typeName = t.type.name; 
    const typeCapitalized = typeName.charAt(0).toUpperCase() + typeName.slice(1); 
    return `<span class="type type-${typeName}">${typeCapitalized}</span>`;
  }).join('');

  //Busca favoritos salvos
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const isFav = favoritos.includes(pokemon.id);

  //Cria elemento do card
  const pokemonEl = document.createElement('div');
  pokemonEl.classList.add('pokemon-card'); 
  
  //Monta o card visual
  pokemonEl.innerHTML = `
    <span class="pokemon-id">#${idFormatado}</span>
    
    <!-- Novo botão de favorito flutuante no topo direito -->
    <button class="btn-favorite ${isFav ? 'active' : ''}" title="Favorite">
        <i class="${isFav ? 'ph-fill' : 'ph'} ph-heart"></i>
    </button>

    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" alt="${nomeFormatado}" class="pokemon-image" loading="lazy">
    <h2 class="pokemon-name">${nomeFormatado}</h2>
    
    <div class="pokemon-types">
      ${typesHtml}
    </div>
  `;
  // <---------- 7

  const btnFav = pokemonEl.querySelector('.btn-favorite');
  const iconFav = btnFav.querySelector('i');

  //Botão Favoritos ----------> 8
  btnFav.addEventListener('click', (e) => {
    e.stopPropagation(); 
    favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    
    if (favoritos.includes(pokemon.id)) {
      favoritos = favoritos.filter(id => id !== pokemon.id);
      btnFav.classList.remove('active');
      iconFav.className = 'ph ph-heart'; // Coração vazado
      if (showingOnlyFavs) aplicarFiltros(); 
    } else {
      favoritos.push(pokemon.id);
      btnFav.classList.add('active');
      iconFav.className = 'ph-fill ph-heart'; // Coração preenchido
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  });
  // <-----------------------8

  pokemonEl.addEventListener('click', () => {
    window.location.href = `detalhes.html?id=${pokemon.id}`;
  });

  pokedexGrid.appendChild(pokemonEl);
};

//Pesquisa/Filtro ------------> 9
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
  //  <-------------- 9
}

searchInput.addEventListener('input', aplicarFiltros);

btnSearch.addEventListener('click', aplicarFiltros);

btnShowFavs.addEventListener('click', () => {
  showingOnlyFavs = !showingOnlyFavs;
  btnShowFavs.classList.toggle('active-filter');
  btnShowFavs.innerText = showingOnlyFavs ? '★ Mostrar Todos' : '★ Meus Favoritos';
  aplicarFiltros();
});

/* Botão do home */
btnHome.addEventListener('click', () =>{
  searchInput.value = '';
  showingOnlyFavs = false;
  btnShowFavs.classList.remove('active-filter');
  currentDisplayList = [...allPokemons];
  currentPage = 1;
  renderPage();
});

fetchInitialList();

const btnThemeHome = document.getElementById('btn-theme-home');

if (btnThemeHome) {
  const themeIconHome = btnThemeHome.querySelector('i');

  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeIconHome.className = 'ph ph-moon';
  }

  btnThemeHome.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    
    themeIconHome.className = isLight ? 'ph ph-moon' : 'ph ph-sun';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}