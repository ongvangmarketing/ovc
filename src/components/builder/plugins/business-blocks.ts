import type { Editor } from "grapesjs";
import { ongvangHtml } from "../../../lib/templates/ongvang-html";

const FONT = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`;

/* ════════════════════════════════════════════
   HERO TEMPLATES (4 variants)
════════════════════════════════════════════ */

const HERO_1 = FONT + `
<section style="font-family:'Inter',sans-serif;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%);min-height:88vh;display:flex;align-items:center;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-120px;right:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(99,102,241,.22)0%,transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;bottom:-80px;left:-80px;width:360px;height:360px;background:radial-gradient(circle,rgba(14,165,233,.15)0%,transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="max-width:1200px;margin:0 auto;padding:80px 40px;display:flex;align-items:center;gap:64px;width:100%;box-sizing:border-box;">
    <div style="flex:1;min-width:0;">
      <span style="display:inline-flex;align-items:center;gap:7px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:28px;">
        <span style="width:6px;height:6px;background:#818cf8;border-radius:50%;"></span>New — Version 3.0 is live
      </span>
      <h1 style="font-size:clamp(2.2rem,4.5vw,3.6rem);font-weight:900;color:#fff;line-height:1.1;letter-spacing:-.03em;margin:0 0 22px;">Build products your<br><span style="background:linear-gradient(90deg,#818cf8,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">customers will love</span></h1>
      <p style="font-size:1.1rem;color:#94a3b8;line-height:1.8;margin:0 0 40px;max-width:500px;">An all-in-one platform that empowers your team to ship faster, scale effortlessly, and deliver exceptional experiences.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;">
        <a href="#" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-size:.95rem;font-weight:700;padding:15px 30px;border-radius:12px;text-decoration:none;box-shadow:0 8px 28px rgba(99,102,241,.35);">Get started free <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></a>
        <a href="#" style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#e2e8f0;font-size:.95rem;font-weight:600;padding:15px 30px;border-radius:12px;text-decoration:none;"><svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Watch demo</a>
      </div>
      <div style="display:flex;align-items:center;gap:20px;margin-top:40px;">
        <div style="display:flex;"><img src="https://i.pravatar.cc/30?img=1" style="width:30px;height:30px;border-radius:50%;border:2px solid #1e3a5f;margin-right:-8px;" alt=""><img src="https://i.pravatar.cc/30?img=2" style="width:30px;height:30px;border-radius:50%;border:2px solid #1e3a5f;margin-right:-8px;" alt=""><img src="https://i.pravatar.cc/30?img=3" style="width:30px;height:30px;border-radius:50%;border:2px solid #1e3a5f;margin-right:-8px;" alt=""><img src="https://i.pravatar.cc/30?img=4" style="width:30px;height:30px;border-radius:50%;border:2px solid #1e3a5f;" alt=""></div>
        <span style="color:#94a3b8;font-size:13px;"><span style="color:#e2e8f0;font-weight:700;">4,800+</span> happy customers · <span style="color:#fbbf24;">★★★★★</span></span>
      </div>
    </div>
    <div style="flex:1;min-width:0;max-width:500px;">
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:18px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.5);">
        <div style="background:rgba(255,255,255,.06);padding:10px 14px;display:flex;align-items:center;gap:7px;border-bottom:1px solid rgba(255,255,255,.07);">
          <span style="width:10px;height:10px;border-radius:50%;background:#ef4444;"></span><span style="width:10px;height:10px;border-radius:50%;background:#f59e0b;"></span><span style="width:10px;height:10px;border-radius:50%;background:#22c55e;"></span>
        </div>
        <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80" alt="" style="width:100%;display:block;">
      </div>
    </div>
  </div>
</section>`;

const HERO_2 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#ffffff;min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 40px;text-align:center;position:relative;overflow:hidden;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:700px;background:radial-gradient(circle,rgba(99,102,241,.06)0%,transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <span style="display:inline-block;background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:5px 16px;border-radius:100px;margin-bottom:24px;">✦ Introducing OVC Platform</span>
  <h1 style="font-size:clamp(2.8rem,6vw,5rem);font-weight:900;color:#0f172a;line-height:1.08;letter-spacing:-.04em;margin:0 0 24px;max-width:800px;">The platform that helps<br><span style="background:linear-gradient(135deg,#7c3aed,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">teams move faster</span></h1>
  <p style="font-size:1.2rem;color:#64748b;line-height:1.75;max-width:580px;margin:0 0 48px;">Stop juggling tools. Our unified platform lets your team collaborate, build, and ship with unprecedented speed and clarity.</p>
  <div style="display:flex;gap:16px;justify-content:center;margin-bottom:60px;">
    <a href="#" style="display:inline-flex;align-items:center;gap:8px;background:#0f172a;color:#fff;font-size:1rem;font-weight:700;padding:16px 32px;border-radius:12px;text-decoration:none;">Start for free <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></a>
    <a href="#" style="display:inline-flex;align-items:center;gap:8px;border:2px solid #e2e8f0;color:#374151;font-size:1rem;font-weight:600;padding:16px 32px;border-radius:12px;text-decoration:none;">See pricing</a>
  </div>
  <div style="display:flex;align-items:center;gap:12px;color:#94a3b8;font-size:13px;margin-bottom:60px;">
    <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Free 14-day trial
    <span style="width:4px;height:4px;background:#e2e8f0;border-radius:50%;display:inline-block;"></span>
    <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>No credit card required
    <span style="width:4px;height:4px;background:#e2e8f0;border-radius:50%;display:inline-block;"></span>
    <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Cancel anytime
  </div>
  <div style="display:flex;align-items:center;gap:32px;opacity:.4;filter:grayscale(1);">
    <span style="font-size:18px;font-weight:800;color:#0f172a;">Stripe</span>
    <span style="font-size:18px;font-weight:800;color:#0f172a;">Notion</span>
    <span style="font-size:18px;font-weight:800;color:#0f172a;">Linear</span>
    <span style="font-size:18px;font-weight:800;color:#0f172a;">Vercel</span>
    <span style="font-size:18px;font-weight:800;color:#0f172a;">Figma</span>
  </div>
</section>`;

const HERO_3 = FONT + `
<section style="font-family:'Inter',sans-serif;position:relative;min-height:88vh;display:flex;align-items:center;overflow:hidden;">
  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(15,23,42,.92)0%,rgba(15,23,42,.7)100%);"></div>
  <div style="position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:80px 40px;width:100%;box-sizing:border-box;">
    <div style="max-width:700px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
        <div style="width:32px;height:2px;background:#6366f1;"></div>
        <span style="color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Trusted by 10,000+ companies</span>
      </div>
      <h1 style="font-size:clamp(2.5rem,5vw,4.2rem);font-weight:900;color:#ffffff;line-height:1.1;letter-spacing:-.03em;margin:0 0 24px;">Transform the way<br>your business works</h1>
      <p style="font-size:1.15rem;color:rgba(255,255,255,.7);line-height:1.8;margin:0 0 48px;max-width:560px;">Powerful, flexible, and built for scale. Give your team the tools they need to do their best work from anywhere in the world.</p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="#" style="display:inline-flex;align-items:center;gap:8px;background:white;color:#0f172a;font-size:1rem;font-weight:800;padding:16px 32px;border-radius:12px;text-decoration:none;">Get started <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></a>
        <a href="#" style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:white;font-size:1rem;font-weight:600;padding:16px 32px;border-radius:12px;text-decoration:none;backdrop-filter:blur(8px);">Learn more</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-top:64px;border-top:1px solid rgba(255,255,255,.12);padding-top:40px;">
        <div><div style="font-size:2.2rem;font-weight:900;color:white;letter-spacing:-.04em;">99.9%</div><div style="font-size:13px;color:rgba(255,255,255,.55);margin-top:4px;font-weight:500;">Uptime SLA</div></div>
        <div><div style="font-size:2.2rem;font-weight:900;color:white;letter-spacing:-.04em;">10M+</div><div style="font-size:13px;color:rgba(255,255,255,.55);margin-top:4px;font-weight:500;">Events daily</div></div>
        <div><div style="font-size:2.2rem;font-weight:900;color:white;letter-spacing:-.04em;">150+</div><div style="font-size:13px;color:rgba(255,255,255,.55);margin-top:4px;font-weight:500;">Countries</div></div>
      </div>
    </div>
  </div>
</section>`;

