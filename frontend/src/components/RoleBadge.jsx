const styles = {
  Owner:  'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Admin:  'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Member: 'bg-green-500/15  text-green-300  border-green-500/30',
  Viewer: 'bg-gray-500/15   text-gray-400   border-gray-500/30',
};

export default function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        styles[role] ?? styles.Viewer
      }`}
    >
      {role}
    </span>
  );
}
