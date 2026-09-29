import { useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CircleHelp, Compass, Layers3, MoveUpRight, Play, Quote, ShieldCheck, Sparkles, Target, TimerReset, Workflow, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const benefits = [
  { icon: Target, title: 'A little more focus', text: 'Bring priorities into view so the important work stops competing with the loudest work.' },
  { icon: Workflow, title: 'Less back and forth', text: 'Turn scattered updates into a steady rhythm your whole team can follow.' },
  { icon: Sparkles, title: 'Better work, together', text: 'Make room for thoughtful collaboration without adding another layer of busywork.' },
]
const services = [
  { icon: Compass, number: '01', title: 'Find your direction', text: 'Get a shared view of the goals, decisions, and next steps that matter.', link: 'Explore strategy' },
  { icon: Layers3, number: '02', title: 'Build a better rhythm', text: 'Give projects a home and make progress easier to see as it happens.', link: 'Explore operations' },
  { icon: Zap, number: '03', title: 'Move with confidence', text: 'Create clear ownership and turn good intentions into finished work.', link: 'Explore enablement' },
]
const faqs = [
  ['What is Nexora?', 'Nexora is a practical workspace and partner for teams that want clearer priorities, calmer collaboration, and more consistent progress.'],
  ['Who is Nexora for?', 'We work best with growing teams that have ambitious goals and want a thoughtful, straightforward way to get there.'],
  ['Can we start small?', 'Absolutely. Start with one team or one challenge, then expand when the approach feels right for you.'],
  ['Is there a free trial?', 'Every plan begins with a conversation. We will help you find a sensible first step before you commit.'],
]
const testimonials = [
  { quote: 'Nexora helped us step back, get honest about what mattered, and find a rhythm that actually sticks. We’re doing our best work, and it feels lighter.', name: 'Morgan Lee', role: 'Operations Lead, Product Team', initials: 'ML' },
  { quote: 'We finally have a shared picture of the work ahead. Our team makes decisions with more confidence and spends less time untangling priorities.', name: 'Jamie Rivera', role: 'Founder, Independent Studio', initials: 'JR' },
  { quote: 'The structure feels human, not heavy. Nexora helped us turn a long list of good ideas into a plan the whole team believes in.', name: 'Riley Kim', role: 'Studio Director, Creative Team', initials: 'RK' },
]

export default function Home() {
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const testimonial = testimonials[testimonialIndex]
  function moveTestimonial(direction) {
    setTestimonialIndex((testimonialIndex + direction + testimonials.length) % testimonials.length)
  }
  return (
    <>
      <section className="hero-section">
        <div className="hero-shell page-container">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> A clearer way to move forward</span>
            <h1>Make good work<br />feel <span className="hero-accent">effortless.</span></h1>
            <p className="hero-lead">Nexora gives ambitious teams the clarity, structure, and support to turn their next big idea into meaningful progress.</p>
            <div className="hero-actions"><Link className="button button-primary" to="/register">Find your next step <ArrowUpRight size={17} /></Link><Link className="button button-quiet" to="/about"><span className="play-icon"><Play size={12} fill="currentColor" /></span> Meet Nexora</Link></div>
            <div className="hero-proof"><div className="avatar-stack" aria-label="Nexora community members"><span>AL</span><span>JM</span><span>RK</span><span>+</span></div><div><strong>Good work, shared</strong><small>Built around real teams</small></div><div className="proof-divider" /><div className="proof-stat"><strong>4.9<span>/5</span></strong><small>Partner rating</small></div></div>
          </div>
          <div className="hero-visual" aria-label="Illustration of a clear team workspace">
            <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
            <div className="visual-note note-top"><span className="note-mark"><Check size={15} /></span><span><strong>One clear priority</strong><small>Everyone knows what matters</small></span></div>
            <div className="workspace-card">
              <div className="workspace-top"><div className="window-dots"><i /><i /><i /></div><span>TEAM OVERVIEW</span><span className="workspace-menu">···</span></div>
              <div className="workspace-greeting"><small>MONDAY, OCTOBER 14</small><h2>Good morning, Alex</h2><p>Here’s what your team is moving forward.</p></div>
              <div className="work-progress"><div><span>Launch planning</span><strong>78%</strong></div><div className="progress-track"><i style={{ width: '78%' }} /></div><small><span className="tiny-avatars"><b>J</b><b>M</b><b>A</b></span> 3 people · On track</small></div>
              <div className="workspace-task"><span className="task-icon"><Target size={16} /></span><div><strong>Define the next milestone</strong><small>Product launch · Today</small></div><span className="task-check"><Check size={13} /></span></div>
              <div className="workspace-bottom"><span><span className="live-dot" /> TEAM MOMENTUM</span><strong>↑ 18% this month</strong></div>
            </div>
            <div className="visual-note note-bottom"><span className="note-clock"><TimerReset size={17} /></span><span><strong>Room to do your best</strong><small>More progress, less noise</small></span><ArrowUpRight size={15} /></div>
            <div className="visual-stamp"><MoveUpRight size={18} /><span>FOCUS<br />FORWARD</span></div>
          </div>
          <a className="hero-scroll" href="#approach"><ArrowDown size={14} /> Scroll to explore</a>
        </div>
        <div className="hero-edge" aria-hidden="true"><span>THOUGHTFUL BY DESIGN</span><i /></div>
      </section>

      <section className="trust-strip page-container"><span>For teams who care about how the work gets done</span><div className="trust-logos"><b>PRODUCT TEAMS</b><b className="trust-serif">creative studios</b><b><i className="trust-spark">✳</i> growing teams</b><b className="trust-wide">MISSION-LED ORGS</b></div></section>

      <section className="section section-approach" id="approach"><div className="page-container approach-layout"><div className="section-heading"><span className="eyebrow">The Nexora difference</span><h2>Clarity changes<br />everything.</h2><p>When everyone can see the path, the work gets lighter. We help your team spend less energy finding its footing and more energy doing what it does best.</p><Link className="text-link" to="/about">A little more about us <ArrowRight size={15} /></Link></div><div className="benefit-list">{benefits.map(({ icon: Icon, title, text }, index) => <article className="benefit-row" key={title}><span className="benefit-index">0{index + 1}</span><span className="benefit-icon"><Icon size={19} /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight className="row-arrow" size={17} /></article>)}</div></div></section>

      <section className="section service-section"><div className="page-container"><div className="section-topline"><div><span className="eyebrow">Thoughtful support, right where you need it</span><h2>Make progress<br />feel more natural.</h2></div><Link className="button button-outline" to="/services">Explore our services <ArrowUpRight size={16} /></Link></div><div className="service-grid">{services.map(({ icon: Icon, number, title, text, link }) => <article className="service-card" key={title}><div className="service-card-top"><span className="service-icon"><Icon size={20} /></span><span>{number}</span></div><h3>{title}</h3><p>{text}</p><Link to="/services" className="text-link">{link} <ArrowRight size={14} /></Link></article>)}</div></div></section>

      <section className="section benefits-band"><div className="page-container benefits-layout"><div className="benefits-art"><div className="benefits-ring ring-a" /><div className="benefits-ring ring-b" /><div className="benefits-center"><MoveUpRight size={28} /><span>NX</span></div><div className="benefits-label label-a"><Check size={13} /> Shared direction</div><div className="benefits-label label-b"><Check size={13} /> Sustainable pace</div><div className="benefits-label label-c"><Check size={13} /> Work that matters</div></div><div className="benefits-copy"><span className="eyebrow">Built for the long game</span><h2>Less friction.<br />More forward.</h2><p>Good systems shouldn’t ask your team to become someone else. Nexora fits around the way you work, helping the right things happen with a little more ease.</p><ul><li><Check size={16} /> Clear priorities without the extra process</li><li><Check size={16} /> Support that adapts as you grow</li><li><Check size={16} /> Progress you can feel, not just report</li></ul><Link className="text-link" to="/about">See what sets us apart <ArrowRight size={15} /></Link></div></div></section>

      <section className="section steps-section"><div className="page-container"><div className="steps-heading"><span className="eyebrow">A good place to begin</span><h2>Three steps. A clearer next.</h2><p>Simple enough to start, strong enough to take you further.</p></div><div className="steps-grid"><article><span className="step-number">01</span><span className="step-icon"><Compass size={20} /></span><h3>Start with a conversation</h3><p>Tell us where you are and what you’re working toward.</p></article><article><span className="step-number">02</span><span className="step-icon"><Layers3 size={20} /></span><h3>Shape your approach</h3><p>We’ll find the structure and support that fit your team.</p></article><article><span className="step-number">03</span><span className="step-icon"><ArrowUpRight size={20} /></span><h3>Make it happen</h3><p>Take the next step with a plan your team can actually use.</p></article></div><Link to="/contact" className="steps-link">How it works at Nexora <ArrowRight size={15} /></Link></div></section>

      <section className="section pricing-preview"><div className="page-container pricing-layout"><div><span className="eyebrow">The right place to start</span><h2>Clear value.<br />No guesswork.</h2><p>Every team is different. Our plans start with what you need now and leave room for what comes next.</p><Link className="text-link" to="/pricing">Compare plans <ArrowRight size={15} /></Link></div><div className="pricing-teaser"><div className="pricing-teaser-head"><span className="pricing-kicker">TEAM WORKSPACE</span><span className="plan-pill">A good place to begin</span></div><h3>Essentials</h3><p>Clarity for the work you’re doing right now.</p><div className="price-line"><strong>$18</strong><span>/ member / month</span></div><div className="teaser-rule" /><ul><li><Check size={15} /> Shared team workspace</li><li><Check size={15} /> Guided project setup</li><li><Check size={15} /> Human support when you need it</li></ul><Link className="button button-primary button-wide" to="/pricing">See all plans <ArrowUpRight size={16} /></Link></div><p className="pricing-side-note"><ShieldCheck size={17} /> Start with a conversation. No pressure, no surprises.</p></div></section>

      <section className="section testimonial-section"><div className="page-container testimonial-layout"><div className="testimonial-aside"><span className="eyebrow">The work speaks for itself</span><h2>A better kind<br />of momentum.</h2><div className="testimonial-pagination"><button aria-label="Previous testimonial" onClick={() => moveTestimonial(-1)}>←</button><span>{String(testimonialIndex + 1).padStart(2, '0')} <i /> 03</span><button aria-label="Next testimonial" onClick={() => moveTestimonial(1)}>→</button></div></div><figure className="quote-card"><Quote size={26} className="quote-mark" /><blockquote>“{testimonial.quote}”</blockquote><figcaption><span className="quote-avatar">{testimonial.initials}</span><span><strong>{testimonial.name}</strong><small>{testimonial.role}</small></span><span className="quote-rating">★★★★★ <small>5.0</small></span></figcaption></figure></div></section>

      <section className="section faq-section"><div className="page-container faq-layout"><div className="faq-intro"><span className="faq-icon"><CircleHelp size={20} /></span><span className="eyebrow">Good questions</span><h2>A few things<br />you might be<br />wondering.</h2><p>Still curious? We’re easy to talk to.</p><Link className="text-link" to="/contact">Ask us anything <ArrowRight size={15} /></Link></div><div className="faq-list">{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="final-cta"><div className="page-container final-cta-inner"><div><span className="eyebrow">Your next chapter starts here</span><h2>Ready for work<br />to feel different?</h2><p>Let’s find a clearer way forward, together.</p></div><div className="final-cta-actions"><Link className="button button-white" to="/register">Let’s get started <ArrowUpRight size={17} /></Link><Link className="cta-secondary" to="/contact">Talk with our team <ArrowRight size={15} /></Link></div><div className="cta-art" aria-hidden="true"><div /><div /><MoveUpRight size={28} /></div></div></section>
    </>
  )
}