const HERO_4 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#f8fafc;min-height:88vh;display:flex;align-items:center;padding:100px 40px;">
  <div style="max-width:1200px;margin:0 auto;width:100%;box-sizing:border-box;">
    <div style="display:flex;gap:80px;align-items:center;">
      <div style="flex:1;">
        <span style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:5px 14px;border-radius:6px;margin-bottom:24px;">🚀 Now in beta</span>
        <h1 style="font-size:clamp(3rem,5.5vw,5rem);font-weight:900;color:#0f172a;line-height:1.05;letter-spacing:-.05em;margin:0 0 28px;">The future<br>of work is<br><em style="font-style:normal;color:#6366f1;">here.</em></h1>
        <p style="font-size:1.1rem;color:#64748b;line-height:1.8;margin:0 0 40px;">Designed for ambitious teams who refuse to compromise. Intuitive enough for day one, powerful enough for year ten.</p>
        <a href="#" style="display:inline-flex;align-items:center;gap:8px;background:#0f172a;color:white;font-size:.95rem;font-weight:700;padding:15px 28px;border-radius:10px;text-decoration:none;">Request early access <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></a>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.04);">
          <div style="font-size:2.8rem;font-weight:900;color:#6366f1;letter-spacing:-.04em;margin-bottom:4px;">98%</div>
          <div style="font-size:13px;color:#64748b;font-weight:500;line-height:1.4;">Customer satisfaction score</div>
        </div>
        <div style="background:#6366f1;border-radius:16px;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:white;letter-spacing:-.04em;margin-bottom:4px;">4.9★</div>
          <div style="font-size:13px;color:rgba(255,255,255,.7);font-weight:500;line-height:1.4;">Average rating on G2</div>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.04);">
          <div style="font-size:2.8rem;font-weight:900;color:#0f172a;letter-spacing:-.04em;margin-bottom:4px;">12x</div>
          <div style="font-size:13px;color:#64748b;font-weight:500;line-height:1.4;">Faster than traditional tools</div>
        </div>
        <div style="background:#0f172a;border-radius:16px;padding:28px;">
          <div style="font-size:2.8rem;font-weight:900;color:white;letter-spacing:-.04em;margin-bottom:4px;">50K+</div>
          <div style="font-size:13px;color:rgba(255,255,255,.5);font-weight:500;line-height:1.4;">Teams worldwide</div>
        </div>
      </div>
    </div>
  </div>
</section>`;

/* ════════════════════════════════════════════
   FEATURES TEMPLATES (4 variants)
════════════════════════════════════════════ */

const FEATURES_1 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#fff;padding:96px 40px;">
  <div style="max-width:1200px;margin:0 auto;">
    <div style="text-align:center;max-width:600px;margin:0 auto 64px;">
      <span style="display:inline-block;background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">Features</span>
      <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 16px;">Everything you need to<br><span style="color:#7c3aed;">ship faster</span></h2>
      <p style="font-size:1.05rem;color:#64748b;line-height:1.75;margin:0;">All the tools your team needs, built into one seamless platform — no more juggling tabs.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
      <div style="background:#fafafa;border:1px solid #f1f5f9;border-radius:18px;padding:32px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#6366f1,#818cf8);border-radius:18px 18px 0 0;"></div>
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#eef2ff,#ddd6fe);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;"><svg width="24" height="24" fill="none" stroke="#6366f1" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Lightning Performance</h3>
        <p style="font-size:.93rem;color:#64748b;line-height:1.7;margin:0 0 18px;">Sub-second load times with global CDN and automatic caching built in.</p>
        <a href="#" style="color:#6366f1;font-size:.88rem;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">Learn more →</a>
      </div>
      <div style="background:#fafafa;border:1px solid #f1f5f9;border-radius:18px;padding:32px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0ea5e9,#38bdf8);border-radius:18px 18px 0 0;"></div>
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#e0f2fe,#bae6fd);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;"><svg width="24" height="24" fill="none" stroke="#0ea5e9" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Enterprise Security</h3>
        <p style="font-size:.93rem;color:#64748b;line-height:1.7;margin:0 0 18px;">SOC 2 Type II certified with AES-256 encryption and SSO out of the box.</p>
        <a href="#" style="color:#0ea5e9;font-size:.88rem;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">Learn more →</a>
      </div>
      <div style="background:#fafafa;border:1px solid #f1f5f9;border-radius:18px;padding:32px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#10b981,#34d399);border-radius:18px 18px 0 0;"></div>
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;"><svg width="24" height="24" fill="none" stroke="#10b981" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Advanced Analytics</h3>
        <p style="font-size:.93rem;color:#64748b;line-height:1.7;margin:0 0 18px;">Real-time dashboards and AI-powered insights to drive confident decisions.</p>
        <a href="#" style="color:#10b981;font-size:.88rem;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">Learn more →</a>
      </div>
      <div style="background:#fafafa;border:1px solid #f1f5f9;border-radius:18px;padding:32px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:18px 18px 0 0;"></div>
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;"><svg width="24" height="24" fill="none" stroke="#f59e0b" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Team Collaboration</h3>
        <p style="font-size:.93rem;color:#64748b;line-height:1.7;margin:0 0 18px;">Live presence, comments, and version history built into every workflow.</p>
        <a href="#" style="color:#f59e0b;font-size:.88rem;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">Learn more →</a>
      </div>
      <div style="background:#fafafa;border:1px solid #f1f5f9;border-radius:18px;padding:32px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#ec4899,#f472b6);border-radius:18px 18px 0 0;"></div>
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#fce7f3,#fbcfe8);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;"><svg width="24" height="24" fill="none" stroke="#ec4899" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg></div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 10px;">500+ Integrations</h3>
        <p style="font-size:.93rem;color:#64748b;line-height:1.7;margin:0 0 18px;">Connect Slack, Salesforce, HubSpot, Zapier and hundreds more tools.</p>
        <a href="#" style="color:#ec4899;font-size:.88rem;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">Learn more →</a>
      </div>
      <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:18px;padding:32px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:rgba(255,255,255,.08);border-radius:50%;"></div>
        <div style="width:48px;height:48px;background:rgba(255,255,255,.15);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;"><svg width="24" height="24" fill="none" stroke="white" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg></div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#fff;margin:0 0 10px;">24/7 Expert Support</h3>
        <p style="font-size:.93rem;color:rgba(255,255,255,.75);line-height:1.7;margin:0 0 18px;">Dedicated engineers, SLA guarantees, and a comprehensive knowledge base.</p>
        <a href="#" style="color:white;font-size:.88rem;font-weight:700;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.5);padding-bottom:1px;display:inline-flex;align-items:center;gap:5px;">Get support →</a>
      </div>
    </div>
  </div>
</section>`;

const FEATURES_2 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#ffffff;padding:96px 40px;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;max-width:580px;margin:0 auto 80px;">
      <span style="display:inline-block;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">How it works</span>
      <h2 style="font-size:clamp(2rem,3.5vw,2.8rem);font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 16px;">Simple process,<br>extraordinary results</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:64px;">
      <div style="display:flex;align-items:center;gap:64px;">
        <div style="flex:1;">
          <span style="display:inline-block;background:#ede9fe;color:#7c3aed;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:4px 12px;border-radius:6px;margin-bottom:16px;">Step 01</span>
          <h3 style="font-size:1.8rem;font-weight:800;color:#0f172a;line-height:1.2;letter-spacing:-.02em;margin:0 0 14px;">Connect your tools</h3>
          <p style="font-size:1rem;color:#64748b;line-height:1.75;margin:0 0 24px;">Link your existing stack in seconds. We support 500+ integrations with zero configuration required.</p>
          <a href="#" style="display:inline-flex;align-items:center;gap:8px;color:#7c3aed;font-weight:700;text-decoration:none;font-size:.95rem;">Explore integrations <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
        </div>
        <div style="flex:1;background:linear-gradient(135deg,#f8fafc,#eef2ff);border-radius:20px;overflow:hidden;height:280px;display:flex;align-items:center;justify-content:center;">
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:64px;">
        <div style="flex:1;background:linear-gradient(135deg,#f8fafc,#e0f2fe);border-radius:20px;overflow:hidden;height:280px;display:flex;align-items:center;justify-content:center;">
          <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">
        </div>
        <div style="flex:1;">
          <span style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:4px 12px;border-radius:6px;margin-bottom:16px;">Step 02</span>
          <h3 style="font-size:1.8rem;font-weight:800;color:#0f172a;line-height:1.2;letter-spacing:-.02em;margin:0 0 14px;">Build your workspace</h3>
          <p style="font-size:1rem;color:#64748b;line-height:1.75;margin:0 0 24px;">Customize your workspace with powerful building blocks. Drag, drop, and configure in minutes.</p>
          <a href="#" style="display:inline-flex;align-items:center;gap:8px;color:#1d4ed8;font-weight:700;text-decoration:none;font-size:.95rem;">Start building <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
        </div>
      </div>
    </div>
  </div>
