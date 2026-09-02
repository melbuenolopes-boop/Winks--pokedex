// Pegamos as ferramentas que vamos usar na tela
const pokedexGrid = document.getElementById('pokedex-grid');
const searchInput = document.getElementById('search-input');
const btnSearch = document.getElementById('btn-search');
const btnShowFavs = document.getElementById('btn-show-favs');

// Ferramentas de virar a página
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');

// Configurações do nosso site
const TOTAL_POKEMONS = 1025; // Total que existe
const ITEMS_PER_PAGE = 8;    // Quantos vamos mostrar por vez na tela
let currentPage = 1;         // Em qual página estamos agora

let allPokemons = [];        // Uma gaveta para guardar só os nomes (sem pesar o site)
let currentDisplayList = []; // Uma gaveta para guardar só os que estamos pesquisando
let showingOnlyFavs = false; // Interruptor para saber se estamos vendo só os favoritos

// Tradutor automático para os tipos não ficarem em inglês
const tiposTraduzidos = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', electric: 'Elétrico', grass: 'Planta', 
  ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno', ground: 'Terra', flying: 'Voador', 
  psychic: 'Psíquico', bug: 'Inseto', rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', 
  dark: 'Sombrio', steel: 'Aço', fairy: 'Fada'
};

// PASSO 1: PEGAR A LISTA DE NOMES RÁPIDO
const fetchInitialList = async () => {
  pokedexGrid.innerHTML = '<p class="loading">Iniciando a Pokédex...</p>';
  
  // Vai na internet e pega um papelzinho só com o Nome e a URL dos 1025. É muito leve!
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMONS}`);
  const data = await res.json();
  
  // Arruma essa lista guardando o ID (Número) de cada um
  allPokemons = data.results.map(pokemon => {
    const urlParts = pokemon.url.split('/');
    const id = parseInt(urlParts[urlParts.length - 2]);
    return { name: pokemon.name, id: id };
  });
  
  // Passa essa lista para a gaveta que vamos usar na tela
  currentDisplayList = [...allPokemons];
  
  // Manda desenhar a primeira página
  renderPage();
};

// PASSO 2: DESENHAR SÓ OS 8 POKÉMON DA PÁGINA ATUAL
const renderPage = async () => {
  pokedexGrid.innerHTML = '<p class="loading">Carregando página...</p>';
  
  // Calcula quantas páginas vão existir no total (1025 dividido por 8 dá 129 páginas)
  const totalPages = Math.ceil(currentDisplayList.length / ITEMS_PER_PAGE) || 1;
  
  // Pega uma tesoura e corta exatamente os 8 que precisamos agora (ex: do 0 ao 8)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = currentDisplayList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Se a pesquisa não achar nada, avisa o usuário
  if (pageItems.length === 0) {
    pokedexGrid.innerHTML = '<p class="loading">Nenhum Pokémon encontrado.</p>';
    updatePaginationControls(totalPages);
    return;
  }

  // Agora sim! Vai na internet e baixa as FOTOS PESADAS, MAS SÓ DESSES 8.
  const promises = pageItems.map(item => fetch(`https://pokeapi.co/api/v2/pokemon/${item.id}`).then(res => res.json()));
  const detailedPokemons = await Promise.all(promises);

  // Limpa a tela e desenha as cartinhas
  pokedexGrid.innerHTML = '';
  detailedPokemons.forEach(pokemon => createPokemonCard(pokemon));
  
  // Atualiza os botões lá embaixo (Página 1 de 129)
  updatePaginationControls(totalPages);
};

// PASSO 3: CONTROLAR OS BOTÕES DE VOLTAR E AVANÇAR
const updatePaginationControls = (totalPages) => {
  pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;
  
  // Bloqueia o botão "Anterior" se estivermos na página 1
  btnPrev.disabled = currentPage === 1;
  
  // Bloqueia o botão "Próxima" se chegarmos na última página
  btnNext.disabled = currentPage === totalPages || currentDisplayList.length === 0;
};

