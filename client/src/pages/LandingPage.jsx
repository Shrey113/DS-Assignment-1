import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShieldAlert,
  CheckCircle2,
  Play,
  Sparkles,
  X,
  Droplet,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Activity,
  Award,
  MapPin
} from 'lucide-react';
import '../App.css';

const BLOOD_GROUPS_INFO = {
  'O-': {
    title: 'O- Negative (The Universal Lifesaver)',
    desc: 'O- red blood cells can be safely given to ANY patient in an emergency when there is no time to test their blood type. Highly vital in trauma rooms.',
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-']
  },
  'O+': {
    title: 'O+ Positive (The Most Common Blood Type)',
    desc: 'O+ is the most frequently transfused blood type across the world. Needed continuously for surgical patients and road trauma care.',
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+']
  },
  'A-': {
    title: 'A- Negative (Rare & In High Demand)',
    desc: 'A- patients can receive red cells only from A- or O- donors. Your donation provides an irreplaceable safety net for surgical patients.',
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-']
  },
  'A+': {
    title: 'A+ Positive (A True Community Pillar)',
    desc: 'One in every three patients admitted to emergency wards can safely receive A+ blood components. A vital daily necessity for hospitals.',
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+']
  },
  'B-': {
    title: 'B- Negative (Precious & Rare)',
    desc: 'Only 2% of the population carries B- blood. When a B- emergency arises, matching voluntary donors make all the difference.',
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-']
  },
  'B+': {
    title: 'B+ Positive (Essential for Critical Care)',
    desc: 'B+ blood is widely needed in oncology, major organ transplants, and for patients managing chronic blood conditions like Thalassemia.',
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+']
  },
  'AB-': {
    title: 'AB- Negative (The Rarest Group)',
    desc: 'Carried by less than 1% of the population. AB- plasma is universally compatible and crucial for pediatric trauma and burn victims.',
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-']
  },
  'AB+': {
    title: 'AB+ Positive (The Universal Receiver)',
    desc: 'Patients with AB+ can receive red blood cells from any blood type. In addition, AB+ donors are universal plasma donors for emergency recovery.',
    canGiveTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  }
};

const FAQ_ITEMS = [
  {
    q: 'Does donating blood hurt?',
    a: 'Not at all. You will only feel a quick, tiny pinch for a fraction of a second when the sterile needle is inserted. After that, you comfortably relax in a recliner chair for 10 minutes.'
  },
  {
    q: 'How long does the entire appointment take?',
    a: 'The actual blood collection takes only 8 to 10 minutes! Including a free mini-health checkup, relaxing, and enjoying complimentary juice and cookies, the whole visit takes around 35 minutes.'
  },
  {
    q: 'How much blood is collected, and will I feel weak?',
    a: 'Only about 350ml to 450ml is collected (less than 8% of your total blood volume). Your body naturally replenishes the lost fluid volume within 24 to 48 hours.'
  },
  {
    q: 'Can I donate if I recently got a tattoo?',
    a: 'Yes! As long as it has been at least 6 months since your tattoo or piercing was done at a certified, hygienic studio.'
  },
  {
    q: 'How often can I donate blood?',
    a: 'Healthy male donors can donate whole blood every 90 days (3 months), and healthy female donors can donate every 120 days (4 months).'
  }
];

