import { useTheme } from '../../context/themecontext';
import { getStatusColor } from '../../utils/statusColors';

interface BadgeProps {
  label: string;
  type?: 'status' | 'priority';
  className?: string;
}

export default function Badge({ label, type = 'status', className = '' }: BadgeProps) {
  const { isDark } = useTheme();

  const resolveColor = () => {
    if (type === 'priority') {
      switch (label) {
        case 'Critical':
        case 'CRITICAL':
          return '#DC2626'; // Critical / Error
        case 'High':
        case 'HIGH':
          return '#D97706'; // Blocked / Warning
        case 'Medium':
        case 'MEDIUM':
          return '#2563EB'; // In Progress
        case 'Low':
        case 'LOW':
        default:
          return '#64748B'; // To Do / Slate
      }
    }
    // Task status colors consistent across all dashboards
    return getStatusColor(label);
  };

  const color = resolveColor();

  return (
    <span 
      style={{
        color: color,
        backgroundColor: isDark ? `${color}26` : `${color}14`,
        borderColor: isDark ? `${color}50` : `${color}38`,
      }}
      className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-tight uppercase inline-flex items-center gap-1 border font-bold transition-colors ${className}`}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full shrink-0" 
        style={{ backgroundColor: color }} 
      />
      {label}
    </span>
  );
}