import React from "react";
import { Link } from "react-router-dom";
import "./HowItWorks.css";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Explore Wedding Halls",
      text: "Browse wedding halls on Wedora and discover venues that match your style, location, guest capacity, and budget.",
    },
    {
      number: "02",
      title: "Choose Your Package",
      text: "Explore the packages available for each hall and compare what is included before making your decision.",
    },
    {
      number: "03",
      title: "Pick Your Date",
      text: "Choose your preferred wedding date and enter the number of guests so you can find an option that fits your celebration.",
    },
    {
      number: "04",
      title: "Send Your Booking",
      text: "Fill in your booking details and send your request directly through Wedora. It only takes a few moments.",
    },
    {
      number: "05",
      title: "Get Confirmation",
      text: "Once the hall confirms your booking, you can follow your reservation and view all its details from your account.",
    },
  ];

  const benefits = [
    {
      title: "Everything in one place",
      text: "No need to jump between different pages, social media accounts, or phone calls just to compare venues.",
    },
    {
      title: "Clear venue information",
      text: "See the important details about each hall, including capacity, location, packages, features, and pricing.",
    },
    {
      title: "Simple booking",
      text: "Choose your hall, select your package, pick your date, and send your booking request in a few simple steps.",
    },
    {
      title: "Stay in control",
      text: "Your bookings stay connected to your account so you can easily check their status and details whenever you need.",
    },
  ];

  return (
    <main className="how-page">
      {/* Hero */}
      <section className="how-hero">
        <div className="how-hero-overlay"></div>

        <div className="how-hero-content">
          <span className="how-eyebrow">HOW WEDORA WORKS</span>

          <h1>
            From searching
            <br />
            to celebrating.
          </h1>

          <p>
            Finding the right wedding hall should feel exciting, not
            overwhelming. Wedora makes the journey simple from the first
            search to your confirmed booking.
          </p>

          <Link to="/halls" className="how-hero-btn">
            Explore Wedding Halls
          </Link>
        </div>
      </section>

      {/* Intro */}
      <section className="how-intro">
        <div className="how-intro-label">
          <span>THE WEDORA JOURNEY</span>
        </div>

        <div className="how-intro-content">
          <h2>
            A simpler way to find
            <br />
            your perfect venue.
          </h2>

          <p>
            Wedora brings wedding halls, packages, availability, and booking
            into one simple experience. Instead of spending hours searching
            and comparing, you can discover your options and make your booking
            with confidence.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="how-steps-section">
        <div className="how-section-heading">
          <span className="how-eyebrow">THE PROCESS</span>

          <h2>
            Five simple steps.
            <br />
            One beautiful beginning.
          </h2>
        </div>

        <div className="how-steps">
          {steps.map((step) => (
            <article className="how-step" key={step.number}>
              <div className="how-step-number">{step.number}</div>

              <div className="how-step-line"></div>

              <div className="how-step-content">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="how-experience">
        <div className="how-experience-image">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85"
            alt="Elegant wedding celebration"
          />

          <div className="how-image-card">
            <span>WEDORA</span>
            <strong>Your day. Your place.</strong>
          </div>
        </div>

        <div className="how-experience-content">
          <span className="how-eyebrow">BUILT AROUND YOU</span>

          <h2>
            Less searching.
            <br />
            More celebrating.
          </h2>

          <p>
            Planning a wedding already comes with enough decisions. Wedora is
            designed to take one of the biggest ones — finding the right venue
            — and make it easier.
          </p>

          <p>
            From discovering beautiful halls to checking packages and sending
            your booking request, everything is designed to keep the process
            clear and straightforward.
          </p>

          <Link to="/halls" className="how-text-link">
            Start exploring
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="how-benefits">
        <div className="how-section-heading centered">
          <span className="how-eyebrow">WHY WEDORA</span>

          <h2>
            Designed to make
            <br />
            planning easier.
          </h2>
        </div>

        <div className="how-benefits-grid">
          {benefits.map((benefit, index) => (
            <article className="how-benefit" key={benefit.title}>
              <span>0{index + 1}</span>

              <h3>{benefit.title}</h3>

              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* For Hall Owners */}
      <section className="how-owners">
        <div className="how-owners-content">
          <span className="how-eyebrow">FOR HALL OWNERS</span>

          <h2>
            Your hall deserves
            <br />
            to be discovered.
          </h2>

          <p>
            Wedora isn't only built for couples. It's also a platform for
            wedding hall owners who want to showcase their venue, packages,
            pricing, and availability to people actively planning their
            celebrations.
          </p>

          <Link to="/register" className="how-owner-btn">
            Join Wedora
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="how-final">
        <span className="how-eyebrow">YOUR NEXT STEP</span>

        <h2>
          Ready to find
          <br />
          your perfect place?
        </h2>

        <p>
          Start exploring wedding halls and take the first step toward your
          perfect celebration.
        </p>

        <Link to="/halls" className="how-final-btn">
          Explore Wedding Halls
        </Link>
      </section>
    </main>
  );
};

export default HowItWorks;
