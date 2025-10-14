'use client';

/**
 * Cortex Command Button Component
 * Migrated from henryreed.ai/hosting/components/CortexCommandButton.tsx
 *
 * Features:
 * - Wraps CortexButton with command execution logic
 * - Automatic loading state management
 * - Success/error notifications
 * - Callback support for custom handling
 */

import React from 'react';
import { CortexButton, CortexButtonProps } from './CortexButton';

export interface CortexCommandButtonProps extends Omit<CortexButtonProps, 'onClick' | 'loading'> {
  /** Command to execute */
  command: string;
  /** Callback when command is executed */
  onExecute?: (command: string) => void | Promise<void>;
  /** Callback for success notification */
  onSuccess?: (message: string) => void;
  /** Callback for error notification */
  onError?: (message: string) => void;
  /** Loading state key for tracking */
  loadingKey?: string;
  /** Disable automatic success notification */
  disableSuccessNotification?: boolean;
  /** Custom success message */
  successMessage?: string;
}

export const CortexCommandButton: React.FC<CortexCommandButtonProps> = ({
  command,
  onExecute,
  onSuccess,
  onError,
  loadingKey = 'command_execution',
  disableSuccessNotification = false,
  successMessage,
  children,
  ...buttonProps
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      if (onExecute) {
        await onExecute(command);
      }

      if (!disableSuccessNotification && onSuccess) {
        const message = successMessage || `Command "${command}" executed successfully`;
        onSuccess(message);
      }
    } catch (error) {
      if (onError) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        onError(`Command "${command}" failed: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CortexButton
      {...buttonProps}
      loading={isLoading}
      disabled={isLoading || buttonProps.disabled}
      onClick={handleClick}
      ariaLabel={buttonProps.ariaLabel || `Execute command: ${command}`}
      tooltip={buttonProps.tooltip || `Execute: ${command}`}
    >
      {children}
    </CortexButton>
  );
};

export default CortexCommandButton;
