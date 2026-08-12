function pokemonFavorito() {
    let pokemonName = document.getElementById("pokemonName").value;
    localStorage.setItem("pokemonName", pokemonName);
    exibirPokemonFavorito("Pokémon salvo com sucesso!");
}

function exibirPokemonFavorito(mensagem) {
    let pokemonId = document.getElementById("pokemonFavorito");
    pokemonId.textContent = mensagem;
}

