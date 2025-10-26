/**
 * Reusable page header component with title and optional subtitle
 * @param {Object} props - Component props
 * @param {string} props.title - Main title text
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {React.ReactNode} [props.rightSection] - Optional content for the right side of the header
 */
export default function PageHeader({ title, subtitle, rightSection }) {
  return (
    <div className="flex items-start justify-between mb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>
      {rightSection && rightSection}
    </div>
  );
}