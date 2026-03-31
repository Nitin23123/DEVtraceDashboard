const sizes = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-11 w-11' };

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2`}
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text)' }}
      />
    </div>
  );
}
