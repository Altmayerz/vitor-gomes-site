(function () {
  'use strict';

  // 1) Fotos: se o arquivo não existir, mostra o espaço reservado
  document.querySelectorAll('.slot').forEach(function (slot) {
    var img = slot.querySelector('img');
    if (!img) return;
    function falta() { slot.classList.add('is-missing'); }
    img.addEventListener('error', falta);
    if (img.complete && img.naturalWidth === 0) falta();
  });

  // 2) Menu no celular
  var menu = document.querySelector('.menu');
  var btn = document.querySelector('.menu-btn');
  if (menu && btn) {
    btn.addEventListener('click', function () {
      var aberto = menu.classList.toggle('aberto');
      btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
  }

  // Cabeçalho compacto durante a rolagem
  var header=document.querySelector('.topo');
  if(header){function syncHeader(){header.classList.toggle('scrolled',window.scrollY>40)}window.addEventListener('scroll',syncHeader,{passive:true});syncHeader()}

  // 4) Carrossel automático: 3 grupos de 2 fotos, loop contínuo sem setas.
  var hero = document.querySelector('.hero');
  if (hero) {
    var track = hero.querySelector('.hero-track');
    var slides = Array.from(hero.querySelectorAll('.hero-slide'));
    var dotsBox = hero.querySelector('.hero-dots');
    var n = slides.length, atual = 0, timer = null;
    var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var clone = slides[0].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('aria-label');
    track.appendChild(clone);
    var dots = [];
    for (var i = 0; i < n; i++) {
      var dot = document.createElement('span');
      dot.className = 'hero-dot';
      dot.setAttribute('aria-hidden', 'true');
      dotsBox.appendChild(dot);
      dots.push(dot);
    }
    function atualizar() {
      dots.forEach(function(d, i) { d.classList.toggle('ativo', i === atual % n); });
      slides.forEach(function(s, i) { s.setAttribute('aria-hidden', i === atual ? 'false' : 'true'); });
    }
    function avancar() {
      atual++;
      track.style.transition = 'transform 1s cubic-bezier(.65,0,.35,1)';
      track.style.transform = 'translateX(' + (-100 * atual) + '%)';
      atualizar();
    }
    track.addEventListener('transitionend', function(e) {
      if (e.target !== track || e.propertyName !== 'transform' || atual !== n) return;
      track.style.transition = 'none';
      atual = 0;
      track.style.transform = 'translateX(0)';
      atualizar();
      // Força o navegador a aplicar o reposicionamento antes da próxima animação.
      void track.offsetWidth;
      track.style.transition = 'transform 1s cubic-bezier(.65,0,.35,1)';
    });
    function iniciar() {
      if (!reduz && !timer && n > 1 && !document.hidden) timer = setInterval(avancar, 5000);
    }
    function parar() { clearInterval(timer); timer = null; }
    document.addEventListener('visibilitychange', function() { document.hidden ? parar() : iniciar(); });
    atualizar();
    iniciar();
  }
})();

// V13 — simulador visual de câmera (efeitos aproximados)
(function(){
 const root=document.querySelector('.camera-experience');if(!root)return;
 const q=s=>root.querySelector(s),iso=q('#camera-iso'),ap=q('#camera-aperture'),speed=q('#camera-shutter-speed');
 const isos=[100,200,400,800,1600],aps=['f/1.8','f/2.8','f/4','f/5.6','f/8'],speeds=['1/30','1/60','1/125','1/250','1/500'];
 const photo=q('#camera-photo'),exposure=q('#camera-exposure'),hud=q('#camera-hud-values'),feedback=q('#camera-feedback');let shots=0;
 function update(){const i=+iso.value,a=+ap.value,s=+speed.value; q('#camera-iso-out').textContent=isos[i];q('#camera-aperture-out').textContent=aps[a];q('#camera-speed-out').textContent=speeds[s];hud.textContent='ISO '+isos[i]+' · '+aps[a]+' · '+speeds[s];
 const ev=(i-2)*.24+(1-a)*.18+(2-s)*.21;photo.style.filter='brightness('+Math.max(.4,Math.min(1.7,1+ev))+') contrast('+(1+(i*.025))+')';photo.style.transform='scale('+(1.025+(4-a)*.006)+')';exposure.style.opacity=String(Math.max(0,Math.min(.48,-ev*.3)));feedback.textContent=ev>.35?'Exposição simulada mais clara.':ev<-.35?'Exposição simulada mais escura.':'Exposição simulada equilibrada.';
 }
 [iso,ap,speed].forEach(el=>el.addEventListener('input',update));q('#camera-reset').addEventListener('click',()=>{iso.value=2;ap.value=1;speed.value=2;update();feedback.textContent='Configurações restauradas.'});
 q('#camera-shutter').addEventListener('click',()=>{shots++;q('#camera-counter').textContent=String(shots).padStart(2,'0')+' CLIQUES';const flash=q('#camera-flash');flash.classList.remove('is-firing');void flash.offsetWidth;flash.classList.add('is-firing');feedback.textContent='Clique registrado! Explore outros ajustes e fotografe novamente.'});update();
})();

// V14 — formulário: abre WhatsApp sem enviar dados a servidor
(function(){const form=document.querySelector('#orcamento-form');if(!form)return;form.addEventListener('submit',function(e){e.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);const v=k=>String(d.get(k)||'').trim();const data=v('data');let fmt='A definir';if(data){const parts=data.split('-');if(parts.length===3)fmt=parts[2]+'/'+parts[1]+'/'+parts[0]}const msg=['Olá, Vitor! Gostaria de solicitar um orçamento para fotografia ou vídeo.','','Nome: '+v('nome'),'Tipo de serviço: '+v('tipo'),'Data desejada: '+fmt,'Local do serviço: '+v('local')];if(v('mensagem'))msg.push('Informações adicionais: '+v('mensagem'));window.open('https://wa.me/5554993389869?text='+encodeURIComponent(msg.join('\n')),'_blank','noopener,noreferrer')})})();

// V18 — animações de entrada quando os elementos aparecem na tela
(function () {
  'use strict';
  const items = Array.from(document.querySelectorAll(
    '.trabalhos-intro, .trabalhos .card, .coberturas-intro, .cobertura-card, .coberturas-footnote, .orcamento-copy, .orcamento-form, .rodape-in > section, .footer-bottom'
  ));
  if (!items.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  items.forEach((el, i) => {
    if (el.matches('.trabalhos .card')) el.style.setProperty('--reveal-delay', ((i % 3) * 90) + 'ms');
    el.classList.add('reveal-ready');
    observer.observe(el);
  });
  // Garante visibilidade em situações de navegação interrompida ou documento oculto.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) items.forEach(el => el.classList.add('is-visible'));
  }, { once: true });
  const menu = document.querySelector('.menu');
  const btn = document.querySelector('.menu-btn');
  if (menu && btn) menu.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('aberto');
    btn.setAttribute('aria-expanded', 'false');
  }));
})();