</section>`;

const FEATURES_3 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#f8fafc;padding:96px 40px;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;max-width:560px;margin:0 auto 72px;">
      <span style="display:inline-block;background:#fef3c7;color:#d97706;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">Our process</span>
      <h2 style="font-size:clamp(2rem,3.5vw,2.8rem);font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0;">Four steps to success</h2>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div style="background:white;border:1px solid #e2e8f0;border-radius:20px;padding:36px;position:relative;">
        <div style="font-size:4rem;font-weight:900;color:#f1f5f9;line-height:1;margin-bottom:20px;letter-spacing:-.05em;">01</div>
        <h3 style="font-size:1.3rem;font-weight:800;color:#0f172a;margin:0 0 12px;">Discovery & Planning</h3>
        <p style="font-size:.95rem;color:#64748b;line-height:1.7;margin:0;">Define goals, identify your audience, and map out the full project scope in a single collaborative session.</p>
        <div style="position:absolute;top:24px;right:24px;width:44px;height:44px;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:10px;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div>
      </div>
      <div style="background:white;border:1px solid #e2e8f0;border-radius:20px;padding:36px;position:relative;">
        <div style="font-size:4rem;font-weight:900;color:#f1f5f9;line-height:1;margin-bottom:20px;letter-spacing:-.05em;">02</div>
        <h3 style="font-size:1.3rem;font-weight:800;color:#0f172a;margin:0 0 12px;">Design & Prototype</h3>
        <p style="font-size:.95rem;color:#64748b;line-height:1.7;margin:0;">Create pixel-perfect wireframes and interactive prototypes that bring your vision to life before a single line of code.</p>
        <div style="position:absolute;top:24px;right:24px;width:44px;height:44px;background:linear-gradient(135deg,#0ea5e9,#38bdf8);border-radius:10px;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/></svg></div>
      </div>
      <div style="background:white;border:1px solid #e2e8f0;border-radius:20px;padding:36px;position:relative;">
        <div style="font-size:4rem;font-weight:900;color:#f1f5f9;line-height:1;margin-bottom:20px;letter-spacing:-.05em;">03</div>
        <h3 style="font-size:1.3rem;font-weight:800;color:#0f172a;margin:0 0 12px;">Build & Develop</h3>
        <p style="font-size:.95rem;color:#64748b;line-height:1.7;margin:0;">Our engineers write clean, scalable code with daily updates and full transparency into every sprint milestone.</p>
        <div style="position:absolute;top:24px;right:24px;width:44px;height:44px;background:linear-gradient(135deg,#10b981,#34d399);border-radius:10px;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg></div>
      </div>
      <div style="background:#0f172a;border-radius:20px;padding:36px;position:relative;">
        <div style="font-size:4rem;font-weight:900;color:rgba(255,255,255,.07);line-height:1;margin-bottom:20px;letter-spacing:-.05em;">04</div>
        <h3 style="font-size:1.3rem;font-weight:800;color:white;margin:0 0 12px;">Launch & Scale</h3>
        <p style="font-size:.95rem;color:rgba(255,255,255,.6);line-height:1.7;margin:0 0 24px;">Go live with confidence. We monitor performance and provide ongoing support to help you scale without limits.</p>
        <a href="#" style="display:inline-flex;align-items:center;gap:7px;background:white;color:#0f172a;font-size:.88rem;font-weight:700;padding:10px 18px;border-radius:8px;text-decoration:none;">Get started →</a>
        <div style="position:absolute;top:24px;right:24px;width:44px;height:44px;background:rgba(255,255,255,.1);border-radius:10px;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
      </div>
    </div>
  </div>
</section>`;

const FEATURES_4 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#ffffff;padding:96px 40px;">
  <div style="max-width:1100px;margin:0 auto;display:flex;gap:80px;align-items:flex-start;">
    <div style="flex:0 0 360px;position:sticky;top:60px;">
      <span style="display:inline-block;background:#fce7f3;color:#be185d;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">Why us</span>
      <h2 style="font-size:2.4rem;font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 16px;">Built for modern teams</h2>
      <p style="font-size:1rem;color:#64748b;line-height:1.75;margin:0 0 32px;">We obsess over the details so your team can focus on what matters most — creating exceptional products.</p>
      <a href="#" style="display:inline-flex;align-items:center;gap:8px;background:#0f172a;color:white;font-size:.92rem;font-weight:700;padding:13px 24px;border-radius:10px;text-decoration:none;">Explore all features →</a>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;gap:0;">
      ${["Lightning-fast performance","Bank-grade security","Advanced analytics","500+ integrations","24/7 support"].map((t, i) => `
      <div style="padding:28px 0;border-bottom:1px solid #f1f5f9;display:flex;align-items:flex-start;gap:20px;">
        <div style="width:44px;height:44px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="20" height="20" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <h3 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin:0 0 6px;">${t}</h3>
          <p style="font-size:.92rem;color:#64748b;line-height:1.65;margin:0;">We deliver enterprise-grade capabilities with consumer-grade simplicity — so every team member can hit the ground running.</p>
        </div>
      </div>`).join("")}
    </div>
  </div>
</section>`;

/* ════════════════════════════════════════════
   SERVICES TEMPLATES (4 variants)
════════════════════════════════════════════ */

const SERVICES_1 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#ffffff;padding:96px 40px;">
  <div style="max-width:1200px;margin:0 auto;">
    <div style="text-align:center;max-width:580px;margin:0 auto 64px;">
      <span style="display:inline-block;background:#fef3c7;color:#d97706;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">Our services</span>
      <h2 style="font-size:clamp(2rem,3.5vw,2.8rem);font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 14px;">Solutions for every business need</h2>
      <p style="font-size:1.05rem;color:#64748b;line-height:1.75;margin:0;">From strategy to execution, we deliver comprehensive services tailored to your goals.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
      <div style="border:1px solid #f1f5f9;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.05);">
        <div style="height:190px;position:relative;overflow:hidden;"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="" style="width:100%;height:100%;object-fit:cover;"><div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(59,130,246,.25),rgba(30,64,175,.65));"></div><div style="position:absolute;top:14px;left:14px;background:white;border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;color:#1d4ed8;">Strategy</div></div>
        <div style="padding:24px;"><h3 style="font-size:1.15rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Digital Strategy</h3><p style="font-size:.9rem;color:#64748b;line-height:1.7;margin:0 0 18px;">End-to-end digital roadmaps aligning tech investments with business objectives.</p><div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:1.2rem;font-weight:800;color:#0f172a;">From $2,400</span><a href="#" style="background:#1d4ed8;color:white;font-size:.85rem;font-weight:700;padding:9px 16px;border-radius:8px;text-decoration:none;">Get Quote</a></div></div>
      </div>
      <div style="border:1px solid #f1f5f9;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.05);">
        <div style="height:190px;position:relative;overflow:hidden;"><img src="https://images.unsplash.com/photo-1555066931-4365d14431b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="" style="width:100%;height:100%;object-fit:cover;"><div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(5,150,105,.25),rgba(4,120,87,.65));"></div><div style="position:absolute;top:14px;left:14px;background:white;border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;color:#059669;">Development</div></div>
        <div style="padding:24px;"><h3 style="font-size:1.15rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Web Development</h3><p style="font-size:.9rem;color:#64748b;line-height:1.7;margin:0 0 18px;">High-performance web apps built with the latest tech stack for speed and reliability.</p><div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:1.2rem;font-weight:800;color:#0f172a;">From $4,800</span><a href="#" style="background:#059669;color:white;font-size:.85rem;font-weight:700;padding:9px 16px;border-radius:8px;text-decoration:none;">Get Quote</a></div></div>
      </div>
      <div style="border:1px solid #f1f5f9;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.05);">
        <div style="height:190px;position:relative;overflow:hidden;"><img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="" style="width:100%;height:100%;object-fit:cover;"><div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(219,39,119,.25),rgba(157,23,77,.65));"></div><div style="position:absolute;top:14px;left:14px;background:white;border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;color:#be185d;">Marketing</div></div>
        <div style="padding:24px;"><h3 style="font-size:1.15rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Social Marketing</h3><p style="font-size:.9rem;color:#64748b;line-height:1.7;margin:0 0 18px;">Data-driven campaigns and content that grow your brand organically.</p><div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:1.2rem;font-weight:800;color:#0f172a;">From $1,200</span><a href="#" style="background:#be185d;color:white;font-size:.85rem;font-weight:700;padding:9px 16px;border-radius:8px;text-decoration:none;">Get Quote</a></div></div>
      </div>
    </div>
  </div>
</section>`;

