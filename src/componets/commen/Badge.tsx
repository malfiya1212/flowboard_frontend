interface BadgeProps {
  label: string;
  type?: 'status' | 'priority';
}

export default function Badge({ label, type = 'status' }: BadgeProps) {
  const getBadgeStyle = () => {
    if (type === 'priority') {
      switch (label) {
        case 'Critical':
          return 'bg-red-100 text-red-800 border border-red-200 font-bold';
        case 'High':
          return 'bg-orange-100 text-orange-800 border border-orange-200';
        case 'Medium':
          return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'Low':
        default:
          return 'bg-gray-100 text-gray-700 border border-gray-200';
      }
    } else {
      switch (label) {
        case 'Completed':
          return 'bg-green-100 text-green-800 border border-green-200';
        case 'Blocked':
          return 'bg-red-100 text-red-700 border border-red-200 font-bold';
        case 'In Progress':
          return 'bg-amber-100 text-amber-800 border border-amber-200';
        case 'Review Queue':
          return 'bg-purple-100 text-purple-800 border border-purple-200';
        case 'To Do':
        default:
          return 'bg-gray-100 text-gray-600 border border-gray-200';
      }
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono tracking-tight uppercase inline-flex items-center ${getBadgeStyle()}`}>
      {label}
    </span>
  );
}