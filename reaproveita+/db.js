const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dataDir = path.join(__dirname, "data");
const dbFile = path.join(dataDir, "reaproveita_plus.sqlite");
const schemaFile = path.join(__dirname, "dbalimentos.sql");

fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(dbFile);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

async function initializeDatabase() {
  const schemaText = fs.readFileSync(schemaFile, "utf8");
  const insertStatements = [
    ...schemaText.matchAll(/INSERT INTO[\s\S]*?;/g),
  ].map((match) => match[0]);
  const ddlSql = schemaText.replace(/INSERT INTO[\s\S]*?;/g, "");

  await new Promise((resolve, reject) => {
    db.exec(ddlSql, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  const [estabelecimentos, alimentos, reservas] = await Promise.all([
    get(`SELECT COUNT(*) AS total FROM estabelecimentos`),
    get(`SELECT COUNT(*) AS total FROM alimentos`),
    get(`SELECT COUNT(*) AS total FROM reservas`),
  ]);

  if (estabelecimentos.total > 0 || alimentos.total > 0 || reservas.total > 0) {
    return;
  }

  for (const insertSql of insertStatements) {
    await run(insertSql);
  }
}

async function listEstablishments() {
  return all(`SELECT * FROM estabelecimentos ORDER BY nome ASC`);
}

async function createEstablishment({ nome, tipo, endereco, telefone }) {
  return run(
    `INSERT INTO estabelecimentos (nome, tipo, endereco, telefone) VALUES (?, ?, ?, ?)`,
    [nome, tipo, endereco, telefone],
  );
}

async function deleteEstablishment(id) {
  await run(
    `DELETE FROM reservas
     WHERE alimento_id IN (
       SELECT id FROM alimentos WHERE estabelecimento_id = ?
     )`,
    [id],
  );

  await run(`DELETE FROM alimentos WHERE estabelecimento_id = ?`, [id]);

  return run(`DELETE FROM estabelecimentos WHERE id = ?`, [id]);
}

async function listFoods() {
  return all(
    `SELECT f.*, e.nome AS estabelecimento_nome,
      CASE
        WHEN date(f.data_validade) < date('now') THEN 'Vencido'
        WHEN date(f.data_validade) <= date('now', '+3 days') THEN 'Próximo do vencimento'
        ELSE 'Em estoque'
      END AS status_validade
    FROM alimentos f
    JOIN estabelecimentos e ON e.id = f.estabelecimento_id
    ORDER BY f.data_validade ASC`,
  );
}

async function createFood({
  estabelecimento_id,
  nome,
  categoria,
  quantidade,
  unidade,
  data_validade,
  valor_unitario,
  desconto,
  observacao,
}) {
  return run(
    `INSERT INTO alimentos (
      estabelecimento_id, nome, categoria, quantidade, unidade, data_validade,
      valor_unitario, desconto, observacao, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'disponivel')`,
    [
      estabelecimento_id,
      nome,
      categoria,
      quantidade,
      unidade,
      data_validade,
      valor_unitario,
      desconto,
      observacao,
    ],
  );
}

async function listReservations() {
  return all(
    `SELECT r.*, f.nome AS alimento_nome, e.nome AS estabelecimento_nome
     FROM reservas r
     JOIN alimentos f ON f.id = r.alimento_id
     JOIN estabelecimentos e ON e.id = f.estabelecimento_id
     ORDER BY r.created_at DESC`,
  );
}

async function createReservation({
  alimento_id,
  cliente_nome,
  quantidade,
  tipo,
  observacao,
}) {
  const alimento = await get(`SELECT * FROM alimentos WHERE id = ?`, [
    alimento_id,
  ]);

  if (!alimento) {
    throw new Error("Alimento não encontrado.");
  }

  if (alimento.quantidade < quantidade) {
    throw new Error("Quantidade solicitada maior que o estoque disponível.");
  }

  const result = await run(
    `INSERT INTO reservas (alimento_id, cliente_nome, quantidade, tipo, observacao, status)
     VALUES (?, ?, ?, ?, ?, 'pendente')`,
    [alimento_id, cliente_nome, quantidade, tipo, observacao || ""],
  );

  const novaQuantidade = alimento.quantidade - quantidade;

  await run(`UPDATE alimentos SET quantidade = ?, status = ? WHERE id = ?`, [
    novaQuantidade,
    novaQuantidade <= 0 ? "reservado" : "disponivel",
    alimento_id,
  ]);

  return result;
}

async function updateReservationStatus(id, status) {
  return run(`UPDATE reservas SET status = ? WHERE id = ?`, [status, id]);
}

async function getDashboardSummary() {
  const [estabelecimentos, alimentos, proximos, reservas, evitado] =
    await Promise.all([
      get(`SELECT COUNT(*) AS total FROM estabelecimentos`),
      get(`SELECT COUNT(*) AS total FROM alimentos`),
      get(
        `SELECT COUNT(*) AS total FROM alimentos WHERE date(data_validade) <= date('now', '+3 days')`,
      ),
      get(`SELECT COUNT(*) AS total FROM reservas`),
      get(`
      SELECT COALESCE(SUM(r.quantidade * f.valor_unitario), 0) AS total
      FROM reservas r
      JOIN alimentos f ON f.id = r.alimento_id
      WHERE r.status IN ('confirmada', 'concluida')
    `),
    ]);

  return {
    estabelecimentos: estabelecimentos.total,
    alimentos: alimentos.total,
    proximos: proximos.total,
    reservas: reservas.total,
    evitado: evitado.total,
  };
}

async function getNearExpiryFoods() {
  return all(
    `SELECT f.*, e.nome AS estabelecimento_nome,
      CASE
        WHEN date(f.data_validade) < date('now') THEN 'Vencido'
        WHEN date(f.data_validade) <= date('now', '+3 days') THEN 'Próximo do vencimento'
        ELSE 'Em estoque'
      END AS status_validade
    FROM alimentos f
    JOIN estabelecimentos e ON e.id = f.estabelecimento_id
    WHERE date(f.data_validade) <= date('now', '+7 days')
    ORDER BY f.data_validade ASC
    LIMIT 8`,
  );
}

async function getReports() {
  const totalValorizado = await get(
    `SELECT COALESCE(SUM(quantidade * valor_unitario), 0) AS total
     FROM alimentos`,
  );

  const totalReservas = await get(
    `SELECT COALESCE(SUM(r.quantidade * f.valor_unitario), 0) AS total
     FROM reservas r
     JOIN alimentos f ON f.id = r.alimento_id
     WHERE r.status IN ('confirmada', 'concluida', 'pendente')`,
  );

  const totalDoacoes = await get(
    `SELECT COUNT(*) AS total FROM reservas WHERE tipo = 'doacao'`,
  );

  const totalDescontos = await get(
    `SELECT COALESCE(SUM(quantidade), 0) AS total
     FROM reservas WHERE tipo = 'desconto'`,
  );

  const porEstabelecimento = await all(
    `SELECT e.nome AS estabelecimento, COUNT(f.id) AS alimentos,
            COALESCE(SUM(f.quantidade * f.valor_unitario), 0) AS valor_estoque
     FROM estabelecimentos e
     LEFT JOIN alimentos f ON f.estabelecimento_id = e.id
     GROUP BY e.id, e.nome
     ORDER BY valor_estoque DESC`,
  );

  return {
    totalValorizado: totalValorizado.total,
    totalReservas: totalReservas.total,
    totalDoacoes: totalDoacoes.total,
    totalDescontos: totalDescontos.total,
    porEstabelecimento,
  };
}

module.exports = {
  db,
  initializeDatabase,
  listEstablishments,
  createEstablishment,
  deleteEstablishment,
  listFoods,
  createFood,
  listReservations,
  createReservation,
  updateReservationStatus,
  getDashboardSummary,
  getNearExpiryFoods,
  getReports,
};
