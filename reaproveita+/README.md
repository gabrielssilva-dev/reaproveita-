# Reaproveita+

O Reaproveita+ é uma aplicação web desenvolvida para ajudar estabelecimentos a controlar alimentos próximos do vencimento, reduzir desperdícios e transformar estoques em oportunidades de venda, reserva ou doação.

## Visão geral do projeto

A ideia do sistema é facilitar a gestão de alimentos em redes de padarias, restaurantes, mercados e outros locais que precisam controlar a validade e a disponibilidade de produtos. A plataforma permite:

- cadastrar estabelecimentos;
- registrar alimentos por local;
- acompanhar a validade dos itens;
- identificar produtos em risco de vencimento;
- registrar reservas e pedidos;
- verificar o valor do estoque e do desperdício evitado;
- gerar uma visão geral do desempenho por meio de dashboard.

Com isso, o projeto combina gestão operacional, sustentabilidade e controle financeiro em uma única solução.

## Objetivo principal

O objetivo do Reaproveita+ é reduzir o desperdício alimentar, melhorar a organização do estoque e incentivar o reaproveitamento de alimentos que ainda podem ser utilizados com desconto, reserva ou doação.

## Problema que o sistema resolve

Muitas empresas enfrentam dificuldades para:

- acompanhar alimentos com validade próxima;
- saber o que está em estoque em cada estabelecimento;
- registrar vendas com desconto ou reservas;
- controlar o volume de itens que poderiam ser reaproveitados;
- reduzir perdas financeiras e impactos ambientais.

O sistema centraliza esses dados em um ambiente simples e visual, ajudando na tomada de decisão.

## Funcionalidades

### 1. Gestão de estabelecimentos

- cadastro de locais onde os alimentos são armazenados;
- organização por nome, tipo, endereço e telefone;
- manutenção de dados de cada unidade.

### 2. Cadastro de alimentos

- registro de alimentos com nome, categoria, quantidade, unidade e validade;
- controle do valor unitário e do desconto aplicado;
- identificação do estabelecimento responsável;
- acompanhamento do status do item.

### 3. Controle de validade

- alerta para alimentos vencidos ou próximos do vencimento;
- organização por data de validade;
- visualização de itens em risco de serem descartados.

### 4. Reservas e movimentações

- registro de clientes ou pedidos de alimentos;
- controle de quantidade solicitada;
- definição do tipo de movimentação, como doação ou desconto;
- atualização do estoque após a reserva.

### 5. Dashboard administrativo

- visão geral dos indicadores principais;
- quantidade de estabelecimentos e alimentos cadastrados;
- itens próximos do vencimento;
- desperdício evitado;
- métricas resumidas para gestão.

### 6. Relatórios

- análise por valor de estoque;
- sumarização de movimentações e reservas;
- acompanhamento do potencial de reutilização dos alimentos.

## Fluxo de uso do sistema

### Cadastro inicial

1. O usuário cadastra os estabelecimentos.
2. Em seguida, registra os alimentos disponíveis em cada unidade.
3. Define a quantidade, categoria e data de validade.

### Acompanhamento diário

1. O sistema verifica a validade dos produtos.
2. Itens próximos do vencimento aparecem em alerta.
3. A equipe pode decidir entre venda com desconto, reserva ou doação.

### Controle de saída

1. O gestor registra uma reserva.
2. O sistema valida se há quantidade disponível.
3. O estoque é atualizado automaticamente.

### Análise de desempenho

1. O dashboard mostra o cenário atual da operação.
2. O administrador pode acompanhar crescimento, risco e eficiência.
3. As decisões passam a ser baseadas em dados reais.

## Tecnologias utilizadas

- Node.js: ambiente de execução JavaScript no servidor.
- Express: framework para criação das rotas e da API da aplicação.
- EJS: template engine para renderização das páginas HTML.
- SQLite: banco de dados leve para armazenar os dados da aplicação.
- HTML/CSS: estrutura e estilo da interface.

## Estrutura do projeto

A estrutura principal do projeto é a seguinte:

- [server.js](server.js): configuração do servidor, rotas e carregamento das páginas.
- [db.js](db.js): conexão com o banco de dados e funções de consulta e manipulação.
- [dbalimentos.sql](dbalimentos.sql): script de criação das tabelas do banco.
- [views/](views): páginas renderizadas com EJS.
- [public/styles.css](public/styles.css): estilos da interface do sistema.
- [data/](data): diretório de armazenamento do banco SQLite.
- [package.json](package.json): configuração do projeto e dependências.

## Passo a passo para executar o projeto

### 1. Abra o terminal

Entre na pasta do projeto:

```bash
cd reaproveita+
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie a aplicação

```bash
npm start
```

### 4. Acesse no navegador

A aplicação será aberta em:

```text
http://localhost:3000
```

### 5. Use as telas disponíveis

Você pode acessar:

- Dashboard principal
- Estabelecimentos
- Alimentos
- Reservas
- Relatórios

## Banco de dados

O sistema utiliza SQLite para guardar:

- estabelecimentos;
- alimentos;
- reservas;
- status dos itens e movimentações.

A base é criada automaticamente ao iniciar a aplicação, usando o arquivo [dbalimentos.sql](dbalimentos.sql).

## Melhorias possíveis

Algumas evoluções futuras para o projeto incluem:

- autenticação de usuários;
- login por perfil de administrador e operador;
- exportação de relatórios em PDF ou Excel;
- gráficos mais avançados;
- integração com WhatsApp ou e-mail para alertas de validade;
- painel com filtros por data, estabelecimento e categoria.

## Benefícios esperados

- redução de desperdício de alimentos;
- melhor organização do estoque;
- aumento da eficiência operacional;
- maior controle financeiro;
- apoio à sustentabilidade ambiental;
- tomada de decisão mais rápida e informada.

## Conclusão

O Reaproveita+ é uma solução prática para empresas que desejam reduzir perdas, melhorar a gestão de alimentos e criar um processo mais sustentável. O sistema combina organização, monitoramento e análise em um único painel administrativo, tornando a operação mais eficiente e consciente.
