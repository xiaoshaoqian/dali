/**
 * Onboarding Entry Screen
 * Redirects to questionnaire for new users
 */
import { Redirect } from 'expo-router';

export default function OnboardingIndex() {
  // Redirect to questionnaire
  return <Redirect href="/(onboarding)/questionnaire" />;
}
