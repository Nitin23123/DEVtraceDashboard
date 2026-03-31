const Card = ({ children, className = '', onClick }) => {
  const base = 'rounded-xl border p-6 transition-colors';
  const style = {
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
  };

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => e.key === 'Enter' && onClick(e)}
        className={`${base} cursor-pointer hover:border-white/20 ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`${base} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default Card;