const HERO_VARIANTS = [
  {
    src: '/editorial_donation_2.png',
    alt: 'Voluntary female blood donor smiling in donation chair with male nurse gently monitoring blood collection unit',
    tagline: 'Community Donor Network',
    line1: 'The Art of',
    line2: 'Connecting Lives.',
    quote: 'BloodLink directly connects voluntary donors with patients and families in urgent medical need. One voluntary donation can help save up to three lives in your local community.',
    badge: 'Voluntary Donor Network • Ready to Help'
  },
  {
    src: '/editorial_donation_3.png',
    alt: 'Male emergency courier delivering red insulated blood transport box to female emergency physician with intake tablet',
    tagline: 'Urgent Emergency Alerts',
    line1: 'Fast Matches,',
    line2: 'Zero Delays.',
    quote: 'When critical emergencies strike, BloodLink broadcasts instant alerts to compatible donors to coordinate life-saving blood for hospital patients without delay.',
    badge: 'Instant Emergency Alerts • Rapid Coordination'
  },
  {
    src: '/editorial_donation_4.png',
    alt: 'Female emergency blood courier delivering insulated transport cooler box to welcoming hospital doctor with clipboard',
    tagline: 'Direct Community Bridge',
    line1: 'Bridging Donors &',
    line2: 'Families in Need.',
    quote: 'No more frantic phone calls or desperate social media posts. BloodLink directly matches patients with voluntary donors ready to help in medical emergencies.',
    badge: 'Direct Donor-to-Patient Bridge • 100% Free'
  },
  {
    src: '/editorial_donation_5.png',
    alt: 'Female clinical blood bank specialist handing carefully verified blood donation pack to male surgical physician in scrubs',
    tagline: 'Smart Compatibility Search',
    line1: 'Find Your Match,',
    line2: 'Save a Life Today.',
    quote: 'Our matching system pairs requesters with compatible voluntary donors across all 8 blood groups, ensuring patients receive the right match without lost time.',
    badge: 'Smart Compatibility Search • 8 Blood Groups'
  },
  {
    src: '/editorial_donation_1.png',
    alt: 'Voluntary male blood donor giving thumbs-up in recliner with healthcare nurse holding blood donation pack',
    tagline: 'Everyday Life-Savers',
    line1: 'The Power of',
    line2: 'Community Heroes.',
    quote: 'Join voluntary donors across your community. Register in 60 seconds, receive alerts when someone needs your blood type, and help save lives.',
    badge: 'Community Lifesavers • Sign Up in 60s'
  }
];

