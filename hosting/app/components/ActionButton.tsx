'use client';

import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from 'react';
import { useActionTelemetry } from '../hooks/useActionTelemetry';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  eventName: string;
  eventData?: Record<string, unknown>;
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ eventName, eventData, onClick, type = 'button', ...rest }, ref) => {
    const logEvent = useActionTelemetry();

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      void logEvent(eventName, { ...eventData, type });
    };

    return <button {...rest} ref={ref} type={type} onClick={handleClick} />;
  },
);

ActionButton.displayName = 'ActionButton';
