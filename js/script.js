// Small interactions for Devang HR Consultancy site
document.addEventListener('DOMContentLoaded', function(){
  // year
  document.getElementById('year').textContent = new Date().getFullYear();

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
    const formData = new FormData(quickForm);
    const payload = {};
    formData.forEach((v,k)=>payload[k]=v);
    try{
      if(APPS_SCRIPT_URL){
        const res = await fetch(APPS_SCRIPT_URL, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        const data = await res.json();
        formStatus.textContent = data && data.result ? 'Thanks — we received your request.' : 'Submission failed. Try again.';
      } else {
        // fallback: open mailto
        const subject = encodeURIComponent('Consultation request from ' + (payload.name||'') );
        const body = encodeURIComponent(Object.entries(payload).map(([k,v])=>k+': '+v).join('\n'));
        window.location.href = `mailto:devang@devanghrconsultancy.in?subject=${subject}&body=${body}`;
        formStatus.textContent = 'Opened email client as fallback.';
      }
    }catch(err){
      console.error(err);
      formStatus.textContent = 'Error sending. Please try again later.';
    }
    });
  }
});
