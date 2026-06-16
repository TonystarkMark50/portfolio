

const ContactSection = () => {
  return (
    <section className="contact-section">
      <h2>Contact Me</h2>
      <p>Get in touch with me.</p>
      <div className="contact-info">
        <p>Email: example@email.com</p>
        <p>Phone: +1234567890</p>
        <div className="social-links">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;