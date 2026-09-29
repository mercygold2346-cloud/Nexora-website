import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, Compass, Layers3, Mail, MessageCircle, ShieldCheck, Sparkles, Target, Workflow, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

function PageIntro({ eyebrow, title, text }) {
  return <section className="page-intro"><div className="page-container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div></section>
}

export function About() {
  return <>
    <PageIntro eyebrow="A little about Nexora" title={<>Good work needs<br /><span className="hero-accent">room to grow.</span></>} text="We help ambitious teams find the clarity and confidence to do meaningful work, their way." />
    <section className="content-section"><div className="page-container about-story"><div><span className="eyebrow">Our point of view</span><h2>Progress isn’t about doing more. It’s about making room for what matters.</h2></div><div><p className="large-copy">Nexora exists for the teams with a lot of potential and a lot on their plate. We bring practical thinking, thoughtful tools, and steady support to help your people move forward with purpose.</p><p>We believe work can be ambitious without being exhausting. That the best systems are the ones people actually use. And that a little clarity can change the way a whole team feels about Monday morning.</p><Link className="text-link" to="/services">See how we help <ArrowRight size={15} /></Link></div></div></section>
    <section className="content-section about-values"><div className="page-container"><div className="section-topline"><div><span className="eyebrow">What we believe</span><h2>Good work, by design.</h2></div></div><div className="value-grid"><article><span>01</span><h3>People before process</h3><p>Structure should make work easier for the people doing it.</p></article><article><span>02</span><h3>Clarity is generous</h3><p>Clear expectations give everyone room to contribute well.</p></article><article><span>03</span><h3>Progress is personal</h3><p>The right next step looks different for every team.</p></article></div></div></section>
    <section className="simple-cta"><div className="page-container"><div><span className="eyebrow">Let’s make room for better</span><h2>Find your way forward with Nexora.</h2></div><Link className="button button-primary" to="/contact">Meet our team <ArrowUpRight size={16} /></Link></div></section>
  </>
}

