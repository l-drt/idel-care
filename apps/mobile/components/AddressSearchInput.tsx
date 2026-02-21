import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input } from './Input';
import { searchAddress, type AddressSuggestion } from '@/services/addressSearch';
import { colors } from '@/theme';

const DEBOUNCE_MS = 350;

export interface AddressSearchInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onSelect: (suggestion: AddressSuggestion) => void;
  disabled?: boolean;
}

export function AddressSearchInput({
  label = 'Rechercher une adresse',
  placeholder = 'Tapez une adresse, ville ou code postal...',
  value,
  onSelect,
  disabled,
}: AddressSearchInputProps) {
  const [query, setQuery] = useState(value ?? '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const list = await searchAddress(q, 8);
      setSuggestions(list);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(text);
        debounceRef.current = null;
      }, DEBOUNCE_MS);
    },
    [fetchSuggestions]
  );

  const handleSelect = useCallback(
    (item: AddressSuggestion) => {
      Keyboard.dismiss();
      setQuery('');
      setSuggestions([]);
      onSelect(item);
    },
    [onSelect]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <View style={styles.wrapper}>
      <Input
        label={label}
        value={query}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        disabled={disabled}
      />
      {loading && query.length >= 2 && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text variant="bodySmall" style={styles.loadingText}>Recherche...</Text>
        </View>
      )}
      {suggestions.length > 0 && !loading && (
        <View style={styles.listWrap}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.item}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color={colors.textMuted} />
              <Text variant="bodyMedium" style={styles.itemLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', zIndex: 10 },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  loadingText: { color: colors.textMuted },
  listWrap: {
    marginTop: 4,
    maxHeight: 220,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemLabel: { flex: 1 },
});