const SERVICES_2 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#f8fafc;padding:96px 40px;">
  <div style="max-width:1200px;margin:0 auto;">
    <div style="text-align:center;max-width:560px;margin:0 auto 64px;">
      <h2 style="font-size:clamp(2rem,3.5vw,2.8rem);font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 14px;">What we do best</h2>
      <p style="font-size:1.05rem;color:#64748b;line-height:1.75;margin:0;">Specialized expertise across the full digital spectrum.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;height:560px;">
      <div style="border-radius:22px;overflow:hidden;position:relative;">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="" style="width:100%;height:100%;object-fit:cover;">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(15,23,42,.9)0%,rgba(15,23,42,.3)50%,transparent 100%);"></div>
        <div style="position:absolute;bottom:32px;left:32px;right:32px;">
          <span style="display:inline-block;background:rgba(99,102,241,.25);border:1px solid rgba(99,102,241,.4);color:#a5b4fc;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 12px;border-radius:100px;margin-bottom:12px;">★ Featured</span>
          <h3 style="font-size:1.8rem;font-weight:800;color:white;margin:0 0 10px;line-height:1.2;">Digital Transformation</h3>
          <p style="font-size:.95rem;color:rgba(255,255,255,.7);line-height:1.65;margin:0 0 20px;">End-to-end transformation that modernizes your operations and unlocks new growth.</p>
          <a href="#" style="display:inline-flex;align-items:center;gap:7px;background:white;color:#0f172a;font-size:.88rem;font-weight:700;padding:11px 20px;border-radius:10px;text-decoration:none;">Learn more →</a>
        </div>
      </div>
      <div style="display:grid;grid-template-rows:1fr 1fr;gap:20px;">
        <div style="border-radius:22px;overflow:hidden;position:relative;">
          <img src="https://images.unsplash.com/photo-1555066931-4365d14431b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="" style="width:100%;height:100%;object-fit:cover;">
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(4,120,87,.85)0%,transparent 60%);"></div>
          <div style="position:absolute;bottom:24px;left:24px;right:24px;"><h3 style="font-size:1.3rem;font-weight:700;color:white;margin:0 0 8px;">Web Development</h3><a href="#" style="color:rgba(255,255,255,.8);font-size:.88rem;font-weight:600;text-decoration:none;">From $4,800 →</a></div>
        </div>
        <div style="border-radius:22px;overflow:hidden;position:relative;">
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="" style="width:100%;height:100%;object-fit:cover;">
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(30,64,175,.85)0%,transparent 60%);"></div>
          <div style="position:absolute;bottom:24px;left:24px;right:24px;"><h3 style="font-size:1.3rem;font-weight:700;color:white;margin:0 0 8px;">Growth Marketing</h3><a href="#" style="color:rgba(255,255,255,.8);font-size:.88rem;font-weight:600;text-decoration:none;">From $1,200 →</a></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

const SERVICES_3 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#0f172a;padding:96px 40px;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;max-width:560px;margin:0 auto 64px;">
      <span style="display:inline-block;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">Process</span>
      <h2 style="font-size:clamp(2rem,3.5vw,2.8rem);font-weight:800;color:white;line-height:1.15;letter-spacing:-.03em;margin:0;">How we deliver</h2>
    </div>
    <div style="display:flex;gap:0;position:relative;">
      <div style="position:absolute;top:28px;left:calc(12.5% + 28px);right:calc(12.5% + 28px);height:2px;background:linear-gradient(90deg,#6366f1,#38bdf8);z-index:0;"></div>
      ${["Discovery","Design","Build","Launch"].map((name, i) => `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;z-index:1;padding:0 16px;">
        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#4f46e5);border:3px solid #0f172a;display:flex;align-items:center;justify-content:center;margin-bottom:24px;font-size:1.2rem;font-weight:900;color:white;">0${i+1}</div>
        <h3 style="font-size:1.1rem;font-weight:700;color:white;margin:0 0 10px;">${name}</h3>
        <p style="font-size:.88rem;color:#94a3b8;line-height:1.65;margin:0;">We analyze your business deeply and craft a strategy that actually fits your goals and timeline.</p>
      </div>`).join("")}
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:64px;">
      ${[["500+","Integrations"],["99.9%","Uptime"],["24/7","Support"]].map(([n,l]) => `
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:24px;text-align:center;">
        <div style="font-size:2.4rem;font-weight:900;color:white;letter-spacing:-.04em;">${n}</div>
        <div style="font-size:13px;color:#64748b;margin-top:4px;font-weight:500;">${l}</div>
      </div>`).join("")}
    </div>
  </div>
</section>`;

const SERVICES_4 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#ffffff;padding:96px 40px;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;max-width:560px;margin:0 auto 64px;">
      <span style="display:inline-block;background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">Pricing</span>
      <h2 style="font-size:clamp(2rem,3.5vw,2.8rem);font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 14px;">Simple, transparent pricing</h2>
      <p style="font-size:1.05rem;color:#64748b;line-height:1.75;margin:0;">No hidden fees. Upgrade or downgrade at any time.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:start;">
      <div style="border:1.5px solid #e2e8f0;border-radius:20px;padding:32px;background:white;">
        <div style="font-size:14px;font-weight:700;color:#64748b;margin-bottom:12px;">Starter</div>
        <div style="font-size:3rem;font-weight:900;color:#0f172a;letter-spacing:-.04em;margin-bottom:4px;">$29<span style="font-size:1rem;font-weight:500;color:#94a3b8;">/mo</span></div>
        <p style="font-size:.88rem;color:#64748b;margin:0 0 24px;line-height:1.5;">Perfect for freelancers and small teams just getting started.</p>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px;">${["1 user","5 projects","10GB storage","Email support"].map(f=>`<div style="display:flex;align-items:center;gap:10px;font-size:.9rem;color:#374151;"><svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>${f}</div>`).join("")}</div>
        <a href="#" style="display:block;text-align:center;border:2px solid #e2e8f0;color:#374151;font-size:.95rem;font-weight:700;padding:13px;border-radius:10px;text-decoration:none;">Get started</a>
      </div>
      <div style="border:2px solid #6366f1;border-radius:20px;padding:32px;background:white;position:relative;box-shadow:0 8px 32px rgba(99,102,241,.15);">
        <div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:4px 16px;border-radius:100px;">Most Popular</div>
        <div style="font-size:14px;font-weight:700;color:#6366f1;margin-bottom:12px;">Pro</div>
        <div style="font-size:3rem;font-weight:900;color:#0f172a;letter-spacing:-.04em;margin-bottom:4px;">$79<span style="font-size:1rem;font-weight:500;color:#94a3b8;">/mo</span></div>
        <p style="font-size:.88rem;color:#64748b;margin:0 0 24px;line-height:1.5;">For growing teams that need more power and flexibility.</p>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px;">${["10 users","50 projects","100GB storage","Priority support"].map(f=>`<div style="display:flex;align-items:center;gap:10px;font-size:.9rem;color:#374151;"><svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>${f}</div>`).join("")}</div>
        <a href="#" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;font-size:.95rem;font-weight:700;padding:13px;border-radius:10px;text-decoration:none;box-shadow:0 4px 16px rgba(99,102,241,.3);">Get started</a>
      </div>
      <div style="border:1.5px solid #e2e8f0;border-radius:20px;padding:32px;background:white;">
        <div style="font-size:14px;font-weight:700;color:#64748b;margin-bottom:12px;">Enterprise</div>
        <div style="font-size:3rem;font-weight:900;color:#0f172a;letter-spacing:-.04em;margin-bottom:4px;">$199<span style="font-size:1rem;font-weight:500;color:#94a3b8;">/mo</span></div>
        <p style="font-size:.88rem;color:#64748b;margin:0 0 24px;line-height:1.5;">Unlimited scale and dedicated support for large organizations.</p>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px;">${["Unlimited users","Unlimited projects","1TB storage","24/7 dedicated support"].map(f=>`<div style="display:flex;align-items:center;gap:10px;font-size:.9rem;color:#374151;"><svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>${f}</div>`).join("")}</div>
        <a href="#" style="display:block;text-align:center;background:#0f172a;color:white;font-size:.95rem;font-weight:700;padding:13px;border-radius:10px;text-decoration:none;">Contact sales</a>
      </div>
    </div>
  </div>
</section>`;

/* ════════════════════════════════════════════
   FAQ TEMPLATES (4 variants)
════════════════════════════════════════════ */

