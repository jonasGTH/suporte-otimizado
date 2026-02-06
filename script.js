/* =====================================================
   SCRIPT.JS — UI/UX MODERNO 2026
   - Dark mode consistente
   - Busca sticky
   - CTA flutuante para Ordem
   - Copy rápido
   - Ordem de serviço otimizada
===================================================== */

(function () {
  "use strict";

  const $ = (q) => document.querySelector(q);
  const $$ = (q) => document.querySelectorAll(q);

  /* ================= TOAST ================= */

function toast(msg, time = 2200) {
  let t = document.getElementById("__toast");

  if (!t) {
    t = document.createElement("div");
    t.id = "__toast";
    document.body.appendChild(t);
  }

  t.textContent = msg;

  // força reflow para reiniciar animação
  t.className = "";
  void t.offsetWidth;
  t.className = "toast-show";

  clearTimeout(t._t);
  t._t = setTimeout(() => {
    t.className = "toast-hide";
  }, time);
}

function playCopyBeep() {
  const beep = document.createElement("audio");
  beep.src =
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
  beep.volume = 0.3;
  beep.play().catch(() => {});
}


 /* ================= COPY ================= */

async function copy(txt) {
  try {
    await navigator.clipboard.writeText(txt);
  } catch {
    const t = document.createElement("textarea");
    t.value = txt;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    document.body.removeChild(t);
  }

  playCopyBeep();                 // 🔊 som
  toast("✔ MENSAGEM COPIADA");     // 🔥 alerta animado
}


  /* ================= FAST MESSAGES ================= */
  function initMessages() {
    $$(".mensagens__item").forEach((box) => {
      const ta = box.querySelector("textarea");
      const btn = box.querySelector("button");
      if (!ta || !btn) return;

      btn.onclick = () => ta.value.trim() && copy(ta.value);
      ta.onclick = () => ta.value.trim() && copy(ta.value);
    });
  }




/* ================= função de busca ================= */
function initSearch() {
  const bar = document.createElement("div");
  bar.id = "search-bar";
  bar.innerHTML = `
    <input id="search-input" placeholder="Buscar na página (case sensitive)" />
    <span id="search-count"></span>
  `;
  document.querySelector("main").prepend(bar);

  const input = document.getElementById("search-input");
  const counter = document.getElementById("search-count");

  let results = [];
  let index = 0;

  /* ================= CORE SEARCH ================= */

  function clearResults() {
    results.forEach(r => r.el.classList.remove("search-hit"));
    results = [];
    index = 0;
    counter.textContent = "";
  }

  function collectTextNodes() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (
            parent.closest("script, style, noscript") ||
            parent.offsetParent === null
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      nodes.push(n);
    }
    return nodes;
  }

  function collectFormFields() {
    return Array.from(
      document.querySelectorAll("textarea, input[type='text'], input[type='number']")
    );
  }

  function runSearch(query) {
    clearResults();
    if (!query) return;

    /* ===== TEXT NODES (conteúdo renderizado) ===== */
    collectTextNodes().forEach(node => {
      if (node.nodeValue.includes(query)) {
        results.push({ el: node.parentElement });
      }
    });

    /* ===== TEXTAREAS / INPUTS (value) ===== */
    collectFormFields().forEach(field => {
      if (field.value && field.value.includes(query)) {
        results.push({ el: field });
      }
    });

    // Remove duplicados
    results = [...new Set(results.map(r => r.el))].map(el => ({ el }));

    if (results.length) {
      results[0].el.classList.add("search-hit");
      results[0].el.scrollIntoView({ behavior: "smooth", block: "center" });
      counter.textContent = `1 / ${results.length}`;
    } else {
      counter.textContent = "0 resultados";
    }
  }

  /* ================= EVENTS ================= */

  input.addEventListener("input", () => {
    runSearch(input.value);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && results.length) {
      results[index].el.classList.remove("search-hit");
      index = (index + 1) % results.length;
      results[index].el.classList.add("search-hit");
      results[index].el.scrollIntoView({ behavior: "smooth", block: "center" });
      counter.textContent = `${index + 1} / ${results.length}`;
    }
  });

  /* ================= CTRL + F OVERRIDE (opcional) ================= */
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
}


  /* ================= THEME ================= */
  function initTheme() {
    const body = document.body;
    const saved = localStorage.getItem("theme");
    body.className = saved || "day";

    $("#b1")?.addEventListener("click", () => {
      body.className = "day";
      localStorage.setItem("theme", "day");
    });

    $("#b2")?.addEventListener("click", () => {
      body.className = "night";
      localStorage.setItem("theme", "night");
    });
  }

  /* ================= ORDEM ================= */
  function initOrder() {
    const out = $("#resultado");
    const gerar = $("#gerar-ordem");
    const copiar = $("#copiar-preview");
    const limpar = $("#limpar-formulario");
    const container = $("#ordem-container");

    if (!container) return;

    function gerarTexto() {
      const get = (id) => $(id)?.value || "";
      return `
ORDEM GERADA EM: ${new Date().toLocaleString("pt-BR")}

Tipo: ${$('input[name="tipo"]:checked')?.value || ""}

LED ONU: ${$('input[name="led"]:checked')?.value || ""}

Reclamação:
${get("#reclamacao")}

Suporte Prestado:
${get("#suporte")}

Observações:
${get("#obs")}

Telefones:
${get("#telefones")}

Referências:
${get("#referencias")}

ID Cliente:
${get("#idcliente")}

Plano:
${$('input[name="plano"]:checked')?.value || ""}

Solicitante:
${get("#solicitante")}
`.trim();
    }

    gerar.onclick = () => {
      out.textContent = gerarTexto();
      out.style.display = "block";
      copiar.style.display = "inline-block";
      toast("Ordem gerada");
    };

    copiar.onclick = () => copy(out.textContent);

    limpar.onclick = () => {
      container.querySelectorAll("textarea").forEach((t) => (t.value = ""));
      container.querySelectorAll("input").forEach((i) => (i.checked = false));
      out.style.display = "none";
      copiar.style.display = "none";
      toast("Formulário limpo");
    };
  }

  /* =====================================================
   AUTO-PREENCHIMENTO — SUPORTE PRESTADO + OBS
   (Funcionalidade restaurada)
===================================================== */