export default function App() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+');
  const [openFaq, setOpenFaq] = useState(0);

  const [heroVariantIndex, setHeroVariantIndex] = useState(0);
  const currentVariant = HERO_VARIANTS[heroVariantIndex];

  const [typedLine1, setTypedLine1] = useState(HERO_VARIANTS[0].line1);
  const [typedLine2, setTypedLine2] = useState(HERO_VARIANTS[0].line2);
  const [isTypingComplete, setIsTypingComplete] = useState(true);

  useEffect(() => {
    let char1 = 0;
    let char2 = 0;
    const target1 = currentVariant.line1;
    const target2 = currentVariant.line2;

    setTypedLine1('');
    setTypedLine2('');
    setIsTypingComplete(false);

    let phase = 1;
    const typingSpeed = 42;

    const interval = setInterval(() => {
      if (phase === 1) {
        if (char1 < target1.length) {
          setTypedLine1(target1.slice(0, char1 + 1));
          char1++;
        } else {
          phase = 2;
        }
      } else if (phase === 2) {
        if (char2 < target2.length) {
          setTypedLine2(target2.slice(0, char2 + 1));
          char2++;
        } else {
          phase = 3;
          setIsTypingComplete(true);
          clearInterval(interval);
        }
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [heroVariantIndex, currentVariant.line1, currentVariant.line2]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroVariantIndex((prev) => (prev + 1) % HERO_VARIANTS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [heroVariantIndex]);

  const handleNextHeroIllustration = () => {
    setHeroVariantIndex((prev) => (prev + 1) % HERO_VARIANTS.length);
  };

  const [showDonorModal, setShowDonorModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="editorial-layout">
      
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          padding: '16px 26px',
          borderRadius: '12px',
          backgroundColor: '#1C201D',
          color: '#FFFFFF',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.95rem',
          fontWeight: 600,
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <Sparkles size={20} color="#EF4E4E" />
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="hero-viewport-section">
        
        <nav className="editorial-nav">
          <Link to="/" className="editorial-logo">
            <img src="/bloodlink_logo.png" alt="BloodLink logo" className="editorial-logo-img" />
            <div className="logo-monogram">Blood<span>Link</span></div>
          </Link>

          <div className="nav-actions-group">
            <Link
              id="nav-our-area"
              to="/our-area"
              className="btn-editorial-secondary"
              style={{ padding: '10px 20px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <MapPin size={15} color="#EF4E4E" />
              <span>Our Area</span>
            </Link>

            <Link
              id="nav-request-blood"
              to="/requester"
              className="btn-editorial-secondary"
              style={{ padding: '10px 20px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Droplet size={15} color="#EF4E4E" />
              <span>Find Blood</span>
            </Link>

            <Link
              id="nav-become-donor"
              to="/donor"
              className="btn-editorial-primary"
              style={{ padding: '10px 22px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Heart size={15} fill="#FFFFFF" color="#FFFFFF" />
              <span>Be a Donor</span>
            </Link>
          </div>
        </nav>

        <header className="editorial-hero">
          <div className="hero-text-block">
            <h1 className="hero-main-heading">
              <span>{typedLine1}</span>
              {!typedLine2 && !isTypingComplete && <span className="typewriter-cursor">|</span>}
              <br />
              {typedLine2 && <em className="hero-typed-text">{typedLine2}</em>}
              {typedLine2 && !isTypingComplete && <span className="typewriter-cursor">|</span>}
            </h1>

            <p className="hero-lead-text">
              {currentVariant.quote}
            </p>

            <div className="hero-action-buttons">
              <Link
                id="hero-find-donor-btn"
                to="/requester"
                className="btn-editorial-primary"
              >
                <Droplet size={17} fill="#FFFFFF" />
                <span>FIND A DONOR</span>
              </Link>

              <Link
                id="hero-donate-btn"
                to="/donor"
                className="btn-editorial-dark"
              >
                <Heart size={17} fill="#EF4E4E" color="#EF4E4E" />
                <span>BE A DONOR</span>
              </Link>
            </div>

            <div className="hero-social-trust">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="#EF4E4E" />
                <span>24/7 Voluntary Blood Coordination</span>
              </span>
              <span>•</span>
              <span>100% Free & Open Platform</span>
            </div>
          </div>

          <div className="hero-illustration-wrapper">
            <div
              className="hero-illustration-area clickable-hero-slider"
              onClick={handleNextHeroIllustration}
              role="button"
              tabIndex={0}
              title="Click to view next story illustration"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNextHeroIllustration();
                }
              }}
            >
              {HERO_VARIANTS.map((variant, idx) => (
                <img
                  key={variant.src}
                  src={variant.src}
                  alt={variant.alt}
                  className={`floating-characters-art ${idx === heroVariantIndex ? 'active-variant' : 'inactive-variant'}`}
                  loading="eager"
                />
              ))}
            </div>

            <div
              className="illustration-caption-pill"
              onClick={handleNextHeroIllustration}
            >
              <span className="caption-dot"></span>
              <span className="caption-text">{currentVariant.badge}</span>
            </div>
          </div>
        </header>
      </section>

      <section className="stats-banner-wrap">
        <div className="stats-inner-grid">
          <div className="stat-item-block">
            <span className="stat-headline-num">14,850<span>+</span></span>
            <span className="stat-title-label">Lives Touched & Saved</span>
            <span className="stat-sub-note">Across emergency & surgical cases</span>
          </div>

          <div className="stat-item-block">
            <span className="stat-headline-num">4,200<span>+</span></span>
            <span className="stat-title-label">Voluntary Heroes</span>
            <span className="stat-sub-note">Ready to answer emergency calls</span>
          </div>

          <div className="stat-item-block">
            <span className="stat-headline-num">120<span>+</span></span>
            <span className="stat-title-label">Partner Hospital Depots</span>
            <span className="stat-sub-note">Coordinated in our safety network</span>
          </div>

          <div className="stat-item-block">
            <span className="stat-headline-num">&lt; 15<span>m</span></span>
            <span className="stat-title-label">Average Response Time</span>
            <span className="stat-sub-note">From request to matched donor</span>
          </div>
        </div>
      </section>

      <section id="why-donate" className="content-section-wrap">
        <div className="editorial-section-head">
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#EF4E4E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Why Give Blood
          </span>
          <h2 className="editorial-section-title">Where Does Your Gift Go?</h2>
          <p className="editorial-section-subtitle">
            Blood cannot be manufactured or synthetically formulated. It is a genuine gift from one human being to another in their most vulnerable moment.
          </p>
        </div>

        <div className="why-matters-grid">
          <div className="editorial-card why-matters-card">
            <div className="card-icon-pill" style={{ backgroundColor: 'var(--coral-soft)' }}>
              <ShieldAlert size={26} color="#EF4E4E" />
            </div>
            <h3 className="card-heading-title">Accident & Emergency Trauma</h3>
            <p className="card-paragraph-body">
              A single road trauma or acute injury patient can require up to 40 pints of blood. Immediate transfusions stabilize blood pressure and sustain vital organs during critical operations.
            </p>
          </div>

          <div className="editorial-card why-matters-card">
            <div className="card-icon-pill" style={{ backgroundColor: 'var(--leaf-sage)' }}>
              <Heart size={26} color="#2E7D32" />
            </div>
            <h3 className="card-heading-title">Mothers & Newborn Babies</h3>
            <p className="card-paragraph-body">
              Childbirth complications and postpartum hemorrhages are sudden and unpredictable. Available matching blood ensures both mother and infant return home healthy and smiling.
            </p>
          </div>

          <div className="editorial-card why-matters-card">
            <div className="card-icon-pill" style={{ backgroundColor: 'var(--amber-soft)' }}>
              <Activity size={26} color="#B45309" />
            </div>
            <h3 className="card-heading-title">Cancer Therapy & Surgery</h3>
            <p className="card-paragraph-body">
              Chemotherapy treatments and major surgeries temporarily deplete red blood cells and platelets. Regular voluntary donations give cancer fighters the strength to recover.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ backgroundColor: '#FFFFFF', padding: '88px 32px', borderTop: '1px solid var(--bg-card-border)', borderBottom: '1px solid var(--bg-card-border)' }}>
        <div className="content-section-wrap" style={{ padding: 0 }}>
          <div className="editorial-section-head">
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#EF4E4E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Simple 3-Step Journey
            </span>
            <h2 className="editorial-section-title">How BloodLink Works</h2>
            <p className="editorial-section-subtitle">
              We make voluntary donation effortless and emergency blood coordination prompt, transparent, and compassionate.
            </p>
          </div>

          <div className="how-steps-grid">
            <div className="step-editorial-card" style={{ backgroundColor: 'var(--bg-cream-pure)' }}>
              <div className="step-num-display">01</div>
              <h3 className="step-heading-text">Join the Registry in 60s</h3>
              <p className="card-paragraph-body">
                Fill out a simple, confidential profile with your blood type and city. Your details remain private and you stay in control.
              </p>
            </div>

            <div className="step-editorial-card" style={{ backgroundColor: 'var(--bg-cream-pure)' }}>
              <div className="step-num-display">02</div>
              <h3 className="step-heading-text">Receive Urgent Alerts</h3>
              <p className="card-paragraph-body">
                When a verified hospital or family nearby urgently needs your exact blood group, you receive a gentle SMS or notification.
              </p>
            </div>

            <div className="step-editorial-card" style={{ backgroundColor: 'var(--bg-cream-pure)' }}>
              <div className="step-num-display">03</div>
              <h3 className="step-heading-text">Donate & Save Up to 3 Lives</h3>
              <p className="card-paragraph-body">
                Visit a certified blood bank or camp. Spend 15 comfortable minutes relaxing in a recliner, enjoy juice, and walk out a hero.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="blood-types" style={{ backgroundColor: '#FFFFFF', padding: '88px 32px', borderTop: '1px solid var(--bg-card-border)', borderBottom: '1px solid var(--bg-card-border)' }}>
        <div className="content-section-wrap" style={{ padding: 0 }}>
          <div className="editorial-section-head">
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#EF4E4E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Know Your Match
            </span>
            <h2 className="editorial-section-title">Blood Group Compatibility</h2>
            <p className="editorial-section-subtitle">
              Select your blood type to discover who you can safely help and who can help you in a medical emergency.
            </p>
          </div>

          <div className="editorial-card compat-guide-card">
            <div className="blood-selector-bar">
              {Object.keys(BLOOD_GROUPS_INFO).map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedBloodGroup(group)}
                  className={`blood-pill-button ${selectedBloodGroup === group ? 'active' : ''}`}
                >
                  {group}
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {BLOOD_GROUPS_INFO[selectedBloodGroup].title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '1.02rem' }}>
                {BLOOD_GROUPS_INFO[selectedBloodGroup].desc}
              </p>
            </div>

            <div className="compat-two-cols">
              <div className="compat-target-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2E7D32', fontWeight: 700, fontSize: '1.05rem' }}>
                  <CheckCircle2 size={20} />
                  <span>You Can Safely DONATE Red Cells To:</span>
                </div>
                <div className="pills-cloud">
                  {BLOOD_GROUPS_INFO[selectedBloodGroup].canGiveTo.map((g) => (
                    <span key={g} className="tag-badge-clean" style={{ backgroundColor: 'var(--leaf-sage)', color: 'var(--leaf-sage-text)', border: '1px solid var(--leaf-sage-border)' }}>
                      ✓ {g} Patients
                    </span>
                  ))}
                </div>
              </div>

              <div className="compat-target-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--coral-accent)', fontWeight: 700, fontSize: '1.05rem' }}>
                  <Heart size={20} />
                  <span>You Can Safely RECEIVE Blood From:</span>
                </div>
                <div className="pills-cloud">
                  {BLOOD_GROUPS_INFO[selectedBloodGroup].canReceiveFrom.map((g) => (
                    <span key={g} className="tag-badge-clean" style={{ backgroundColor: 'var(--coral-soft)', color: 'var(--coral-accent)', border: '1px solid var(--peach-border)' }}>
                      ← {g} Donors
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stories" className="content-section-wrap">
        <div className="editorial-section-head">
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#EF4E4E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Stories of Hope
          </span>
          <h2 className="editorial-section-title">Lives Reborn Through Kindness</h2>
          <p className="editorial-section-subtitle">
            Behind every blood bag is a person who gave with an open heart, and a family whose loved one came back home.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="editorial-card testimonial-card-wrap">
            <p className="quote-statement">
              “Donating blood takes only 15 minutes of my afternoon, but knowing that a young mother walked out of the ICU because of my donation is the most humbling, beautiful feeling in the world.”
            </p>
            <div className="author-profile-box">
              <div className="author-monogram">PS</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Priya Sharma</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)' }}>Software Engineer • 9-Time Voluntary Donor</div>
              </div>
            </div>
          </div>

          <div className="editorial-card testimonial-card-wrap">
            <p className="quote-statement">
              “When my father was rushed into surgery after a highway accident, they needed rare O- blood at midnight. Two voluntary heroes from BloodLink arrived at the clinic within 25 minutes. They gave him a second chance at life.”
            </p>
            <div className="author-profile-box">
              <div className="author-monogram" style={{ backgroundColor: 'var(--leaf-sage)', color: 'var(--leaf-sage-text)' }}>KN</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Karthik Nambiar</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)' }}>Grateful Son • Bengaluru</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="content-section-wrap" style={{ paddingTop: 0 }}>
        <div className="editorial-section-head">
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#EF4E4E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Questions & Answers
          </span>
          <h2 className="editorial-section-title">Frequently Asked Questions</h2>
          <p className="editorial-section-subtitle">
            Everything you need to know about giving blood safely and comfortably.
          </p>
        </div>

        <div className="faq-wrap-stack">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="faq-single-item"
              onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
            >
              <div className="faq-question-title">
                <span>{item.q}</span>
                {openFaq === idx ? <ChevronUp size={20} color="#EF4E4E" /> : <ChevronDown size={20} color="#8A948C" />}
              </div>
              {openFaq === idx && (
                <div className="faq-body-text">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {showDonorModal && (
        <div className="editorial-modal-backdrop" onClick={() => setShowDonorModal(false)}>
          <div className="editorial-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="editorial-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Heart size={24} color="#EF4E4E" fill="#EF4E4E" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem' }}>Join as a Donor</h3>
              </div>
              <button onClick={() => setShowDonorModal(false)} className="modal-close-editorial">
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              Thank you for stepping forward! We will keep your personal contact confidential and only reach out when an emergency patient nearby needs your blood group.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowDonorModal(false);
              showToast('🎉 Thank you! Your donor profile is active and ready to save lives.');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="calc-field-group">
                <label className="calc-field-label">Full Name</label>
                <input required placeholder="e.g. Ramesh Kumar" className="calc-field-control" defaultValue="Ramesh Kumar" />
              </div>

              <div className="calc-inputs-row">
                <div className="calc-field-group">
                  <label className="calc-field-label">Your Blood Group</label>
                  <select className="calc-field-control" defaultValue="O+">
                    {Object.keys(BLOOD_GROUPS_INFO).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="calc-field-group">
                  <label className="calc-field-label">City / Area</label>
                  <input required placeholder="Bengaluru" className="calc-field-control" defaultValue="Bengaluru" />
                </div>
              </div>

              <div className="calc-inputs-row">
                <div className="calc-field-group">
                  <label className="calc-field-label">Age (18 - 65)</label>
                  <input required type="number" min="18" max="65" defaultValue="26" className="calc-field-control" />
                </div>
                <div className="calc-field-group">
                  <label className="calc-field-label">Weight (&gt;45 kg)</label>
                  <input required type="number" min="45" defaultValue="64" className="calc-field-control" />
                </div>
              </div>

              <div className="calc-field-group">
                <label className="calc-field-label">Mobile Number</label>
                <input required placeholder="+91 98765 43210" defaultValue="+91 98450 12345" className="calc-field-control" />
              </div>

              <button type="submit" className="btn-editorial-primary" style={{ marginTop: '10px' }}>
                Complete Registration
              </button>
            </form>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="editorial-modal-backdrop" onClick={() => setShowRequestModal(false)}>
          <div className="editorial-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="editorial-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={24} color="#EF4E4E" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem' }}>Request Urgent Blood</h3>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="modal-close-editorial">
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              Please provide the medical details below. Our 24/7 coordination team will immediately contact verified matching voluntary donors and partner hospital blood banks.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowRequestModal(false);
              showToast('🚨 Urgent Blood Request Received! Our coordination desk is matching available donors.');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="calc-field-group">
                <label className="calc-field-label">Patient Name / Hospital Ward</label>
                <input required placeholder="e.g. ICU Bed #4 - Emergency Trauma" className="calc-field-control" defaultValue="Trauma Ward #3" />
              </div>

              <div className="calc-inputs-row">
                <div className="calc-field-group">
                  <label className="calc-field-label">Required Blood Group</label>
                  <select className="calc-field-control" defaultValue="O-">
                    {Object.keys(BLOOD_GROUPS_INFO).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="calc-field-group">
                  <label className="calc-field-label">Units Needed</label>
                  <input required type="number" min="1" max="10" defaultValue="2" className="calc-field-control" />
                </div>
              </div>

              <div className="calc-field-group">
                <label className="calc-field-label">Hospital Name & City</label>
                <input required placeholder="e.g. City General Hospital, Bengaluru" defaultValue="City General Hospital, Bengaluru" className="calc-field-control" />
              </div>

              <div className="calc-field-group">
                <label className="calc-field-label">Contact Person Phone Number</label>
                <input required placeholder="+91 98765 43210" defaultValue="+91 98220 98765" className="calc-field-control" />
              </div>

              <button type="submit" className="btn-editorial-primary" style={{ marginTop: '10px' }}>
                Submit Emergency Request
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="editorial-footer-bar">
        <div className="footer-top-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/bloodlink_logo.png" alt="BloodLink logo" className="editorial-logo-img" style={{ width: '26px', height: '26px' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>BloodLink</span>
            </div>
            <p className="footer-brand-bio">
              BloodLink is a dedicated voluntary blood donor coordination network built to bridge the gap between compassionate donors and emergency patients in need. 100% voluntary, certified, and non-commercial.
            </p>
          </div>

          <div>
            <div className="footer-col-header">Quick Links</div>
            <ul className="footer-nav-list">
              <li><a href="#why-donate" className="footer-nav-anchor">Why Give Blood</a></li>
              <li><a href="#how-it-works" className="footer-nav-anchor">How It Works</a></li>
              <li><a href="#blood-types" className="footer-nav-anchor">Blood Compatibility</a></li>
              <li><Link to="/our-area" className="footer-nav-anchor">Our Area (Gujarat Map)</Link></li>
              <li><Link to="/blood-banks" className="footer-nav-anchor">Blood Banks Directory</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-header">Get Involved</div>
            <ul className="footer-nav-list">
              <li><a href="#" onClick={(e) => { e.preventDefault(); setShowDonorModal(true); }} className="footer-nav-anchor">Register as a Donor</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setShowRequestModal(true); }} className="footer-nav-anchor">Request Blood</a></li>
              <li><a href="#stories" className="footer-nav-anchor">Stories of Hope</a></li>
              <li><a href="#faq" className="footer-nav-anchor">Common Questions</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-header">Emergency 24/7</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              National Helpline:<br />
              <strong style={{ color: '#EF4E4E', fontSize: '1.1rem' }}>1800-419-HELP</strong><br />
              Email: care@bloodlink.org<br />
              Available round-the-clock across all major hospital networks.
            </div>
          </div>
        </div>

        <div className="footer-sub-bar">
          <div>© 2026 BloodLink. Non-Profit Voluntary Blood Network. All Rights Reserved.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>Medical Safety Certified</span>
            <span>Privacy Standards</span>
            <span>Voluntary Non-Remunerated Care</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
