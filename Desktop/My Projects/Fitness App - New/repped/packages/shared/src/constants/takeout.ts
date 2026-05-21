export interface TakeoutOption {
  restaurant: string;
  items: {
    name: string;
    customization: string;
    estimated_calories: number;
    estimated_protein_g: number;
    estimated_carbs_g: number;
    estimated_fat_g: number;
    meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  }[];
}

export const TAKEOUT_GUIDES: TakeoutOption[] = [
  {
    restaurant: "Chipotle",
    items: [
      { name: "Chicken Burrito Bowl", customization: "Brown rice, black beans, chicken, fajita veggies, salsa, lettuce — skip cheese and sour cream", estimated_calories: 540, estimated_protein_g: 42, estimated_carbs_g: 55, estimated_fat_g: 12, meal_type: "lunch" },
      { name: "Steak Bowl (High Protein)", customization: "No rice, double steak, black beans, fajita veggies, salsa, lettuce", estimated_calories: 420, estimated_protein_g: 50, estimated_carbs_g: 25, estimated_fat_g: 14, meal_type: "dinner" },
    ],
  },
  {
    restaurant: "Subway",
    items: [
      { name: "Turkey Breast Sub", customization: "6-inch on wheat, all veggies, mustard — skip mayo and cheese", estimated_calories: 350, estimated_protein_g: 25, estimated_carbs_g: 42, estimated_fat_g: 5, meal_type: "lunch" },
      { name: "Chicken Breast Sub", customization: "6-inch on wheat, all veggies, oil and vinegar", estimated_calories: 380, estimated_protein_g: 28, estimated_carbs_g: 42, estimated_fat_g: 8, meal_type: "lunch" },
    ],
  },
  {
    restaurant: "McDonald's",
    items: [
      { name: "Egg McMuffin", customization: "As-is, solid protein-to-calorie ratio", estimated_calories: 300, estimated_protein_g: 17, estimated_carbs_g: 30, estimated_fat_g: 12, meal_type: "breakfast" },
      { name: "Grilled Chicken Sandwich", customization: "No mayo, extra lettuce and tomato", estimated_calories: 380, estimated_protein_g: 32, estimated_carbs_g: 40, estimated_fat_g: 8, meal_type: "lunch" },
    ],
  },
  {
    restaurant: "Chick-fil-A",
    items: [
      { name: "Grilled Nuggets (12-count)", customization: "With side salad instead of fries", estimated_calories: 340, estimated_protein_g: 38, estimated_carbs_g: 12, estimated_fat_g: 8, meal_type: "lunch" },
      { name: "Grilled Chicken Sandwich", customization: "Whole wheat bun if available", estimated_calories: 390, estimated_protein_g: 33, estimated_carbs_g: 38, estimated_fat_g: 12, meal_type: "dinner" },
      { name: "Grilled Nuggets (8-count)", customization: "Perfect high-protein snack on the go", estimated_calories: 130, estimated_protein_g: 25, estimated_carbs_g: 2, estimated_fat_g: 3, meal_type: "snack" },
    ],
  },
  {
    restaurant: "Panda Express",
    items: [
      { name: "Plate: Grilled Teriyaki Chicken", customization: "With half steamed rice, half super greens", estimated_calories: 460, estimated_protein_g: 36, estimated_carbs_g: 50, estimated_fat_g: 10, meal_type: "lunch" },
      { name: "Bowl: String Bean Chicken Breast", customization: "With brown rice", estimated_calories: 420, estimated_protein_g: 28, estimated_carbs_g: 55, estimated_fat_g: 10, meal_type: "dinner" },
    ],
  },
  {
    restaurant: "Taco Bell",
    items: [
      { name: "Power Menu Bowl", customization: "Sub black beans for refried, skip sour cream", estimated_calories: 420, estimated_protein_g: 26, estimated_carbs_g: 48, estimated_fat_g: 14, meal_type: "lunch" },
    ],
  },
  {
    restaurant: "Starbucks",
    items: [
      { name: "Egg White & Roasted Red Pepper Egg Bites", customization: "Pair with black coffee", estimated_calories: 170, estimated_protein_g: 13, estimated_carbs_g: 11, estimated_fat_g: 8, meal_type: "breakfast" },
      { name: "Turkey & Havarti Protein Box", customization: "As-is", estimated_calories: 360, estimated_protein_g: 22, estimated_carbs_g: 32, estimated_fat_g: 16, meal_type: "snack" },
      { name: "Cheese & Fruit Protein Box", customization: "Good balance of protein and carbs", estimated_calories: 470, estimated_protein_g: 18, estimated_carbs_g: 44, estimated_fat_g: 24, meal_type: "snack" },
    ],
  },
  {
    restaurant: "Wendy's",
    items: [
      { name: "Grilled Chicken Sandwich", customization: "No mayo, ask for extra lettuce and tomato", estimated_calories: 370, estimated_protein_g: 35, estimated_carbs_g: 36, estimated_fat_g: 8, meal_type: "lunch" },
    ],
  },
  {
    restaurant: "Five Guys",
    items: [
      { name: "Bunless Burger (Little Hamburger)", customization: "Lettuce wrap, all veggies, mustard only", estimated_calories: 350, estimated_protein_g: 22, estimated_carbs_g: 8, estimated_fat_g: 24, meal_type: "dinner" },
    ],
  },
  {
    restaurant: "Panera Bread",
    items: [
      { name: "Mediterranean Grain Bowl with Chicken", customization: "As-is, high protein with complex carbs", estimated_calories: 550, estimated_protein_g: 35, estimated_carbs_g: 55, estimated_fat_g: 18, meal_type: "lunch" },
      { name: "Breakfast Power Sandwich", customization: "Egg, ham, and cheese on brioche", estimated_calories: 340, estimated_protein_g: 22, estimated_carbs_g: 30, estimated_fat_g: 14, meal_type: "breakfast" },
      { name: "Greek Yogurt with Mixed Berries", customization: "Ask for granola on the side to control carbs", estimated_calories: 250, estimated_protein_g: 15, estimated_carbs_g: 30, estimated_fat_g: 7, meal_type: "snack" },
    ],
  },
];
