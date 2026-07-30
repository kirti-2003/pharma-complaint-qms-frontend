function FormSection({ number, title, children }) {
  return (
    <section className="form-section">
      <div className="form-section__heading">
        <span className="form-section__number">{number}</span>
        <h2>{title}</h2>
      </div>

      <div className="form-section__content">{children}</div>
    </section>
  );
}

export default FormSection;