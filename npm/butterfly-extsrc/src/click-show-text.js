(()=>{var t=document.getElementById("click-show-text");let l=null;if("false"!==(l=null!==t.getAttribute("mobile")?{mobile:t.getAttribute("mobile"),text:GLOBAL_CONFIG.ClickShowText.text,fontSize:GLOBAL_CONFIG.ClickShowText.fontSize,random:GLOBAL_CONFIG.ClickShowText.random}:{mobile:t.getAttribute("data-mobile"),text:t.getAttribute("data-text"),fontSize:t.getAttribute("data-fontsize"),random:t.getAttribute("data-random")}).mobile||!/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent)){let r=0;document.body.addEventListener("click",function(t){var e=l.text.split(",");let o=document.createElement("span");"true"===l.random?(r=Math.floor(Math.random()*e.length),o.textContent=e[r]):(o.textContent=e[r],r=(r+1)%e.length);e=t.pageX;let i=t.pageY-20,n=(o.style.cssText=`
      z-index: 150;
      top: ${i}px;
      left: ${e-20}px;
      position: absolute;
      font-weight: bold;
      color: ${(()=>{var e="0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f".split(",");let o="#";for(let t=0;t<6;t++)o+=e[Math.floor(16*Math.random())];return o})()};
      cursor: default;
      font-size: ${l.fontSize||"inherit"};
      word-break: break-word;
    `,this.appendChild(o),(new Date).getTime()),a=1;window.requestAnimationFrame(function t(){i--,a-=.02,o.style.top=i+"px",o.style.opacity=a,(new Date).getTime()-n<600?window.requestAnimationFrame(t):o.remove()})})}})();