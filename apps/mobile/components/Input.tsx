import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

export interface InputProps extends Omit<TextInputProps, 'mode'> {
  /** @default outlined */
  mode?: 'outlined' | 'flat';
}

export function Input({ style, ...rest }: InputProps) {
  const { roundness } = useTheme();

  return (
    <TextInput
      mode="outlined"
      outlineStyle={[styles.outline, { borderRadius: roundness }]}
      contentStyle={styles.content}
      style={[styles.input, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  outline: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingVertical: 4,
  },
  input: {
    marginBottom: 16,
  },
});
