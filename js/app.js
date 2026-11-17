/* =====================================================================
   Clínica Sorriso – comportamento da interface
   HTML, CSS e JavaScript puros. Dados salvos só neste navegador (localStorage).
   ===================================================================== */
'use strict';
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const html = document.documentElement;

  /* ------------------------------------------------------------ VLibras */
  try { if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch (e) { /* sem internet */ }

  /* ------------------------------------------------------------ estado */
  const CHAVE = 'sorriso:v1';
  const PREFS_PADRAO = { fonte: 100, tema: 'claro', temaAntes: 'claro', calmo: true, sons: false, espaco: false, perfil: 'marina', lembretes: false, bloqueado: false, pin: null, visual: null };
  const estado = carregar();
  function carregar() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(CHAVE) || '{}'); } catch (e) { s = {}; }
    return {
      prefs: Object.assign({}, PREFS_PADRAO, s.prefs || {}),
      usuario: s.usuario || null,
      consultas: Array.isArray(s.consultas) ? s.consultas : null,
      rascunho: s.rascunho || {},
      ajuda: Array.isArray(s.ajuda) ? s.ajuda : [],
      ultimaId: s.ultimaId || null
    };
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* modo privado */ } }

  function anunciar(msg) {
    const el = $('#aviso-sr');
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 60);
  }
  function mensagem(msg) { $('#mensagem-geral').textContent = msg || ''; }
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------ datas */
  const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const DIAS_CURTOS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const pad = (n) => String(n).padStart(2, '0');
  const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const somaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const deIso = (s) => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
  const dataLonga = (s) => { const d = deIso(s); return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
  const dataMedia = (s) => { const d = deIso(s); return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`; };
  const horaTxt = (h) => h.replace(':', 'h');
  function diasUteis(n, aPartir) {
    const out = []; let d = somaDias(hoje(), aPartir);
    while (out.length < n) { if (d.getDay() !== 0 && d.getDay() !== 6) out.push(iso(d)); d = somaDias(d, 1); }
    return out;
  }
  function proximoDia(semana, minimo) { let d = somaDias(hoje(), minimo); while (d.getDay() !== semana) d = somaDias(d, 1); return iso(d); }
  function diaUtilPassado(n) { let d = somaDias(hoje(), -n); while (d.getDay() === 0 || d.getDay() === 6) d = somaDias(d, -1); return iso(d); }

  /* ------------------------------------------------------------ dados da clínica */
  const PROFS = {
    ana: { nome: 'Dra. Ana Lima', esp: 'clínica geral', horas: ['08:00', '09:00', '10:00', '14:00', '15:30'] },
    rafael: { nome: 'Dr. Rafael Souza', esp: 'odontopediatria (crianças até 14 anos)', horas: ['08:30', '10:30', '13:30', '16:00'] },
    helena: { nome: 'Dra. Helena Prado', esp: 'ortodontia', horas: ['09:30', '11:00', '15:00'] }
  };
  const TIPOS = { avaliacao: { nome: 'Avaliação e limpeza', min: 40 }, retorno: { nome: 'Retorno', min: 20 }, dor: { nome: 'Dor ou dente quebrado', min: 30 } };
  const CONFORTO = {
    silencio: 'Sala mais silenciosa, sem música ambiente', luz: 'Luz mais baixa e óculos escuros à disposição',
    avisar: 'Aviso antes de cada etapa e de cada barulho', esperar: 'Esperar do lado de fora e receber mensagem',
    pausa: 'Sinal combinado para pausa (levantar a mão)', fones: 'Uso dos próprios fones abafadores'
  };
  const AVISOS = { email: 'e-mail', sms: 'mensagem de texto (SMS)', whatsapp: 'WhatsApp' };
  const ENDERECO = 'Clínica Sorriso – Rua Episcopal, 120, sala 3 (térreo), Centro, São Carlos (SP)';

  if (!estado.consultas) {
    estado.consultas = [
      { id: 'c-tele', para: 'mim', paciente: 'Marina', tipo: 'retorno', formato: 'tele', prof: 'ana', dia: proximoDia(2, 3), hora: '10:00', duracao: 15, conforto: ['avisar'], obs: '', status: 'confirmada', demo: true },
      { id: 'c-antiga', para: 'mim', paciente: 'Marina', tipo: 'avaliacao', formato: 'presencial', prof: 'ana', dia: diaUtilPassado(21), hora: '09:00', duracao: 40, conforto: ['silencio', 'avisar', 'fones'], obs: '', status: 'realizada', demo: true,
        resumo: 'Limpeza feita. A Dra. Ana encontrou uma cárie pequena num dente de baixo, do lado direito. Próximo passo: retorno por teleconsulta para ver se o dente ainda dói.' }
    ];
    salvar();
  }

  /* hash simples e determinístico: decide quais horários estão livres */
  function livre(dia, prof, hora) {
    let h = 7; const s = dia + prof + hora;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const ocupadoPorMim = estado.consultas.some((c) => c.status === 'confirmada' && c.dia === dia && c.hora === hora && c.prof === prof && c.id !== estado.rascunho.remarcando);
    return h % 3 !== 0 && !ocupadoPorMim;
  }
  function horasLivres(dia, prof) { return PROFS[prof].horas.filter((h) => livre(dia, prof, h)); }

  /* ------------------------------------------------------------ preferências */
  const NIVEIS_FONTE = [87.5, 100, 112.5, 125, 150, 175, 200];
  function setSwitch(el, on) { if (typeof el === 'string') el = $(el); if (el) el.setAttribute('aria-checked', on ? 'true' : 'false'); }
  function aplicarPrefs() {
    const p = estado.prefs;
    html.style.fontSize = p.fonte + '%';
    html.dataset.tema = p.tema;
    html.dataset.perfil = p.perfil;
    html.classList.toggle('calmo', !!p.calmo);
    html.classList.toggle('espaco', !!p.espaco);
    $('#fonte-valor').textContent = String(p.fonte).replace('.', ',') + '%';
    /* aria-disabled (e não disabled) para o foco não se perder ao chegar no limite */
    $('#fonte-menos').setAttribute('aria-disabled', p.fonte <= NIVEIS_FONTE[0] ? 'true' : 'false');
    $('#fonte-mais').setAttribute('aria-disabled', p.fonte >= NIVEIS_FONTE[NIVEIS_FONTE.length - 1] ? 'true' : 'false');
    $('#btn-contraste').setAttribute('aria-pressed', p.tema === 'contraste' ? 'true' : 'false');
    setSwitch('#btn-calmo', p.calmo); setSwitch('#sw-calmo', p.calmo); setSwitch('#sw-sons', p.sons);
    setSwitch('#sw-espaco', p.espaco); setSwitch('#sw-lembretes', p.lembretes); setSwitch('#sw-bloqueio', p.bloqueado);
    $('#bloq-estado').textContent = p.bloqueado ? 'Ligado. Para desligar, use “Desbloquear (adulto)” no topo.' : 'Desligado';
    $$('input[name="tema"]').forEach((i) => { i.checked = i.value === p.tema; });
    if (grupos.perfil) grupos.perfil.definir(p.perfil);
    $('#faixa-bloqueio').hidden = !p.bloqueado;
    $$('#menu a[data-rota]').forEach((a) => {
      const travar = p.bloqueado && !LIVRES_NO_BLOQUEIO.includes(a.dataset.rota);
      const t = a.querySelector('.trav');
      if (travar && !t) a.insertAdjacentHTML('beforeend', '<span class="trav"><svg class="ico" aria-hidden="true"><use href="#i-cadeado"/></svg><span class="sr-only"> (bloqueado)</span></span>');
      if (!travar && t) t.remove();
    });
    atualizarSaudacao();
  }
  function mudarPref(chave, valor, aviso) {
    estado.prefs[chave] = valor; salvar(); aplicarPrefs();
    if (aviso) anunciar(aviso);
  }

  $('#fonte-mais').addEventListener('click', () => {
    if (estado.prefs.fonte >= 200) { anunciar('O texto já está no tamanho máximo, 200%.'); return; }
    const i = NIVEIS_FONTE.indexOf(estado.prefs.fonte);
    const v = NIVEIS_FONTE[Math.min(NIVEIS_FONTE.length - 1, (i < 0 ? 1 : i) + 1)];
    mudarPref('fonte', v);
  });
  $('#fonte-menos').addEventListener('click', () => {
    if (estado.prefs.fonte <= 87.5) { anunciar('O texto já está no tamanho mínimo.'); return; }
    const i = NIVEIS_FONTE.indexOf(estado.prefs.fonte);
    const v = NIVEIS_FONTE[Math.max(0, (i < 0 ? 1 : i) - 1)];
    mudarPref('fonte', v);
  });
  $('#fonte-padrao').addEventListener('click', () => mudarPref('fonte', 100));
  $('#btn-contraste').addEventListener('click', () => {
    const p = estado.prefs;
    if (p.tema === 'contraste') mudarPref('tema', p.temaAntes || 'claro', 'Alto contraste desligado.');
    else { p.temaAntes = p.tema; mudarPref('tema', 'contraste', 'Alto contraste ligado.'); }
  });
  function ligarSwitch(el, fn) {
    el.addEventListener('click', () => { const on = el.getAttribute('aria-checked') !== 'true'; fn(on, el); });
  }
  ligarSwitch($('#btn-calmo'), (on) => mudarPref('calmo', on, on ? 'Modo calmo ligado.' : 'Modo calmo desligado.'));
  ligarSwitch($('#sw-calmo'), (on) => mudarPref('calmo', on, on ? 'Modo calmo ligado.' : 'Modo calmo desligado.'));
  ligarSwitch($('#sw-sons'), (on) => mudarPref('sons', on, on ? 'Sons ligados.' : 'Sons desligados.'));
  ligarSwitch($('#sw-espaco'), (on) => mudarPref('espaco', on, on ? 'Espaçamento ampliado ligado.' : 'Espaçamento ampliado desligado.'));
  ligarSwitch($('#sw-lembretes'), (on) => mudarPref('lembretes', on, on ? 'Lembretes ligados. Só por escrito.' : 'Lembretes desligados.'));
  ligarSwitch($('#sw-bloqueio'), (on) => { if (on) pedirPin('definir'); });
  $$('input[name="tema"]').forEach((i) => i.addEventListener('change', () => {
    if (i.value !== 'contraste') estado.prefs.temaAntes = i.value;
    mudarPref('tema', i.value, 'Cores alteradas.');
  }));

  $('#btn-libras').addEventListener('click', () => {
    const b = document.querySelector('[vw-access-button]');
    if (window.VLibras && b && b.offsetParent !== null) { b.click(); anunciar('Tradutor de Libras aberto.'); }
    else if (window.VLibras && b) { b.click(); }
    else mensagem('O tradutor VLibras não carregou. Ele precisa de internet. Tente de novo em alguns segundos.');
  });

  /* ------------------------------------------------------------ componentes ARIA */
  const grupos = {};
  /** Grupo de opções customizado (role="radiogroup"), com setas e uma parada de Tab. */
  function radiogroup(grupo, aoMudar) {
    const itens = () => $$('[role="radio"]', grupo).filter((r) => r.getAttribute('aria-disabled') !== 'true');
    function marcar(r) { itens().forEach((x) => { const s = x === r; x.setAttribute('aria-checked', s ? 'true' : 'false'); x.tabIndex = s ? 0 : -1; }); }
    function escolher(r, foco) { marcar(r); if (foco) r.focus(); if (aoMudar) aoMudar(r.dataset.valor, r); }
    grupo.addEventListener('click', (e) => { const r = e.target.closest('[role="radio"]'); if (r && grupo.contains(r)) escolher(r, true); });
    grupo.addEventListener('keydown', (e) => {
      const r = e.target.closest('[role="radio"]'); if (!r) return;
      const l = itens(); let i = l.indexOf(r);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = (i + 1) % l.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = (i - 1 + l.length) % l.length;
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = l.length - 1;
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); escolher(r, true); return; }
      else return;
      e.preventDefault(); escolher(l[i], true);
    });
    return {
      definir(v) { const r = itens().find((x) => x.dataset.valor === v); if (r) marcar(r); },
      valor() { const r = itens().find((x) => x.getAttribute('aria-checked') === 'true'); return r ? r.dataset.valor : null; },
      prepararTab() { const l = itens(); if (l.length && !l.some((x) => x.tabIndex === 0)) l[0].tabIndex = 0; }
    };
  }
  /** Abas (tablist / tab / tabpanel) com ativação automática pelas setas. */
  function abas(raiz) {
    const tabs = $$('[role="tab"]', raiz);
    function ativar(t, foco) {
      tabs.forEach((x) => {
        const s = x === t;
        x.setAttribute('aria-selected', s ? 'true' : 'false'); x.tabIndex = s ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !s;
      });
      if (foco) t.focus();
      raiz.dispatchEvent(new CustomEvent('aba', { detail: t.id }));
    }
    tabs.forEach((t) => {
      t.addEventListener('click', () => ativar(t, true));
      t.addEventListener('keydown', (e) => {
        let i = tabs.indexOf(t);
        if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = tabs.length - 1; else return;
        e.preventDefault(); ativar(tabs[i], true);
      });
    });
    return { ativar: (id) => ativar(document.getElementById(id), false) };
  }
  /** Acordeão: botão com aria-expanded e aria-controls. */
  function acordeao(botao) {
    botao.addEventListener('click', () => {
      const aberto = botao.getAttribute('aria-expanded') === 'true';
      botao.setAttribute('aria-expanded', aberto ? 'false' : 'true');
      document.getElementById(botao.getAttribute('aria-controls')).hidden = aberto;
    });
  }

  /* ------------------------------------------------------------ diálogos */
  let focoAntes = null;
  function abrirDialogo(d) { focoAntes = document.activeElement; d.showModal(); }
  $$('dialog').forEach((d) => d.addEventListener('close', () => { if (focoAntes && document.contains(focoAntes)) focoAntes.focus(); }));
  $$('[data-fechar]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));

  /* PIN do modo bloqueado */
  let pinModo = null, pinDestino = null;
  function pedirPin(modo, destino) {
    pinModo = modo; pinDestino = destino || null;
    const d = $('#dlg-pin');
    $('#dlg-pin-tit').textContent = modo === 'definir' ? 'Criar o PIN do modo bloqueado' : 'Desbloquear o app';
    $('#dlg-pin-desc').textContent = modo === 'definir'
      ? 'Escolha 4 números que a criança não saiba. Você vai usar este PIN para sair do modo bloqueado. Para testar, pode usar 1234.'
      : 'O modo bloqueado está ligado. Um adulto precisa digitar o PIN para abrir esta tela.';
    $('#pin-ok').textContent = modo === 'definir' ? 'Ligar o modo bloqueado' : 'Desbloquear';
    limparErro($('#pin'), $('#erro-pin'));
    $('#pin').value = '';
    abrirDialogo(d);
    $('#pin').focus();
  }
  $('#form-pin').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#pin').value.trim();
    if (!/^\d{4}$/.test(v)) { mostrarErro($('#pin'), $('#erro-pin'), 'O PIN precisa ter exatamente 4 números. Exemplo: 1234.'); $('#pin').focus(); return; }
    if (pinModo === 'definir') {
      estado.prefs.pin = v; estado.prefs.bloqueado = true; salvar(); aplicarPrefs();
      $('#dlg-pin').close();
      location.hash = '#/como-e';
      setTimeout(() => mensagem('Modo bloqueado ligado. Só “Como é a consulta” e “Escovar os dentes” estão abertos.'), 50);
    } else {
      if (v !== estado.prefs.pin) { mostrarErro($('#pin'), $('#erro-pin'), 'Este PIN não confere. Confira os números e tente de novo.'); $('#pin').select(); return; }
      estado.prefs.bloqueado = false; salvar(); aplicarPrefs();
      $('#dlg-pin').close();
      mensagem('App desbloqueado. Todas as telas estão abertas.');
      if (pinDestino) location.hash = '#/' + pinDestino;
    }
  });
  $('#pin').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
  $('#btn-desbloquear').addEventListener('click', () => pedirPin('desbloquear'));

  /* restaurar preferências */
  $('#btn-restaurar').addEventListener('click', () => abrirDialogo($('#dlg-restaurar')));
  $('#dlg-restaurar-sim').addEventListener('click', () => {
    const perfil = estado.prefs.perfil;
    estado.prefs = Object.assign({}, PREFS_PADRAO, { perfil });
    salvar(); aplicarPrefs(); $('#dlg-restaurar').close();
    mensagem('Preferências restauradas: texto em 100%, cores claras, modo calmo ligado e sons desligados.');
  });

  /* ------------------------------------------------------------ menu "Mais opções" */
  const btnMais = $('#btn-mais'), submenu = $('#submenu-mais');
  const linksSub = () => $$('a', submenu).filter((a) => a.offsetParent !== null);
  function abrirSub(focarPrimeiro) { btnMais.setAttribute('aria-expanded', 'true'); submenu.hidden = false; if (focarPrimeiro) linksSub()[0].focus(); }
  function fecharSub(focarBotao) { btnMais.setAttribute('aria-expanded', 'false'); submenu.hidden = true; if (focarBotao) btnMais.focus(); }
  btnMais.addEventListener('click', () => (submenu.hidden ? abrirSub(false) : fecharSub(false)));
  btnMais.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); abrirSub(true); } });
  submenu.addEventListener('keydown', (e) => {
    const l = linksSub(); const i = l.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); fecharSub(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); l[(i + 1) % l.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); l[(i - 1 + l.length) % l.length].focus(); }
  });
  btnMais.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharSub(true); });
  document.addEventListener('click', (e) => { if (!submenu.hidden && !e.target.closest('.menu__mais')) fecharSub(false); });
  $('.menu__mais').addEventListener('focusout', (e) => { if (!submenu.hidden && !e.currentTarget.contains(e.relatedTarget) && e.relatedTarget) fecharSub(false); });

  /* ------------------------------------------------------------ atalhos de teclado */
  function pular(alvo) {
    if (alvo === 'menu') { const a = $('#menu a[aria-current="page"]') || $('#menu a'); a.focus(); a.scrollIntoView({ block: 'nearest' }); return; }
    if (alvo === 'conteudo') { const h = $('.vista:not([hidden]) h1'); (h || $('#conteudo')).focus(); return; }
    const el = document.getElementById(alvo); if (el) { el.focus(); }
  }
  $$('[data-pular]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); pular(a.dataset.pular); }));
  document.addEventListener('keydown', (e) => {
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const m = { Digit1: 'conteudo', Digit2: 'menu', Digit3: 'rodape', Numpad1: 'conteudo', Numpad2: 'menu', Numpad3: 'rodape' }[e.code];
    if (m) { e.preventDefault(); pular(m); }
  });

  /* ------------------------------------------------------------ rotas */
  const ROTAS = {
    inicio: { t: 'Início' },
    agendar: { t: 'Agendar consulta', pai: 'inicio' },
    confirmado: { t: 'Consulta marcada', pai: 'consultas', nav: 'consultas' },
    consultas: { t: 'Minhas consultas', pai: 'inicio' },
    'como-e': { t: 'Como é a consulta', pai: 'inicio' },
    teleconsulta: { t: 'Teleconsulta', pai: 'consultas' },
    atividades: { t: 'Escovar os dentes', pai: 'inicio' },
    ajuda: { t: 'Ajuda por mensagem', pai: 'inicio' },
    novidades: { t: 'Novidades do app', pai: 'inicio' },
    ajustes: { t: 'Preferências', pai: 'inicio' },
    entrar: { t: 'Entrar sem senha', pai: 'inicio' },
    acessibilidade: { t: 'Acessibilidade', pai: 'inicio' },
    creditos: { t: 'Créditos das imagens', pai: 'acessibilidade' },
    mapa: { t: 'Mapa do site', pai: 'inicio' },
    'nao-encontrada': { t: 'Página não encontrada', pai: 'inicio' }
  };
  const LIVRES_NO_BLOQUEIO = ['como-e', 'atividades', 'acessibilidade', 'creditos'];
  const entrada = {}, saida = {};
  let rotaAtual = null, primeira = true, ultimoHash = '#/inicio';

  function rotaDoHash() {
    const h = location.hash;
    if (!h || h === '#' || h === '#/') return 'inicio';
    if (!h.startsWith('#/')) return null;
    const r = h.slice(2).split('?')[0];
    return ROTAS[r] ? r : 'nao-encontrada';
  }
  function parametro(nome) { const q = location.hash.split('?')[1]; return q ? new URLSearchParams(q).get(nome) : null; }

  function rotear() {
    const r = rotaDoHash();
    if (r === null) return; // âncora interna (ex.: link de erro)
    if (estado.prefs.bloqueado && !LIVRES_NO_BLOQUEIO.includes(r)) {
      if (primeira) { history.replaceState(null, '', '#/como-e'); rotear(); return; }
      history.replaceState(null, '', ultimoHash);
      pedirPin('desbloquear', r);
      return;
    }
    if (rotaAtual && saida[rotaAtual]) saida[rotaAtual]();
    if (rotaAtual !== r) mensagem('');
    rotaAtual = r; ultimoHash = location.hash || '#/inicio';
    $$('.vista').forEach((v) => { v.hidden = v.dataset.rota !== r; });
    document.title = `${ROTAS[r].t} · Clínica Sorriso`;
    const navR = ROTAS[r].nav || r;
    $$('#menu a[data-rota]').forEach((a) => { if (a.dataset.rota === navR) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    fecharSub(false);
    montarTrilha(r);
    if (entrada[r]) entrada[r]();
    if (!primeira) { const h1 = $(`.vista[data-rota="${r}"] h1`); if (h1) h1.focus({ preventScroll: true }); window.scrollTo(0, 0); }
    primeira = false;
  }
  function montarTrilha(r) {
    const cad = []; let x = r;
    while (x) { cad.unshift(x); x = ROTAS[x].pai; }
    if (cad[0] !== 'inicio') cad.unshift('inicio');
    $('#trilha-lista').innerHTML = cad.map((k, i) => i === cad.length - 1
      ? `<li><span aria-current="page">${esc(ROTAS[k].t)}</span></li>`
      : `<li><a href="#/${k}">${esc(ROTAS[k].t)}</a></li>`).join('');
  }
  window.addEventListener('hashchange', rotear);

  /* ------------------------------------------------------------ usuário */
  function primeiroNome() { return estado.usuario ? estado.usuario.nome.split(' ')[0] : null; }
  function atualizarSaudacao() {
    const s = $('#saudacao');
    if (s) s.textContent = estado.prefs.perfil === 'lucas' ? 'Oi, Lucas!' : (primeiroNome() ? `Olá, ${primeiroNome()}!` : 'Olá!');
    const l = $('#link-usuario');
    l.textContent = estado.usuario ? `${primeiroNome()} · minha conta` : 'Entrar sem senha';
  }

  /* ------------------------------------------------------------ INÍCIO */
  grupos.perfil = radiogroup($('[data-radiogroup="perfil"]'), (v) => {
    mudarPref('perfil', v, v === 'lucas' ? 'Perfil do Lucas: frases curtas e figuras.' : 'Perfil da Marina.');
  });
  function consultasFuturas() {
    const h = iso(hoje());
    return estado.consultas.filter((c) => c.status === 'confirmada' && c.dia >= h).sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora));
  }
  function consultasPassadas() {
    const h = iso(hoje());
    return estado.consultas.filter((c) => c.status !== 'confirmada' || c.dia < h).sort((a, b) => (b.dia + b.hora).localeCompare(a.dia + a.hora));
  }
  function ondeTxt(c) { return c.formato === 'tele' ? 'Teleconsulta pelo app (vídeo, áudio ou mensagens)' : ENDERECO; }
  entrada.inicio = () => {
    const c = consultasFuturas()[0];
    $('#prox-consulta').innerHTML = c
      ? `<p><strong>${esc(dataMedia(c.dia))}, às ${horaTxt(c.hora)}</strong><br>${esc(TIPOS[c.tipo].nome)} ${c.formato === 'tele' ? 'por teleconsulta' : 'na clínica'} com ${esc(PROFS[c.prof].nome)}.</p>
         <p><a href="#/consultas">Ver detalhes em Minhas consultas</a></p>`
      : '<p>Você ainda não tem consulta marcada.</p><p><a href="#/agendar">Agendar uma consulta</a></p>';
    atualizarSaudacao();
  };

  /* ------------------------------------------------------------ AGENDAR */
  const form = $('#form-agendar');
  const NOMES_ETAPA = { 1: 'o que você precisa', 2: 'com quem e quando', 3: 'conforto na visita', 4: 'seus dados', 5: 'confira antes de confirmar' };
  let etapa = 1;
  const r = () => estado.rascunho;

  /* máscaras de entrada */
  function mascarar(tipo, v) {
    let d = v.replace(/\D/g, '');
    if (tipo === 'cpf') { d = d.slice(0, 11); return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'); }
    if (tipo === 'cel') { d = d.slice(0, 11); if (!d.length) return ''; if (d.length <= 2) return '(' + d; if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`; return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; }
    if (tipo === 'data') { d = d.slice(0, 8); if (d.length <= 2) return d; if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`; return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`; }
    return v;
  }
  $$('[data-mascara]').forEach((i) => i.addEventListener('input', (e) => {
    if (e.inputType && e.inputType.startsWith('delete')) return;
    i.value = mascarar(i.dataset.mascara, i.value);
  }));

  /* validações */
  function cpfValido(v) {
    const d = v.replace(/\D/g, '');
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    const calc = (n) => { let s = 0; for (let i = 0; i < n; i++) s += +d[i] * (n + 1 - i); const r2 = (s * 10) % 11; return r2 === 10 ? 0 : r2; };
    return calc(9) === +d[9] && calc(10) === +d[10];
  }
  function lerData(v) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v); if (!m) return null;
    const d = new Date(+m[3], +m[2] - 1, +m[1]);
    return d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 ? d : null;
  }
  const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  function mostrarErro(campo, el, msg) {
    el.textContent = msg; el.hidden = false;
    if (campo) {
      const alvos = campo.matches('fieldset, [role="radiogroup"]') ? [campo, ...$$('input', campo)] : [campo];
      alvos.forEach((a) => {
        if (!a.matches('fieldset')) a.setAttribute('aria-invalid', 'true');
        const db = (a.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        if (!db.includes(el.id)) { db.push(el.id); a.setAttribute('aria-describedby', db.join(' ')); }
      });
    }
  }
  function limparErro(campo, el) {
    el.textContent = ''; el.hidden = true;
    if (campo) { const alvos = campo.matches('fieldset, [role="radiogroup"]') ? [campo, ...$$('input', campo)] : [campo]; alvos.forEach((a) => a.removeAttribute('aria-invalid')); }
  }

  function lerForm() {
    const fd = new FormData(form); const x = r();
    ['para', 'depNome', 'depNasc', 'tipo', 'formato', 'prof', 'obs', 'nome', 'nasc', 'cpf', 'cel', 'email'].forEach((k) => { if (fd.has(k)) x[k] = fd.get(k); });
    x.conforto = fd.getAll('conforto');
    x.avisos = fd.getAll('avisos');
    x.lgpd = $('#lgpd').checked;
    x.dia = grupos.dia ? grupos.dia.valor() || x.dia : x.dia;
    x.hora = grupos.hora ? grupos.hora.valor() || x.hora : x.hora;
    x.etapa = etapa;
  }
  function preencherForm() {
    const x = r();
    $$('input[type="radio"]', form).forEach((i) => { i.checked = x[i.name] === i.value; });
    ['depNome', 'depNasc', 'obs', 'nome', 'nasc', 'cpf', 'cel', 'email'].forEach((k) => { const el = form.elements[k]; if (el) el.value = x[k] || ''; });
    $$('input[name="conforto"]', form).forEach((i) => { i.checked = (x.conforto || []).includes(i.value); });
    $$('input[name="avisos"]', form).forEach((i) => { i.checked = (x.avisos || ['email']).includes(i.value); });
    $('#lgpd').checked = !!x.lgpd;
    $('#bloco-dependente').hidden = x.para !== 'dependente';
    contarObs();
  }
  const autosalvar = debounce(() => {
    lerForm(); salvar();
    const a = new Date();
    $('#salvo').textContent = `Salvo automaticamente às ${pad(a.getHours())}h${pad(a.getMinutes())}. Não há limite de tempo.`;
  }, 400);
  const timersCampo = new Map();
  const revalidarDigitando = (el) => { clearTimeout(timersCampo.get(el)); timersCampo.set(el, setTimeout(() => revalidarCampo(el), 500)); };
  form.addEventListener('input', (e) => { autosalvar(); if (e.target.matches('input[type="text"], input[type="email"], input[type="tel"], textarea')) revalidarDigitando(e.target); });
  form.addEventListener('change', (e) => {
    autosalvar();
    if (e.target.name === 'para') { $('#bloco-dependente').hidden = e.target.value !== 'dependente'; }
    if (e.target.name === 'prof') { lerForm(); renderDias(); renderHoras(); }
    if (e.target.matches('input[type="radio"], input[type="checkbox"]')) revalidarCampo(e.target);
  });
  function contarObs() { const o = $('#obs'); $('#obs-cont').textContent = `Você pode escrever até 300 caracteres. Restam ${300 - o.value.length}.`; }
  $('#obs').addEventListener('input', debounce(contarObs, 500));

  /* dias e horários (radiogroup ARIA) */
  function renderDias() {
    const x = r(); const g = $('#rg-dia');
    const prof = x.prof;
    const dias = diasUteis(8, 1).filter((d) => !prof || horasLivres(d, prof).length);
    g.innerHTML = dias.map((d) => {
      const dt = deIso(d);
      return `<div role="radio" class="chip" aria-checked="${x.dia === d}" tabindex="${x.dia === d ? 0 : -1}" data-valor="${d}"><span>${DIAS_CURTOS[dt.getDay()]}</span><small>${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}</small></div>`;
    }).join('');
    if (x.dia && !dias.includes(x.dia)) x.dia = null;
    grupos.dia.prepararTab();
  }
  function renderHoras() {
    const x = r(); const g = $('#rg-hora');
    if (!x.prof || !x.dia) { g.innerHTML = ''; g.hidden = true; $('#dica-hora').textContent = 'Escolha primeiro o profissional e o dia.'; return; }
    const hs = horasLivres(x.dia, x.prof);
    if (x.hora && !hs.includes(x.hora)) x.hora = null;
    g.hidden = false;
    $('#dica-hora').textContent = `Horários livres com ${PROFS[x.prof].nome} em ${dataMedia(x.dia)}. Use as setas para mudar.`;
    g.innerHTML = hs.map((h) => `<div role="radio" class="chip" aria-checked="${x.hora === h}" tabindex="${x.hora === h ? 0 : -1}" data-valor="${h}">${horaTxt(h)}</div>`).join('');
    grupos.hora.prepararTab();
  }
  grupos.dia = radiogroup($('#rg-dia'), (v) => { r().dia = v; r().hora = null; salvar(); renderHoras(); autosalvar(); revalidarCampo($('#rg-dia')); });
  grupos.hora = radiogroup($('#rg-hora'), (v) => { r().hora = v; salvar(); autosalvar(); revalidarCampo($('#rg-hora')); });

  function validar(n) {
    lerForm();
    const x = r(); const e = [];
    const add = (campo, erroId, msg) => e.push({ campo, erro: $('#' + erroId), msg });
    if (n === 1) {
      if (!x.para) add($('#g-para'), 'erro-para', 'Escolha para quem é a consulta: “Para mim” ou “Para um dependente”.');
      if (x.para === 'dependente') {
        if (!x.depNome || x.depNome.trim().split(/\s+/).length < 2) add($('#dep-nome'), 'erro-dep-nome', 'Escreva o nome e o sobrenome do dependente. Exemplo: Lucas Ferreira.');
        const dn = lerData(x.depNasc || '');
        if (!dn) add($('#dep-nasc'), 'erro-dep-nasc', 'Escreva a data com dia, mês e ano, só com números. Exemplo: 05/08/2017.');
        else if (dn > hoje()) add($('#dep-nasc'), 'erro-dep-nasc', 'A data de nascimento não pode ser depois de hoje. Confira o ano.');
      }
      if (!x.tipo) add($('#g-tipo'), 'erro-tipo', 'Escolha o tipo de consulta. Se não souber, escolha “Avaliação e limpeza”.');
      if (!x.formato) add($('#g-formato'), 'erro-formato', 'Escolha “Na clínica” ou “Teleconsulta”.');
      else if (x.formato === 'tele' && x.tipo === 'avaliacao') add($('#g-formato'), 'erro-formato', 'A avaliação com limpeza precisa ser na clínica. Escolha “Na clínica” ou mude o tipo para “Retorno”.');
    }
    if (n === 2) {
      if (!x.prof) add($('#g-prof'), 'erro-prof', 'Escolha um dos três profissionais.');
      else if (x.prof === 'rafael' && x.para === 'mim') add($('#g-prof'), 'erro-prof', 'O Dr. Rafael atende só crianças até 14 anos. Escolha a Dra. Ana ou a Dra. Helena, ou volte à etapa 1 e marque “Para um dependente”.');
      if (!x.dia) add($('#rg-dia'), 'erro-dia', 'Escolha um dia na lista.');
      if (!x.hora) add($('#rg-hora'), 'erro-hora', x.dia && x.prof ? 'Escolha um horário na lista.' : 'Escolha o profissional e o dia; depois, escolha um horário.');
    }
    if (n === 4) {
      if (!x.nome || x.nome.trim().split(/\s+/).length < 2) add($('#nome'), 'erro-nome', 'Escreva seu nome e sobrenome. Exemplo: Marina Oliveira.');
      const dn = lerData(x.nasc || '');
      if (!dn) add($('#nasc'), 'erro-nasc', 'Escreva a data com dia, mês e ano, só com números. Exemplo: 14/03/2003.');
      else if (dn > hoje()) add($('#nasc'), 'erro-nasc', 'A data de nascimento não pode ser depois de hoje. Confira o ano.');
      const cd = (x.cpf || '').replace(/\D/g, '');
      if (cd.length !== 11) add($('#cpf'), 'erro-cpf', `O CPF tem 11 números. Você escreveu ${cd.length}. Exemplo: 123.456.789-09.`);
      else if (!cpfValido(x.cpf)) add($('#cpf'), 'erro-cpf', 'Este CPF não existe. Confira os números no seu documento.');
      const cel = (x.cel || '').replace(/\D/g, '');
      if (cel.length !== 11 || cel[2] !== '9') add($('#cel'), 'erro-cel', 'Escreva o celular com DDD: 11 números, começando com o DDD e depois o 9. Exemplo: (16) 99876-5432.');
      if (!emailValido(x.email || '')) add($('#email'), 'erro-email', 'Escreva o e-mail completo, com @ e o final. Exemplo: marina@email.com.');
      if (!x.avisos.length) add($('#g-avisos'), 'erro-avisos', 'Marque pelo menos um jeito de receber lembretes. Sugestão: e-mail.');
      if (!x.lgpd) add($('#lgpd'), 'erro-lgpd', 'Para marcar a consulta, marque a caixa “Concordo…”. Sem ela não podemos guardar seus dados.');
    }
    return e;
  }
  function mostrarErros(lista) {
    $$('.etapa:not([hidden]) .erro', form).forEach((el) => { const campo = form.querySelector(`[aria-describedby~="${el.id}"]`); limparErro(campo && campo.closest('fieldset, [role="radiogroup"]') || campo, el); });
    $$('.etapa:not([hidden]) [aria-invalid]', form).forEach((a) => a.removeAttribute('aria-invalid'));
    lista.forEach((it) => mostrarErro(it.campo, it.erro, it.msg));
  }
  /* Revalida só o campo que mudou, para a mensagem sumir sem mexer no resto da tela. */
  function revalidarCampo(alvo) {
    const campo = alvo.closest('fieldset, [role="radiogroup"]') || alvo;
    const invalido = campo.getAttribute('aria-invalid') === 'true' || $('[aria-invalid="true"]', campo);
    if (!invalido) return;
    const ids = (campo.getAttribute('aria-describedby') || (alvo.getAttribute('aria-describedby') || '')).split(' ');
    const erroEl = ids.map((i) => document.getElementById(i)).find((el) => el && el.classList.contains('erro'));
    if (!erroEl) return;
    const achado = validar(etapa).find((e) => e.erro === erroEl);
    if (achado) mostrarErro(achado.campo, erroEl, achado.msg); else limparErro(campo, erroEl);
  }
  function resumoErros(lista) {
    const box = $('#resumo-erros');
    if (!lista.length) { box.hidden = true; return; }
    $('span', box.querySelector('h2')).textContent = lista.length === 1 ? 'Falta corrigir 1 item nesta etapa' : `Falta corrigir ${lista.length} itens nesta etapa`;
    $('ul', box).innerHTML = lista.map((it, i) => `<li><a href="#" data-i="${i}">${esc(it.msg)}</a></li>`).join('');
    $$('a', box).forEach((a) => a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const c = lista[+a.dataset.i].campo;
      const alvo = c.matches('fieldset') ? $('input', c) : c.matches('[role="radiogroup"]') ? ($('[tabindex="0"]', c) || $('[role="radio"]', c) || c) : c;
      (alvo || c).focus();
    }));
    box.hidden = false; box.focus();
  }

  function mostrarEtapa(n, foco) {
    etapa = n; r().etapa = n; salvar();
    $$('.etapa', form).forEach((e) => { e.hidden = +e.dataset.etapa !== n; });
    $$('#etapas li').forEach((li) => {
      const k = +li.dataset.etapa;
      li.classList.toggle('feita', k < n);
      if (k === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      const sr = k < n ? ' (concluída)' : '';
      let s = li.querySelector('.sr-only'); if (!s) { s = document.createElement('span'); s.className = 'sr-only'; li.appendChild(s); }
      s.textContent = sr;
    });
    $('#progresso-txt').textContent = `Etapa ${n} de 5: ${NOMES_ETAPA[n]}`;
    $('#btn-voltar').textContent = n === 1 ? 'Sair e voltar ao início (fica salvo)' : `Voltar para a etapa ${n - 1}`;
    $('#btn-avancar').textContent = n < 5 ? `Continuar para a etapa ${n + 1}` : 'Confirmar agendamento';
    $('#resumo-erros').hidden = true;
    if (n === 2) { renderDias(); renderHoras(); }
    if (n === 4) prepararDados();
    if (n === 5) renderResumo();
    document.title = `Agendar consulta (etapa ${n} de 5) · Clínica Sorriso`;
    if (foco) { const h = $(`.etapa[data-etapa="${n}"] h2`, form); h.focus({ preventScroll: true }); h.scrollIntoView({ block: 'start' }); }
  }
  function prepararDados() {
    const u = estado.usuario; const x = r();
    $('#dados-salvos').hidden = !u; $('#dados-entrar').hidden = !!u;
    if (u) ['nome', 'nasc', 'cpf', 'cel', 'email'].forEach((k) => { if (!x[k]) { x[k] = u[k]; form.elements[k].value = u[k]; } });
    if (u && (!x.avisos || !x.avisos.length)) x.avisos = u.avisos;
    $$('input[name="avisos"]', form).forEach((i) => { i.checked = (x.avisos || ['email']).includes(i.value); });
  }
  function renderResumo() {
    const x = r();
    const linhas = [
      ['Para quem', x.para === 'dependente' ? `${x.depNome} (dependente), nascido em ${x.depNasc}` : 'Para mim', 1],
      ['Tipo', `${TIPOS[x.tipo].nome} – cerca de ${TIPOS[x.tipo].min} minutos`, 1],
      ['Onde', x.formato === 'tele' ? 'Teleconsulta pelo app. Você escolhe vídeo, áudio ou mensagens no dia.' : ENDERECO, 1],
      ['Com quem', `${PROFS[x.prof].nome} – ${PROFS[x.prof].esp}`, 2],
      ['Quando', `${dataLonga(x.dia)}, às ${horaTxt(x.hora)}`, 2],
      ['Conforto', x.conforto.length ? x.conforto.map((c) => CONFORTO[c]).join('; ') : 'Nenhuma preferência marcada', 3],
      ['Observação', x.obs ? x.obs : 'Nenhuma', 3],
      ['Seus dados', `${x.nome} · CPF ${x.cpf} · ${x.cel} · ${x.email}`, 4],
      ['Lembretes', x.avisos.map((a) => AVISOS[a]).join(', ') + '. Nunca por ligação.', 4]
    ];
    $('#resumo-agendamento').innerHTML = linhas.map(([k, v, e], i) => `<div><dt id="rs-${i}">${k}</dt><dd>${esc(v)}</dd><dd class="alterar"><button type="button" class="btn btn--sec btn--peq" data-ir="${e}" aria-describedby="rs-${i}">Alterar</button></dd></div>`).join('');
    $$('[data-ir]', $('#resumo-agendamento')).forEach((b) => b.addEventListener('click', () => mostrarEtapa(+b.dataset.ir, true)));
  }

  $('#btn-voltar').addEventListener('click', () => {
    lerForm(); salvar();
    if (etapa === 1) { location.hash = '#/inicio'; mensagem('O que você preencheu ficou salvo. Volte a “Agendar” quando quiser.'); return; }
    mostrarEtapa(etapa - 1, true);
  });
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const erros = validar(etapa);
    mostrarErros(erros);
    if (erros.length) { resumoErros(erros); return; }
    salvar();
    if (etapa < 5) { mostrarEtapa(etapa + 1, true); return; }
    confirmarAgendamento();
  });
  function confirmarAgendamento() {
    const x = r();
    const id = 'c-' + Date.now().toString(36);
    const nova = {
      id, para: x.para, paciente: x.para === 'dependente' ? x.depNome : x.nome.split(' ')[0], tipo: x.tipo, formato: x.formato, prof: x.prof,
      dia: x.dia, hora: x.hora, duracao: TIPOS[x.tipo].min, conforto: x.conforto, obs: x.obs || '', avisos: x.avisos, status: 'confirmada'
    };
    if (x.remarcando) estado.consultas = estado.consultas.filter((c) => c.id !== x.remarcando);
    estado.consultas.push(nova);
    estado.usuario = { nome: x.nome, nasc: x.nasc, cpf: x.cpf, cel: x.cel, email: x.email, avisos: x.avisos };
    estado.ultimaId = id; estado.rascunho = {};
    salvar();
    location.hash = '#/confirmado';
  }
  $('#btn-recomecar').addEventListener('click', () => {
    estado.rascunho = {}; salvar(); preencherForm(); $('#aviso-retomar').hidden = true;
    mostrarEtapa(1, true); anunciar('Formulário limpo. Etapa 1 de 5.');
  });
  entrada.agendar = () => {
    const x = r();
    preencherForm();
    const tem = x.etapa && x.etapa > 1;
    $('#aviso-retomar').hidden = !tem && !x.remarcando;
    if (x.remarcando) {
      const c = estado.consultas.find((k) => k.id === x.remarcando);
      $('#aviso-retomar-txt').textContent = c ? `Você está remarcando a consulta de ${dataMedia(c.dia)}, às ${horaTxt(c.hora)}. Escolha o novo dia e horário. A consulta antiga só é trocada quando você confirmar.` : '';
    } else if (tem) {
      $('#aviso-retomar-txt').textContent = `Você parou na etapa ${x.etapa}. Continuamos de onde parou, com tudo o que você já preencheu.`;
    }
    mostrarEtapa(x.etapa || 1, false);
    $('#salvo').textContent = 'Seu progresso é salvo automaticamente neste aparelho. Não há limite de tempo.';
  };

  /* ------------------------------------------------------------ CONFIRMADO */
  function canais(c) { return (c.avisos && c.avisos.length ? c.avisos : ['email']).map((a) => AVISOS[a]).join(' e '); }
  entrada.confirmado = () => {
    const c = estado.consultas.find((k) => k.id === estado.ultimaId);
    if (!c) { $('#conf-resumo').innerHTML = '<div><dt>Consulta</dt><dd>Não encontramos uma consulta marcada agora. Veja “Minhas consultas”.</dd></div>'; $('#conf-depois').innerHTML = ''; return; }
    $('#conf-resumo').innerHTML = [
      ['Quando', `${dataLonga(c.dia)}, às ${horaTxt(c.hora)}`],
      ['Onde', ondeTxt(c)],
      ['Com quem', PROFS[c.prof].nome],
      ['Para quem', c.para === 'dependente' ? c.paciente : 'Para você'],
      ['Tipo', TIPOS[c.tipo].nome],
      ['Duração', `Cerca de ${c.duracao} minutos`],
      ['Conforto', c.conforto.length ? c.conforto.map((k) => CONFORTO[k]).join('; ') : 'Nenhuma preferência marcada']
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    const vespera = dataMedia(iso(somaDias(deIso(c.dia), -1)));
    $('#conf-depois').innerHTML = [
      `<strong>Agora:</strong> enviamos este resumo por ${canais(c)}.`,
      `<strong>${esc(vespera)}:</strong> você recebe um lembrete por ${canais(c)}. Não ligamos.`,
      c.formato === 'tele'
        ? '<strong>No dia:</strong> abra “Teleconsulta” 5 minutos antes e escolha vídeo, só áudio ou só mensagens.'
        : `<strong>No dia:</strong> chegue 10 minutos antes.${c.conforto.includes('esperar') ? ' Você pode esperar do lado de fora: mandamos mensagem quando for a vez.' : ''}`,
      '<strong>Se precisar mudar:</strong> remarque ou cancele em “Minhas consultas” até 24 horas antes, sem custo.'
    ].map((t) => `<li>${t}</li>`).join('');
    $('#bloco-chegar').hidden = c.formato === 'tele';
  };
  function baixarIcs(c) {
    const [a, m, d] = c.dia.split('-');
    const [hh, mm] = c.hora.split(':').map(Number);
    const fim = new Date(+a, +m - 1, +d, hh, mm + c.duracao);
    const f = (dt) => `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
    const ini = new Date(+a, +m - 1, +d, hh, mm);
    const agora = new Date();
    const stamp = `${agora.getUTCFullYear()}${pad(agora.getUTCMonth() + 1)}${pad(agora.getUTCDate())}T${pad(agora.getUTCHours())}${pad(agora.getUTCMinutes())}00Z`;
    const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Clinica Sorriso//Agendamento//PT-BR', 'BEGIN:VEVENT',
      `UID:${c.id}@clinicasorriso.exemplo`, `DTSTAMP:${stamp}`, `DTSTART:${f(ini)}`, `DTEND:${f(fim)}`,
      `SUMMARY:${TIPOS[c.tipo].nome} – ${PROFS[c.prof].nome}`,
      `LOCATION:${c.formato === 'tele' ? 'Teleconsulta pelo app Clínica Sorriso' : ENDERECO.replace(/,/g, '\\,')}`,
      'DESCRIPTION:Consulta marcada pelo app Clínica Sorriso. Para remarcar ou cancelar\\, use Minhas consultas.',
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Lembrete: consulta amanhã', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([txt], { type: 'text/calendar;charset=utf-8' }));
    const l = document.createElement('a'); l.href = url; l.download = `consulta-${c.dia}.ics`;
    document.body.appendChild(l); l.click(); l.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    anunciar('Arquivo de agenda baixado. Abra o arquivo para adicionar a consulta à sua agenda.');
  }
  $('#btn-ics').addEventListener('click', () => { const c = estado.consultas.find((k) => k.id === estado.ultimaId); if (c) baixarIcs(c); });

  /* ------------------------------------------------------------ MINHAS CONSULTAS */
  abas($('[data-rota="consultas"] [data-abas]'));
  function cartaoConsulta(c, passada) {
    const t = `ct-${c.id}`;
    const meta = `${dataLonga(c.dia)}, às ${horaTxt(c.hora)} · ${c.formato === 'tele' ? 'teleconsulta' : 'na clínica, sala 3'} · cerca de ${c.duracao} min · para ${c.para === 'dependente' ? c.paciente : 'você'}`;
    const etiqueta = c.status === 'cancelada' ? 'Cancelada' : passada ? 'Realizada' : 'Confirmada';
    let acoes = '';
    if (!passada) {
      acoes = `<div class="botoes">
        ${c.formato === 'tele' ? `<a class="btn btn--prim btn--peq" href="#/teleconsulta?id=${c.id}" aria-describedby="${t}">Preparar e entrar na teleconsulta</a>` : `<a class="btn btn--prim btn--peq" href="#/como-e" aria-describedby="${t}">Ver como é a consulta</a>`}
        <button type="button" class="btn btn--sec btn--peq" data-ics="${c.id}" aria-describedby="${t}">Baixar lembrete (.ics)</button>
        <button type="button" class="btn btn--sec btn--peq" data-remarcar="${c.id}" aria-describedby="${t}">Remarcar</button>
        <button type="button" class="btn btn--sec btn--peq" data-cancelar="${c.id}" aria-describedby="${t}">Cancelar</button>
      </div>`;
    } else if (c.resumo) {
      acoes = `<h3 class="acordeao"><button type="button" class="acordeao__botao" aria-expanded="false" aria-controls="res-${c.id}">Ver o resumo desta consulta <svg class="ico" aria-hidden="true"><use href="#i-seta"/></svg></button></h3>
        <div class="acordeao__painel" id="res-${c.id}" hidden><p>${esc(c.resumo)}</p></div>`;
    }
    return `<li class="consulta${passada ? ' consulta--passada' : ''}"><article aria-labelledby="${t}">
      <h2 id="${t}">${esc(TIPOS[c.tipo].nome)} com ${esc(PROFS[c.prof].nome)}</h2>
      <p class="consulta__meta">${esc(meta)}</p>
      <p><span class="etiqueta">${etiqueta}</span>${c.demo ? ' <span class="dica">(dado de demonstração)</span>' : ''}</p>
      ${acoes}</article></li>`;
  }
  entrada.consultas = () => {
    const f = consultasFuturas(), p = consultasPassadas();
    $('#lista-proximas').innerHTML = f.length ? f.map((c) => cartaoConsulta(c, false)).join('') : '<li class="consulta"><p>Nenhuma consulta marcada.</p><a class="btn btn--prim" href="#/agendar">Agendar consulta</a></li>';
    $('#lista-anteriores').innerHTML = p.length ? p.map((c) => cartaoConsulta(c, true)).join('') : '<li class="consulta"><p>Nenhuma consulta anterior.</p></li>';
    $$('#lista-anteriores .acordeao__botao').forEach(acordeao);
  };
  let cancelarId = null;
  $('section[data-rota="consultas"]').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ics) baixarIcs(estado.consultas.find((c) => c.id === b.dataset.ics));
    if (b.dataset.remarcar) {
      const c = estado.consultas.find((k) => k.id === b.dataset.remarcar);
      estado.rascunho = { para: c.para, depNome: c.para === 'dependente' ? c.paciente : '', tipo: c.tipo, formato: c.formato, prof: c.prof, conforto: c.conforto, obs: c.obs, remarcando: c.id, etapa: 2 };
      if (estado.usuario) Object.assign(estado.rascunho, estado.usuario);
      salvar(); location.hash = '#/agendar';
    }
    if (b.dataset.cancelar) {
      const c = estado.consultas.find((k) => k.id === b.dataset.cancelar);
      cancelarId = c.id;
      const horas = (new Date(deIso(c.dia).getTime() + 36e5 * +c.hora.split(':')[0]) - new Date()) / 36e5;
      $('#dlg-cancelar-desc').textContent = `${TIPOS[c.tipo].nome} com ${PROFS[c.prof].nome}, ${dataMedia(c.dia)}, às ${horaTxt(c.hora)}. ` +
        (horas >= 24 ? 'Faltam mais de 24 horas: não há custo. ' : 'Faltam menos de 24 horas: a clínica pode cobrar uma taxa. ') +
        'O horário fica livre para outra pessoa. Para voltar a ter consulta, será preciso agendar de novo.';
      abrirDialogo($('#dlg-cancelar'));
    }
  });
  $('#dlg-cancelar-sim').addEventListener('click', () => {
    const c = estado.consultas.find((k) => k.id === cancelarId);
    if (c) c.status = 'cancelada';
    salvar(); $('#dlg-cancelar').close(); entrada.consultas();
    mensagem(`Consulta de ${dataMedia(c.dia)} cancelada. Ela agora aparece na aba “Anteriores”.`);
    $('#aba-proximas').focus();
  });

  /* ------------------------------------------------------------ COMO É A CONSULTA */
  const abasComo = abas($('[data-rota="como-e"] [data-abas]'));
  const PASSOS = [
    { img: 'picto-1-chegar.svg', alt: 'Pictograma de relógio: chegar e esperar cerca de 10 minutos.', t: 'Chegar e esperar',
      m: 'Você chega, fala seu nome na recepção e espera sentada ou do lado de fora. A espera dura cerca de 10 minutos.',
      l: 'Você chega com sua mãe. Você fala seu nome. Você espera sentado. Dura uns 10 minutos.' },
    { img: 'picto-2-cadeira.svg', alt: 'Pictograma de cadeira odontológica que deita um pouco para trás.', t: 'Sentar na cadeira',
      m: 'Você senta numa cadeira que deita um pouco para trás. A dentista avisa antes de mexer na cadeira.',
      l: 'Você senta na cadeira. A cadeira deita um pouco. A Dra. Ana avisa antes.' },
    { img: 'picto-3-luz.svg', alt: 'Pictograma de luz acesa e de óculos escuros: a luz é forte, mas não esquenta.', t: 'A luz acende',
      m: 'Uma luz forte acende em cima de você. Ela não esquenta. Você pode usar óculos escuros e fones abafadores.',
      l: 'Uma luz forte acende. Ela não esquenta. Você pode usar óculos escuros.' },
    { img: 'picto-4-casa.svg', alt: 'Pictograma de casa: a consulta acabou e é hora de ir para casa.', t: 'Acabou! Ir para casa',
      m: 'A dentista diz “acabou”. Você levanta, pega suas coisas e vai embora.',
      l: 'A Dra. Ana diz: “acabou!”. Você levanta e vai para casa com sua mãe.' }
  ];
  let passo = 0;
  function renderPasso(anunciarMudanca) {
    const p = PASSOS[passo]; const lucas = estado.prefs.perfil === 'lucas';
    $('#historia-cont').textContent = `Passo ${passo + 1} de ${PASSOS.length}`;
    const img = $('#historia-img'); img.src = 'img/' + p.img; img.alt = p.alt;
    $('#historia-tit').textContent = `${passo + 1}. ${p.t}`;
    $('#historia-txt').textContent = lucas ? p.l : p.m;
    $('#historia-trilha').innerHTML = PASSOS.map((x, i) => `<li class="${i < passo ? 'feito' : ''}" ${i === passo ? 'aria-current="step"' : ''}><span class="sr-only">Passo ${i + 1}: ${x.t}${i < passo ? ' (visto)' : i === passo ? ' (agora)' : ''}</span></li>`).join('');
    $('#hist-ant').disabled = passo === 0;
    $('#hist-prox').textContent = passo === PASSOS.length - 1 ? 'Começar de novo' : 'Próximo passo';
    pararFala();
    if (anunciarMudanca) anunciar(`${$('#historia-tit').textContent}. ${$('#historia-txt').textContent}`);
  }
  $('#hist-ant').addEventListener('click', () => { if (passo > 0) { passo--; renderPasso(true); } });
  $('#hist-prox').addEventListener('click', () => { passo = passo === PASSOS.length - 1 ? 0 : passo + 1; renderPasso(true); });
  [$('#hist-ant'), $('#hist-prox')].forEach((b) => b.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && passo < PASSOS.length - 1) { e.preventDefault(); passo++; renderPasso(true); }
    if (e.key === 'ArrowLeft' && passo > 0) { e.preventDefault(); passo--; renderPasso(true); }
  }));

  /* leitura em voz alta: só quando a pessoa toca */
  const temFala = 'speechSynthesis' in window;
  let falando = false;
  function pararFala() { if (temFala) speechSynthesis.cancel(); falando = false; const b = $('#btn-ouvir-passo span'); if (b) b.textContent = 'Ouvir este passo'; }
  $('#btn-ouvir-passo').addEventListener('click', () => {
    if (!temFala) { mensagem('Este navegador não consegue ler textos em voz alta.'); return; }
    if (falando) { pararFala(); return; }
    const u = new SpeechSynthesisUtterance(`${$('#historia-tit').textContent}. ${$('#historia-txt').textContent}`);
    u.lang = 'pt-BR'; u.rate = 0.9; u.volume = 0.8;
    u.onend = pararFala;
    speechSynthesis.speak(u); falando = true;
    $('#btn-ouvir-passo span').textContent = 'Parar de ouvir';
  });

  /* vídeo: nunca começa sozinho; controles extras grandes */
  const video = $('#video-historia');
  const trilhaLegenda = () => (video.textTracks && video.textTracks[0]) || null;
  video.addEventListener('loadedmetadata', () => { const t = trilhaLegenda(); if (t) t.mode = 'showing'; });
  $('#vid-play').addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); });
  video.addEventListener('play', () => { $('#vid-play').textContent = 'Pausar o vídeo'; });
  video.addEventListener('pause', () => { $('#vid-play').textContent = 'Tocar o vídeo'; });
  video.addEventListener('ended', () => { $('#vid-play').textContent = 'Tocar de novo'; });
  $('#vid-voltar').addEventListener('click', () => { video.currentTime = Math.max(0, video.currentTime - 5); });
  $('#vid-legenda').addEventListener('click', (e) => {
    const t = trilhaLegenda(); const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    if (t) t.mode = on ? 'showing' : 'hidden';
    e.currentTarget.setAttribute('aria-pressed', on ? 'true' : 'false');
    e.currentTarget.textContent = on ? 'Legendas ligadas' : 'Legendas desligadas';
  });
  $('#vid-vel').addEventListener('change', (e) => { video.playbackRate = +e.target.value; });
  $('[data-rota="como-e"] [data-abas]').addEventListener('aba', (e) => { if (e.detail !== 'aba-video') video.pause(); pararFala(); });
  entrada['como-e'] = () => renderPasso(false);
  saida['como-e'] = () => { video.pause(); pararFala(); };

  /* ------------------------------------------------------------ TELECONSULTA */
  grupos.canal = radiogroup($('[data-radiogroup="canal"]'));
  ['#sw-camera', '#sw-autoimagem', '#sw-legendas', '#sw-escuro'].forEach((s) => ligarSwitch($(s), (on, el) => {
    el.setAttribute('aria-checked', on ? 'true' : 'false');
    if (s === '#sw-camera') anunciar(on ? 'Câmera será ligada ao entrar.' : 'Câmera desligada.');
  }));
  let teleConsulta = null, roteiroPos = 0, roteiroTimer = null;
  const ROTEIRO = [
    { t: 'Olá, {nome}. Eu sou a Dra. Ana Lima, dentista. Esta conversa dura até 15 minutos.' },
    { t: 'Vou fazer 3 perguntas, uma de cada vez. Você pode responder com os botões ou escrevendo.' },
    { t: 'Pergunta 1 de 3: o dente ainda dói quando você come ou bebe algo gelado?', r: ['Sim', 'Não', 'Um pouco'] },
    { t: 'Obrigada. Pergunta 2 de 3: a gengiva sangra quando você escova os dentes?', r: ['Sim', 'Não', 'Às vezes'] },
    { t: 'Entendi. Pergunta 3 de 3: você quer marcar a limpeza agora ou receber o link por e-mail para marcar depois?', r: ['Marcar agora', 'Receber por e-mail'] },
    { t: 'Combinado. Vou enviar o resumo por e-mail ainda hoje. A consulta terminou. Você pode sair da sala quando quiser.', fim: true }
  ];
  entrada.teleconsulta = () => {
    const id = parametro('id');
    teleConsulta = estado.consultas.find((c) => c.id === id && c.formato === 'tele') || consultasFuturas().find((c) => c.formato === 'tele');
    $('#tele-preparo').hidden = false; $('#tele-sala').hidden = true; $('#tele-fim').hidden = true;
    if (!teleConsulta) {
      $('#tele-info').innerHTML = '<div><dt>Situação</dt><dd>Você não tem teleconsulta marcada. <a href="#/agendar">Agendar uma consulta</a> e escolher “Teleconsulta”.</dd></div>';
      $('#btn-entrar-sala').hidden = true; return;
    }
    $('#btn-entrar-sala').hidden = false;
    $('#tele-info').innerHTML = [
      ['Com quem', PROFS[teleConsulta.prof].nome],
      ['Quando', `${dataLonga(teleConsulta.dia)}, às ${horaTxt(teleConsulta.hora)}`],
      ['Tipo', TIPOS[teleConsulta.tipo].nome],
      ['Duração', 'Até 15 minutos']
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
  };
  function msgChat(log, autor, texto, eu) {
    const li = document.createElement('div');
    li.className = 'msg' + (eu ? ' msg--eu' : '');
    li.innerHTML = `<span class="msg__autor">${esc(autor)}</span>${esc(texto)}`;
    log.appendChild(li); log.scrollTop = log.scrollHeight;
  }
  function falaDraAna() {
    const passoR = ROTEIRO[roteiroPos]; if (!passoR) return;
    $('#sala-digitando').textContent = 'A Dra. Ana está escrevendo…';
    roteiroTimer = setTimeout(() => {
      $('#sala-digitando').textContent = '';
      msgChat($('#sala-log'), 'Dra. Ana Lima', passoR.t.replace('{nome}', primeiroNome() || 'Marina'));
      $('#sala-rapidas').innerHTML = (passoR.r || []).map((x) => `<button type="button" class="btn btn--sec btn--peq">${esc(x)}</button>`).join('');
      roteiroPos++;
      if (!passoR.r && !passoR.fim) falaDraAna();
      if (passoR.fim) { $('#sala-msg').disabled = true; $('#btn-sair-sala').classList.replace('btn--sec', 'btn--prim'); }
    }, 1400);
  }
  function respostaPaciente(t) {
    if (!t.trim()) return;
    msgChat($('#sala-log'), 'Você', t, true);
    $('#sala-rapidas').innerHTML = '';
    if (ROTEIRO[roteiroPos - 1] && ROTEIRO[roteiroPos - 1].r) falaDraAna();
  }
  $('#sala-rapidas').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { respostaPaciente(b.textContent); $('#sala-msg').focus(); } });
  $('#sala-form').addEventListener('submit', (e) => { e.preventDefault(); const i = $('#sala-msg'); respostaPaciente(i.value); i.value = ''; });
  $('#btn-entrar-sala').addEventListener('click', () => {
    const canal = grupos.canal.valor() || 'chat';
    const cam = $('#sw-camera').getAttribute('aria-checked') === 'true';
    const leg = $('#sw-legendas').getAttribute('aria-checked') === 'true';
    const nomes = { video: 'vídeo', audio: 'só áudio', chat: 'só mensagens' };
    $('#tele-preparo').hidden = true; $('#tele-sala').hidden = false;
    $('#tele-sala').classList.toggle('escura', $('#sw-escuro').getAttribute('aria-checked') === 'true');
    $('#sala-video').classList.toggle('oculto', canal === 'chat');
    $('.sala__corpo').classList.toggle('sala__corpo--so-chat', canal === 'chat');
    $('#sala-estado').textContent = `Canal: ${nomes[canal]} · Câmera: ${cam && canal === 'video' ? 'ligada' : 'desligada'} · Legendas: ${leg || canal === 'chat' ? 'ligadas' : 'desligadas'}`;
    $('#sala-log').innerHTML = ''; $('#sala-msg').disabled = false; $('#btn-sair-sala').classList.replace('btn--prim', 'btn--sec');
    roteiroPos = 0;
    $('#t-sala').focus();
    falaDraAna();
  });
  $('#btn-sair-sala').addEventListener('click', () => {
    clearTimeout(roteiroTimer);
    $('#tele-sala').hidden = true; $('#tele-fim').hidden = false; $('#t-tele-fim').focus();
  });
  saida.teleconsulta = () => { clearTimeout(roteiroTimer); };

  /* ------------------------------------------------------------ ATIVIDADE: ESCOVAR */
  const ESCOVA = [
    { t: 'Molhar a escova', img: 'escova-1-molhar.svg', alt: 'Pictograma: molhar a escova na água da torneira.' },
    { t: 'Escovar os dentes de cima', img: 'escova-2-cima.svg', alt: 'Pictograma: escovar os dentes de cima, destacados em verde.' },
    { t: 'Escovar os dentes de baixo', img: 'escova-3-baixo.svg', alt: 'Pictograma: escovar os dentes de baixo, destacados em verde.' },
    { t: 'Escovar a língua', img: 'escova-4-lingua.svg', alt: 'Pictograma: escovar a língua com cuidado.' },
    { t: 'Cuspir e enxaguar a boca', img: 'escova-5-enxaguar.svg', alt: 'Pictograma: copo com água para cuspir e enxaguar a boca.' }
  ];
  let aPasso = 0, aResta = 30, aRodando = false, aTimer = null, aIniciou = false;
  const duracaoPasso = () => +$('#ativ-duracao').value;
  function renderAtiv() {
    const p = ESCOVA[aPasso];
    $('#ativ-agora').textContent = `Passo ${aPasso + 1} de 5 — Agora: ${p.t}`;
    $('#ativ-depois').textContent = aPasso < 4 ? `Depois: ${ESCOVA[aPasso + 1].t.toLowerCase()}.` : 'Depois: a atividade acaba.';
    const img = $('#ativ-img'); img.src = 'img/' + p.img; img.alt = p.alt;
    $('#ativ-lista').innerHTML = ESCOVA.map((x, i) => `<li class="${i < aPasso ? 'feito' : ''}" ${i === aPasso ? 'aria-current="step"' : ''}><span>${i + 1}. ${x.t}</span><span class="estado">${i < aPasso ? 'feito' : i === aPasso ? 'agora' : 'depois'}</span></li>`).join('');
    relogio();
  }
  function relogio() {
    const d = duracaoPasso();
    $('#relogio-num').textContent = aResta;
    $('#relogio-arco').style.strokeDashoffset = String(100 - (aResta / d) * 100);
    $('#ativ-timer').textContent = aResta === 1 ? 'Falta 1 segundo neste passo.' : `Faltam ${aResta} segundos neste passo.`;
  }
  function bip() {
    if (!estado.prefs.sons) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 520; g.gain.value = 0.04; o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.18);
    } catch (e) { /* sem áudio */ }
  }
  function tique() {
    aResta--;
    if (aResta <= 0) { proximoPassoAtiv(); return; }
    relogio();
  }
  function proximoPassoAtiv() {
    bip();
    if (aPasso >= ESCOVA.length - 1) { terminarAtiv(); return; }
    aPasso++; aResta = duracaoPasso(); renderAtiv();
  }
  function botaoIniciar() { $('#ativ-iniciar').textContent = aRodando ? 'Pausar' : aIniciou ? 'Continuar' : 'Começar'; }
  $('#ativ-iniciar').addEventListener('click', () => {
    if (aRodando) { clearInterval(aTimer); aRodando = false; anunciar('Pausado.'); }
    else { aIniciou = true; aRodando = true; aTimer = setInterval(tique, 1000); anunciar(`Começou. ${ESCOVA[aPasso].t}.`); }
    botaoIniciar();
  });
  $('#ativ-pular').addEventListener('click', proximoPassoAtiv);
  $('#ativ-parar').addEventListener('click', terminarAtiv);
  $('#ativ-duracao').addEventListener('change', () => { aResta = duracaoPasso(); relogio(); });
  function terminarAtiv() {
    clearInterval(aTimer); aRodando = false;
    $('#ativ').hidden = true; $('#ativ-fim').hidden = false; $('#t-ativ-fim').focus();
  }
  function reiniciarAtiv() {
    clearInterval(aTimer); aRodando = false; aIniciou = false; aPasso = 0; aResta = duracaoPasso();
    $('#ativ').hidden = false; $('#ativ-fim').hidden = true; botaoIniciar(); renderAtiv();
  }
  $('#ativ-refazer').addEventListener('click', () => { reiniciarAtiv(); $('#ativ-iniciar').focus(); });
  entrada.atividades = () => { if ($('#ativ-fim').hidden) { botaoIniciar(); renderAtiv(); } };
  saida.atividades = () => { if (aRodando) { clearInterval(aTimer); aRodando = false; botaoIniciar(); } };

  /* ------------------------------------------------------------ AJUDA */
  const FAQ = [
    ['Preciso ligar para a clínica em algum momento?', 'Não. Agendar, confirmar, remarcar e cancelar são feitos por aqui. Dúvidas são respondidas por mensagem escrita. Só ligamos se você pedir.'],
    ['Posso conhecer a sala antes da consulta?', 'Sim. Peça uma “visita de reconhecimento” pela conversa. Ela dura 15 minutos, não tem procedimento e não tem custo.'],
    ['E se eu ficar sobrecarregado durante a consulta?', 'Levante a mão. A dentista para na hora. Você pode sair da sala, voltar quando quiser ou remarcar o resto da consulta para outro dia.'],
    ['Posso levar alguém comigo?', 'Sim. Uma pessoa pode entrar com você na sala.'],
    ['E se a consulta atrasar?', 'Se o atraso passar de 10 minutos, mandamos uma mensagem com o novo horário previsto.'],
    ['Como funciona o modo bloqueado?', 'Um adulto liga o modo em Preferências e cria um PIN de 4 números. Com o modo ligado, a criança só vê “Como é a consulta” e “Escovar os dentes”.']
  ];
  $('#faq').innerHTML = FAQ.map(([q, a], i) => `<h3><button type="button" class="acordeao__botao" aria-expanded="false" aria-controls="faq-${i}">${esc(q)}<svg class="ico" aria-hidden="true"><use href="#i-seta"/></svg></button></h3><div class="acordeao__painel" id="faq-${i}" hidden><p>${esc(a)}</p></div>`).join('');
  $$('#faq .acordeao__botao').forEach(acordeao);

  function respostaRecepcao(t) {
    const s = t.toLowerCase();
    if (/confirm/.test(s)) return 'Sua consulta já está confirmada quando aparece a etiqueta “Confirmada” em Minhas consultas. Não precisa fazer mais nada.';
    if (/cancel|desmarc/.test(s)) return 'Você pode cancelar em Minhas consultas, no botão “Cancelar”. Até 24 horas antes, não há custo. Não precisa ligar.';
    if (/remarc|mudar.*(dia|hor)|trocar/.test(s)) return 'Para remarcar, abra Minhas consultas e toque em “Remarcar”. Você escolhe o novo dia e horário. A consulta antiga só muda quando você confirmar.';
    if (/endere|onde fica|chegar|local/.test(s)) return 'O endereço é Rua Episcopal, 120, Centro, São Carlos (SP). O prédio é térreo e tem rampa. A recepção fica logo depois da porta de vidro.';
    if (/fone|óculos|oculos|kit|barulho|luz/.test(s)) return 'Pode, sim. Você pode usar seus fones e óculos escuros durante toda a consulta. A clínica também empresta um kit sensorial na recepção.';
    if (/dor|doendo|urg/.test(s)) return 'Para dor, agende o tipo “Dor ou dente quebrado”. Temos horários no mesmo dia ou no dia seguinte. Se a dor for muito forte, procure um pronto-socorro.';
    return 'Recebi sua mensagem. Vou verificar e respondo aqui em até 10 minutos. Você pode sair desta tela: a resposta fica salva nesta conversa.';
  }
  function renderAjuda() {
    const log = $('#ajuda-log'); log.innerHTML = '';
    const base = [{ a: 'Joana, da recepção', t: 'Olá! Eu sou a Joana, da recepção. Escreva sua dúvida. Eu respondo por aqui, por escrito.' }].concat(estado.ajuda);
    base.forEach((m) => msgChat(log, m.a, m.t, m.eu));
  }
  let ajudaTimer = null;
  function enviarAjuda(t) {
    const campo = $('#ajuda-msg');
    if (!t.trim()) { mostrarErro(campo, $('#erro-ajuda-msg'), 'Escreva uma mensagem antes de tocar em Enviar.'); campo.focus(); return; }
    limparErro(campo, $('#erro-ajuda-msg'));
    estado.ajuda.push({ a: 'Você', t, eu: true }); salvar();
    msgChat($('#ajuda-log'), 'Você', t, true);
    $('#ajuda-digitando').textContent = 'A Joana está escrevendo…';
    clearTimeout(ajudaTimer);
    ajudaTimer = setTimeout(() => {
      $('#ajuda-digitando').textContent = '';
      const resp = respostaRecepcao(t);
      estado.ajuda.push({ a: 'Joana, da recepção', t: resp }); salvar();
      msgChat($('#ajuda-log'), 'Joana, da recepção', resp);
    }, 1500);
  }
  $('#ajuda-form').addEventListener('submit', (e) => { e.preventDefault(); const i = $('#ajuda-msg'); enviarAjuda(i.value); if (i.value.trim()) i.value = ''; });
  $('#ajuda-rapidas').addEventListener('click', (e) => { const b = e.target.closest('[data-msg]'); if (b) enviarAjuda(b.dataset.msg); });
  entrada.ajuda = renderAjuda;

  /* ------------------------------------------------------------ NOVIDADES */
  $('#form-visual').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = new FormData(e.target).get('visual');
    if (!v) { $('#visual-salvo').textContent = 'Escolha uma das três opções antes de salvar.'; return; }
    estado.prefs.visual = v; salvar();
    const t = { manter: 'manter o visual atual', novo: 'usar o novo visual a partir de 1º de dezembro', lembrar: 'perguntar de novo no dia' }[v];
    $('#visual-salvo').textContent = `Escolha salva: ${t}. Você pode mudar aqui quando quiser.`;
  });
  entrada.novidades = () => { $$('input[name="visual"]').forEach((i) => { i.checked = i.value === estado.prefs.visual; }); $('#visual-salvo').textContent = ''; };

  /* ------------------------------------------------------------ ENTRAR SEM SENHA */
  let voltarPara = '#/inicio';
  $('#form-entrar').addEventListener('submit', (e) => {
    e.preventDefault();
    const i = $('#entrar-email');
    if (!emailValido(i.value.trim())) { mostrarErro(i, $('#erro-entrar-email'), 'Escreva o e-mail completo, com @ e o final. Exemplo: marina@email.com.'); i.focus(); return; }
    limparErro(i, $('#erro-entrar-email'));
    $('#entrar-msg').textContent = `Enviamos o link de acesso para ${i.value.trim()}.`;
    $('#form-entrar').hidden = true; $('#entrar-enviado').hidden = false; $('#t-entrar-ok').focus();
  });
  $('#btn-abrir-link').addEventListener('click', () => {
    estado.usuario = { nome: 'Marina Oliveira', nasc: '14/03/2003', cpf: '123.456.789-09', cel: '(16) 99123-4567', email: $('#entrar-email').value.trim(), avisos: ['email', 'whatsapp'] };
    salvar(); atualizarSaudacao();
    location.hash = voltarPara;
    setTimeout(() => mensagem('Você entrou. Seus dados foram preenchidos onde for preciso.'), 50);
  });
  $('#btn-sair').addEventListener('click', () => { estado.usuario = null; salvar(); atualizarSaudacao(); entrada.entrar(); mensagem('Você saiu da conta.'); });
  entrada.entrar = () => {
    const logado = !!estado.usuario;
    $('#form-entrar').hidden = logado; $('#entrar-enviado').hidden = true; $('#entrar-logado').hidden = !logado;
    if (logado) $('#logado-msg').textContent = `Você entrou como ${estado.usuario.nome} (${estado.usuario.email}).`;
  };
  window.addEventListener('hashchange', (e) => {
    const de = (e.oldURL.split('#')[1] || '');
    if (location.hash.startsWith('#/entrar') && de.startsWith('/') && !de.startsWith('/entrar')) voltarPara = '#' + de;
  });

  /* ------------------------------------------------------------ CRÉDITOS */
  const IMAGENS = [
    ['logo.svg', 'Cabeçalho (logotipo) e ícone da aba'], ['recepcao.svg', 'Início'], ['avatar-marina.svg', 'Início – escolha de perfil'],
    ['avatar-lucas.svg', 'Início – escolha de perfil'], ['dra-ana.svg', 'Agendar – etapa 2'], ['dr-rafael.svg', 'Agendar – etapa 2'],
    ['dra-helena.svg', 'Agendar – etapa 2'], ['confirmado.svg', 'Consulta marcada'], ['fachada.svg', 'Consulta marcada – como chegar'],
    ['picto-1-chegar.svg', 'Como é a consulta – passo 1'], ['picto-2-cadeira.svg', 'Como é a consulta – passo 2'],
    ['picto-3-luz.svg', 'Como é a consulta – passo 3'], ['picto-4-casa.svg', 'Como é a consulta – passo 4'],
    ['historia-da-consulta.mp4 e capa', 'Como é a consulta – vídeo (5 cenas próprias, sem áudio, com legendas)'],
    ['sala-atendimento.svg', 'Como é a consulta – a sala'], ['kit-sensorial.svg', 'Como é a consulta – kit sensorial'],
    ['teleconsulta.svg', 'Teleconsulta'], ['escova-1-molhar.svg a escova-5-enxaguar.svg', 'Escovar os dentes – um pictograma por passo'],
    ['dente-feliz.svg', 'Escovar os dentes – fim'], ['ajuda-texto.svg', 'Ajuda por mensagem'],
    ['visual-atual.svg', 'Novidades – como é hoje'], ['visual-novo.svg', 'Novidades – como vai ficar']
  ];
  $('#tabela-creditos').innerHTML = IMAGENS.map(([f, o]) => `<tr><td><code>${esc(f)}</code></td><td>${esc(o)}</td><td>Gerada por IA (Claude Opus 5.5, Anthropic), código SVG original, nov. 2026</td></tr>`).join('');

  /* ------------------------------------------------------------ início */
  aplicarPrefs();
  if (!location.hash || location.hash === '#' || location.hash === '#/') history.replaceState(null, '', '#/inicio');
  rotear();
})();