function atualizarSuporte() {
  const led = document.querySelector('input[name="led"]:checked');
  const suporte = document.getElementById("suporte");

  if (!led || !suporte) return;

  let texto = "";

  switch (led.value) {
    case "Vermelho fixo":
      texto =
        "Orientado o cliente que LED vermelho indica perda de comunicação por problema na fibra.\n" +
        "Solicitado reiniciar o equipamento e coferir o conector se está frouxo,pressionando contra o aparelho.\n" +
        "Cliente fez procedimento mas sem sucesso.";
      break;

    case "Apagado":
      texto =
        "Informado ao cliente que LED apagado indica ausência total de sinal.\n" +
        "Solicitado verificar cabo óptico, conectar corretamente o conector verde/azul.\n" +
        "Reiniciado modem/ONU e aguardado retorno.";
      break;

    case "Piscando":
      texto =
        "LED piscando rápido indica tentativa de sincronização ou sinal alto;\n" +
        "Solicitado desligar e ligar o equipamento, verificar encaixe do conector do cabo de fibra.\n" +
        "Acompanhada tentativa de estabilização do sinal, sem sucesso.";
      break;

    case "Normal":
      texto =
        "Informado que LED normal indica sinal chegando corretamente.\n" +
        "Orientado realizar teste em mais dispositivos.\n" +
        "Reiniciado roteador para otimização, se necessário.";
      break;
  }

 suporte.classList.remove("autofill-animate");
void suporte.offsetWidth; // força reflow
suporte.value = texto;
suporte.classList.add("autofill-animate");

}

/* ================= OBS ================= */

function atualizarOBS() {
  const tipo = document.querySelector('input[name="tipo"]:checked');
  const led = document.querySelector('input[name="led"]:checked');
  const obs = document.getElementById("obs");

  if (!obs) return;

  let texto = "";

  if (tipo) {
    if (tipo.value === "Pessoa Física") {
      texto +=
        "O suporte técnico é passível de cobrança quando o problema é ocasionado pelo cliente (mau uso, equipamento danificado ou rede interna).\n" +
        "Valor: R$80,00 — pagamento em dinheiro ou PIX no ato.\n" +
        "Prazo: até 2 dias úteis.\n\n";
    }

    if (tipo.value === "Pessoa Jurídica") {
      texto +=
        "O suporte técnico é passível de cobrança quando o problema é ocasionado pelo cliente (mau uso, equipamento danificado ou rede interna).\n" +
        "Valor: R$80,00 — pagamento em dinheiro ou PIX no ato.\n" +
        "Prazo: até 12 horas úteis.\n\n";
    }
  }

  if (led) {
    texto += `LED da ONU: ${led.value}.\n`;
  }

obs.classList.remove("autofill-animate");
void obs.offsetWidth;
obs.value = texto.trim();
obs.classList.add("autofill-animate");

}


  /* ORDEM (preview em tempo real + gerar + copiar) */

  function readOrderValues(){
    return {
      tipo: document.querySelector("input[name='tipo']:checked")?.value || "",
      led: document.querySelector("input[name='led']:checked")?.value || "",
      plano: document.querySelector("input[name='plano']:checked")?.value || "",
      reclamacao: (byId("reclamacao")?.value||"").trim(),
      suporte: (byId("suporte")?.value||"").trim(),
      obs: (byId("obs")?.value||"").trim(),
      telefones: (byId("telefones")?.value||"").trim(),
      referencias: (byId("referencias")?.value||"").trim(),
      idcliente: (byId("idcliente")?.value||"").trim(),
      solicitante: (byId("solicitante")?.value||"").trim(),
    };
  }


/* ================= EVENTOS ================= */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[name="led"]').forEach((r) => {
    r.addEventListener("change", () => {
      atualizarSuporte();
      atualizarOBS();
    });
  });

  document.querySelectorAll('input[name="tipo"]').forEach((r) => {
    r.addEventListener("change", atualizarOBS);
  });

  // Caso já venha marcado
  atualizarSuporte();
  atualizarOBS();
});


  /* ================= CTA FLOAT ================= */
  function initCTA() {
    const btn = document.createElement("button");
    btn.className = "cta-float";
    btn.textContent = "➜ Gerar Ordem";
    btn.onclick = () =>
      $("#ordem-container").scrollIntoView({ behavior: "smooth" });
    document.body.appendChild(btn);
  }

  /* ================= INIT ================= */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMessages();
    initSearch();
    initOrder();
    initCTA();
  });
})();

