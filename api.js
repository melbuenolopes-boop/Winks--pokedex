async function fetchPokemon(pokemon) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.toString().toLowerCase()}`);
        if (!response.ok) throw new Error('Pokémon não encontrado');
        
        const data = await response.json();
        return {
            id: data.id,
            name: data.name,
            image: data.sprites.front_default,
            types: data.types.map(t => t.type.name)
        };
    } catch (error) {
        console.error("Erro na API:", error);
        return null;
    }
}