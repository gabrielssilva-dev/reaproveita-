const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  const pageLabels = {
    "/": "Dashboard",
    "/estabelecimentos": "Estabelecimentos",
    "/alimentos": "Alimentos",
    "/reservas": "Reservas",
    "/relatorios": "Relatórios",
  };

  res.locals.currentPage = req.path || "/";
  res.locals.currentPageLabel = pageLabels[res.locals.currentPage] || "Página";
  next();
});

app.locals.formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

app.get("/", async (req, res) => {
  try {
    const summary = await db.getDashboardSummary();
    const alimentos = await db.getNearExpiryFoods();

    res.render("index", {
      summary,
      alimentos,
      currentPage: "/",
      currentPageLabel: "Dashboard",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao carregar dashboard.");
  }
});

app.get("/estabelecimentos", async (req, res) => {
  try {
    const estabelecimentos = await db.listEstablishments();
    res.render("estabelecimentos", {
      estabelecimentos,
      currentPage: "/estabelecimentos",
      currentPageLabel: "Estabelecimentos",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao listar estabelecimentos.");
  }
});

app.post("/estabelecimentos", async (req, res) => {
  try {
    const { nome, tipo, endereco, telefone } = req.body;

    if (!nome || !tipo) {
      return res.status(400).send("Nome e tipo são obrigatórios.");
    }

    await db.createEstablishment({ nome, tipo, endereco, telefone });
    res.redirect("/estabelecimentos");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao cadastrar estabelecimento.");
  }
});

app.post("/estabelecimentos/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send("Estabelecimento inválido.");
    }

    await db.deleteEstablishment(id);
    res.redirect("/estabelecimentos");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao excluir estabelecimento.");
  }
});

app.get("/alimentos", async (req, res) => {
  try {
    const alimentos = await db.listFoods();
    const estabelecimentos = await db.listEstablishments();

    res.render("alimentos", {
      alimentos,
      estabelecimentos,
      currentPage: "/alimentos",
      currentPageLabel: "Alimentos",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao listar alimentos.");
  }
});

app.post("/alimentos", async (req, res) => {
  try {
    const {
      estabelecimento_id,
      nome,
      categoria,
      quantidade,
      unidade,
      data_validade,
      valor_unitario,
      desconto,
      observacao,
    } = req.body;

    if (
      !estabelecimento_id ||
      !nome ||
      !categoria ||
      !quantidade ||
      !data_validade
    ) {
      return res
        .status(400)
        .send("Preencha todos os campos obrigatórios do alimento.");
    }

    await db.createFood({
      estabelecimento_id,
      nome,
      categoria,
      quantidade: Number(quantidade),
      unidade: unidade || "unidade",
      data_validade,
      valor_unitario: Number(valor_unitario || 0),
      desconto: Number(desconto || 0),
      observacao,
    });

    res.redirect("/alimentos");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao cadastrar alimento.");
  }
});

app.get("/reservas", async (req, res) => {
  try {
    const reservas = await db.listReservations();
    const alimentos = await db.listFoods();

    res.render("reservas", {
      reservas,
      alimentos,
      currentPage: "/reservas",
      currentPageLabel: "Reservas",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao listar reservas.");
  }
});

app.post("/reservas", async (req, res) => {
  const { alimento_id, cliente_nome, quantidade, tipo, observacao } = req.body;

  if (!alimento_id || !cliente_nome || !quantidade || !tipo) {
    return res.status(400).send("Preencha os campos da reserva.");
  }

  try {
    await db.createReservation({
      alimento_id,
      cliente_nome,
      quantidade: Number(quantidade),
      tipo,
      observacao,
    });

    res.redirect("/reservas");
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || "Erro ao registrar reserva.");
  }
});

app.post("/reservas/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.updateReservationStatus(id, status);
    res.redirect("/reservas");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao atualizar reserva.");
  }
});

app.get("/relatorios", async (req, res) => {
  try {
    const relatorio = await db.getReports();
    res.render("relatorios", {
      relatorio,
      currentPage: "/relatorios",
      currentPageLabel: "Relatórios",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao gerar relatório.");
  }
});

async function initializeApp() {
  try {
    await db.initializeDatabase();
    app.listen(PORT, () => {
      console.log(`reaproveita+ rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Não foi possível inicializar o banco de dados:", error);
    process.exit(1);
  }
}

initializeApp();
