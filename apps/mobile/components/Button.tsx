import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { colors } from '@/theme';

type Variant = 'primary' | 'secondary' | 'text';

export interface ButtonProps extends Omit<PaperButtonProps, 'mode' | 'children'> {
  variant?: Variant;
  children: React.ReactNode;
}

const variantToMode: Record<Variant, PaperButtonProps['mode']> = {
  primary: 'contained',
  secondary: 'outlined',
  text: 'text',
};

export function Button({ variant = 'primary', style, children, ...rest }: ButtonProps) {
  const { roundness } = useTheme();
  const mode = variantToMode[variant];

  return (
    <PaperButton
      mode={mode}
      contentStyle={styles.content}
      labelStyle={variant === 'primary' ? styles.labelPrimary : undefined}
      style={[
        variant === 'primary' && styles.primary,
        variant === 'secondary' && [styles.secondary, { borderRadius: roundness }],
        variant === 'text' && styles.text,
        style,
      ]}
      {...rest}
    >
      {children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 6,
  },
  labelPrimary: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primary: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  secondary: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  text: {
    marginTop: 20,
  },
});
