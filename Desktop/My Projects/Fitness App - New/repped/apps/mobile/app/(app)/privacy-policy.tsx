import { Text } from "react-native";
import { SubScreenLayout } from "../../src/components/account/SubScreenLayout";
import {
  LongReadTitle,
  LongReadHeading,
  LongReadParagraph,
  LongReadBullet,
} from "../../src/components/account/LongRead";

export default function PrivacyPolicy() {
  return (
    <SubScreenLayout title="Privacy Policy">
      <LongReadTitle updated="May 21, 2026">Privacy Policy</LongReadTitle>

      <LongReadParagraph>
        This policy explains what Revive collects about you, why we collect it, and how we keep it safe. Plain English — no fine print.
      </LongReadParagraph>

      <LongReadHeading>1. What we collect</LongReadHeading>
      <LongReadParagraph>To build your personalized training and nutrition plan, we store:</LongReadParagraph>
      <LongReadBullet><Text style={{ fontWeight: "700" }}>Profile basics:</Text> name, date of birth, sex, height, weight.</LongReadBullet>
      <LongReadBullet><Text style={{ fontWeight: "700" }}>Training inputs:</Text> goal, experience level, equipment, days per week, current injuries.</LongReadBullet>
      <LongReadBullet><Text style={{ fontWeight: "700" }}>Nutrition inputs:</Text> dietary preference, allergies, cuisine preferences.</LongReadBullet>
      <LongReadBullet><Text style={{ fontWeight: "700" }}>Activity logs:</Text> the workouts you finish, the sets and reps you log, the meals you save.</LongReadBullet>
      <LongReadBullet><Text style={{ fontWeight: "700" }}>Account info:</Text> your email address (for sign-in and account recovery).</LongReadBullet>

      <LongReadHeading>2. How we use it</LongReadHeading>
      <LongReadBullet>Generate your workout plan and macro targets.</LongReadBullet>
      <LongReadBullet>Adapt the plan as you log more sessions and update your settings.</LongReadBullet>
      <LongReadBullet>Show your progress over time (streaks, weekly summary, achievements).</LongReadBullet>
      <LongReadBullet>Send you optional reminders (workout, meal, weekly summary) — only if you opt in.</LongReadBullet>

      <LongReadHeading>3. What we don't do</LongReadHeading>
      <LongReadBullet>We don't sell your data to advertisers.</LongReadBullet>
      <LongReadBullet>We don't share your data with third parties for marketing.</LongReadBullet>
      <LongReadBullet>We don't run ad networks inside the app.</LongReadBullet>

      <LongReadHeading>4. Where it's stored</LongReadHeading>
      <LongReadParagraph>
        Your data lives on Supabase, our managed Postgres host. It's encrypted in transit (TLS) and at rest. Only your account can read your rows — enforced by Row Level Security policies on the database.
      </LongReadParagraph>

      <LongReadHeading>5. Your rights</LongReadHeading>
      <LongReadBullet>
        <Text style={{ fontWeight: "700" }}>Access:</Text> see what we hold by tapping into each Account sub-screen.
      </LongReadBullet>
      <LongReadBullet>
        <Text style={{ fontWeight: "700" }}>Correct:</Text> edit anything that's wrong — Profile, Goal, Training, Nutrition.
      </LongReadBullet>
      <LongReadBullet>
        <Text style={{ fontWeight: "700" }}>Delete:</Text> tap Delete Account at the bottom of Account, or email us to wipe your data permanently.
      </LongReadBullet>
      <LongReadBullet>
        <Text style={{ fontWeight: "700" }}>Export:</Text> email support@revive.app and we'll send you a JSON copy of everything we have.
      </LongReadBullet>

      <LongReadHeading>6. Age</LongReadHeading>
      <LongReadParagraph>
        Revive is for users aged 13 and older. Our PAR-Q+ screening during onboarding flags anyone outside that range. If you believe a child has signed up, email us and we'll remove their data.
      </LongReadParagraph>

      <LongReadHeading>7. Changes</LongReadHeading>
      <LongReadParagraph>
        If we change this policy materially, we'll surface the change in-app before it takes effect. Minor wording tweaks update silently with a new "last updated" date.
      </LongReadParagraph>

      <LongReadHeading>8. Contact</LongReadHeading>
      <LongReadParagraph>
        Questions, requests, or complaints — email support@revive.app. We aim to reply within two business days.
      </LongReadParagraph>

      <Text style={{ textAlign: "center", fontSize: 11, color: "#9A9A92", marginTop: 24, marginBottom: 16 }}>
        Draft — review before publishing.
      </Text>
    </SubScreenLayout>
  );
}
