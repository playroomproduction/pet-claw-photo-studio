/* Local decorative layer. No input handlers, network, sound, canvas or WebGL. */
(function () {
  'use strict';
  var pets = ['hung', 'baby', 'momo', 'biru'];
  var names = ((window.PET_CLAW_THEME || {}).names || ['Pet 1','Pet 2','Pet 3','Pet 4']).map(function(n,i){return String(n || ('Pet '+(i+1))).slice(0,24);});
  var slots = [180, 400, 620, 840];
  var root = document.createElement('div');
  root.id = 'petArcade';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="pet-caption"><small>OUR LITTLE GANG</small>' +
    '<div class="pet-names"><span>Hung &amp; Baby.</span><span>Momo &amp; Biru.</span></div><div class="caption-rule"></div></div>' +
    '<div class="cabinet"><div class="marquee">HAPPY TOGETHER</div><div class="glass-room">' +
    '<div class="track"></div><div class="bed"></div><div class="pet-pool"></div>' +
    '<div class="carriage"><div class="rope"></div><div class="trolley"></div><div class="elevator"><div class="lift-rig">' +
    '<div class="pet caught"><span class="face"></span></div>' +
    '<svg class="claw" viewBox="0 0 96 82"><path d="M48 0V26M48 26V61"/>' +
    '<path class="prong-left" d="M46 26L16 47 12 66 27 76"/>' +
    '<path class="prong-right" d="M50 26L80 47 84 66 69 76"/>' +
    '<rect class="hub" x="35" y="16" width="26" height="22" rx="6"/></svg></div></div></div></div>' +
    '<div class="bottom-panel"><span class="pet-labels">HUNG · BABY · MOMO · BIRU</span>' +
    '<div class="status-lights"><i></i><i></i><i></i></div><div class="prize-door"></div></div></div>';
  document.body.insertBefore(root, document.body.firstChild);
  root.querySelector('.pet-names span:first-child').textContent=names[0]+' & '+names[1];
  root.querySelector('.pet-names span:nth-child(2)').textContent=names[2]+' & '+names[3];
  root.querySelector('.pet-labels').textContent=names.join(' · ');
  var pool = root.querySelector('.pet-pool');
  var caught = root.querySelector('.caught .face');
  // Front and all twelve rear toys are eligible, interleaved early in the cycle.
  var order = [12, 3, 13, 2, 15, 0, 14, 1, 6, 8, 7, 11, 5, 9, 10, 4];
  var round = 0, turn = 0;
  var timer;
  var started = 0;
  var remaining = 12000;
  var paused = false, manualPause = false;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function petFace(index, extra, x, rotation) {
    var el = document.createElement('div');
    el.className = 'pet pool-pet ' + extra;
    el.style.left = x + 'px';
    el.innerHTML = '<span class="face pet-' + pets[index] + '"></span>';
    el.querySelector('.face').style.transform = 'rotate(' + rotation + 'deg)';
    return el;
  }
  var toys = [];
  function addToy(pet, row, x, y, size) {
    var id = toys.length;
    var el = petFace(pet, row === 'front' ? 'front' : 'back', x, 0);
    el.classList.toggle('idle-' + (id % 4), true);
    el.style.top = y + 'px';
    el.style.width = el.style.height = size + 'px';
    el.setAttribute('data-pet', names[pet]);
    el.setAttribute('data-target-id', String(id));
    el.setAttribute('data-row', row);
    pool.appendChild(el);
    var scale = size / 170;
    var carriageX = x + size / 2 - 85;
    var elevatorTop = row === 'front' ? 31 : 18;
    var down = y - (5 + elevatorTop + 46 * scale);
    var restCable = (5 + elevatorTop + 16 * scale - 30) / 89;
    var cable = restCable + down / 89;
    toys.push({id:id, pet:pet, row:row, x:x, y:y, size:size, scale:scale,
      carriageX:carriageX, down:down, cable:cable, restCable:restCable, el:el});
  }
  var backSlots = [[70,370,670,970],[200,500,800,1040],[35,335,635,935]];
  for (var row = 0; row < 3; row++) {
    for (var col = 0; col < 4; col++) {
      addToy((col + row) % 4, 'back', backSlots[row][col], 60 + row * 36, 136);
    }
  }
  for (var j = 0; j < 4; j++) addToy(j, 'front', slots[j], 164, 170);

  // Build immutable numeric routes once, directly from the rendered toy geometry.
  var routes = document.createElement('style');
  routes.setAttribute('id', 'petRoutes');
  routes.textContent = toys.map(function (toy) {
    var n = toy.id;
    return '#petArcade[data-target-id="' + n + '"] .carriage{animation-name:pet-route-' + n + ';}' +
      '#petArcade[data-target-id="' + n + '"] .elevator{animation-name:pet-drop-' + n + ';}' +
      '#petArcade[data-target-id="' + n + '"] .rope{animation-name:pet-rope-' + n + ';}' +
      '@keyframes pet-route-' + n + '{0%,8%,72%,100%{transform:translateX(1030px)}25%,54%{transform:translateX(' + toy.carriageX + 'px)}}' +
      '@keyframes pet-drop-' + n + '{0%,26%,54%,100%{transform:translateY(0)}37%,44%{transform:translateY(' + toy.down + 'px)}78%{transform:translateY(15px)}}' +
      '@keyframes pet-rope-' + n + '{0%,26%,54%,100%{transform:scaleY(' + toy.restCable + ')}37%,44%{transform:scaleY(' + toy.cable + ')}78%{transform:scaleY(' + (toy.restCable + 15 / 89) + ')}}';
  }).join('\n');
  root.appendChild(routes);

  function selectPet() {
    var target = order[(turn + (round % 2) * 8) % order.length];
    var toy = toys[target];
    turn++;
    if (turn === order.length) { turn = 0; round++; }
    toys.forEach(function (item) { item.el.classList.toggle('target', item.id === target); });
    caught.className = 'face pet-' + pets[toy.pet];
    root.setAttribute('data-pet', names[toy.pet]);
    root.setAttribute('data-target-id', String(target));
    root.setAttribute('data-row', toy.row);
    root.setAttribute('data-target-x', String(toy.carriageX));
    // Each pet has an explicit numeric route, not changing inherited variables.
    // Restart the whole synchronized timeline once when a new catch begins.
    root.classList.toggle('motion-reset', true);
    void root.offsetWidth;
    root.classList.toggle('motion-reset', false);
  }
  function schedule() {
    clearTimeout(timer);
    started = Date.now();
    timer = setTimeout(function () {
      remaining = 12000;
      selectPet();
      schedule();
    }, remaining);
  }
  function updateMotion() {
    var mustPause = manualPause || document.hidden || document.body.classList.contains('scrolled') || reduced.matches;
    if (mustPause === paused) return;
    paused = mustPause;
    document.body.classList.toggle('pet-motion-paused', paused);
    if (paused) {
      remaining = Math.max(1, remaining - (Date.now() - started));
      clearTimeout(timer);
    } else schedule();
  }
  window.addEventListener('message', function(e){if(e.source===window.parent && e.data && e.data.type==='pet-claw-preview'){manualPause=!!e.data.paused;updateMotion();}});
  selectPet();
  schedule();
  document.addEventListener('visibilitychange', updateMotion);
  if (reduced.addEventListener) reduced.addEventListener('change', updateMotion);
  else if (reduced.addListener) reduced.addListener(updateMotion);
  new MutationObserver(updateMotion).observe(document.body, {attributes:true, attributeFilter:['class']});
  updateMotion();
}());
