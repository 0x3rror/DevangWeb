// Small interactions for DriveX site
document.addEventListener('DOMContentLoaded', function(){
  // year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Loading splash hide logic
  (function(){
    const loading = document.getElementById('loading-screen');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!loading) return;
    if(prefersReduced){
      loading.style.display = 'none';
      return;
    }
    // animate greeting then brand, then hide. totalDelay should match CSS animation durations
    const totalDelay = 1400; // ms (greeting + brand animation)
    // trigger CSS animations by adding class
    loading.classList.add('loading-animate');
    setTimeout(()=>{
      loading.classList.add('loading-hidden');
      // remove after transition
      setTimeout(()=>{
        if(loading && loading.parentNode) loading.parentNode.removeChild(loading);
      }, 500);
    }, totalDelay);
  })();


  // nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  navToggle && navToggle.addEventListener('click', () => {
    if(navList.style.display === 'flex') navList.style.display = '';
    else navList.style.display = 'flex';
  });
  // Close mobile nav after clicking an item
  document.querySelectorAll('.nav-list a').forEach(a=>a.addEventListener('click', ()=>{
    if(window.innerWidth <= 900 && navList){ navList.style.display = ''; }
  }));

  // smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // Respect motion preferences and small screens
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = window.innerWidth <= 600;

  // Reveal on scroll using IntersectionObserver (only on non-small screens and when motion isn't reduced)
  const revealElems = document.querySelectorAll('.service, .testimonial, .hero-content, .contact-info, .contact-form');
  if(!reduceMotion && !smallScreen && revealElems.length){
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },{threshold:0.15});
    revealElems.forEach(el=>{ el.classList.add('reveal'); obs.observe(el); });
  } else {
    // Reveal immediately for small screens or reduced-motion preference
    revealElems.forEach(el=>el.classList.add('visible'));
  }

  // Parallax for floating card (only on larger screens and when motion isn't reduced)
  const floating = document.querySelector('.card.floating');
  if(floating){
    if(!reduceMotion && !smallScreen){
      const onScrollParallax = ()=>{
        const rect = floating.getBoundingClientRect();
        const mid = rect.top + rect.height/2 - window.innerHeight/2;
        const depth = parseFloat(floating.getAttribute('data-depth') || 10);
        const y = Math.max(-20, Math.min(20, -mid / (depth)));
        floating.style.transform = `translateY(${y}px)`;
      };
      window.addEventListener('scroll', onScrollParallax, {passive:true});
      // run once on load
      onScrollParallax();
    } else {
      floating.style.transform = '';
    }
  }

  // quick form submission (fallback) - send to Apps Script endpoint if configured
  const quickForm = document.getElementById('quickForm');
  const formStatus = document.getElementById('formStatus');
  const APPS_SCRIPT_URL = ''; // <-- Put deployed Apps Script web app URL here

  if(quickForm){
    quickForm.addEventListener('submit', async function(e){
      e.preventDefault();
      formStatus.textContent = 'Sending...';

      // Build payload and handle optional file upload (cv)
      const payload = {};
      const elements = Array.from(quickForm.elements).filter(el=>el.name);

      for(const el of elements){
        if(el.type === 'file') continue; // handle separately
        payload[el.name] = el.value || '';
      }

      // Handle file input (optional)
      const fileInput = document.querySelector('#cv');
      if(fileInput && fileInput.files && fileInput.files[0]){
        const file = fileInput.files[0];
        try{
          const dataUrl = await new Promise((resolve,reject)=>{
            const reader = new FileReader();
            reader.onload = ()=>resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          payload.cv = { name: file.name, type: file.type, content: dataUrl };
        }catch(err){
          console.error('File read error',err);
        }
      }

      try{
        if(APPS_SCRIPT_URL){
          const res = await fetch(APPS_SCRIPT_URL, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
          const data = await res.json();
          formStatus.textContent = data && data.result ? 'Thanks — we received your request.' : 'Submission failed. Try again.';
        } else {
          // fallback: mailto doesn't support attachments; provide helpful message
          const subject = encodeURIComponent('Consultation request from ' + (payload.name||'') );
          const body = encodeURIComponent(Object.entries(payload).filter(([k])=>k!=='cv').map(([k,v])=>k+': '+v).join('\n'));
          window.location.href = `mailto:hello@drivex.com?subject=${subject}&body=${body}`;
          formStatus.textContent = 'Opened email client as fallback. To send CV, use the Apps Script integration.';
        }
      }catch(err){
        console.error(err);
        formStatus.textContent = 'Error sending. Please try again later.';
      }
    });
  }
});
