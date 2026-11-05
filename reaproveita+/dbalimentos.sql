PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS estabelecimentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT
);

CREATE TABLE IF NOT EXISTS alimentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estabelecimento_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  unidade TEXT DEFAULT 'unidade',
  data_validade TEXT NOT NULL,
  valor_unitario REAL NOT NULL DEFAULT 0,
  desconto INTEGER NOT NULL DEFAULT 0,
  observacao TEXT,
  status TEXT DEFAULT 'disponivel',
  FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id)
);

CREATE TABLE IF NOT EXISTS reservas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alimento_id INTEGER NOT NULL,
  cliente_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('desconto', 'doacao', 'reserva')),
  observacao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alimento_id) REFERENCES alimentos(id)
);

INSERT INTO estabelecimentos (nome, tipo, endereco, telefone)
VALUES
  ('Padaria Sol do Amanhecer', 'Padaria', 'Rua das Flores, 105', '(11) 3333-1010'),
  ('Restaurante Sabor da Rua', 'Restaurante', 'Av. Paulista, 990', '(11) 99888-2211'),
  ('Supermercado Boa Compra', 'Supermercado', 'Rua da Economia, 44', '(11) 4455-7788');

INSERT INTO alimentos (
  estabelecimento_id, nome, categoria, quantidade, unidade, data_validade,
  valor_unitario, desconto, observacao, status
)
VALUES
  (1, 'Pão francês', 'Padaria', 28, 'unidade', date('now', '+2 days'), 0.70, 25, 'Produção do início da manhã', 'disponivel'),
  (1, 'Café em pó', 'Bebida', 12, 'pacote', date('now', '+6 days'), 15.00, 15, 'Lote recente', 'disponivel'),
  (2, 'Salada de folhas', 'Prato pronto', 8, 'porção', date('now', '+1 day'), 12.50, 30, 'Preparação do almoço', 'disponivel'),
  (2, 'Sopa de legumes', 'Prato pronto', 15, 'porção', date('now', '+4 days'), 9.00, 20, 'Sobras do restaurante', 'disponivel'),
  (3, 'Leite integral', 'Laticínio', 18, 'caixa', date('now', '+3 days'), 6.80, 15, 'Validade crítica', 'disponivel'),
  (3, 'Iogurte natural', 'Laticínio', 20, 'unidade', date('now', '+6 days'), 4.50, 20, 'Produto com pouca margem de venda', 'disponivel');

INSERT INTO reservas (alimento_id, cliente_nome, quantidade, tipo, observacao, status)
VALUES
  (1, 'Maria da Silva', 6, 'desconto', 'Compra em balcão com desconto para retirada imediata', 'confirmada'),
  (3, 'ONG Casa da Esperança', 4, 'doacao', 'Doação para apoio comunitário', 'concluida'),
  (5, 'João Pereira', 5, 'reserva', 'Cliente reserva com retirada em 24h', 'pendente');
