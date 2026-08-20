import { getContext, setContext } from "svelte";

import {
  encodeDocsMediaSentinel,
  serverDocsMediaUrl,
  type DocsMediaUrlResolver,
} from "./docs-relative-media";

const DOCS_MEDIA_RESOLVER_CONTEXT = "cvstudio:docs-media-url-resolver";

export type DocsMediaResolveResult = string | Promise<string>;

export type DocsMediaResolver = (
  relativePath: string,
) => DocsMediaResolveResult;

/** Sync mapper used during Carta rehype (always emits the sentinel). */
export function docsMediaSentinelResolver(
  relativePath: string,
): string {
  return encodeDocsMediaSentinel(relativePath);
}

export function setDocsMediaResolver(resolver: DocsMediaResolver) {
  setContext(DOCS_MEDIA_RESOLVER_CONTEXT, resolver);
}

export function getDocsMediaResolver(): DocsMediaResolver {
  return (
    (getContext(DOCS_MEDIA_RESOLVER_CONTEXT) as DocsMediaResolver | undefined) ??
    serverDocsMediaUrl
  );
}

/** Default sync Carta plugin resolver: emit sentinel for post-render. */
export function defaultDocsMediaPluginResolver(): DocsMediaUrlResolver {
  return docsMediaSentinelResolver;
}
