import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { ArrowLeft, Globe2, LockKeyhole } from "lucide-react";
import PagePreview from "@/components/PagePreview";
import type { LocalProject } from "@/lib/projectStore";
import { findPublishedProject } from "@/lib/projectStore";

export default function PublishedPage() {
  const [, params] = useRoute("/p/:slug/:project");
  const slug = params?.slug ?? "";
  const projectId = params?.project ?? "";
  const [project, setProject] = useState<LocalProject>();

  useEffect(() => {
    setProject(findPublishedProject(decodeURIComponent(slug), decodeURIComponent(projectId)));
  }, [slug, projectId]);

  if (!project) {
    return (
      <main className="published-empty">
        <div className="published-empty__card"><span className="published-empty__icon"><LockKeyhole size={19} /></span><span className="panel-eyebrow">LOCAL PREVIEW</span><h1>This page isn’t available here.</h1><p>Pageforge’s preview links use this browser’s local workspace. Publish the draft again or open it from the same browser profile where it was created.</p><a className="button button--primary" href="#/"><ArrowLeft size={14} />Back to Pageforge</a></div>
      </main>
    );
  }

  return (
    <main className="published-shell">
      <div className="published-banner"><span><Globe2 size={14} /> Pageforge local preview <i>·</i> {project.blueprint.meta.title}</span><a href="#/">Edit in Pageforge <ArrowLeft size={13} /></a></div>
      <PagePreview blueprint={project.blueprint} />
      <div className="published-local-note">This generated path is stored in this browser only. Public internet hosting is not enabled.</div>
    </main>
  );
}
