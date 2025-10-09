'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import Link, { type LinkProps } from 'next/link';
import type { UrlObject } from 'url';
import { useActionTelemetry } from '../hooks/useActionTelemetry';

type ActionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    eventName: string;
    eventData?: Record<string, unknown>;
  };

export function ActionLink({
  eventName,
  eventData,
  onClick,
  href,
  children,
  ...rest
}: ActionLinkProps) {
  const logEvent = useActionTelemetry();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    void logEvent(eventName, {
      ...eventData,
      href: extractHref(href),
    });
  };

  return (
    <Link href={href} {...rest} onClick={handleClick}>
      {children}
    </Link>
  );
}

function extractHref(href: string | UrlObject) {
  if (typeof href === 'string') {
    return href;
  }

  const query = href.query ? `?${new URLSearchParams(href.query as Record<string, string>).toString()}` : '';
  const rawHash = href.hash ?? '';
  const hash = rawHash ? (rawHash.startsWith('#') ? rawHash : `#${rawHash}`) : '';

  return `${href.pathname ?? ''}${query}${hash}`;
}