const FAQ_1 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#f8fafc;padding:96px 40px;">
  <div style="max-width:1100px;margin:0 auto;display:flex;gap:72px;align-items:flex-start;">
    <div style="flex:0 0 340px;position:sticky;top:60px;">
      <span style="display:inline-block;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">FAQ</span>
      <h2 style="font-size:2.4rem;font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 14px;">Frequently<br>asked<br><span style="color:#16a34a;">questions</span></h2>
      <p style="font-size:.97rem;color:#64748b;line-height:1.75;margin:0 0 28px;">Can't find what you're looking for? Reach out to our support team.</p>
      <a href="#" style="display:inline-flex;align-items:center;gap:7px;background:#0f172a;color:white;font-size:.9rem;font-weight:700;padding:13px 22px;border-radius:10px;text-decoration:none;">Contact support →</a>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;gap:12px;">
      <details style="background:white;border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;" open>
        <summary style="display:flex;justify-content:space-between;align-items:center;padding:22px 24px;cursor:pointer;font-size:1rem;font-weight:700;color:#0f172a;list-style:none;gap:14px;">What is included in the free plan?<span style="flex-shrink:0;width:28px;height:28px;background:#f1f5f9;border-radius:7px;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" fill="none" stroke="#475569" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/></svg></span></summary>
        <div style="padding:0 24px 20px;font-size:.93rem;color:#64748b;line-height:1.75;border-top:1px solid #f1f5f9;">Our free plan includes up to 3 projects, 5 GB of storage, access to all core features, and community support.</div>
      </details>
      <details style="background:white;border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <summary style="display:flex;justify-content:space-between;align-items:center;padding:22px 24px;cursor:pointer;font-size:1rem;font-weight:700;color:#0f172a;list-style:none;gap:14px;">How does billing work?<span style="flex-shrink:0;width:28px;height:28px;background:#f1f5f9;border-radius:7px;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" fill="none" stroke="#475569" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg></span></summary>
      </details>
      <details style="background:white;border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <summary style="display:flex;justify-content:space-between;align-items:center;padding:22px 24px;cursor:pointer;font-size:1rem;font-weight:700;color:#0f172a;list-style:none;gap:14px;">Can I cancel my subscription at any time?<span style="flex-shrink:0;width:28px;height:28px;background:#f1f5f9;border-radius:7px;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" fill="none" stroke="#475569" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg></span></summary>
      </details>
      <details style="background:white;border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <summary style="display:flex;justify-content:space-between;align-items:center;padding:22px 24px;cursor:pointer;font-size:1rem;font-weight:700;color:#0f172a;list-style:none;gap:14px;">Do you offer a free trial?<span style="flex-shrink:0;width:28px;height:28px;background:#f1f5f9;border-radius:7px;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" fill="none" stroke="#475569" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg></span></summary>
      </details>
      <details style="background:white;border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <summary style="display:flex;justify-content:space-between;align-items:center;padding:22px 24px;cursor:pointer;font-size:1rem;font-weight:700;color:#0f172a;list-style:none;gap:14px;">Is my data safe and private?<span style="flex-shrink:0;width:28px;height:28px;background:#f1f5f9;border-radius:7px;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" fill="none" stroke="#475569" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg></span></summary>
      </details>
    </div>
  </div>
</section>`;

const FAQ_2 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#ffffff;padding:96px 40px;">
  <div style="max-width:720px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:56px;">
      <h2 style="font-size:clamp(2rem,3.5vw,2.8rem);font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 14px;">Questions & Answers</h2>
      <p style="font-size:1.05rem;color:#64748b;line-height:1.75;margin:0;">Everything you need to know about our platform and services.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:0;border:1.5px solid #e2e8f0;border-radius:20px;overflow:hidden;">
      ${[
        ["What is included in the free plan?","Our free plan includes up to 3 projects, 5 GB of storage, and access to core features."],
        ["How does billing work?",""],
        ["Can I cancel anytime?",""],
        ["Do you offer enterprise pricing?",""],
        ["Is there a free trial?",""],
      ].map(([q, a], i) => `
      <details style="border-bottom:${i<4?'1':'0'}px solid #f1f5f9;" ${i===0?'open':''}>
        <summary style="display:flex;justify-content:space-between;align-items:center;padding:22px 28px;cursor:pointer;font-size:1rem;font-weight:700;color:#0f172a;list-style:none;gap:14px;">${q}<span style="flex-shrink:0;width:30px;height:30px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#64748b;">${i===0?'−':'+'}</span></summary>
        ${a ? `<div style="padding:0 28px 20px;font-size:.93rem;color:#64748b;line-height:1.75;">${a}</div>` : ''}
      </details>`).join("")}
    </div>
  </div>
</section>`;

const FAQ_3 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#f8fafc;padding:96px 40px;">
  <div style="max-width:1100px;margin:0 auto;display:flex;gap:64px;align-items:center;">
    <div style="flex:0 0 420px;border-radius:22px;overflow:hidden;height:500px;">
      <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="" style="width:100%;height:100%;object-fit:cover;">
    </div>
    <div style="flex:1;">
      <span style="display:inline-block;background:#e0f2fe;color:#0284c7;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">FAQ</span>
      <h2 style="font-size:2.2rem;font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 32px;">Got questions?<br>We've got answers.</h2>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${["What services do you offer?","How long does onboarding take?","What are your pricing plans?","How do I contact support?"].map((q,i) => `
        <div style="background:white;border:1.5px solid #e2e8f0;border-radius:14px;padding:20px 24px;">
          <h3 style="font-size:.97rem;font-weight:700;color:#0f172a;margin:0 0 6px;">${q}</h3>
          <p style="font-size:.9rem;color:#64748b;line-height:1.6;margin:0;">We provide tailored solutions designed to accelerate your growth. Our team is ready to guide you every step of the way.</p>
        </div>`).join("")}
      </div>
    </div>
  </div>
</section>`;

const FAQ_4 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#ffffff;padding:96px 40px;">
  <div style="max-width:860px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:64px;">
      <h2 style="font-size:clamp(2rem,3.5vw,2.8rem);font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 14px;">Common questions</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${[
        ["What is included in the free plan?","Our free plan includes up to 3 projects, 5 GB of storage, access to all core features, community support, and unlimited collaborators."],
        ["How does billing work?","We bill monthly or annually. Annual plans include a 20% discount. You can switch plans or cancel anytime from your account dashboard."],
        ["Can I cancel my subscription?","Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period with no hidden fees."],
        ["Do you offer a free trial?","Yes! All paid plans include a 14-day free trial with full feature access and no credit card required to get started."],
        ["Is my data secure?","Absolutely. We're SOC 2 Type II certified with AES-256 encryption, two-factor authentication, and GDPR compliance built in."],
      ].map(([q, a], i) => `
      <div style="display:flex;gap:24px;align-items:flex-start;">
        <div style="width:40px;height:40px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.9rem;font-weight:800;color:#6366f1;">0${i+1}</div>
        <div>
          <h3 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin:0 0 8px;">${q}</h3>
          <p style="font-size:.93rem;color:#64748b;line-height:1.75;margin:0;">${a}</p>
        </div>
      </div>`).join("")}
    </div>
    <div style="margin-top:64px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:18px;padding:36px;text-align:center;">
      <h3 style="font-size:1.3rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Still have questions?</h3>
      <p style="font-size:.95rem;color:#64748b;margin:0 0 20px;">Our support team is here to help.</p>
      <a href="#" style="display:inline-flex;align-items:center;gap:7px;background:#0f172a;color:white;font-size:.92rem;font-weight:700;padding:13px 24px;border-radius:10px;text-decoration:none;">Contact support →</a>
    </div>
  </div>
