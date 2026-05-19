interface AnalysisCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function AnalysisCard({ title, children, className = '' }: AnalysisCardProps) {
  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-brand-orange">{title}</h3>
      <div className="text-gray-200">{children}</div>
    </div>
  );
}