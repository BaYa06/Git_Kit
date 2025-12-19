export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-8',
    lg: 'size-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizeClasses[size]} border-2 border-primary/30 border-t-primary rounded-full animate-spin`}></div>
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
}
