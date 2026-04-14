export interface EducationalTip {
  id: number;
  title: string;
  body: string;
  category: "training" | "nutrition" | "recovery" | "mindset";
}

export const EDUCATIONAL_TIPS: EducationalTip[] = [
  { id: 1, title: "Progressive Overload", body: "Your muscles grow when you gradually increase the challenge. Add a tiny bit more weight, one more rep, or an extra set over time. Small progress compounds into big results.", category: "training" },
  { id: 2, title: "Protein Timing Doesn't Matter Much", body: "Total daily protein matters way more than when you eat it. Aim for 1.6-2.0g per kg of body weight spread across your meals. Don't stress about a post-workout shake.", category: "nutrition" },
  { id: 3, title: "Sleep Is Your Secret Weapon", body: "Muscle repair happens during deep sleep. Aim for 7-9 hours. Poor sleep increases cortisol, reduces testosterone, and kills your recovery. Prioritize it.", category: "recovery" },
  { id: 4, title: "Compound Lifts Are King", body: "Exercises like squats, deadlifts, bench press, and rows work multiple muscle groups at once. You get more bang for your buck compared to isolation exercises.", category: "training" },
  { id: 5, title: "Water and Muscle Growth", body: "Muscle is about 75% water. Even mild dehydration reduces strength and endurance. Drink at least 2-3 liters daily, more on training days.", category: "nutrition" },
  { id: 6, title: "Deload Weeks Aren't Weakness", body: "Planned lighter weeks let your joints and nervous system recover. You often come back stronger. Every 4th week, reduce weight and volume by 40%.", category: "recovery" },
  { id: 7, title: "Mind-Muscle Connection", body: "Focusing on the muscle you're training improves activation and growth. Don't just move weight — feel the muscle working through every rep.", category: "training" },
  { id: 8, title: "Calorie Deficit vs Surplus", body: "To lose fat, eat slightly less than you burn (300-500 cal deficit). To build muscle, eat slightly more (200-300 surplus). Small adjustments, big difference.", category: "nutrition" },
  { id: 9, title: "Rest Between Sets", body: "For strength (1-5 reps): rest 3-5 min. For hypertrophy (6-12 reps): rest 60-90 sec. For endurance (15+ reps): rest 30-60 sec. Rest matters.", category: "training" },
  { id: 10, title: "Consistency Beats Intensity", body: "3 solid workouts per week for a year beats 6 intense weeks followed by months off. Show up regularly, even when motivation is low.", category: "mindset" },
  { id: 11, title: "Track Your Workouts", body: "You can't improve what you don't measure. Log your weights, reps, and sets. Look for trends. This is why Livvia exists.", category: "training" },
  { id: 12, title: "Fiber Keeps You Full", body: "High-fiber foods (vegetables, beans, oats) keep you full longer on fewer calories. Great for fat loss. Aim for 25-35g of fiber daily.", category: "nutrition" },
  { id: 13, title: "Active Recovery Works", body: "On rest days, light movement (walking, stretching, yoga) increases blood flow and speeds recovery. Total rest isn't always best rest.", category: "recovery" },
  { id: 14, title: "Form Over Ego", body: "Lifting heavier with bad form leads to injuries and less muscle growth. Drop the weight, nail the form, then progress. Your joints will thank you.", category: "training" },
  { id: 15, title: "Don't Fear Carbs", body: "Carbs fuel your workouts and recovery. They're not the enemy. Choose complex carbs (rice, potatoes, oats) around training for best results.", category: "nutrition" },
  { id: 16, title: "Stress Kills Gains", body: "Chronic stress raises cortisol, which breaks down muscle and stores fat. Find ways to manage stress: meditation, walking, hobbies, sleep.", category: "recovery" },
  { id: 17, title: "Warming Up Prevents Injury", body: "5-10 minutes of warm-up increases blood flow to muscles and prepares joints. It's not optional — it's insurance against injury.", category: "training" },
  { id: 18, title: "Alcohol and Recovery", body: "Alcohol disrupts sleep quality, reduces protein synthesis by up to 37%, and dehydrates you. If you drink, keep it moderate and away from training days.", category: "recovery" },
  { id: 19, title: "Patience Is a Skill", body: "Visible results take 8-12 weeks. Strength gains come first, then muscle size, then visible changes. Trust the process and keep showing up.", category: "mindset" },
  { id: 20, title: "Creatine Is the Only Supplement That Matters", body: "5g of creatine monohydrate daily is the most researched and effective supplement for strength. Cheap, safe, and actually works. Almost nothing else does.", category: "nutrition" },
];
