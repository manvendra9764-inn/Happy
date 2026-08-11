(function(){
  // Extract id from path like /t/ABC
  function getId(){
    const m = window.location.pathname.match(/^\/t\/([^\/]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function safeJSON(v){
    try{ return JSON.stringify(v); } catch(e){ return String(v); }
  }

  async function collectAndSend(){
    const id = getId();
    const info = {
      id,
      ua: navigator.userAgent || null,
      platform: navigator.platform || null,
      language: navigator.language || null,
      userAgentData: navigator.userAgentData || null,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        pixelRatio: window.devicePixelRatio || 1
      },
      connection: (navigator.connection && {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      }) || null,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      referrer: document.referrer || null,
      href: window.location.href
    };

    // Attempt geolocation (prompts user; may be denied)
    try{
      if (navigator.geolocation){
        const pos = await new Promise((resolve) => {
          let done = false;
          const timer = setTimeout(()=>{ if(!done){ done=true; resolve(null); } }, 5000);
          navigator.geolocation.getCurrentPosition(p=>{ if(!done){ done=true; clearTimeout(timer); resolve({lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy}); } }, ()=>{ if(!done){ done=true; clearTimeout(timer); resolve(null); } }, {maximumAge:60000, timeout:5000});
        });
        info.geolocation = pos;
      } else {
        info.geolocation = null;
      }
    }catch(e){ info.geolocation = null; }

    // Send in background
    try{
      fetch('/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      }).catch(()=>{});
    }catch(e){}

    // Redirect after a short delay (server may respond with redirect url but we use env placeholder)
    setTimeout(()=>{
      // try to use server-provided destination via GET /collect would have returned it, but we didn't wait to avoid blocking.
      // Use the configured destination on the server which defaults to https://example.com
      window.location.href = window.location.origin; // fallback to origin
    }, 800);
  }

  document.getElementById('status').textContent = 'Collecting device and browser info. You may be prompted for location.';
  collectAndSend();
})();
