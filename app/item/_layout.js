// app/item/_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';

export default function ItemLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: '動物詳細資訊',
          headerShown: false,
        }}
      />
    </Stack>
  );
}