</section>`;

/* ════════════════════════════════════════════
   FORM / CONTACT TEMPLATES (4 variants)
════════════════════════════════════════════ */

const FORM_1 = FONT + `
<section style="font-family:'Inter',sans-serif;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:96px 40px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(99,102,241,.2)0%,transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:80px;">
    <div style="flex:1;">
      <span style="display:inline-block;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:22px;">Get in touch</span>
      <h2 style="font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-.03em;margin:0 0 18px;">Let's start a conversation</h2>
      <p style="font-size:1rem;color:#94a3b8;line-height:1.8;margin:0 0 36px;">Tell us about your project and we'll respond within one business day.</p>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;align-items:center;gap:14px;"><div style="width:42px;height:42px;background:rgba(99,102,241,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="18" height="18" fill="none" stroke="#818cf8" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div><div><div style="font-size:11px;color:#64748b;font-weight:500;margin-bottom:2px;">Email</div><div style="font-size:.92rem;color:#e2e8f0;font-weight:600;">hello@yourcompany.com</div></div></div>
        <div style="display:flex;align-items:center;gap:14px;"><div style="width:42px;height:42px;background:rgba(99,102,241,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="18" height="18" fill="none" stroke="#818cf8" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></div><div><div style="font-size:11px;color:#64748b;font-weight:500;margin-bottom:2px;">Phone</div><div style="font-size:.92rem;color:#e2e8f0;font-weight:600;">+1 (555) 000-0000</div></div></div>
      </div>
    </div>
    <div style="flex:1;background:white;border-radius:22px;padding:44px;box-shadow:0 32px 80px rgba(0,0,0,.4);">
      <h3 style="font-size:1.4rem;font-weight:800;color:#0f172a;margin:0 0 5px;">Send us a message</h3>
      <p style="font-size:.88rem;color:#94a3b8;margin:0 0 28px;">We'll respond within 24 hours.</p>
      <form style="display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;gap:14px;"><div style="flex:1;"><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">First name</label><input type="text" placeholder="John" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:.92rem;color:#0f172a;font-family:inherit;outline:none;"></div><div style="flex:1;"><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">Last name</label><input type="text" placeholder="Doe" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:.92rem;color:#0f172a;font-family:inherit;outline:none;"></div></div>
        <div><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">Email address</label><input type="email" placeholder="john@company.com" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:.92rem;color:#0f172a;font-family:inherit;outline:none;"></div>
        <div><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">Phone number</label><input type="tel" placeholder="+1 (555) 000-0000" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:.92rem;color:#0f172a;font-family:inherit;outline:none;"></div>
        <div><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">How can we help?</label><textarea rows="3" placeholder="Tell us about your project..." style="width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:.92rem;color:#0f172a;font-family:inherit;outline:none;resize:none;"></textarea></div>
        <button type="submit" style="width:100%;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;font-size:.95rem;font-weight:700;padding:14px;border-radius:9px;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,.3);">Send Message →</button>
      </form>
    </div>
  </div>
</section>`;

const FORM_2 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#f8fafc;padding:96px 40px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span style="display:inline-block;background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:16px;">Contact us</span>
      <h2 style="font-size:2.4rem;font-weight:800;color:#0f172a;line-height:1.15;letter-spacing:-.03em;margin:0 0 12px;">We'd love to hear from you</h2>
      <p style="font-size:1rem;color:#64748b;line-height:1.7;margin:0;">Fill out the form and our team will get back to you within 24 hours.</p>
    </div>
    <div style="background:white;border:1.5px solid #e2e8f0;border-radius:22px;padding:44px;box-shadow:0 4px 24px rgba(0,0,0,.06);">
      <form style="display:flex;flex-direction:column;gap:18px;">
        <div><label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px;">Full name</label><input type="text" placeholder="John Doe" style="width:100%;box-sizing:border-box;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.95rem;color:#0f172a;font-family:inherit;outline:none;"></div>
        <div><label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px;">Email address</label><input type="email" placeholder="john@company.com" style="width:100%;box-sizing:border-box;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.95rem;color:#0f172a;font-family:inherit;outline:none;"></div>
        <div><label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px;">Phone number</label><input type="tel" placeholder="+1 (555) 000-0000" style="width:100%;box-sizing:border-box;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.95rem;color:#0f172a;font-family:inherit;outline:none;"></div>
        <div><label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px;">Message</label><textarea rows="4" placeholder="Tell us about your project..." style="width:100%;box-sizing:border-box;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.95rem;color:#0f172a;font-family:inherit;outline:none;resize:none;"></textarea></div>
        <button type="submit" style="width:100%;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;font-size:.97rem;font-weight:700;padding:15px;border-radius:10px;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(124,58,237,.28);">Send Message →</button>
        <p style="text-align:center;font-size:.8rem;color:#9ca3af;margin:0;">We respect your privacy. No spam, ever.</p>
      </form>
    </div>
  </div>
</section>`;

const FORM_3 = FONT + `
<section style="font-family:'Inter',sans-serif;position:relative;padding:96px 40px;overflow:hidden;">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#6366f1 0%,#7c3aed 40%,#2563eb 100%);"></div>
  <div style="position:absolute;inset:0;opacity:.08;background-image:radial-gradient(circle at 1px 1px,white 1px,transparent 0);background-size:32px 32px;"></div>
  <div style="position:relative;z-index:1;max-width:580px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:36px;">
      <h2 style="font-size:2.4rem;font-weight:900;color:white;line-height:1.15;letter-spacing:-.03em;margin:0 0 10px;">Get in touch</h2>
      <p style="font-size:1rem;color:rgba(255,255,255,.75);line-height:1.7;margin:0;">We'll get back to you within one business day, guaranteed.</p>
    </div>
    <div style="background:white;border-radius:24px;padding:40px;box-shadow:0 32px 80px rgba(0,0,0,.25);">
      <form style="display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;gap:14px;"><div style="flex:1;"><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">First name</label><input type="text" placeholder="John" style="width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:.9rem;font-family:inherit;outline:none;"></div><div style="flex:1;"><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">Last name</label><input type="text" placeholder="Doe" style="width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:.9rem;font-family:inherit;outline:none;"></div></div>
        <div><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">Email</label><input type="email" placeholder="john@company.com" style="width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:.9rem;font-family:inherit;outline:none;"></div>
        <div><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">Message</label><textarea rows="3" placeholder="Your message..." style="width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:.9rem;font-family:inherit;outline:none;resize:none;"></textarea></div>
        <button type="submit" style="width:100%;background:linear-gradient(135deg,#6366f1,#7c3aed);color:white;font-size:.95rem;font-weight:700;padding:14px;border-radius:9px;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,.3);">Send Message →</button>
      </form>
    </div>
  </div>
</section>`;

const FORM_4 = FONT + `
<section style="font-family:'Inter',sans-serif;background:#ffffff;padding:96px 40px;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:80px;">
    <div style="flex:0 0 380px;">
      <span style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;">Newsletter</span>
      <h2 style="font-size:2rem;font-weight:800;color:#0f172a;line-height:1.2;letter-spacing:-.03em;margin:0 0 12px;">Stay in the loop</h2>
      <p style="font-size:.97rem;color:#64748b;line-height:1.75;margin:0 0 24px;">Get the latest news, product updates, and exclusive tips delivered straight to your inbox.</p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;font-size:.88rem;color:#64748b;"><svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Weekly digest</div>
        <div style="display:flex;align-items:center;gap:8px;font-size:.88rem;color:#64748b;"><svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>No spam</div>
        <div style="display:flex;align-items:center;gap:8px;font-size:.88rem;color:#64748b;"><svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Unsubscribe anytime</div>
      </div>
    </div>
    <div style="flex:1;">
      <form style="display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;gap:14px;"><div style="flex:1;"><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">Full name</label><input type="text" placeholder="John Doe" style="width:100%;box-sizing:border-box;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.92rem;font-family:inherit;outline:none;"></div><div style="flex:1;"><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">Email address</label><input type="email" placeholder="john@company.com" style="width:100%;box-sizing:border-box;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.92rem;font-family:inherit;outline:none;"></div></div>
        <div><label style="display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:5px;">What topics interest you most?</label><select style="width:100%;box-sizing:border-box;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.92rem;color:#374151;font-family:inherit;outline:none;background:white;"><option>Product updates</option><option>Industry news</option><option>Tips & tutorials</option></select></div>
        <button type="submit" style="align-self:flex-start;background:#0f172a;color:white;font-size:.92rem;font-weight:700;padding:13px 28px;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;">Subscribe <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></button>
      </form>
    </div>
  </div>
</section>`;

/* ════════════════════════════════════════════
   PLUGIN REGISTRATION
════════════════════════════════════════════ */

function thumb(name: string) {
  return `<img src="/block-thumbs/${name}" style="width:100%;height:100%;object-fit:cover;" />`;
}

