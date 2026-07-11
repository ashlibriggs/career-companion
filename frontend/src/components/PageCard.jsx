function PageCard({
  title,
  description,
  children,
  className = '',
}) {
  return (
    <section className={`page-card ${className}`}>
      <header className="page-card__header">
        <h2>{title}</h2>

        {description && (
          <p>{description}</p>
        )}
      </header>

      <div className="page-card__content">
        {children}
      </div>
    </section>
  )
}

export default PageCard