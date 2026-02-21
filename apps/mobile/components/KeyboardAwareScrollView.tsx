import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from 'react-native';

export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  /**
   * Offset (px) to apply when keyboard is visible (e.g. 20 if you have a header inside the same SafeArea).
   * Use the same value on all form screens for consistent behavior.
   */
  keyboardVerticalOffset?: number;
}

/**
 * ScrollView that avoids the keyboard so focused inputs stay visible.
 * Use this for every screen that contains form fields (login, inscription, patient-add, etc.).
 *
 * Rule: same behavior everywhere — always wrap form content in KeyboardAwareScrollView
 * so fields don’t stay hidden under the keyboard.
 */
export function KeyboardAwareScrollView({
  keyboardVerticalOffset = 0,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  style,
  ...scrollViewProps
}: KeyboardAwareScrollViewProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.wrapper, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        {...scrollViewProps}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});
