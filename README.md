# 🔴 PokéDex Web 

Aplicação web interativa desenvolvida como projeto prático (PM1 - 2º Período) para consulta, exploração e gerenciamento de Pokémons através do consumo da API pública **PokéAPI**.

---

## 🚀 Funcionalidades

- **Catálogo de Pokémons:** Listagem paginada consumindo dados da PokéAPI.
- **Busca Rápida:** Pesquisa dinâmica por nome ou ID oficial da criatura.
- **Ficha Técnica & Detalhes:** Modal interativo contendo:
  - Tipo(s), Altura, Peso e Habilidades traduzidas.
  - Barras coloridas de estatísticas base (*HP, Ataque, Defesa, Velocidade*).
  - Alternância para a **Versão Shiny (Brilhante)**.
  - Descrição da história da Pokédex traduzida para o Português.
- **Sistema de Favoritos:** Armazenamento local persistente via `LocalStorage` (mantém os dados salvos mesmo após fechar o navegador).
- **Design Responsivo:** Layout adaptado para visualização em computadores, tablets e smartphones.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estruturação semântica da aplicação.
- **CSS3:** Estilização com tema escuro (Dark Theme), Flexbox, CSS Grid e media queries para responsividade.
- **JavaScript (ES6+):** Manipulação dinâmica do DOM, consumo de API assíncrona (`fetch`/`async/await`) e persistência de dados.
- **PokéAPI:** Fonte de dados RESTful para informações, atributos e artes oficiais.

---

## 📁 Estrutura de Arquivos

```text
├── index.html       # Estrutura visual da aplicação
├── estilo.css       # Folha de estilos e responsividade
├── script.js        # Lógica de consumo da API e interações
├── log.png          # Logo do projeto
└── README.md        # Documentação do repositório

## 🎨 Protótipo e Design

Abaixo estão as telas de protótipo planejadas para a aplicação:

### Tela Principal
![Tela Principal](prototipos/tela-inicial.png)

### Modal de Detalhes
![Modal de Detalhes](prototipos/modal-detalhes.png)
