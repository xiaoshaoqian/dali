/**
 * App Entry Point
 * Redirects to the main tabs navigation
 */
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the tabs home screen
  return <Redirect href="/(tabs)" />;
}
