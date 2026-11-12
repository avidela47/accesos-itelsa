(() => {
  const root = document.getElementById('it-motion');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const output = root.querySelector('output');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width, height, hovered, selected, frame;
  let pointer = .5, position = .5, pulse = 0;

  function draw() {
    frame = 0;
    if (!width || !height || !ctx) return;
    position += (pointer - position) * .09;
    const active = hovered || selected;
    const bounds = root.getBoundingClientRect();
    const anchor = active?.getBoundingClientRect();
    const focus = anchor ? (anchor.left + anchor.width / 2 - bounds.left) / width : position;
    ctx.clearRect(0, 0, width, height);
    const ink = ctx.createLinearGradient(0, 0, width, 0);
    ink.addColorStop(0, '#14a29f44');
    ink.addColorStop(.45, '#10788282');
    ink.addColorStop(.72, '#11818f76');
    ink.addColorStop(1, '#314d952d');
    ctx.strokeStyle = ink;
    for (let line = 0; line < 44; line++) {
      const depth = (line - 21.5) / 21.5;
      ctx.beginPath();
      for (let step = 0; step <= 100; step++) {
        const x = step / 100;
        const swell = Math.exp(-18 * (x - focus) ** 2);
        const center = .52 + .12 * Math.sin(7 * x + position * 2.4) + .12 * (x - .5);
        const ribbon = depth * (.10 + .065 * Math.sin(7 * x - depth) + .08 * swell);
        const fold = .045 * Math.sin(11 * x + depth * 2 + position * 2) * depth;
        const ripple = .05 * pulse * Math.sin(30 * (x - focus) + 8 * (1 - pulse)) * swell;
        const y = height * (center + ribbon + fold + ripple);
        if (step === 0) ctx.moveTo(x * width, y);
        else ctx.lineTo(x * width, y);
      }
      ctx.lineWidth = line % 11 === 0 ? 1.3 : .72;
      ctx.stroke();
    }
    pulse *= .94;
    if (!reduced.matches && (Math.abs(pointer - position) > .002 || pulse > .015)) schedule();
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function resize() {
    width = root.clientWidth;
    height = root.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    schedule();
  }

  function update() {
    output.textContent = (hovered || selected)?.textContent.trim() || '';
    schedule();
  }

  root.addEventListener('pointermove', event => {
    if (reduced.matches || event.pointerType === 'touch') return;
    pointer = (event.clientX - root.getBoundingClientRect().left) / width;
    schedule();
  });
  root.addEventListener('pointerleave', () => { pointer = .5; schedule(); });
  root.querySelectorAll('nav a').forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    const enter = () => { hovered = button; update(); };
    const leave = () => { if (hovered === button) hovered = null; update(); };
    button.addEventListener('pointerenter', enter);
    button.addEventListener('pointerleave', leave);
    button.addEventListener('focus', enter);
    button.addEventListener('blur', leave);
    button.addEventListener('click', () => {
      selected?.setAttribute('aria-pressed', 'false');
      selected = selected === button ? null : button;
      selected?.setAttribute('aria-pressed', 'true');
      pulse = reduced.matches ? 0 : 1;
      update();
    });
  });
  new ResizeObserver(resize).observe(root);
  resize();
})();