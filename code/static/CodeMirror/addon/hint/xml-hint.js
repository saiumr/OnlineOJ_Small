'use strict';(function(p){"object"==typeof exports&&"object"==typeof module?p(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],p):p(CodeMirror)})(function(p){function t(c,f,b){return b?0<=c.indexOf(f):0==c.lastIndexOf(f,0)}var u=p.Pos;p.registerHelper("hint","xml",function(c,f){var b=f&&f.schemaInfo,k=f&&f.quoteChar||'"';f=f&&f.matchInMiddle;if(b){var h=c.getCursor(),a=c.getTokenAt(h);a.end>h.ch&&(a.end=h.ch,a.string=a.string.slice(0,h.ch-a.start));
var m=p.innerMode(c.getMode(),a.state);if("xml"==m.mode.name){var r=[],n=!1,v=/\btag\b/.test(a.type)&&!/>$/.test(a.string),y=v&&/^\w/.test(a.string),w;if(y){var d=c.getLine(h.line).slice(Math.max(0,a.start-2),a.start);(d=/<\/$/.test(d)?"close":/<$/.test(d)?"open":null)&&(w=a.start-("close"==d?2:1))}else v&&"<"==a.string?d="open":v&&"</"==a.string&&(d="close");if(!v&&!m.state.tagName||d){if(y)var g=a.string;n=d;m=(k=m.state.context)&&b[k.tagName];var l=k?m&&m.children:b["!top"];if(l&&"close"!=d)for(c=
0;c<l.length;++c)g&&!t(l[c],g,f)||r.push("<"+l[c]);else if("close"!=d)for(var e in b)!b.hasOwnProperty(e)||"!top"==e||"!attrs"==e||g&&!t(e,g,f)||r.push("<"+e);k&&(!g||"close"==d&&t(k.tagName,g,f))&&r.push("</"+k.tagName+">")}else{e=(m=b[m.state.tagName])&&m.attrs;b=b["!attrs"];if(!e&&!b)return;if(!e)e=b;else if(b){d={};for(var q in b)b.hasOwnProperty(q)&&(d[q]=b[q]);for(q in e)e.hasOwnProperty(q)&&(d[q]=e[q]);e=d}if("string"==a.type||"="==a.string){d=c.getRange(u(h.line,Math.max(0,h.ch-60)),u(h.line,
"string"==a.type?a.start:a.end));b=d.match(/([^\s\u00a0=<>"']+)=$/);if(!b||!e.hasOwnProperty(b[1])||!(l=e[b[1]]))return;"function"==typeof l&&(l=l.call(this,c));"string"==a.type&&(g=a.string,n=0,/['"]/.test(a.string.charAt(0))&&(k=a.string.charAt(0),g=a.string.slice(1),n++),b=a.string.length,/['"]/.test(a.string.charAt(b-1))&&(k=a.string.charAt(b-1),g=a.string.substr(n,b-2)),n&&(c=c.getLine(h.line),c.length>a.end&&c.charAt(a.end)==k&&a.end++),n=!0);for(c=0;c<l.length;++c)g&&!t(l[c],g,f)||r.push(k+
l[c]+k)}else{"attribute"==a.type&&(g=a.string,n=!0);for(var x in e)!e.hasOwnProperty(x)||g&&!t(x,g,f)||r.push(x)}}return{list:r,from:n?u(h.line,null==w?a.start:w):h,to:n?u(h.line,a.end):h}}}})});