export default function businessBlocksPlugin(editor: Editor) {
  const bm = editor.BlockManager;

  const addBlock = (id: string, label: string, category: string, content: string, thumbFile: string) => {
    bm.add(id, { label, category, content, media: thumb(thumbFile) });
  };

  // ── HERO ──
  addBlock("hero-1", "Hero · Dark Split",    "Hero",     HERO_1, "hero-1.png");
  addBlock("hero-2", "Hero · Centered",      "Hero",     HERO_2, "hero-2.png");
  addBlock("hero-3", "Hero · Full BG Image", "Hero",     HERO_3, "hero-3.png");
  addBlock("hero-4", "Hero · Stats Grid",    "Hero",     HERO_4, "hero-4.png");

  // ── FEATURES ──
  addBlock("features-1", "Features · Cards",       "Features", FEATURES_1, "features-1.png");
  addBlock("features-2", "Features · Alternating", "Features", FEATURES_2, "features-2.png");
  addBlock("features-3", "Features · Steps",       "Features", FEATURES_3, "features-3.png");
  addBlock("features-4", "Features · List",        "Features", FEATURES_4, "features-4.png");

  // ── SERVICES ──
  addBlock("services-1", "Services · Card Grid", "Services", SERVICES_1, "services-1.png");
  addBlock("services-2", "Services · Bento",     "Services", SERVICES_2, "services-2.png");
  addBlock("services-3", "Services · Process",   "Services", SERVICES_3, "services-3.png");
  addBlock("services-4", "Services · Pricing",   "Services", SERVICES_4, "services-4.png");

  // ── FAQ ──
  addBlock("faq-1", "FAQ · Two Column", "FAQ", FAQ_1, "faq-1.png");
  addBlock("faq-2", "FAQ · Centered",   "FAQ", FAQ_2, "faq-2.png");
  addBlock("faq-3", "FAQ · With Image", "FAQ", FAQ_3, "faq-3.png");
  addBlock("faq-4", "FAQ · Numbered",   "FAQ", FAQ_4, "faq-4.png");

  // ── CONTACT FORM ──
  addBlock("form-1", "Form · Dark Split",  "Contact Form", FORM_1, "form-1.png");
  addBlock("form-2", "Form · Light Card",  "Contact Form", FORM_2, "form-2.png");
  addBlock("form-3", "Form · Gradient BG", "Contact Form", FORM_3, "form-3.png");
  addBlock("form-4", "Form · Newsletter",  "Contact Form", FORM_4, "form-4.png");

  // ── TEMPLATE ──
  bm.add("ongvang-template", {
    label: "Mẫu Ong Vàng",
    category: "Templates",
    content: ongvangHtml,
    media: thumb("hero-1.png"),
  });

  const DB_PLACEHOLDER_BASE = `
    font-family:'Inter',sans-serif;
    display:flex;align-items:center;justify-content:center;
    flex-direction:column;gap:10px;
    min-height:180px;padding:40px;text-align:center;
    border-radius:16px;border:2px dashed;
  `;

  const THUMB_SERVICES = `<div style="width:100%;height:100%;overflow:hidden;background:#fff;font-family:Inter,sans-serif;position:relative;"><div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:7px 10px 6px;"><div style="font-size:5px;font-weight:800;color:white;">DICH VU CUA CHUNG TOI</div><div style="font-size:4px;color:rgba(255,255,255,.7);margin-top:1px;">Giai phap toan dien cho doanh nghiep</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:5px 6px 4px;"><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:2px;background:#6366f1;"></div><div style="padding:4px;"><div style="background:#eef2ff;border-radius:2px;width:10px;height:10px;margin-bottom:3px;"></div><div style="font-size:4.5px;font-weight:800;color:#0f172a;margin-bottom:1px;">Thiet ke Web</div><div style="font-size:3.5px;color:#64748b;margin-bottom:3px;">Giao dien dep</div><div style="border-top:1px solid #f1f5f9;padding-top:3px;display:flex;justify-content:space-between;align-items:center;"><div style="font-size:5px;font-weight:800;color:#6366f1;">5tr+</div><div style="background:#6366f1;color:white;font-size:3px;padding:2px 4px;border-radius:2px;">Tu van</div></div></div></div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:2px;background:#0ea5e9;"></div><div style="padding:4px;"><div style="background:#e0f2fe;border-radius:2px;width:10px;height:10px;margin-bottom:3px;"></div><div style="font-size:4.5px;font-weight:800;color:#0f172a;margin-bottom:1px;">Marketing</div><div style="font-size:3.5px;color:#64748b;margin-bottom:3px;">Chien luoc toan dien</div><div style="border-top:1px solid #f1f5f9;padding-top:3px;display:flex;justify-content:space-between;align-items:center;"><div style="font-size:5px;font-weight:800;color:#0ea5e9;">3tr+</div><div style="background:#0ea5e9;color:white;font-size:3px;padding:2px 4px;border-radius:2px;">Tu van</div></div></div></div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:2px;background:#10b981;"></div><div style="padding:4px;"><div style="background:#d1fae5;border-radius:2px;width:10px;height:10px;margin-bottom:3px;"></div><div style="font-size:4.5px;font-weight:800;color:#0f172a;margin-bottom:1px;">Tu van CRM</div><div style="font-size:3.5px;color:#64748b;margin-bottom:3px;">Quan ly khach hang</div><div style="border-top:1px solid #f1f5f9;padding-top:3px;display:flex;justify-content:space-between;align-items:center;"><div style="font-size:5px;font-weight:800;color:#10b981;">Lien he</div><div style="background:#10b981;color:white;font-size:3px;padding:2px 4px;border-radius:2px;">Tu van</div></div></div></div></div><div style="position:absolute;bottom:4px;right:6px;background:#6366f1;color:white;font-size:3px;padding:2px 5px;border-radius:100px;font-weight:700;">LIVE DATA</div></div>`;

  const THUMB_COURSES = `<div style="width:100%;height:100%;overflow:hidden;background:#f8fafc;font-family:Inter,sans-serif;position:relative;"><div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:6px 10px 5px;"><div style="font-size:5px;font-weight:800;color:white;">KHOA HOC NOI BAT</div><div style="font-size:3.5px;color:rgba(255,255,255,.7);margin-top:1px;">Tu cac chuyen gia hang dau</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:5px 6px 4px;"><div style="background:white;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:22px;background:linear-gradient(135deg,#6366f1,#4f46e5);position:relative;"><div style="position:absolute;top:2px;left:2px;background:#dcfce7;color:#16a34a;font-size:3px;font-weight:700;padding:1px 3px;border-radius:2px;">Co ban</div></div><div style="padding:3px;"><div style="font-size:4px;font-weight:800;color:#0f172a;margin-bottom:2px;">Marketing Online</div><div style="display:flex;gap:3px;margin-bottom:2px;"><span style="font-size:3px;color:#64748b;">12h</span><span style="font-size:3px;color:#64748b;">234 hv</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:4px;font-weight:800;color:#7c3aed;">2.5tr</div><div style="background:#7c3aed;color:white;font-size:3px;padding:1px 4px;border-radius:2px;">Dang ky</div></div></div></div><div style="background:white;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:22px;background:linear-gradient(135deg,#0ea5e9,#0284c7);position:relative;"><div style="position:absolute;top:2px;left:2px;background:#dbeafe;color:#1d4ed8;font-size:3px;font-weight:700;padding:1px 3px;border-radius:2px;">Trung cap</div></div><div style="padding:3px;"><div style="font-size:4px;font-weight:800;color:#0f172a;margin-bottom:2px;">Lap trinh Web</div><div style="display:flex;gap:3px;margin-bottom:2px;"><span style="font-size:3px;color:#64748b;">40h</span><span style="font-size:3px;color:#64748b;">89 hv</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:4px;font-weight:800;color:#0ea5e9;">Mien phi</div><div style="background:#0ea5e9;color:white;font-size:3px;padding:1px 4px;border-radius:2px;">Dang ky</div></div></div></div><div style="background:white;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:22px;background:linear-gradient(135deg,#10b981,#059669);position:relative;"><div style="position:absolute;top:2px;left:2px;background:#ede9fe;color:#7c3aed;font-size:3px;font-weight:700;padding:1px 3px;border-radius:2px;">Nang cao</div></div><div style="padding:3px;"><div style="font-size:4px;font-weight:800;color:#0f172a;margin-bottom:2px;">Data Analytics</div><div style="display:flex;gap:3px;margin-bottom:2px;"><span style="font-size:3px;color:#64748b;">24h</span><span style="font-size:3px;color:#64748b;">156 hv</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:4px;font-weight:800;color:#10b981;">1.5tr</div><div style="background:#10b981;color:white;font-size:3px;padding:1px 4px;border-radius:2px;">Dang ky</div></div></div></div></div><div style="position:absolute;bottom:4px;right:6px;background:#7c3aed;color:white;font-size:3px;padding:2px 5px;border-radius:100px;font-weight:700;">LIVE DATA</div></div>`;

  const THUMB_PROJECTS = `<div style="width:100%;height:100%;overflow:hidden;background:#f8fafc;font-family:Inter,sans-serif;position:relative;"><div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:6px 10px 5px;"><div style="font-size:5px;font-weight:800;color:white;">DU AN TIEU BIEU</div><div style="font-size:3.5px;color:rgba(255,255,255,.6);margin-top:1px;">Cac du an dang trien khai</div></div><div style="display:flex;flex-direction:column;gap:3px;padding:5px 6px 4px;"><div style="background:white;border:1px solid #e2e8f0;border-radius:4px;padding:4px;position:relative;overflow:hidden;"><div style="position:absolute;top:0;left:0;bottom:0;width:2px;background:#6366f1;"></div><div style="padding-left:5px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><div style="font-size:4.5px;font-weight:800;color:#0f172a;">Website TMDT</div><div style="background:#dbeafe;color:#1d4ed8;font-size:3px;font-weight:700;padding:1px 4px;border-radius:100px;">Dang lam</div></div><div style="height:2.5px;background:#f1f5f9;border-radius:100px;overflow:hidden;margin-bottom:2px;"><div style="width:75%;height:100%;background:#3b82f6;border-radius:100px;"></div></div><div style="font-size:3px;color:#64748b;">75% · 50.000.000d</div></div></div><div style="background:white;border:1px solid #e2e8f0;border-radius:4px;padding:4px;position:relative;overflow:hidden;"><div style="position:absolute;top:0;left:0;bottom:0;width:2px;background:#10b981;"></div><div style="padding-left:5px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><div style="font-size:4.5px;font-weight:800;color:#0f172a;">App CRM Mobile</div><div style="background:#d1fae5;color:#065f46;font-size:3px;font-weight:700;padding:1px 4px;border-radius:100px;">Hoan thanh</div></div><div style="height:2.5px;background:#f1f5f9;border-radius:100px;overflow:hidden;margin-bottom:2px;"><div style="width:100%;height:100%;background:#10b981;border-radius:100px;"></div></div><div style="font-size:3px;color:#64748b;">100% · 120.000.000d</div></div></div><div style="background:white;border:1px solid #e2e8f0;border-radius:4px;padding:4px;position:relative;overflow:hidden;"><div style="position:absolute;top:0;left:0;bottom:0;width:2px;background:#f59e0b;"></div><div style="padding-left:5px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><div style="font-size:4.5px;font-weight:800;color:#0f172a;">Automation Pipeline</div><div style="background:#fef3c7;color:#92400e;font-size:3px;font-weight:700;padding:1px 4px;border-radius:100px;">Len ke hoach</div></div><div style="height:2.5px;background:#f1f5f9;border-radius:100px;overflow:hidden;margin-bottom:2px;"><div style="width:20%;height:100%;background:#f59e0b;border-radius:100px;"></div></div><div style="font-size:3px;color:#64748b;">20% · 80.000.000d</div></div></div></div><div style="position:absolute;bottom:4px;right:6px;background:#0f172a;color:white;font-size:3px;padding:2px 5px;border-radius:100px;font-weight:700;">LIVE DATA</div></div>`;

  const THUMB_FORM = `<div style="width:100%;height:100%;overflow:hidden;background:#1e1b4b;font-family:Inter,sans-serif;display:flex;"><div style="width:45%;padding:8px 7px;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:3.5px;color:rgba(255,255,255,.6);font-weight:700;text-transform:uppercase;margin-bottom:4px;">LIEN HE</div><div style="font-size:6px;font-weight:900;color:white;line-height:1.2;margin-bottom:5px;">Lien he voi chung toi</div><div style="font-size:3.5px;color:rgba(255,255,255,.6);margin-bottom:6px;">Dien thong tin, chung toi se lien he trong 24 gio.</div><div style="display:flex;flex-direction:column;gap:2px;"><div style="display:flex;align-items:center;gap:3px;"><div style="width:8px;height:8px;background:rgba(255,255,255,.1);border-radius:50%;"></div><div style="font-size:3.5px;color:rgba(255,255,255,.75);">Phan hoi trong 24h</div></div><div style="display:flex;align-items:center;gap:3px;"><div style="width:8px;height:8px;background:rgba(255,255,255,.1);border-radius:50%;"></div><div style="font-size:3.5px;color:rgba(255,255,255,.75);">Bao mat tuyet doi</div></div><div style="display:flex;align-items:center;gap:3px;"><div style="width:8px;height:8px;background:rgba(255,255,255,.1);border-radius:50%;"></div><div style="font-size:3.5px;color:rgba(255,255,255,.75);">Tu van mien phi</div></div></div></div><div style="flex:1;margin:6px;background:white;border-radius:6px;padding:7px;display:flex;flex-direction:column;gap:3px;"><div style="height:2px;background:linear-gradient(90deg,#4f46e5,#7c3aed);border-radius:4px;margin-bottom:2px;"></div><div style="font-size:4.5px;font-weight:800;color:#0f172a;margin-bottom:1px;">Gui yeu cau ngay</div><div><div style="font-size:3.5px;color:#374151;font-weight:600;margin-bottom:1px;">Ho va ten *</div><div style="border:1px solid #e2e8f0;border-radius:3px;height:7px;background:#f8fafc;"></div></div><div><div style="font-size:3.5px;color:#374151;font-weight:600;margin-bottom:1px;">So dien thoai *</div><div style="border:1px solid #e2e8f0;border-radius:3px;height:7px;background:#f8fafc;"></div></div><div><div style="font-size:3.5px;color:#374151;font-weight:600;margin-bottom:1px;">Email</div><div style="border:1px solid #e2e8f0;border-radius:3px;height:7px;background:#f8fafc;"></div></div><div style="background:linear-gradient(135deg,#4f46e5,#6d28d9);border-radius:3px;height:9px;display:flex;align-items:center;justify-content:center;margin-top:1px;"><div style="font-size:4px;font-weight:800;color:white;">GUI YEU CAU</div></div></div></div>`;

  // ── DB: SERVICES ──
  bm.add("db-services", {
    label: "Dich vu Live",
    category: "Data Blocks",
    content: `<div
      data-ovc-block="db-services"
      data-ovc-limit="6"
      data-ovc-title="Dich vu cua chung toi"
      style="${DB_PLACEHOLDER_BASE}background:#eef2ff;border-color:#6366f1;"
    >
      <strong style="font-size:14px;color:#4338ca;font-weight:800;">Block Dich Vu - Live Data</strong>
      <span style="font-size:12px;color:#818cf8;">Tu dong lay dich vu tu module Services</span>
      <span style="font-size:11px;color:#a5b4fc;background:#e0e7ff;padding:4px 12px;border-radius:100px;">Hien thi du lieu that khi Preview</span>
    </div>`,
    media: THUMB_SERVICES,
  });

  // ── DB: COURSES ──
  bm.add("db-courses", {
    label: "Khoa hoc Live",
    category: "Data Blocks",
    content: `<div
      data-ovc-block="db-courses"
      data-ovc-limit="6"
      data-ovc-title="Khoa hoc noi bat"
      style="${DB_PLACEHOLDER_BASE}background:#ede9fe;border-color:#8b5cf6;"
    >
      <strong style="font-size:14px;color:#6d28d9;font-weight:800;">Block Khoa Hoc - Live Data</strong>
      <span style="font-size:12px;color:#7c3aed;">Hien thi khoa hoc tu module Courses</span>
      <span style="font-size:11px;color:#a78bfa;background:#ede9fe;padding:4px 12px;border-radius:100px;">Hien thi du lieu that khi Preview</span>
    </div>`,
    media: THUMB_COURSES,
  });

  // ── DB: PROJECTS ──
  bm.add("db-projects", {
    label: "Du an Live",
    category: "Data Blocks",
    content: `<div
      data-ovc-block="db-projects"
      data-ovc-limit="6"
      data-ovc-title="Du an tieu bieu"
      style="${DB_PLACEHOLDER_BASE}background:#dbeafe;border-color:#3b82f6;"
    >
      <strong style="font-size:14px;color:#1d4ed8;font-weight:800;">Block Du An - Live Data</strong>
      <span style="font-size:12px;color:#2563eb;">Hien thi du an tu module Projects</span>
      <span style="font-size:11px;color:#60a5fa;background:#dbeafe;padding:4px 12px;border-radius:100px;">Hien thi du lieu that khi Preview</span>
    </div>`,
    media: THUMB_PROJECTS,
  });

  // ── DB: LEAD FORM ──
  bm.add("db-form", {
    label: "Form Lead Live",
    category: "Data Blocks",
    content: `<div
      data-ovc-block="db-form"
      data-ovc-form-id="first"
      data-ovc-layout="split"
      style="${DB_PLACEHOLDER_BASE}background:#dcfce7;border-color:#10b981;"
    >
      <strong style="font-size:14px;color:#065f46;font-weight:800;">Block Form Lead - Live Data</strong>
      <span style="font-size:12px;color:#059669;">Lay form dau tien dang hoat dong tu module CRM</span>
      <span style="font-size:11px;color:#34d399;background:#dcfce7;padding:4px 12px;border-radius:100px;">Hien thi du lieu that khi Preview</span>
    </div>`,
    media: THUMB_FORM,
  });
}