const serviceItems = [
  { icon: Compass, title: 'Strategy & direction', tag: 'See the bigger picture', text: 'Get aligned on where you’re going, what matters most, and what to do next.', items: ['Goal and priority setting', 'Team alignment sessions', 'Quarterly planning support'] },
  { icon: Workflow, title: 'Operations & systems', tag: 'Make the work flow', text: 'Create the everyday structures that keep good work moving without getting in the way.', items: ['Workflow design', 'Project and process setup', 'Operating rhythm facilitation'] },
  { icon: Sparkles, title: 'Team enablement', tag: 'Make good work possible', text: 'Give your people the confidence, context, and tools to do their best work together.', items: ['Leadership coaching', 'Team workshops', 'Change and adoption support'] },
]
export function Services() {
  return <>
    <PageIntro eyebrow="How we can help" title={<>Support that meets<br /><span className="hero-accent">you where you are.</span></>} text="A practical mix of perspective, process, and people support. Choose one area or bring us the whole challenge." />
    <section className="content-section services-page"><div className="page-container"><div className="services-page-grid">{serviceItems.map(({ icon: Icon, title, tag, text, items }, index) => <article className="service-detail" key={title}><div className="service-card-top"><span className="service-icon"><Icon size={20} /></span><span>0{index + 1}</span></div><span className="eyebrow">{tag}</span><h2>{title}</h2><p>{text}</p><ul>{items.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul><Link to="/contact" className="text-link">Talk about this <ArrowRight size={15} /></Link></article>)}</div></div></section>
    <section className="simple-cta"><div className="page-container"><div><span className="eyebrow">Not sure where to start?</span><h2>That’s a good place to start.</h2></div><Link className="button button-primary" to="/contact">Let’s talk <ArrowUpRight size={16} /></Link></div></section>
  </>
}

const plans = [
  { name: 'Essentials', description: 'A clear start for a team ready to find its rhythm.', price: '$18', cadence: 'per member / month', items: ['Shared team workspace', 'Guided project setup', 'Monthly progress review', 'Email support'], action: 'Start with Essentials' },
  { name: 'Momentum', description: 'More hands-on support for your next stage of growth.', price: '$42', cadence: 'per member / month', featured: true, items: ['Everything in Essentials', 'Dedicated Nexora partner', 'Team workshops each quarter', 'Priority support'], action: 'Explore Momentum' },
  { name: 'Partnership', description: 'A tailored approach for ambitious, complex work.', price: 'Let’s talk', cadence: 'built around your team', items: ['Custom scope and cadence', 'Executive-level facilitation', 'Integrated team support', 'Flexible partnership model'], action: 'Build a plan together' },
]
export function Pricing() {
  return <>
    <PageIntro eyebrow="Straightforward by design" title={<>The right support<br /><span className="hero-accent">for what’s next.</span></>} text="Thoughtful plans for teams at different stages. Start with what you need and grow from there." />
    <section className="content-section pricing-page"><div className="page-container"><div className="plans-grid">{plans.map(({ name, description, price, cadence, featured, items, action }) => <article className={`plan-card${featured ? ' plan-featured' : ''}`} key={name}>{featured && <span className="featured-label">MOST POPULAR</span>}<span className="plan-name">{name}</span><p>{description}</p><div className="plan-price"><strong>{price}</strong>{price.startsWith('$') && <span>{cadence}</span>}</div>{!price.startsWith('$') && <span className="plan-cadence">{cadence}</span>}<ul>{items.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul><Link className={`button ${featured ? 'button-primary' : 'button-outline'} button-wide`} to="/contact">{action}<ArrowUpRight size={15} /></Link></article>)}</div><p className="pricing-footnote"><ShieldCheck size={16} /> All plans begin with a conversation. No surprise fees, no pressure.</p></div></section>
    <section className="simple-cta"><div className="page-container"><div><span className="eyebrow">A question about pricing?</span><h2>We’ll help you find the right fit.</h2></div><Link className="button button-primary" to="/contact">Ask our team <ArrowUpRight size={16} /></Link></div></section>
  </>
}

export function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (!form.get('name') || !form.get('email') || !form.get('message')) {
      setError('Please complete each field so we know how to reach you.')
      return
    }
    setError('')
    setSubmitted(true)
  }
  return <>
    <PageIntro eyebrow="Start a conversation" title={<>Tell us what’s<br /><span className="hero-accent">on your mind.</span></>} text="A first conversation is just that. Share what you’re working through, and we’ll take it from there." />
    <p className="contact-demo-note page-container">Frontend demo only: messages are not sent or saved.</p>
    <section className="content-section contact-page"><div className="page-container contact-layout"><aside className="contact-aside"><span className="contact-aside-icon"><MessageCircle size={21} /></span><h2>We’re listening.</h2><p>Tell us a little about where you are and where you’d like to go. A real person from Nexora will get back to you.</p><a href="mailto:hello@nexora.example"><Mail size={16} /> hello@nexora.example</a><div className="contact-response"><span className="live-dot" /> Usually responds within one business day</div></aside><div className="contact-form-wrap">{submitted ? <div className="success-panel" role="status"><span className="success-icon"><Check size={22} /></span><h2>Thanks for reaching out.</h2><p>Your note is ready for the Nexora team. We’ll be in touch soon.</p><button className="text-link" onClick={() => setSubmitted(false)}>Send another message <ArrowRight size={15} /></button></div> : <form className="form-stack" onSubmit={handleSubmit} noValidate><div className="form-heading"><span className="eyebrow">Contact Nexora</span><h2>Let’s start somewhere.</h2></div><div className="field-row"><label className="field"><span>Your name</span><input name="name" autoComplete="name" placeholder="Alex Morgan" required /></label><label className="field"><span>Work email</span><input name="email" type="email" autoComplete="email" placeholder="alex@company.com" required /></label></div><label className="field"><span>What would you like to talk about?</span><select name="topic" defaultValue=""><option value="" disabled>Select a topic</option><option>Strategy and direction</option><option>Operations and systems</option><option>Team support</option><option>Something else</option></select></label><label className="field"><span>A little more about it</span><textarea name="message" rows="5" placeholder="What’s on your mind?" required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit">Send your note <ArrowUpRight size={16} /></button><p className="form-disclaimer">Your details are only used to respond to your message.</p></form>}</div></div></section>
  </>
}
