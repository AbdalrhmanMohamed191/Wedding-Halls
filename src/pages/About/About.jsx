// import React from "react";
// import { Link } from "react-router-dom";
// import "./About.css";

// const About = () => {
//   return (
//     <main className="about-page">
//       {/* HERO */}
//       <section className="about-hero">
//         <div className="about-hero-overlay" />

//         <div className="about-hero-content">
//           <span className="about-eyebrow">ABOUT WEDORA</span>

//           <h1>
//             Making your
//             <br />
//             <span>perfect day</span>
//             easier.
//           </h1>

//           <p>
//             Wedora helps couples discover beautiful wedding halls,
//             compare packages, check availability and book their perfect
//             venue with confidence.
//           </p>
//         </div>
//       </section>

//       {/* INTRO */}
//       <section className="about-intro">
//         <div className="about-intro-label">
//           <span>01</span>
//           <div />
//           <p>OUR STORY</p>
//         </div>

//         <div className="about-intro-content">
//           <div className="about-intro-heading">
//             <span className="section-label">A BETTER WAY TO PLAN</span>

//             <h2>
//               Your wedding deserves
//               <br />
//               <span>a simpler beginning.</span>
//             </h2>
//           </div>

//           <div className="about-intro-text">
//             <p>
//               Finding the right wedding hall should be exciting, not
//               stressful. Wedora was created to make the search easier
//               from the very first step.
//             </p>

//             <p>
//               Instead of visiting countless halls, making endless calls
//               and comparing information manually, couples can discover
//               venues, explore their details, compare packages and choose
//               a date — all in one place.
//             </p>

//             <p>
//               We believe technology should make important moments
//               simpler, clearer and more enjoyable.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* VALUES */}
//       <section className="about-values">
//         <div className="about-values-heading">
//           <span className="section-label">WHAT MATTERS TO US</span>

//           <h2>
//             Built around
//             <br />
//             <span>your experience.</span>
//           </h2>
//         </div>

//         <div className="values-grid">
//           <article className="value-card">
//             <span className="value-number">01</span>

//             <div className="value-icon">⌖</div>

//             <h3>Discover</h3>

//             <p>
//               Explore wedding halls in one place and find venues that
//               match your location, guest count and budget.
//             </p>
//           </article>

//           <article className="value-card">
//             <span className="value-number">02</span>

//             <div className="value-icon">◷</div>

//             <h3>Compare</h3>

//             <p>
//               See hall details, packages, prices and features clearly
//               before making your decision.
//             </p>
//           </article>

//           <article className="value-card">
//             <span className="value-number">03</span>

//             <div className="value-icon">✓</div>

//             <h3>Book</h3>

//             <p>
//               Choose your preferred package and date, then send your
//               booking request without unnecessary complications.
//             </p>
//           </article>
//         </div>
//       </section>

//       {/* FOR COUPLES / OWNERS */}
//       <section className="about-two-sides">
//         <div className="about-side about-side-dark">
//           <span className="section-label">FOR COUPLES</span>

//           <h2>
//             Everything you need
//             <br />
//             <span>to choose confidently.</span>
//           </h2>

//           <p>
//             From the first search to the final booking, Wedora gives
//             couples the information they need to make a decision they
//             feel good about.
//           </p>

//           <Link to="/halls" className="about-side-btn">
//             Explore Halls
//             <span>→</span>
//           </Link>
//         </div>

//         <div className="about-side about-side-light">
//           <span className="section-label">FOR HALL OWNERS</span>

//           <h2>
//             Bring your hall
//             <br />
//             <span>to more couples.</span>
//           </h2>

//           <p>
//             Wedora gives hall owners a dedicated platform to showcase
//             their venue, manage packages and handle booking requests
//             from one place.
//           </p>

//           <Link to="/register" className="about-side-btn">
//             List Your Hall
//             <span>→</span>
//           </Link>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="about-cta">
//         <div className="about-cta-content">
//           <span className="section-label">THE NEXT STEP</span>