// Se clicar em "Anterior", diminui a página e desenha de novo
btnPrev.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

// Se clicar em "Próxima", aumenta a página e desenha de novo
btnNext.addEventListener('click', () => {
  const totalPages = Math.ceil(currentDisplayList.length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});

// PASSO 4: MONTAR A CARTA (FOTO, NOME, TIPO E BOTÃO FAVORITO)
const createPokemonCard = (pokemon) => {
  // Traduz os tipos
  const types = pokemon.types.map(t => tiposTraduzidos[t.type.name] || t.type.name).join(' / ');
  const hp = pokemon.stats[0].base_stat;
  const attack = pokemon.stats[1].base_stat;
  const idFormatado = pokemon.id.toString().padStart(3, '0');

  // Olha na memória do navegador para ver se você já clicou em favoritar antes
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const isFav = favoritos.includes(pokemon.id);

  // Cria a caixinha do card
  const pokemonEl = document.createElement('div');
  pokemonEl.classList.add('poke-card');
  pokemonEl.innerHTML = `
    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" class="poke-img" loading="lazy">
    <div class="poke-title">#${idFormatado} - ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</div>
    <div class="poke-type">Tipo: ${types}</div>
    <div class="poke-stats">HP: ${hp} | Ataque: ${attack}</div>
    <button class="btn-fav ${isFav ? 'active' : ''}">${isFav ? '★ Favorito' : '☆ Favoritar'}</button>
  `;

  // Lógica do botão de Favoritar
  const btnFav = pokemonEl.querySelector('.btn-fav');
  btnFav.addEventListener('click', (e) => {
    e.stopPropagation(); // Impede de abrir a outra tela ao clicar no botão
    favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    
    if (favoritos.includes(pokemon.id)) {
      // Se já estava favoritado, tira da lista
      favoritos = favoritos.filter(id => id !== pokemon.id);
      btnFav.classList.remove('active');
      btnFav.innerText = '☆ Favoritar';
      if(showingOnlyFavs) aplicarFiltros(); 
    } else {
      // Se não estava, salva na lista
      favoritos.push(pokemon.id);
      btnFav.classList.add('active');
      btnFav.innerText = '★ Favorito';
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  });

  // Se clicar em qualquer lugar do card (menos no botão), vai para a tela bonita de Detalhes
  pokemonEl.addEventListener('click', () => {
    window.location.href = `detalhes.html?id=${pokemon.id}`;
  });

  // Joga o card na tela
  pokedexGrid.appendChild(pokemonEl);
};

// PASSO 5: BARRA DE PESQUISA
function aplicarFiltros() {
  const termo = searchInput.value.toLowerCase();
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

  // Peneira a lista procurando pelo nome, número ou se é favorito
  currentDisplayList = allPokemons.filter(pokemon => {
    const atendeBusca = pokemon.name.toLowerCase().includes(termo) || pokemon.id.toString().includes(termo);
    const atendeFav = showingOnlyFavs ? favoritos.includes(pokemon.id) : true;
    return atendeBusca && atendeFav;
  });

  // Volta para a página 1 e desenha os que achou
  currentPage = 1;
  renderPage();
}

// Ouve quando você digita na barra
searchInput.addEventListener('input', aplicarFiltros);
// Ouve quando você clica no botão Buscar
btnSearch.addEventListener('click', aplicarFiltros);

// Ouve quando você clica em "Meus Favoritos"
btnShowFavs.addEventListener('click', () => {
  showingOnlyFavs = !showingOnlyFavs;
  btnShowFavs.classList.toggle('active-filter');
  btnShowFavs.innerText = showingOnlyFavs ? '★ Mostrar Todos' : '★ Meus Favoritos';
  aplicarFiltros();
});

// A primeira coisa que o código faz quando você abre o site:
fetchInitialList();