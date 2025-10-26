import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Reusable breadcrumbs component
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of breadcrumb items with title and href
 */
export default function Breadcrumbs({ items }) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className={
                    isLast
                      ? "text-muted-foreground pointer-events-none"
                      : "text-primary hover:underline"
                  }
                >
                  <Link to={item.href}>{item.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator>→</BreadcrumbSeparator>}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
