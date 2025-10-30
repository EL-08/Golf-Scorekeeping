(() => {
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  const LS_KEY = "golf-scorekeeper-state-v1";

  const state = {
    holes: 9,
    players: [], // {name, scores:number[]}
    undo: [],    // stack of {pi, hi, prev, next}
  };

  const setupEl = $("#setup");
  const scorecardEl = $("#scorecard");
  const scoreTable = $("#scoreTable");
  const totalsBar = $("#totalsBar");
  const undoBtn = $("#undoBtn");
  const clearBtn = $("#clearBtn");
  const resetBtn = $("#resetBtn");
  const wakeBtn = $("#wakeBtn");
  let wakeLock = null;

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify({holes: state.holes, players: state.players}));
    renderTotalsPills();
  }

  function load() {
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(!raw) return false;
      const data = JSON.parse(raw);
      if(!data || !Array.isArray(data.players)) return false;
      state.holes = data.holes || 9;
      state.players = data.players.map(p => ({name: p.name || "Player", scores: (p.scores || []).slice(0, state.holes)}));
      // pad scores
      state.players.forEach(p => { while(p.scores.length < state.holes) p.scores.push(""); });
      return true;
    }catch(e){ console.warn("load failed", e); return false; }
  }

  function totalForPlayer(pi){
    return (state.players[pi]?.scores || []).reduce((sum, v) => sum + (parseInt(v,10)||0), 0);
  }

  function renderTotalsPills(){
    totalsBar.innerHTML = state.players.map((p, i) => `<span class="pill">${escapeHtml(p.name)}: <strong>${totalForPlayer(i)}</strong></span>`).join("");
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

  function buildScorecard(){
    // Header
    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    hr.innerHTML = `<th class="hole-col">Hole</th>` + state.players.map(p => `<th class="player-col">${escapeHtml(p.name)}</th>`).join("");
    thead.appendChild(hr);

    // Body
    const tbody = document.createElement("tbody");
    for(let h=0; h<state.holes; h++){
      const tr = document.createElement("tr");
      tr.innerHTML = `<th>${h+1}</th>` + state.players.map((p, pi) => {
        const val = p.scores[h] ?? "";
        return `<td><input class="score-input" type="number" inputmode="numeric" pattern="[0-9]*" min="0" step="1" data-pi="${pi}" data-hi="${h}" value="${val}"></td>`;
      }).join("");
      tbody.appendChild(tr);
    }

    // Footer totals
    const tfoot = document.createElement("tfoot");
    const fr = document.createElement("tr");
    fr.innerHTML = `<td>Total</td>` + state.players.map((_, pi) => `<td id="total-${pi}">${totalForPlayer(pi)}</td>`).join("");
    tfoot.appendChild(fr);

    scoreTable.innerHTML = "";
    scoreTable.appendChild(thead);
    scoreTable.appendChild(tbody);
    scoreTable.appendChild(tfoot);

    // Wire inputs
    $$(".score-input", scoreTable).forEach(inp => {
      inp.addEventListener("focus", e => e.target.select());
      inp.addEventListener("input", onScoreChange);
      inp.addEventListener("change", onScoreChange);
    });

    renderTotalsPills();
  }

  function onScoreChange(e){
    const inp = e.target;
    const pi = parseInt(inp.dataset.pi,10);
    const hi = parseInt(inp.dataset.hi,10);
    const prev = state.players[pi].scores[hi] === "" ? "" : parseInt(state.players[pi].scores[hi],10);
    const next = inp.value === "" ? "" : parseInt(inp.value,10);

    // push to undo if actually changed
    if(prev !== next){
      state.undo.push({pi, hi, prev, next});
      state.players[pi].scores[hi] = (inp.value === "" ? "" : Math.max(0, next|0));
      $("#total-"+pi).textContent = totalForPlayer(pi);
      save();
    }
  }

  function undo(){
    const last = state.undo.pop();
    if(!last) return;
    const {pi, hi, prev} = last;
    state.players[pi].scores[hi] = prev === "" ? "" : prev;
    const cell = $(`input.score-input[data-pi="${pi}"][data-hi="${hi}"]`);
    if(cell) cell.value = prev === "" ? "" : String(prev);
    $("#total-"+pi).textContent = totalForPlayer(pi);
    save();
  }

  function clearLast(){
    // Clear value in the most recently edited cell (same as undo to previous value, but set to empty and add to stack so it can be undone)
    const inputs = $$(".score-input");
    const active = document.activeElement && document.activeElement.classList.contains("score-input") ? document.activeElement : null;
    const target = active || inputs[inputs.length-1];
    if(!target) return;
    const pi = parseInt(target.dataset.pi,10);
    const hi = parseInt(target.dataset.hi,10);
    const prev = state.players[pi].scores[hi];
    state.undo.push({pi, hi, prev, next: ""});
    state.players[pi].scores[hi] = "";
    target.value = "";
    $("#total-"+pi).textContent = totalForPlayer(pi);
    save();
  }

  function resetAll(){
    if(!confirm("Reset the current round? This clears all scores.")) return;
    localStorage.removeItem(LS_KEY);
    location.reload();
  }

  function showScorecard(){
    setupEl.classList.add("hidden");
    scorecardEl.classList.remove("hidden");
    buildScorecard();
  }

  function initSetup(){
    const form = $("#setupForm");
    const namesWrap = $("#playerNames");
    const countInput = $("#playerCount");

    function renderNameInputs(){
      const count = Math.min(4, Math.max(1, parseInt(countInput.value,10) || 1));
      namesWrap.innerHTML = "";
      for(let i=0;i<count;i++){
        const t = $("#playerNameInput").content.cloneNode(true);
        t.querySelector(".pnum").textContent = i+1;
        t.querySelector(".pname").value = `Player ${i+1}`;
        namesWrap.appendChild(t);
      }
    }

    countInput.addEventListener("input", renderNameInputs);
    renderNameInputs();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const holes = form.holes.value === "18" ? 18 : 9;
      const names = $$(".pname", namesWrap).map(i => (i.value || "Player").trim().slice(0,20));
      state.holes = holes;
      state.players = names.map(n => ({name:n, scores: Array.from({length: holes}, _ => "")}));
      state.undo = [];
      save();
      showScorecard();
      requestWakeLock(); // try to keep awake
    });
  }

  // === Wake Lock (prevent screen sleep where feasible) ===
  async function requestWakeLock(){
    if(!("wakeLock" in navigator)) { wakeBtn.disabled = true; wakeBtn.textContent = "Keep Awake (N/A)"; return; }
    try{
      wakeLock = await navigator.wakeLock.request("screen");
      wakeBtn.textContent = "Awake ✓";
      wakeBtn.classList.add("primary");
      wakeLock.addEventListener("release", () => {
        wakeBtn.textContent = "Keep Awake";
        wakeBtn.classList.remove("primary");
      });
      document.addEventListener("visibilitychange", async () => {
        if(document.visibilityState === "visible" && wakeLock === null){
          try{ wakeLock = await navigator.wakeLock.request("screen"); }catch{}
        }
      });
    }catch(e){
      console.warn("WakeLock failed", e);
      wakeBtn.textContent = "Keep Awake (blocked)";
    }
  }
  wakeBtn.addEventListener("click", requestWakeLock);

  // Buttons
  undoBtn.addEventListener("click", undo);
  clearBtn.addEventListener("click", clearLast);
  resetBtn.addEventListener("click", resetAll);

  // Boot
  if(load()){
    showScorecard();
    requestWakeLock();
  }else{
    initSetup();
  }
})();
