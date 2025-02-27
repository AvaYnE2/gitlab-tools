import type { GitLabProject } from "@/types/gitlab";
import Image from "next/image";

interface ProjectCardProps {
  project: GitLabProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = new Date(project.last_activity_at).toLocaleDateString();

  return (
    <a
      href={project.web_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        {project.avatar_url ? (
          <Image
            src={project.avatar_url}
            alt={`${project.name} avatar`}
            width={40}
            height={40}
            className="rounded-md"
          />
        ) : (
          <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary font-semibold">
            {project.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-medium text-foreground truncate">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>⭐</span>
              <span>{project.star_count}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mb-2">
            {project.namespace.name}
          </div>

          {project.description && (
            <p className="text-sm text-foreground/80 line-clamp-2 mb-2">
              {project.description}
            </p>
          )}

          <div className="flex justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
              {project.visibility}
            </span>
            <span className="text-muted-foreground">
              Last activity: {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