//           <h2>
//             Let's find the place
//             <br />
//             <span>where your story begins.</span>
//           </h2>

//           <p>
//             Your perfect celebration starts with the right venue.
//           </p>

//           <Link to="/halls" className="about-cta-btn">
//             Find Your Hall
//             <span>→</span>
//           </Link>
//         </div>
//       </section>
//     </main>
//   );
// };

// export default About;



import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  return (
    <main className="wedora-about-page">

      {/* =========================
          HERO
      ========================= */}

      <section className="wedora-about-hero">
        <div className="wedora-about-hero-image" />

        <div className="wedora-about-hero-overlay" />

        <div className="wedora-about-hero-content">
          <span className="wedora-about-eyebrow">
            ABOUT WEDORA
          </span>

          <h1>
            Your perfect wedding
            <br />
            starts with the
            <br />
            <span>right place.</span>
          </h1>

          <p>
            Wedora is a dedicated platform that makes discovering,
            comparing and booking wedding halls simpler, clearer
            and more enjoyable.
          </p>
        </div>

        <div className="wedora-about-hero-bottom">
          <span>WEDDING HALLS PLATFORM</span>

          <div className="wedora-about-hero-line" />

          <span>EST. 2026</span>
        </div>
      </section>


      {/* =========================
          INTRO
      ========================= */}

      <section className="wedora-about-intro">
        <div className="wedora-about-intro-top">
          <span>01</span>

          <p>
            MORE THAN A HALL DIRECTORY
          </p>
        </div>

        <div className="wedora-about-intro-grid">

          <div className="wedora-about-intro-title">
            <span className="wedora-section-label">
              THE WEDORA IDEA
            </span>

            <h2>
              One platform.
              <br />
              <span>Every celebration.</span>
            </h2>
          </div>

          <div className="wedora-about-intro-text">
            <p className="wedora-about-lead">
              Choosing a wedding hall is one of the biggest
              decisions in planning your special day.
            </p>

            <p>
              Wedora was built to make that decision easier.
              Instead of searching through scattered pages,
              making endless calls and trying to compare
              different venues manually, couples can discover
              wedding halls and explore everything they need
              in one place.
            </p>

            <p>
              From hall details and capacity to packages,
              prices and availability, Wedora brings the
              information together so couples can focus on
              what really matters — choosing the place where
              their special moments will happen.
            </p>
          </div>

        </div>
      </section>


      {/* =========================
          EXPERIENCE
      ========================= */}

      <section className="wedora-experience">

        <div className="wedora-experience-header">
          <div>
            <span className="wedora-section-label">
              THE WEDORA EXPERIENCE
            </span>

            <h2>
              From the first search
              <br />
              <span>to the final booking.</span>
            </h2>
          </div>

          <p>
            Everything is designed around one simple idea:
            make finding the right wedding hall feel easy.
          </p>
        </div>


        <div className="wedora-experience-grid">

          <article className="wedora-experience-card">
            <span className="experience-number">01</span>

            <div className="experience-icon">
              ⌕
            </div>

            <h3>
              Discover
            </h3>

            <p>
              Explore wedding halls and discover venues
              that fit your celebration, location and
              guest requirements.
            </p>
          </article>


          <article className="wedora-experience-card">
            <span className="experience-number">02</span>

            <div className="experience-icon">
              ◫
            </div>

            <h3>
              Compare
            </h3>

            <p>
              See hall information, packages, prices,
              capacities and features clearly before
              making your decision.
            </p>
          </article>


          <article className="wedora-experience-card">
            <span className="experience-number">03</span>

            <div className="experience-icon">
              ◷
            </div>

            <h3>
              Choose
            </h3>

            <p>
              Select the package and date that match
              your celebration and move forward with
              confidence.
            </p>
          </article>


          <article className="wedora-experience-card">
            <span className="experience-number">04</span>

            <div className="experience-icon">
              ✓
            </div>

            <h3>
              Book
            </h3>

            <p>
              Send your booking request and keep track
              of your reservation through your Wedora
              account.
            </p>
          </article>

        </div>
      </section>


      {/* =========================
          COUPLES
      ========================= */}

      <section className="wedora-about-couples">

        <div className="wedora-about-couples-image">
          <img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85"
            alt="Wedding celebration"
          />

          <div className="wedora-image-caption">
            <span>YOUR CELEBRATION</span>

            <strong>
              Starts with
              <br />
              the right venue.
            </strong>
          </div>
        </div>


        <div className="wedora-about-couples-content">

          <span className="wedora-section-label">
            FOR COUPLES
          </span>

          <h2>
            Spend less time
            <br />
            searching.
            <br />
            <span>More time celebrating.</span>
          </h2>

          <p>
            Planning your wedding already comes with enough
            decisions. Finding the right venue shouldn't be
            another complicated task.
          </p>

          <p>
            Wedora gives you a simple way to discover halls,
            explore their details, compare packages and
            choose a date — all from one place.
          </p>

          <Link
            to="/halls"
            className="wedora-about-link"
          >
            Explore Wedding Halls
            <span>→</span>
          </Link>

        </div>
      </section>


      {/* =========================
          OWNERS
      ========================= */}

      <section className="wedora-about-owners">

        <div className="wedora-about-owners-content">

          <span className="wedora-section-label">
            FOR HALL OWNERS
          </span>

          <h2>
            Put your venue
            <br />
            where couples
            <br />
            are <span>looking.</span>
          </h2>

          <p>
            Wedora is not only built for couples.
            It gives wedding hall owners a dedicated
            digital presence where they can showcase
            their venue and manage their bookings.
          </p>

          <div className="wedora-owner-points">

            <div>
              <span>01</span>
              <p>Showcase your wedding hall</p>
            </div>

            <div>
              <span>02</span>
              <p>Manage packages and pricing</p>
            </div>

            <div>
              <span>03</span>
              <p>Manage booking requests</p>
            </div>

            <div>
              <span>04</span>
              <p>Keep your venue information organized</p>
            </div>

          </div>

          <Link
            to="/register"
            className="wedora-about-link"
          >
            Join Wedora
            <span>→</span>
          </Link>

        </div>


        <div className="wedora-about-owners-visual">

          <div className="owners-visual-main">
            <span>WEDORA</span>

            <strong>
              Your venue.
              <br />
              Your business.
              <br />
              More visibility.
            </strong>
          </div>

          <div className="owners-visual-card">
            <span>HALL OWNERS</span>

            <strong>
              Built to make
              <br />
              management easier.
            </strong>
          </div>

        </div>

      </section>


      {/* =========================
          VISION
      ========================= */}

      <section className="wedora-about-vision">

        <div className="wedora-about-vision-inner">

          <span className="wedora-section-label">
            OUR VISION
          </span>

          <h2>
            To become the place people
            <br />
            think of first when they
            <br />
            search for a
            <span> wedding hall.</span>
          </h2>

          <p>
            Wedora is being built with a long-term vision:
            to create a trusted platform where discovering
            and booking wedding venues becomes as simple
            as choosing the place that feels right.
          </p>

        </div>

      </section>


      {/* =========================
          FINAL CTA
      ========================= */}

      <section className="wedora-about-final">

        <div className="wedora-about-final-content">

          <span className="wedora-section-label">
            YOUR DAY STARTS HERE
          </span>

          <h2>
            The perfect venue
            <br />
            is waiting for
            <br />
            <span>your story.</span>
          </h2>

          <p>
            Discover beautiful wedding halls and take
            the first step toward your perfect celebration.
          </p>

          <Link
            to="/halls"
            className="wedora-final-btn"
          >
            Explore Wedding Halls
            <span>→</span>
          </Link>

        </div>

      </section>

    </main>
  );
};

export default About;
