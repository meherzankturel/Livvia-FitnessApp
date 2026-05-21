import type { MealTemplate } from "./meals";

/**
 * Comprehensive Indian cuisine meal database for fitness-focused meal planning.
 *
 * All macros are based on healthy preparation methods:
 * - Minimal oil/ghee (1-2 tsp per serving instead of traditional 2-3 tbsp)
 * - Grilling/steaming preferred over deep frying
 * - Measured portions based on standard single-serving sizes
 * - Brown rice / multigrain options where applicable
 *
 * 50 meals total:
 *   - North Indian Breakfast: 6
 *   - South Indian Breakfast: 4
 *   - Indian Lunch: 8
 *   - Indian Dinner: 6
 *   - Indian Snacks: 6
 *   - West Indian Breakfast: 3
 *   - West Indian Lunch: 3
 *   - West Indian Dinner: 2
 *   - West Indian Snacks: 2
 *   - East Indian Breakfast: 3
 *   - East Indian Lunch: 3
 *   - East Indian Dinner: 2
 *   - East Indian Snacks: 2
 */

export const INDIAN_MEAL_TEMPLATES: MealTemplate[] = [
  // ═══════════════════════════════════════════════════════════════
  // NORTH INDIAN BREAKFAST (6 meals)
  // ═══════════════════════════════════════════════════════════════

  // 1. Moong Dal Cheela
  {
    name: "Moong Dal Cheela",
    description:
      "Crispy green gram crepes made from soaked and ground moong dal, spiced with cumin and green chili. High in plant protein and naturally gluten-free.",
    calories: 280,
    protein_g: 18,
    carbs_g: 32,
    fat_g: 8,
    servings: 3,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["moong_dal", "lentils", "cumin", "green_chili"],
    recipe: {
      ingredients: [
        { name: "Green moong dal (soaked 4 hrs)", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Green chili (chopped)", amount: "1", unit: "piece", category: "produce" },
        { name: "Ginger (grated)", amount: "1", unit: "tsp", category: "produce" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Fresh coriander (chopped)", amount: "2", unit: "tbsp", category: "produce" },
      ],
      steps: [
        "Drain soaked moong dal and grind to a smooth batter with minimal water.",
        "Mix in chopped onion, green chili, ginger, cumin, turmeric, coriander, and salt.",
        "Heat a non-stick tawa and brush with a few drops of oil.",
        "Pour a ladleful of batter and spread into a thin circle.",
        "Cook on medium heat for 2 minutes until the bottom is golden and crisp.",
        "Flip and cook for another minute. Serve hot with green chutney.",
      ],
      prep_time_min: 15,
      cook_time_min: 10,
    },
  },

  // 2. Masala Omelette with Multigrain Toast
  {
    name: "Masala Omelette with Multigrain Toast",
    description:
      "Fluffy Indian-style omelette loaded with onions, tomatoes, green chili, and fresh coriander, served with toasted multigrain bread.",
    calories: 380,
    protein_g: 24,
    carbs_g: 30,
    fat_g: 18,
    servings: 1,
    category: "breakfast",
    cuisine: "indian",
    tags: ["no_preference"],
    ingredient_tags: ["eggs", "wheat", "onion", "tomato"],
    recipe: {
      ingredients: [
        { name: "Eggs", amount: "3", unit: "large", category: "protein" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (finely chopped)", amount: "1", unit: "small", category: "produce" },
        { name: "Green chili (chopped)", amount: "1", unit: "piece", category: "produce" },
        { name: "Fresh coriander (chopped)", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Black pepper", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Multigrain bread", amount: "2", unit: "slices", category: "grains" },
      ],
      steps: [
        "Whisk eggs with salt, turmeric, red chili powder, and black pepper.",
        "Mix in chopped onion, tomato, green chili, and coriander.",
        "Heat oil in a non-stick pan over medium heat.",
        "Pour the egg mixture and tilt pan to spread evenly.",
        "Cook for 2-3 minutes until the bottom sets, then flip and cook 1 more minute.",
        "Toast the multigrain bread and serve alongside the omelette.",
      ],
      prep_time_min: 5,
      cook_time_min: 5,
    },
  },

  // 3. Besan Chilla with Mint Chutney
  {
    name: "Besan Chilla with Mint Chutney",
    description:
      "Savory gram flour pancakes packed with vegetables and spices. A high-protein vegetarian breakfast that's quick to make and naturally gluten-free.",
    calories: 300,
    protein_g: 16,
    carbs_g: 28,
    fat_g: 14,
    servings: 2,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["besan", "chickpea_flour", "onion", "mint"],
    recipe: {
      ingredients: [
        { name: "Besan (gram flour)", amount: "1", unit: "cup", category: "lentils" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (finely chopped)", amount: "1", unit: "small", category: "produce" },
        { name: "Green chili (chopped)", amount: "1", unit: "piece", category: "produce" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Ajwain (carom seeds)", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Water", amount: "3/4", unit: "cup", category: "pantry" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Fresh mint leaves", amount: "1/2", unit: "cup", category: "produce" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Coriander leaves", amount: "1/4", unit: "cup", category: "produce" },
      ],
      steps: [
        "Mix besan with water to form a smooth, pourable batter. Add salt, turmeric, cumin, and ajwain.",
        "Fold in chopped onion, tomato, green chili, and coriander.",
        "Heat a non-stick tawa and brush lightly with oil.",
        "Pour batter and spread into a thin round. Cook on medium heat for 2-3 minutes.",
        "Flip when edges start lifting and cook for another 1-2 minutes until golden.",
        "For chutney: blend mint, coriander, green chili, lemon juice, and salt with a splash of water.",
        "Serve chilla hot with the mint chutney on the side.",
      ],
      prep_time_min: 10,
      cook_time_min: 10,
    },
  },

  // 4. Poha with Peanuts
  {
    name: "Poha with Peanuts",
    description:
      "Light and fluffy flattened rice tempered with mustard seeds, curry leaves, and turmeric, boosted with extra peanuts and sprouted moong for protein.",
    calories: 360,
    protein_g: 16,
    carbs_g: 48,
    fat_g: 12,
    servings: 2,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["rice_flakes", "peanuts", "mustard_seeds", "curry_leaves"],
    recipe: {
      ingredients: [
        { name: "Thick poha (flattened rice)", amount: "1.5", unit: "cups", category: "grains" },
        { name: "Roasted peanuts", amount: "2", unit: "tbsp", category: "nuts" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Green chili (slit)", amount: "1", unit: "piece", category: "produce" },
        { name: "Mustard seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Curry leaves", amount: "8", unit: "leaves", category: "produce" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Sugar", amount: "1/2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Fresh coriander (chopped)", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Roasted peanuts (extra)", amount: "2", unit: "tbsp", category: "protein" },
        { name: "Sprouted moong", amount: "1/4", unit: "cup", category: "protein" },
      ],
      steps: [
        "Rinse poha gently in a strainer under running water. Let it sit for 5 minutes to soften.",
        "Heat oil in a pan. Add mustard seeds and let them splutter.",
        "Add curry leaves, green chili, and peanuts. Saute for 1 minute.",
        "Add chopped onion and cook until translucent.",
        "Add turmeric, salt, and sugar. Mix well.",
        "Add the softened poha and toss gently on low heat for 2-3 minutes.",
        "Squeeze lemon juice, garnish with coriander, and serve warm.",
      ],
      prep_time_min: 10,
      cook_time_min: 8,
    },
  },

  // 5. Dalia Khichdi (Broken Wheat Porridge)
  {
    name: "Dalia Khichdi",
    description:
      "Wholesome broken wheat cooked with moong dal and mild spices. A fiber-rich, easy-to-digest breakfast that keeps you full for hours.",
    calories: 310,
    protein_g: 14,
    carbs_g: 50,
    fat_g: 6,
    servings: 1,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["wheat", "moong_dal", "lentils", "ghee"],
    recipe: {
      ingredients: [
        { name: "Dalia (broken wheat)", amount: "1/4", unit: "cup", category: "grains" },
        { name: "Yellow moong dal", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Ghee", amount: "1", unit: "tsp", category: "dairy" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Mixed vegetables (carrot, beans, peas)", amount: "1/2", unit: "cup", category: "produce" },
        { name: "Green chili (slit)", amount: "1", unit: "piece", category: "produce" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Water", amount: "2.5", unit: "cups", category: "pantry" },
      ],
      steps: [
        "Dry roast dalia in a pan for 2 minutes until lightly fragrant. Set aside.",
        "In the same pan, heat ghee and add cumin seeds. Let them splutter.",
        "Add green chili and mixed vegetables. Saute for 2 minutes.",
        "Add washed moong dal, roasted dalia, turmeric, and salt.",
        "Pour in water, bring to a boil, then cover and simmer on low for 15-18 minutes.",
        "Stir occasionally. Cook until dalia is soft and porridge-like. Serve warm.",
      ],
      prep_time_min: 5,
      cook_time_min: 20,
    },
  },

  // 6. Paneer Bhurji with Roti
  {
    name: "Paneer Bhurji with Roti",
    description:
      "Scrambled cottage cheese cooked with onions, tomatoes, and aromatic spices. A high-protein vegetarian breakfast served with whole wheat roti.",
    calories: 420,
    protein_g: 24,
    carbs_g: 38,
    fat_g: 18,
    servings: 2,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["paneer", "dairy", "wheat", "onion", "tomato"],
    recipe: {
      ingredients: [
        { name: "Paneer (crumbled)", amount: "150", unit: "g", category: "dairy" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (finely chopped)", amount: "1", unit: "medium", category: "produce" },
        { name: "Green chili (chopped)", amount: "1", unit: "piece", category: "produce" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tsp", category: "produce" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Garam masala", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Fresh coriander (chopped)", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Whole wheat roti", amount: "2", unit: "pieces", category: "grains" },
      ],
      steps: [
        "Heat oil in a pan. Add ginger-garlic paste and saute until fragrant.",
        "Add chopped onion and cook until golden brown.",
        "Add tomato, turmeric, red chili powder, and salt. Cook until tomatoes are soft.",
        "Add crumbled paneer and mix well. Cook on medium heat for 3-4 minutes.",
        "Sprinkle garam masala and garnish with coriander.",
        "Serve hot with whole wheat roti.",
      ],
      prep_time_min: 10,
      cook_time_min: 12,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // SOUTH INDIAN BREAKFAST (4 meals)
  // ═══════════════════════════════════════════════════════════════

  // 7. Idli Sambar
  {
    name: "Idli Sambar",
    description:
      "Steamed fermented rice and lentil cakes served with a nutritious vegetable lentil stew. Light on the stomach, easy to digest, and naturally vegan.",
    calories: 290,
    protein_g: 10,
    carbs_g: 52,
    fat_g: 4,
    servings: 1,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["rice", "urad_dal", "lentils", "drumstick", "tamarind"],
    recipe: {
      ingredients: [
        { name: "Idli batter (store-bought or homemade)", amount: "2", unit: "cups", category: "grains" },
        { name: "Toor dal", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Sambar powder", amount: "1", unit: "tbsp", category: "spices" },
        { name: "Tamarind paste", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Drumstick (cut into pieces)", amount: "1", unit: "piece", category: "produce" },
        { name: "Carrot (diced)", amount: "1", unit: "small", category: "produce" },
        { name: "Onion (chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (chopped)", amount: "1", unit: "small", category: "produce" },
        { name: "Mustard seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Curry leaves", amount: "8", unit: "leaves", category: "produce" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Grease idli moulds and pour batter into each cavity. Steam for 10-12 minutes.",
        "Pressure cook toor dal with turmeric and water until soft (3 whistles).",
        "In a pan, heat oil. Add mustard seeds and curry leaves. Let them splutter.",
        "Add onion and saute until soft. Add tomato and cook until mushy.",
        "Add drumstick, carrot, sambar powder, tamarind paste, and salt with 2 cups water.",
        "Simmer for 10 minutes until vegetables are cooked. Add cooked dal and mix well.",
        "Simmer for 5 more minutes. Serve 4 idlis with a bowl of hot sambar.",
      ],
      prep_time_min: 10,
      cook_time_min: 25,
    },
  },

  // 8. Ragi Dosa with Coconut Chutney
  {
    name: "Ragi Dosa with Coconut Chutney",
    description:
      "Crispy dosa made from finger millet flour, rich in calcium and iron. Paneer-stuffed for extra protein, served with fresh coconut chutney for a fiber-packed breakfast.",
    calories: 320,
    protein_g: 16,
    carbs_g: 42,
    fat_g: 10,
    servings: 1,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["ragi", "millet", "coconut", "rice_flour"],
    recipe: {
      ingredients: [
        { name: "Ragi (finger millet) flour", amount: "3/4", unit: "cup", category: "grains" },
        { name: "Rice flour", amount: "1/4", unit: "cup", category: "grains" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Water", amount: "1", unit: "cup", category: "pantry" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Fresh coconut (grated)", amount: "1/2", unit: "cup", category: "produce" },
        { name: "Roasted chana dal", amount: "1", unit: "tbsp", category: "lentils" },
        { name: "Green chili", amount: "2", unit: "pieces", category: "produce" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Mustard seeds (for tempering)", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Curry leaves", amount: "6", unit: "leaves", category: "produce" },
        { name: "Paneer (grated, for stuffing)", amount: "50", unit: "g", category: "dairy" },
      ],
      steps: [
        "Mix ragi flour, rice flour, cumin, and salt. Add water gradually to make a thin batter.",
        "Let batter rest for 15 minutes.",
        "Heat a non-stick tawa. Pour a ladleful of batter and spread in a circular motion.",
        "Drizzle a few drops of oil around edges. Cook until crisp and golden (2-3 minutes).",
        "For chutney: blend coconut, chana dal, green chili, coriander, and salt with water.",
        "Temper the chutney with mustard seeds and curry leaves in a little oil.",
        "Spread grated paneer on the dosa before folding.",
        "Fold the dosa and serve with coconut chutney.",
      ],
      prep_time_min: 20,
      cook_time_min: 10,
    },
  },

  // 9. Upma with Vegetables
  {
    name: "Upma with Vegetables",
    description:
      "Savory semolina porridge cooked with mixed vegetables and tempered with mustard seeds and curry leaves. A quick, filling, and nutritious South Indian staple.",
    calories: 340,
    protein_g: 14,
    carbs_g: 44,
    fat_g: 12,
    servings: 1,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["semolina", "wheat", "mustard_seeds", "curry_leaves", "cashews"],
    recipe: {
      ingredients: [
        { name: "Rava (semolina)", amount: "1", unit: "cup", category: "grains" },
        { name: "Mixed vegetables (beans, carrot, peas)", amount: "1/2", unit: "cup", category: "produce" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Green chili (chopped)", amount: "1", unit: "piece", category: "produce" },
        { name: "Ginger (grated)", amount: "1", unit: "tsp", category: "produce" },
        { name: "Mustard seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Urad dal", amount: "1", unit: "tsp", category: "lentils" },
        { name: "Chana dal", amount: "1", unit: "tsp", category: "lentils" },
        { name: "Curry leaves", amount: "8", unit: "leaves", category: "produce" },
        { name: "Cashews", amount: "5", unit: "pieces", category: "nuts" },
        { name: "Oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Water", amount: "2", unit: "cups", category: "pantry" },
        { name: "Lemon juice", amount: "1", unit: "tsp", category: "produce" },
        { name: "Roasted cashews", amount: "10", unit: "pieces", category: "protein" },
        { name: "Roasted chana dal", amount: "1", unit: "tbsp", category: "protein" },
      ],
      steps: [
        "Dry roast semolina on medium heat for 3-4 minutes until fragrant. Set aside.",
        "Heat oil in a pan. Add mustard seeds, urad dal, chana dal, and cashews.",
        "When mustard seeds splutter, add curry leaves, green chili, and ginger.",
        "Add onion and saute until translucent. Add mixed vegetables and cook for 2 minutes.",
        "Add water and salt, bring to a boil.",
        "Gradually add roasted semolina while stirring continuously to avoid lumps.",
        "Cover and cook on low heat for 3-4 minutes. Add lemon juice and serve hot.",
      ],
      prep_time_min: 10,
      cook_time_min: 12,
    },
  },

  // 10. Pesarattu (Green Moong Dosa)
  {
    name: "Pesarattu",
    description:
      "Andhra-style crispy crepe made from whole green moong dal. One of the highest-protein dosas, naturally vegan and packed with nutrition.",
    calories: 260,
    protein_g: 16,
    carbs_g: 34,
    fat_g: 6,
    servings: 3,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["moong_dal", "lentils", "rice", "ginger", "green_chili"],
    recipe: {
      ingredients: [
        { name: "Whole green moong dal (soaked 6 hrs)", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Rice (soaked)", amount: "2", unit: "tbsp", category: "grains" },
        { name: "Ginger", amount: "1", unit: "inch piece", category: "produce" },
        { name: "Green chili", amount: "2", unit: "pieces", category: "produce" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Water", amount: "as needed", unit: "", category: "pantry" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Onion (finely chopped, for topping)", amount: "1/2", unit: "medium", category: "produce" },
      ],
      steps: [
        "Drain soaked moong dal and rice. Grind together with ginger, green chili, cumin, and salt.",
        "Add water gradually to make a smooth, pourable batter (thinner than idli batter).",
        "Heat a non-stick or cast-iron tawa on medium-high heat.",
        "Pour a ladleful of batter and spread quickly in a circular motion to make a thin crepe.",
        "Sprinkle chopped onion on top and press gently.",
        "Drizzle a few drops of oil around the edges.",
        "Cook until the bottom is golden and crisp (2-3 minutes). Fold and serve with ginger chutney.",
      ],
      prep_time_min: 15,
      cook_time_min: 10,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIAN LUNCH (8 meals)
  // ═══════════════════════════════════════════════════════════════

  // 11. Dal Tadka + Brown Rice + Cucumber Raita
  {
    name: "Dal Tadka + Brown Rice + Cucumber Raita",
    description:
      "Yellow lentils finished with a sizzling cumin-garlic tempering, served with fiber-rich brown rice and cooling cucumber raita. A balanced vegetarian meal.",
    calories: 480,
    protein_g: 20,
    carbs_g: 68,
    fat_g: 12,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["toor_dal", "lentils", "rice", "yogurt", "dairy", "garlic", "ghee", "cucumber"],
    recipe: {
      ingredients: [
        { name: "Toor dal", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Brown rice", amount: "1/3", unit: "cup (dry)", category: "grains" },
        { name: "Ghee", amount: "1", unit: "tsp", category: "dairy" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Garlic (sliced)", amount: "3", unit: "cloves", category: "produce" },
        { name: "Dry red chili", amount: "1", unit: "piece", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Tomato (chopped)", amount: "1", unit: "medium", category: "produce" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Yogurt (low-fat)", amount: "1/2", unit: "cup", category: "dairy" },
        { name: "Cucumber (grated)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Roasted cumin powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
      ],
      steps: [
        "Cook brown rice in 1.5 cups water until done (about 25-30 minutes). Set aside.",
        "Pressure cook toor dal with turmeric and water until soft (3 whistles).",
        "Mash the dal and add salt and red chili powder. Simmer for 5 minutes.",
        "For tadka: heat ghee, add cumin seeds, dry red chili, and sliced garlic. Fry until golden.",
        "Add chopped tomato and cook until soft. Pour this tempering over the dal.",
        "For raita: mix yogurt with grated cucumber, salt, and roasted cumin powder.",
        "Plate brown rice, serve dal tadka alongside, and raita on the side.",
      ],
      prep_time_min: 10,
      cook_time_min: 30,
    },
  },

  // 12. Rajma Chawal
  {
    name: "Rajma Chawal",
    description:
      "Hearty kidney bean curry slow-cooked in a tomato-onion gravy with warming spices, served over steamed rice. A Punjabi classic loaded with plant protein and fiber.",
    calories: 460,
    protein_g: 18,
    carbs_g: 72,
    fat_g: 10,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["kidney_beans", "rice", "onion", "tomato", "garlic", "ginger"],
    recipe: {
      ingredients: [
        { name: "Rajma (kidney beans, soaked overnight)", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Basmati rice", amount: "1/3", unit: "cup (dry)", category: "grains" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (pureed)", amount: "1", unit: "medium", category: "produce" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Coriander powder", amount: "1", unit: "tsp", category: "spices" },
        { name: "Garam masala", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
      ],
      steps: [
        "Pressure cook soaked rajma with salt and water until very soft (5-6 whistles).",
        "Cook basmati rice separately and set aside.",
        "Heat oil in a pan. Add cumin seeds and let them splutter.",
        "Add onion and cook until deep golden brown.",
        "Add ginger-garlic paste and saute for 1 minute.",
        "Add tomato puree, turmeric, red chili powder, and coriander powder. Cook until oil separates.",
        "Add cooked rajma with its liquid. Simmer for 15-20 minutes until gravy thickens.",
        "Add garam masala, garnish with coriander, and serve hot over steamed rice.",
      ],
      prep_time_min: 15,
      cook_time_min: 40,
    },
  },

  // 13. Chole + Multigrain Roti
  {
    name: "Chole + Multigrain Roti",
    description:
      "Spiced chickpea curry with a tangy, robust gravy served with fiber-rich multigrain roti. High in plant protein and dietary fiber.",
    calories: 440,
    protein_g: 18,
    carbs_g: 60,
    fat_g: 14,
    servings: 2,
    category: "lunch",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["chickpeas", "wheat", "onion", "tomato"],
    recipe: {
      ingredients: [
        { name: "Kabuli chana (chickpeas, soaked overnight)", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Multigrain roti", amount: "2", unit: "pieces", category: "grains" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (pureed)", amount: "1", unit: "medium", category: "produce" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Chole masala", amount: "1", unit: "tbsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Amchur (dry mango powder)", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Tea bag (for dark color)", amount: "1", unit: "bag", category: "pantry" },
        { name: "Oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Lemon wedge", amount: "1", unit: "piece", category: "produce" },
      ],
      steps: [
        "Pressure cook soaked chickpeas with a tea bag and salt until very soft (5-6 whistles). Discard tea bag.",
        "Heat oil in a pan. Add onion and cook until deep brown.",
        "Add ginger-garlic paste and saute for a minute.",
        "Add tomato puree, turmeric, red chili powder, and chole masala. Cook until oil separates.",
        "Add cooked chickpeas with some of the cooking liquid.",
        "Mash a few chickpeas with the back of a spoon for a thick gravy.",
        "Simmer for 15 minutes. Add amchur powder and adjust salt.",
        "Garnish with coriander and lemon. Serve with multigrain roti.",
      ],
      prep_time_min: 15,
      cook_time_min: 40,
    },
  },

  // 14. Chicken Curry + Brown Rice
  {
    name: "Chicken Curry + Brown Rice",
    description:
      "Tender chicken pieces in a spiced tomato-onion gravy, served with nutty brown rice. A high-protein, balanced non-vegetarian lunch.",
    calories: 520,
    protein_g: 38,
    carbs_g: 52,
    fat_g: 16,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["no_preference"],
    ingredient_tags: ["chicken", "rice", "onion", "tomato", "yogurt", "dairy"],
    recipe: {
      ingredients: [
        { name: "Chicken (bone-in, skinless)", amount: "250", unit: "g", category: "protein" },
        { name: "Brown rice", amount: "1/3", unit: "cup (dry)", category: "grains" },
        { name: "Onion (sliced)", amount: "2", unit: "medium", category: "produce" },
        { name: "Tomato (pureed)", amount: "1", unit: "medium", category: "produce" },
        { name: "Yogurt (low-fat)", amount: "2", unit: "tbsp", category: "dairy" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Coriander powder", amount: "1", unit: "tsp", category: "spices" },
        { name: "Garam masala", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Bay leaf", amount: "1", unit: "piece", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
      ],
      steps: [
        "Cook brown rice and set aside.",
        "Marinate chicken with yogurt, turmeric, red chili powder, and salt for 15 minutes.",
        "Heat oil in a heavy-bottomed pan. Add bay leaf and sliced onions.",
        "Cook onions until deep golden brown (8-10 minutes).",
        "Add ginger-garlic paste and saute for 2 minutes.",
        "Add tomato puree and coriander powder. Cook until oil separates.",
        "Add marinated chicken. Stir well, cover, and cook on medium-low for 20-25 minutes.",
        "Add garam masala, garnish with coriander, and serve with brown rice.",
      ],
      prep_time_min: 20,
      cook_time_min: 35,
    },
  },

  // 15. Fish Curry + Steamed Rice
  {
    name: "Fish Curry + Steamed Rice",
    description:
      "Light and tangy fish curry with a coconut-based gravy, served with steamed basmati rice. Rich in omega-3 fatty acids and lean protein.",
    calories: 450,
    protein_g: 32,
    carbs_g: 50,
    fat_g: 12,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["no_preference", "pescatarian"],
    ingredient_tags: ["fish", "coconut", "rice", "tamarind", "curry_leaves"],
    recipe: {
      ingredients: [
        { name: "Fish fillets (rohu/surmai)", amount: "200", unit: "g", category: "protein" },
        { name: "Basmati rice", amount: "1/3", unit: "cup (dry)", category: "grains" },
        { name: "Coconut milk (light)", amount: "1/2", unit: "cup", category: "pantry" },
        { name: "Onion (sliced)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (chopped)", amount: "1", unit: "medium", category: "produce" },
        { name: "Tamarind paste", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Coriander powder", amount: "1", unit: "tsp", category: "spices" },
        { name: "Mustard seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Curry leaves", amount: "10", unit: "leaves", category: "produce" },
        { name: "Coconut oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Cook basmati rice and set aside.",
        "Marinate fish pieces with turmeric, salt, and a pinch of red chili powder for 10 minutes.",
        "Heat coconut oil. Add mustard seeds and curry leaves. Let them splutter.",
        "Add sliced onion and cook until soft.",
        "Add tomato, red chili powder, coriander powder, and tamarind paste. Cook for 5 minutes.",
        "Add coconut milk and 1/2 cup water. Bring to a gentle simmer.",
        "Gently place fish pieces in the gravy. Cover and cook on low heat for 8-10 minutes.",
        "Serve the curry over steamed rice. Do not stir vigorously to keep fish pieces intact.",
      ],
      prep_time_min: 15,
      cook_time_min: 25,
    },
  },

  // 16. Palak Paneer + Roti
  {
    name: "Palak Paneer + Roti",
    description:
      "Cottage cheese cubes in a vibrant, creamy spinach gravy. High in protein, iron, and calcium. A beloved North Indian classic made healthier with minimal cream.",
    calories: 440,
    protein_g: 24,
    carbs_g: 38,
    fat_g: 20,
    servings: 2,
    category: "lunch",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["paneer", "dairy", "spinach", "wheat", "cream"],
    recipe: {
      ingredients: [
        { name: "Paneer (cubed)", amount: "150", unit: "g", category: "dairy" },
        { name: "Spinach (fresh)", amount: "3", unit: "cups (packed)", category: "produce" },
        { name: "Onion (chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (chopped)", amount: "1", unit: "small", category: "produce" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tsp", category: "produce" },
        { name: "Green chili", amount: "1", unit: "piece", category: "produce" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Garam masala", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Cream (optional)", amount: "1", unit: "tbsp", category: "dairy" },
        { name: "Whole wheat roti", amount: "2", unit: "pieces", category: "grains" },
      ],
      steps: [
        "Blanch spinach in boiling water for 2 minutes. Transfer to ice water immediately.",
        "Blend blanched spinach with green chili into a smooth puree.",
        "Heat oil in a pan. Add cumin seeds and let them splutter.",
        "Add onion and cook until soft. Add ginger-garlic paste and saute for 1 minute.",
        "Add chopped tomato and cook until mushy.",
        "Add spinach puree, salt, and garam masala. Simmer for 5 minutes.",
        "Add paneer cubes and cook for 3-4 minutes on low heat.",
        "Finish with a drizzle of cream if using. Serve with whole wheat roti.",
      ],
      prep_time_min: 15,
      cook_time_min: 20,
    },
  },

  // 17. Mixed Sabzi + Dal + Roti
  {
    name: "Mixed Sabzi + Dal + Roti",
    description:
      "A wholesome thali-style meal with seasonal mixed vegetables, comforting yellow dal, and whole wheat roti. Balanced, nourishing, and naturally vegan.",
    calories: 420,
    protein_g: 16,
    carbs_g: 60,
    fat_g: 12,
    servings: 2,
    category: "lunch",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["lentils", "wheat", "mixed_vegetables", "onion", "tomato"],
    recipe: {
      ingredients: [
        { name: "Moong dal", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Mixed vegetables (potato, cauliflower, beans, peas)", amount: "1.5", unit: "cups", category: "produce" },
        { name: "Whole wheat roti", amount: "2", unit: "pieces", category: "grains" },
        { name: "Onion (chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (chopped)", amount: "1", unit: "medium", category: "produce" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tsp", category: "produce" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Coriander powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Garam masala", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Pressure cook moong dal with turmeric and water until soft. Mash and set aside.",
        "Heat 1 tsp oil in a pan. Add cumin seeds, then onion. Cook until soft.",
        "Add ginger-garlic paste and tomato. Cook until tomato breaks down.",
        "Add mixed vegetables, red chili powder, coriander powder, and salt. Add 1/4 cup water.",
        "Cover and cook vegetables on medium heat for 10-12 minutes until tender.",
        "For dal tadka: heat 1 tsp oil, add cumin and garlic, pour over cooked dal.",
        "Finish sabzi with garam masala. Serve everything with warm roti.",
      ],
      prep_time_min: 15,
      cook_time_min: 25,
    },
  },

  // 18. Egg Curry + Jeera Rice
  {
    name: "Egg Curry + Jeera Rice",
    description:
      "Boiled eggs simmered in a rich, spiced onion-tomato gravy, paired with fragrant cumin-tempered basmati rice. An affordable, high-protein meal.",
    calories: 480,
    protein_g: 22,
    carbs_g: 54,
    fat_g: 18,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["no_preference"],
    ingredient_tags: ["eggs", "rice", "onion", "tomato", "cumin"],
    recipe: {
      ingredients: [
        { name: "Eggs", amount: "3", unit: "large", category: "protein" },
        { name: "Basmati rice", amount: "1/3", unit: "cup (dry)", category: "grains" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (pureed)", amount: "1", unit: "medium", category: "produce" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Cumin seeds", amount: "1", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Coriander powder", amount: "1", unit: "tsp", category: "spices" },
        { name: "Garam masala", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Oil or ghee", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Bay leaf", amount: "1", unit: "piece", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
      ],
      steps: [
        "Boil eggs for 10 minutes. Peel and make 2-3 slits on each egg.",
        "For jeera rice: heat 1 tsp ghee, add 1/2 tsp cumin seeds and bay leaf. Add rice and water (1:1.5). Cook until done.",
        "Heat remaining oil. Add 1/2 tsp cumin seeds, then onion. Cook until deep brown.",
        "Add ginger-garlic paste and cook for a minute.",
        "Add tomato puree, turmeric, red chili, and coriander powder. Cook until oil separates.",
        "Add 1 cup water and bring to a simmer. Add boiled eggs and simmer for 10 minutes.",
        "Finish with garam masala and coriander. Serve curry over jeera rice.",
      ],
      prep_time_min: 15,
      cook_time_min: 25,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIAN DINNER (6 meals)
  // ═══════════════════════════════════════════════════════════════

  // 19. Grilled Tandoori Chicken + Salad
  {
    name: "Grilled Tandoori Chicken + Salad",
    description:
      "Yogurt-marinated chicken grilled with tandoori spices until charred and juicy. Served with a fresh cucumber-onion salad. High protein, low carb.",
    calories: 350,
    protein_g: 42,
    carbs_g: 10,
    fat_g: 14,
    servings: 2,
    category: "dinner",
    cuisine: "indian",
    tags: ["no_preference"],
    ingredient_tags: ["chicken", "yogurt", "dairy", "cucumber", "onion"],
    recipe: {
      ingredients: [
        { name: "Chicken leg/thigh (skinless)", amount: "250", unit: "g", category: "protein" },
        { name: "Yogurt (thick)", amount: "3", unit: "tbsp", category: "dairy" },
        { name: "Tandoori masala", amount: "1", unit: "tbsp", category: "spices" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Cucumber (sliced)", amount: "1", unit: "medium", category: "produce" },
        { name: "Onion (sliced into rings)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (sliced)", amount: "1", unit: "small", category: "produce" },
        { name: "Chaat masala", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Lemon wedge", amount: "1", unit: "piece", category: "produce" },
      ],
      steps: [
        "Make deep cuts in the chicken. Marinate with yogurt, tandoori masala, ginger-garlic paste, lemon juice, red chili powder, oil, and salt.",
        "Refrigerate for at least 2 hours (overnight is best).",
        "Preheat oven to 220C/425F or prepare a grill.",
        "Place chicken on a wire rack over a baking tray. Cook for 25-30 minutes, flipping once.",
        "Baste with any remaining marinade halfway through.",
        "For salad: arrange cucumber, onion rings, and tomato slices. Sprinkle chaat masala and squeeze lemon.",
        "Serve chicken hot with the salad on the side.",
      ],
      prep_time_min: 15,
      cook_time_min: 30,
    },
  },

  // 20. Dal Palak + Multigrain Roti
  {
    name: "Dal Palak + Multigrain Roti",
    description:
      "Protein-rich red lentils cooked with fresh spinach and aromatic spices. Served with multigrain roti for a fiber-packed, iron-rich vegan dinner.",
    calories: 380,
    protein_g: 20,
    carbs_g: 52,
    fat_g: 10,
    servings: 1,
    category: "dinner",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["masoor_dal", "lentils", "spinach", "wheat", "garlic"],
    recipe: {
      ingredients: [
        { name: "Masoor dal (red lentils)", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Spinach (chopped)", amount: "2", unit: "cups (packed)", category: "produce" },
        { name: "Multigrain roti", amount: "2", unit: "pieces", category: "grains" },
        { name: "Onion (chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (chopped)", amount: "1", unit: "small", category: "produce" },
        { name: "Garlic (minced)", amount: "4", unit: "cloves", category: "produce" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Lemon juice", amount: "1", unit: "tsp", category: "produce" },
      ],
      steps: [
        "Wash masoor dal and pressure cook with turmeric and 2 cups water (3 whistles).",
        "Add chopped spinach to the cooked dal and simmer for 5 minutes until spinach wilts.",
        "Heat oil in a small pan. Add cumin seeds and garlic. Fry until garlic is golden.",
        "Add onion and cook until soft. Add tomato and red chili powder. Cook until mushy.",
        "Pour this tempering into the dal-spinach mixture. Mix well and simmer for 5 minutes.",
        "Add salt and lemon juice. Serve hot with multigrain roti.",
      ],
      prep_time_min: 10,
      cook_time_min: 20,
    },
  },

  // 21. Paneer Tikka + Green Salad
  {
    name: "Paneer Tikka + Green Salad",
    description:
      "Marinated cottage cheese and bell peppers chargrilled to perfection with aromatic spices. Paired with a fresh green salad for a high-protein, low-carb dinner.",
    calories: 360,
    protein_g: 26,
    carbs_g: 14,
    fat_g: 22,
    servings: 1,
    category: "dinner",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["paneer", "dairy", "yogurt", "bell_pepper", "onion"],
    recipe: {
      ingredients: [
        { name: "Paneer (cubed)", amount: "200", unit: "g", category: "dairy" },
        { name: "Yogurt (thick)", amount: "3", unit: "tbsp", category: "dairy" },
        { name: "Bell pepper (cubed)", amount: "1", unit: "medium", category: "produce" },
        { name: "Onion (cubed)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tandoori masala", amount: "1", unit: "tbsp", category: "spices" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tsp", category: "produce" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Lettuce leaves", amount: "4", unit: "leaves", category: "produce" },
        { name: "Cucumber (sliced)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Cherry tomatoes", amount: "6", unit: "pieces", category: "produce" },
        { name: "Chaat masala", amount: "1/4", unit: "tsp", category: "spices" },
      ],
      steps: [
        "Mix yogurt, tandoori masala, ginger-garlic paste, lemon juice, oil, and salt.",
        "Add paneer cubes, bell pepper, and onion to the marinade. Coat well. Rest for 30 minutes.",
        "Thread onto skewers or arrange on a baking tray lined with foil.",
        "Grill at 220C/425F for 15-18 minutes, turning once, until charred spots appear.",
        "Alternatively, cook on a hot tawa with a few drops of oil, turning frequently.",
        "Prepare salad with lettuce, cucumber, and cherry tomatoes. Season with chaat masala and lemon.",
        "Serve tikka hot over the green salad.",
      ],
      prep_time_min: 15,
      cook_time_min: 18,
    },
  },

  // 22. Moong Dal Khichdi + Papad
  {
    name: "Moong Dal Khichdi + Papad",
    description:
      "The ultimate comfort food -- soft, one-pot rice and lentil porridge tempered with cumin and ghee. Light on the stomach, easy to digest, served with a crispy roasted papad.",
    calories: 340,
    protein_g: 14,
    carbs_g: 54,
    fat_g: 8,
    servings: 1,
    category: "dinner",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["rice", "moong_dal", "lentils", "ghee", "cumin"],
    recipe: {
      ingredients: [
        { name: "Basmati rice", amount: "1/3", unit: "cup", category: "grains" },
        { name: "Yellow moong dal", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Ghee (or oil for vegan)", amount: "1", unit: "tsp", category: "dairy" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Ginger (grated)", amount: "1", unit: "tsp", category: "produce" },
        { name: "Green chili (slit)", amount: "1", unit: "piece", category: "produce" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Water", amount: "3", unit: "cups", category: "pantry" },
        { name: "Papad", amount: "1", unit: "piece", category: "pantry" },
        { name: "Lemon wedge", amount: "1", unit: "piece", category: "produce" },
      ],
      steps: [
        "Wash rice and dal together until water runs clear.",
        "Heat ghee in a pressure cooker. Add cumin seeds and let them splutter.",
        "Add ginger and green chili. Saute for 30 seconds.",
        "Add rice, dal, turmeric, salt, and water. Mix well.",
        "Pressure cook for 3-4 whistles on medium heat.",
        "Let pressure release naturally. Open and stir gently -- it should be porridge-like.",
        "Roast or microwave the papad until crispy.",
        "Serve khichdi hot with a lemon wedge and papad on the side.",
      ],
      prep_time_min: 5,
      cook_time_min: 15,
    },
  },

  // 23. Chicken Tikka + Raita
  {
    name: "Chicken Tikka + Raita",
    description:
      "Boneless chicken chunks marinated in yogurt and spices, then grilled until smoky and charred. Served with cooling cumin raita. High protein, low carb.",
    calories: 340,
    protein_g: 40,
    carbs_g: 8,
    fat_g: 16,
    servings: 2,
    category: "dinner",
    cuisine: "indian",
    tags: ["no_preference"],
    ingredient_tags: ["chicken", "yogurt", "dairy", "spices"],
    recipe: {
      ingredients: [
        { name: "Chicken breast (boneless, cubed)", amount: "250", unit: "g", category: "protein" },
        { name: "Yogurt (thick)", amount: "3", unit: "tbsp", category: "dairy" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Tikka masala", amount: "1", unit: "tbsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Yogurt (for raita)", amount: "1/2", unit: "cup", category: "dairy" },
        { name: "Onion (finely chopped, for raita)", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Roasted cumin powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Chaat masala", amount: "1/4", unit: "tsp", category: "spices" },
      ],
      steps: [
        "Mix yogurt, ginger-garlic paste, tikka masala, red chili powder, lemon juice, oil, and salt.",
        "Add chicken cubes and coat well. Marinate for at least 1 hour (overnight is best).",
        "Preheat oven to 220C/425F. Thread chicken onto skewers or place on a wire rack.",
        "Grill for 18-20 minutes, turning once halfway through, until charred and cooked through.",
        "For raita: whisk yogurt with chopped onion, roasted cumin powder, salt, and chaat masala.",
        "Serve chicken tikka hot with raita and lemon wedges on the side.",
      ],
      prep_time_min: 15,
      cook_time_min: 20,
    },
  },

  // 24. Baingan Bharta + Roti
  {
    name: "Baingan Bharta + Roti",
    description:
      "Smoky roasted eggplant mashed and cooked with onions, tomatoes, and green peas. A flavorful dish served with whole wheat roti.",
    calories: 460,
    protein_g: 24,
    carbs_g: 46,
    fat_g: 20,
    servings: 2,
    category: "dinner",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["eggplant", "onion", "tomato", "wheat", "peas"],
    recipe: {
      ingredients: [
        { name: "Eggplant (large)", amount: "1", unit: "large", category: "produce" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (finely chopped)", amount: "1", unit: "medium", category: "produce" },
        { name: "Green peas", amount: "1/4", unit: "cup", category: "produce" },
        { name: "Green chili (chopped)", amount: "2", unit: "pieces", category: "produce" },
        { name: "Ginger (grated)", amount: "1", unit: "tsp", category: "produce" },
        { name: "Garlic (minced)", amount: "3", unit: "cloves", category: "produce" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Coriander powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Whole wheat roti", amount: "2", unit: "pieces", category: "grains" },
        { name: "Paneer (crumbled)", amount: "100", unit: "g", category: "dairy" },
      ],
      steps: [
        "Roast the whole eggplant directly over a gas flame, turning frequently, until the skin is charred and the flesh is completely soft (10-12 minutes).",
        "Let it cool slightly, then peel off the charred skin. Mash the flesh roughly -- keep it chunky.",
        "Heat oil in a pan. Add cumin seeds and let them splutter.",
        "Add onion and cook until golden. Add ginger, garlic, and green chili.",
        "Add tomato, turmeric, red chili powder, and coriander powder. Cook until oil separates.",
        "Add green peas and cook for 2 minutes. Add the mashed eggplant.",
        "Mix well and cook on medium heat for 5-7 minutes, stirring occasionally.",
        "Crumble paneer and mix into the bharta for protein.",
        "Garnish with fresh coriander. Serve hot with whole wheat roti.",
      ],
      prep_time_min: 10,
      cook_time_min: 25,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIAN SNACKS (6 meals)
  // ═══════════════════════════════════════════════════════════════

  // 25. Roasted Makhana (Fox Nuts)
  {
    name: "Roasted Makhana",
    description:
      "Crunchy fox nuts dry-roasted with a touch of ghee and seasoned with black pepper and rock salt. An incredibly light, low-calorie snack packed with minerals.",
    calories: 120,
    protein_g: 4,
    carbs_g: 18,
    fat_g: 4,
    servings: 1,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["makhana", "fox_nuts", "ghee"],
    recipe: {
      ingredients: [
        { name: "Makhana (fox nuts)", amount: "2", unit: "cups", category: "grains" },
        { name: "Ghee", amount: "1", unit: "tsp", category: "dairy" },
        { name: "Black pepper (crushed)", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Rock salt (sendha namak)", amount: "1/4", unit: "tsp", category: "pantry" },
        { name: "Turmeric powder", amount: "1/8", unit: "tsp", category: "spices" },
      ],
      steps: [
        "Heat a wide pan on medium-low heat. Add ghee.",
        "Add makhana and roast on low heat, stirring continuously, for 6-8 minutes.",
        "They should turn crunchy and slightly golden -- do not brown them.",
        "Remove from heat. Immediately sprinkle black pepper, rock salt, and turmeric.",
        "Toss well and let cool completely. They crisp up further as they cool.",
        "Store in an airtight container. Enjoy within 2-3 days for best crunch.",
      ],
      prep_time_min: 2,
      cook_time_min: 8,
    },
  },

  // 26. Sprouts Chaat
  {
    name: "Sprouts Chaat",
    description:
      "A tangy, crunchy mixed sprouts salad tossed with onion, tomato, cucumber, and chaat masala. A protein-rich, no-cook snack that's refreshing and filling.",
    calories: 180,
    protein_g: 12,
    carbs_g: 28,
    fat_g: 2,
    servings: 1,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["sprouts", "moong", "onion", "tomato", "lemon"],
    recipe: {
      ingredients: [
        { name: "Mixed sprouts (moong, chana, moth)", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato (finely chopped)", amount: "1", unit: "small", category: "produce" },
        { name: "Cucumber (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Green chili (finely chopped)", amount: "1", unit: "piece", category: "produce" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Chaat masala", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
      ],
      steps: [
        "If using raw sprouts, steam them for 5-6 minutes until just tender but still crunchy. Let cool.",
        "In a bowl, combine sprouts, onion, tomato, cucumber, and green chili.",
        "Add lemon juice, chaat masala, and salt. Toss well.",
        "Garnish with fresh coriander.",
        "Serve immediately for the best texture.",
      ],
      prep_time_min: 10,
      cook_time_min: 6,
    },
  },

  // 27. Masala Chaas (Spiced Buttermilk)
  {
    name: "Masala Chaas",
    description:
      "Refreshing spiced buttermilk made by churning yogurt with water, roasted cumin, and fresh herbs. A probiotic-rich, cooling drink that aids digestion.",
    calories: 75,
    protein_g: 6,
    carbs_g: 8,
    fat_g: 2,
    servings: 2,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["yogurt", "dairy", "cumin", "mint"],
    recipe: {
      ingredients: [
        { name: "Yogurt (low-fat)", amount: "3/4", unit: "cup", category: "dairy" },
        { name: "Cold water", amount: "1", unit: "cup", category: "pantry" },
        { name: "Roasted cumin powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Black salt (kala namak)", amount: "1/4", unit: "tsp", category: "pantry" },
        { name: "Fresh mint leaves", amount: "6", unit: "leaves", category: "produce" },
        { name: "Fresh coriander", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Ginger (grated)", amount: "1/4", unit: "tsp", category: "produce" },
        { name: "Green chili (optional)", amount: "1/2", unit: "piece", category: "produce" },
      ],
      steps: [
        "Whisk yogurt until smooth. Gradually add cold water while whisking.",
        "Add roasted cumin powder, black salt, and grated ginger.",
        "Tear mint leaves and add them in. Add chopped coriander.",
        "Whisk or blend for 30 seconds until frothy.",
        "Serve in a tall glass with ice cubes. Garnish with a mint sprig.",
      ],
      prep_time_min: 5,
      cook_time_min: 0,
    },
  },

  // 28. Roasted Chana
  {
    name: "Roasted Chana",
    description:
      "Crunchy dry-roasted black chickpeas seasoned with chaat masala, lemon, and a hint of chili. A high-protein, high-fiber snack you can carry anywhere.",
    calories: 160,
    protein_g: 10,
    carbs_g: 24,
    fat_g: 3,
    servings: 2,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["chickpeas", "chana", "lemon"],
    recipe: {
      ingredients: [
        { name: "Kala chana (black chickpeas, roasted)", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Chaat masala", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Lemon juice", amount: "1", unit: "tsp", category: "produce" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "If using store-bought roasted chana, skip to step 3.",
        "To roast at home: spread soaked and dried kala chana on a baking tray. Bake at 180C/350F for 25-30 minutes, shaking tray halfway.",
        "Toss roasted chana with chaat masala, red chili powder, and salt.",
        "Squeeze lemon juice and mix well.",
        "Enjoy immediately or store in an airtight jar for up to a week.",
      ],
      prep_time_min: 2,
      cook_time_min: 0,
    },
  },

  // 29. Fruit Chaat with Chaat Masala
  {
    name: "Fruit Chaat with Chaat Masala",
    description:
      "A vibrant mix of seasonal fruits tossed with tangy chaat masala, lemon juice, and a pinch of black salt. A naturally sweet, vitamin-rich snack.",
    calories: 170,
    protein_g: 4,
    carbs_g: 32,
    fat_g: 3,
    servings: 2,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["apple", "banana", "pomegranate", "guava", "orange", "fruits"],
    recipe: {
      ingredients: [
        { name: "Apple (diced)", amount: "1", unit: "small", category: "produce" },
        { name: "Banana (sliced)", amount: "1", unit: "small", category: "produce" },
        { name: "Pomegranate seeds", amount: "1/4", unit: "cup", category: "produce" },
        { name: "Guava (diced)", amount: "1", unit: "small", category: "produce" },
        { name: "Orange segments", amount: "1", unit: "small", category: "produce" },
        { name: "Chaat masala", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Black salt", amount: "1/4", unit: "tsp", category: "pantry" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Red chili powder (optional)", amount: "1/8", unit: "tsp", category: "spices" },
        { name: "Greek yogurt", amount: "1/4", unit: "cup", category: "dairy" },
      ],
      steps: [
        "Wash and cut all fruits into bite-sized pieces.",
        "Combine all fruits in a large bowl.",
        "Sprinkle chaat masala, black salt, and red chili powder.",
        "Squeeze lemon juice over the top and toss gently.",
        "Top with Greek yogurt for protein.",
        "Serve immediately. Best enjoyed fresh.",
      ],
      prep_time_min: 10,
      cook_time_min: 0,
    },
  },

  // 30. Paneer Tikka Bites
  {
    name: "Paneer Tikka Bites",
    description:
      "Bite-sized paneer cubes marinated in spiced yogurt and pan-seared until golden. A quick, protein-packed vegetarian snack perfect for post-workout refueling.",
    calories: 220,
    protein_g: 16,
    carbs_g: 6,
    fat_g: 16,
    servings: 2,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["paneer", "dairy", "yogurt", "spices"],
    recipe: {
      ingredients: [
        { name: "Paneer (cubed into bite-sized pieces)", amount: "150", unit: "g", category: "dairy" },
        { name: "Yogurt (thick)", amount: "2", unit: "tbsp", category: "dairy" },
        { name: "Tikka masala", amount: "1/2", unit: "tbsp", category: "spices" },
        { name: "Ginger-garlic paste", amount: "1/2", unit: "tsp", category: "produce" },
        { name: "Lemon juice", amount: "1", unit: "tsp", category: "produce" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Chaat masala (for garnish)", amount: "1/4", unit: "tsp", category: "spices" },
      ],
      steps: [
        "Mix yogurt, tikka masala, ginger-garlic paste, lemon juice, and salt.",
        "Add paneer cubes and coat evenly. Marinate for 15-20 minutes.",
        "Heat a non-stick pan or tawa with oil on medium-high heat.",
        "Place paneer cubes in a single layer. Cook for 2-3 minutes per side until golden-charred.",
        "Sprinkle chaat masala and serve hot with mint chutney.",
      ],
      prep_time_min: 5,
      cook_time_min: 8,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // WEST INDIAN BREAKFAST (3 meals) — Gujarat, Maharashtra, Goa
  // ═══════════════════════════════════════════════════════════════

  // 1. Dhokla
  {
    name: "Dhokla",
    description:
      "Steamed gram flour cake with mustard tempering. A light, tangy, and protein-rich Gujarati breakfast staple.",
    calories: 180,
    protein_g: 8,
    carbs_g: 28,
    fat_g: 4,
    servings: 3,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["besan", "yogurt", "mustard_seeds", "curry_leaves"],
    recipe: {
      ingredients: [
        { name: "Besan (gram flour)", amount: "1", unit: "cup", category: "lentils" },
        { name: "Yogurt", amount: "1/4", unit: "cup", category: "dairy" },
        { name: "Ginger-green chili paste", amount: "1", unit: "tsp", category: "produce" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Sugar", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Eno / baking soda", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Mustard seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Curry leaves", amount: "8", unit: "pieces", category: "produce" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "In a bowl, combine besan, yogurt, turmeric, salt, sugar, and 1/2 cup water. Whisk until you have a smooth, lump-free batter.",
        "Grease a steaming plate or thali with a few drops of oil. Set up your steamer and bring water to a rolling boil.",
        "Add eno (or 1/2 tsp baking soda + 1/2 tsp citric acid) to the batter and stir quickly for 10 seconds — the batter will become frothy and airy.",
        "Immediately pour the batter into the greased plate, spreading evenly. Do not delay after adding eno.",
        "Place the plate in the steamer, cover tightly, and steam on medium-high heat for 12-15 minutes. Check doneness by inserting a toothpick — it should come out clean.",
        "Let the dhokla cool for 5 minutes, then cut into squares or diamond shapes while still in the plate.",
        "For tempering: heat oil in a small pan, add mustard seeds and let them splutter. Add curry leaves and chopped green chili, stir for 10 seconds.",
        "Add 2 tbsp water and a pinch of sugar to the tempering. Let it bubble for 30 seconds.",
        "Pour the tempering evenly over the cut dhokla pieces. Garnish with fresh coriander and grated coconut if desired.",
      ],
      prep_time_min: 10,
      cook_time_min: 15,
    },
  },

  // 2. Thepla with Yogurt
  {
    name: "Thepla with Yogurt",
    description:
      "Spiced fenugreek flatbread with curd. A nutritious Gujarati breakfast rich in iron from fresh methi leaves.",
    calories: 320,
    protein_g: 12,
    carbs_g: 42,
    fat_g: 12,
    servings: 2,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["wheat", "fenugreek", "yogurt", "cumin"],
    recipe: {
      ingredients: [
        { name: "Whole wheat flour", amount: "1", unit: "cup", category: "grains" },
        { name: "Fresh fenugreek leaves (methi)", amount: "1", unit: "cup", category: "produce" },
        { name: "Yogurt", amount: "2", unit: "tbsp", category: "dairy" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Plain yogurt (side)", amount: "1/2", unit: "cup", category: "dairy" },
      ],
      steps: [
        "Wash and chop methi leaves.",
        "Mix flour, methi, yogurt, all spices, salt.",
        "Knead into soft dough.",
        "Divide into 4 balls, roll thin.",
        "Cook on tawa with minimal oil until golden spots appear.",
        "Serve hot with fresh yogurt.",
      ],
      prep_time_min: 10,
      cook_time_min: 15,
    },
  },

  // 3. Misal Pav
  {
    name: "Misal Pav",
    description:
      "Sprouted moth beans curry with pav bread. A fiery Maharashtrian breakfast packed with protein from sprouts.",
    calories: 380,
    protein_g: 16,
    carbs_g: 52,
    fat_g: 11,
    servings: 1,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["moth_beans", "sprouts", "pav", "onion"],
    recipe: {
      ingredients: [
        { name: "Sprouted moth beans", amount: "1", unit: "cup", category: "lentils" },
        { name: "Onion", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato", amount: "1", unit: "medium", category: "produce" },
        { name: "Misal masala", amount: "1", unit: "tbsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Pav bread", amount: "2", unit: "pieces", category: "grains" },
        { name: "Farsan/sev", amount: "2", unit: "tbsp", category: "pantry" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
      ],
      steps: [
        "Pressure cook sprouted moth beans for 2 whistles.",
        "Sauté onions in oil until golden.",
        "Add tomato, misal masala, turmeric, cook 3 min.",
        "Add cooked sprouts with water, simmer 10 min.",
        "Serve in bowl, top with farsan, lemon, coriander.",
        "Serve pav on side.",
      ],
      prep_time_min: 10,
      cook_time_min: 20,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // WEST INDIAN LUNCH (3 meals)
  // ═══════════════════════════════════════════════════════════════

  // 4. Gujarati Dal + Rice + Sabzi
  {
    name: "Gujarati Dal + Rice + Sabzi",
    description:
      "Sweet and tangy lentil soup with steamed rice and dry vegetable. A balanced Gujarati thali combination.",
    calories: 420,
    protein_g: 16,
    carbs_g: 65,
    fat_g: 10,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["toor_dal", "rice", "jaggery", "tamarind"],
    recipe: {
      ingredients: [
        { name: "Toor dal", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Tomato", amount: "1", unit: "medium", category: "produce" },
        { name: "Jaggery", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Kokum or tamarind", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Mustard seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Curry leaves", amount: "6", unit: "pieces", category: "produce" },
        { name: "Green chili", amount: "1", unit: "piece", category: "produce" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Brown rice (cooked)", amount: "1/2", unit: "cup", category: "grains" },
        { name: "Seasonal vegetables", amount: "1", unit: "cup", category: "produce" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Cook toor dal until soft.",
        "Add tomato, turmeric, jaggery, tamarind, salt. Simmer 5 min.",
        "Temper with mustard seeds, curry leaves, green chili in oil.",
        "Stir-fry seasonal vegetables with minimal spices.",
        "Serve dal over steamed brown rice with sabzi on side.",
      ],
      prep_time_min: 10,
      cook_time_min: 25,
    },
  },

  // 5. Goan Fish Curry + Rice
  {
    name: "Goan Fish Curry + Rice",
    description:
      "Coconut-based tangy fish curry from Goa. A flavourful, protein-rich coastal lunch with kokum and spices.",
    calories: 450,
    protein_g: 32,
    carbs_g: 40,
    fat_g: 18,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["no_preference", "pescatarian"],
    ingredient_tags: ["fish", "coconut_milk", "kokum", "tamarind"],
    recipe: {
      ingredients: [
        { name: "White fish fillets", amount: "200", unit: "g", category: "protein" },
        { name: "Coconut milk", amount: "1/2", unit: "cup", category: "pantry" },
        { name: "Onion", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Tomato", amount: "1", unit: "medium", category: "produce" },
        { name: "Kokum", amount: "2", unit: "pieces", category: "pantry" },
        { name: "Tamarind paste", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Turmeric powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1", unit: "tsp", category: "spices" },
        { name: "Coriander powder", amount: "1", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Steamed rice", amount: "1/3", unit: "cup", category: "grains" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Marinate fish with turmeric and salt for 10 min.",
        "Sauté onion until soft, add tomato and spices.",
        "Add coconut milk and kokum, simmer 5 min.",
        "Add fish pieces, cook gently 8 min.",
        "Do not stir vigorously.",
        "Serve over steamed rice.",
      ],
      prep_time_min: 15,
      cook_time_min: 20,
    },
  },

  // 6. Pav Bhaji
  {
    name: "Pav Bhaji",
    description:
      "Mashed vegetable curry with buttered bread rolls. A beloved Mumbai street food turned into a wholesome meal.",
    calories: 420,
    protein_g: 12,
    carbs_g: 58,
    fat_g: 17,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["potatoes", "cauliflower", "peas", "pav"],
    recipe: {
      ingredients: [
        { name: "Potatoes", amount: "2", unit: "medium", category: "produce" },
        { name: "Cauliflower", amount: "1/2", unit: "cup", category: "produce" },
        { name: "Peas", amount: "1/4", unit: "cup", category: "produce" },
        { name: "Capsicum", amount: "1", unit: "small", category: "produce" },
        { name: "Tomatoes", amount: "1", unit: "medium", category: "produce" },
        { name: "Pav bhaji masala", amount: "1.5", unit: "tbsp", category: "spices" },
        { name: "Butter", amount: "1", unit: "tsp", category: "dairy" },
        { name: "Pav bread", amount: "2", unit: "pieces", category: "grains" },
        { name: "Onion", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
      ],
      steps: [
        "Boil and mash potatoes, cauliflower, peas.",
        "Sauté onion and capsicum in butter.",
        "Add tomatoes, cook until soft.",
        "Add mashed vegetables and pav bhaji masala.",
        "Mash everything together, simmer 10 min.",
        "Lightly toast pav.",
        "Serve bhaji with garnish of onion, lemon, coriander.",
      ],
      prep_time_min: 15,
      cook_time_min: 20,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // WEST INDIAN DINNER (2 meals)
  // ═══════════════════════════════════════════════════════════════

  // 7. Undhiyu (Gujarati Mixed Veg)
  {
    name: "Undhiyu (Gujarati Mixed Veg)",
    description:
      "Slow-cooked winter vegetable medley. A traditional Gujarati delicacy with purple yam, raw banana, and fresh fenugreek.",
    calories: 310,
    protein_g: 10,
    carbs_g: 45,
    fat_g: 10,
    servings: 1,
    category: "dinner",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["flat_beans", "brinjal", "sweet_potato", "fenugreek"],
    recipe: {
      ingredients: [
        { name: "Surti papdi (flat beans)", amount: "1/2", unit: "cup", category: "produce" },
        { name: "Small brinjal", amount: "4", unit: "pieces", category: "produce" },
        { name: "Sweet potato", amount: "1", unit: "small", category: "produce" },
        { name: "Raw banana", amount: "1", unit: "piece", category: "produce" },
        { name: "Purple yam", amount: "1/4", unit: "cup", category: "produce" },
        { name: "Fresh fenugreek leaves", amount: "1/2", unit: "cup", category: "produce" },
        { name: "Green garlic", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Ginger-chili paste", amount: "1", unit: "tsp", category: "produce" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Coriander powder", amount: "1", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Prep all vegetables into bite-sized pieces.",
        "Make masala paste with green garlic, ginger, chili.",
        "Layer vegetables in a heavy pot with masala and spices.",
        "Add 1 tsp oil and 2 tbsp water.",
        "Cover and slow cook on low heat 25 min.",
        "Stir gently once. Serve hot.",
      ],
      prep_time_min: 20,
      cook_time_min: 25,
    },
  },

  // 8. Kolhapuri Chicken
  {
    name: "Kolhapuri Chicken",
    description:
      "Spicy chicken curry from Maharashtra. A bold, fiery curry with roasted coconut and Kolhapuri masala.",
    calories: 380,
    protein_g: 35,
    carbs_g: 15,
    fat_g: 22,
    servings: 2,
    category: "dinner",
    cuisine: "indian",
    tags: ["no_preference"],
    ingredient_tags: ["chicken", "coconut", "kolhapuri_masala", "onion"],
    recipe: {
      ingredients: [
        { name: "Chicken thigh pieces", amount: "250", unit: "g", category: "protein" },
        { name: "Onion", amount: "2", unit: "medium", category: "produce" },
        { name: "Tomato", amount: "1", unit: "medium", category: "produce" },
        { name: "Coconut (grated)", amount: "2", unit: "tbsp", category: "pantry" },
        { name: "Kolhapuri masala", amount: "2", unit: "tbsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Dry roast coconut and grind with 1 onion to paste.",
        "Sauté remaining onion until browned.",
        "Add tomatoes, kolhapuri masala, turmeric, cook 5 min.",
        "Add coconut-onion paste, cook 3 min.",
        "Add chicken, 1/2 cup water.",
        "Cover and cook 20 min until chicken is tender.",
        "Garnish with coriander.",
      ],
      prep_time_min: 15,
      cook_time_min: 25,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // WEST INDIAN SNACKS (2 meals)
  // ═══════════════════════════════════════════════════════════════

  // 9. Khandvi
  {
    name: "Khandvi",
    description:
      "Gram flour rolls with coconut-mustard topping. A delicate Gujarati snack that is light, tangy, and beautifully presented.",
    calories: 150,
    protein_g: 7,
    carbs_g: 18,
    fat_g: 5,
    servings: 3,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["besan", "buttermilk", "coconut", "mustard_seeds"],
    recipe: {
      ingredients: [
        { name: "Besan (gram flour)", amount: "1/2", unit: "cup", category: "lentils" },
        { name: "Buttermilk", amount: "1", unit: "cup", category: "dairy" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Ginger-green chili paste", amount: "1", unit: "tsp", category: "produce" },
        { name: "Mustard seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Sesame seeds", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Grated coconut", amount: "1", unit: "tbsp", category: "pantry" },
        { name: "Curry leaves", amount: "6", unit: "pieces", category: "produce" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Whisk besan and buttermilk until smooth.",
        "Add turmeric, ginger-chili paste, salt.",
        "Cook on medium heat stirring continuously until thick.",
        "Spread thin on oiled surface. Let cool.",
        "Roll into tight spirals.",
        "Temper with mustard, sesame, curry leaves, coconut.",
        "Pour over khandvi rolls.",
      ],
      prep_time_min: 10,
      cook_time_min: 15,
    },
  },

  // 10. Baked Vada Pav Bites
  {
    name: "Baked Vada Pav Bites",
    description:
      "Spiced potato balls in mini buns (baked, not fried). A healthier twist on Mumbai's favourite street food.",
    calories: 200,
    protein_g: 5,
    carbs_g: 32,
    fat_g: 6,
    servings: 2,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["potatoes", "mustard_seeds", "garlic", "pav"],
    recipe: {
      ingredients: [
        { name: "Potatoes (boiled/mashed)", amount: "2", unit: "medium", category: "produce" },
        { name: "Mustard seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Green chili", amount: "1", unit: "piece", category: "produce" },
        { name: "Garlic", amount: "3", unit: "cloves", category: "produce" },
        { name: "Curry leaves", amount: "6", unit: "pieces", category: "produce" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Mini pav/slider buns", amount: "3", unit: "pieces", category: "grains" },
        { name: "Dry garlic chutney", amount: "1", unit: "tbsp", category: "pantry" },
      ],
      steps: [
        "Mash boiled potatoes.",
        "Temper mustard seeds, curry leaves, garlic in oil.",
        "Add turmeric, green chili, mashed potato. Mix well, shape into small balls.",
        "Bake at 180°C for 15 min until golden.",
        "Serve in mini pav with dry garlic chutney.",
      ],
      prep_time_min: 15,
      cook_time_min: 15,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // EAST INDIAN BREAKFAST (3 meals) — Bengal, Odisha, Assam, NE
  // ═══════════════════════════════════════════════════════════════

  // 11. Luchi with Cholar Dal
  {
    name: "Luchi with Cholar Dal",
    description:
      "Puffed Bengali bread (air-fried for a healthier version) with Bengal gram lentils. A classic Bengali breakfast with lightly sweetened lentil curry.",
    calories: 340,
    protein_g: 14,
    carbs_g: 55,
    fat_g: 9,
    servings: 1,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["maida", "chana_dal", "coconut", "raisins"],
    recipe: {
      ingredients: [
        { name: "Maida (refined flour)", amount: "1", unit: "cup", category: "grains" },
        { name: "Ghee", amount: "1", unit: "tsp", category: "dairy" },
        { name: "Chana dal", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Bay leaf", amount: "1", unit: "piece", category: "spices" },
        { name: "Cumin seeds", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Ginger paste", amount: "1", unit: "tsp", category: "produce" },
        { name: "Raisins", amount: "5", unit: "pieces", category: "pantry" },
        { name: "Coconut bits", amount: "1", unit: "tbsp", category: "pantry" },
        { name: "Sugar", amount: "1/2", unit: "tsp", category: "pantry" },
        { name: "Oil for air frying/light brushing", amount: "1/2", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Knead maida with ghee, salt, water into soft dough. Rest 15 min.",
        "Cook chana dal until soft.",
        "Temper with bay leaf, cumin.",
        "Add turmeric, ginger, salt, sugar, coconut, raisins. Simmer 5 min.",
        "Roll small luchis thin.",
        "Brush lightly with oil and air fry at 200°C for 3-4 min until puffed, or cook on tawa with minimal oil.",
        "Serve with cholar dal.",
      ],
      prep_time_min: 20,
      cook_time_min: 20,
    },
  },

  // 12. Pitha (Rice Flour Pancakes)
  {
    name: "Pitha (Rice Flour Pancakes)",
    description:
      "Assamese rice flour crepes with jaggery. A traditional Northeast Indian sweet breakfast with coconut filling.",
    calories: 250,
    protein_g: 4,
    carbs_g: 48,
    fat_g: 5,
    servings: 2,
    category: "breakfast",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["rice_flour", "jaggery", "coconut", "sesame"],
    recipe: {
      ingredients: [
        { name: "Rice flour", amount: "1/3", unit: "cup", category: "grains" },
        { name: "Jaggery (grated)", amount: "3", unit: "tbsp", category: "pantry" },
        { name: "Grated coconut", amount: "2", unit: "tbsp", category: "pantry" },
        { name: "Cardamom powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Sesame seeds", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Water", amount: "as needed", unit: "", category: "pantry" },
      ],
      steps: [
        "Mix rice flour with enough water to make thin batter.",
        "Heat tawa, pour thin crepe.",
        "Fill center with jaggery-coconut-cardamom mixture.",
        "Fold in half.",
        "Cook until golden on both sides.",
        "Sprinkle sesame seeds. Serve warm.",
      ],
      prep_time_min: 10,
      cook_time_min: 15,
    },
  },

  // 13. Aloo Posto (Potatoes in Poppy Seed Paste)
  {
    name: "Aloo Posto (Potatoes in Poppy Seed Paste)",
    description:
      "Bengali comfort dish with potatoes cooked in a rich poppy seed paste with mustard oil and nigella seeds, served with paneer for added protein.",
    calories: 330,
    protein_g: 14,
    carbs_g: 38,
    fat_g: 15,
    servings: 2,
    category: "lunch",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["potatoes", "poppy_seeds", "mustard_oil", "nigella_seeds", "paneer", "dairy"],
    recipe: {
      ingredients: [
        { name: "Potatoes", amount: "2", unit: "medium", category: "produce" },
        { name: "Poppy seeds (khus khus)", amount: "2", unit: "tbsp", category: "spices" },
        { name: "Green chili", amount: "2", unit: "pieces", category: "produce" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Mustard oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Nigella seeds (kalonji)", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Paneer (cubed)", amount: "50", unit: "g", category: "dairy" },
      ],
      steps: [
        "Soak poppy seeds 30 min, grind to smooth paste.",
        "Cut potatoes into cubes.",
        "Heat mustard oil until smoking, reduce heat.",
        "Add nigella seeds, then potatoes. Fry lightly 3 min.",
        "Add turmeric, salt, poppy paste, green chili.",
        "Add 1/4 cup water. Cover and cook until potatoes are done.",
        "The gravy should be thick.",
      ],
      prep_time_min: 35,
      cook_time_min: 15,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // EAST INDIAN LUNCH (3 meals)
  // ═══════════════════════════════════════════════════════════════

  // 14. Machher Jhol (Bengali Fish Curry) + Rice
  {
    name: "Machher Jhol (Bengali Fish Curry) + Rice",
    description:
      "Light turmeric fish curry with potatoes. The quintessential Bengali comfort meal served over steamed rice.",
    calories: 430,
    protein_g: 30,
    carbs_g: 42,
    fat_g: 16,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["no_preference", "pescatarian"],
    ingredient_tags: ["fish", "potatoes", "mustard_oil", "nigella_seeds"],
    recipe: {
      ingredients: [
        { name: "Rohu or catla fish", amount: "200", unit: "g", category: "protein" },
        { name: "Potatoes", amount: "1", unit: "medium", category: "produce" },
        { name: "Tomato", amount: "1", unit: "piece", category: "produce" },
        { name: "Turmeric powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Cumin powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Mustard oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Bay leaf", amount: "1", unit: "piece", category: "spices" },
        { name: "Nigella seeds", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Green chili", amount: "2", unit: "pieces", category: "produce" },
        { name: "Steamed rice", amount: "1/3", unit: "cup", category: "grains" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Marinate fish with turmeric and salt.",
        "Lightly fry fish pieces in mustard oil, set aside.",
        "Fry cubed potatoes until light golden.",
        "Add bay leaf, nigella seeds. Add tomato, spices, cook 3 min.",
        "Add water, potatoes. Simmer 5 min.",
        "Gently add fish, cook 7 min on low.",
        "Serve over steamed rice.",
      ],
      prep_time_min: 15,
      cook_time_min: 20,
    },
  },

  // 15. Dal Pakhala (Fermented Rice with Lentils)
  {
    name: "Dal Pakhala (Fermented Rice with Lentils)",
    description:
      "Odia summer staple of fermented rice with lentils. A cooling, probiotic-rich traditional meal from Odisha.",
    calories: 350,
    protein_g: 12,
    carbs_g: 60,
    fat_g: 6,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["rice", "moong_dal", "mustard_oil", "cucumber"],
    recipe: {
      ingredients: [
        { name: "Cooked rice", amount: "1/2", unit: "cup", category: "grains" },
        { name: "Water", amount: "2", unit: "cups", category: "pantry" },
        { name: "Moong dal", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Cucumber (diced)", amount: "1/4", unit: "piece", category: "produce" },
        { name: "Raw onion", amount: "1", unit: "small", category: "produce" },
        { name: "Green chili", amount: "1", unit: "piece", category: "produce" },
        { name: "Mustard oil", amount: "1/2", unit: "tsp", category: "pantry" },
        { name: "Fried dry red chili", amount: "1", unit: "piece", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Soak cooked rice in water overnight (6-8 hours) at room temperature for fermentation.",
        "Cook moong dal until soft.",
        "Mix rice water with dal, mash slightly.",
        "Add salt, mustard oil.",
        "Serve in bowl with diced cucumber, raw onion, green chili, fried dry chili on top.",
      ],
      prep_time_min: 480,
      cook_time_min: 15,
    },
  },

  // 16. Assamese Thali (Dal, Xaak, Rice, Fish)
  {
    name: "Assamese Thali (Dal, Xaak, Rice, Fish)",
    description:
      "Balanced Assamese plate with simple lentils, sautéed greens, pan-fried fish, and steamed rice.",
    calories: 480,
    protein_g: 28,
    carbs_g: 55,
    fat_g: 16,
    servings: 1,
    category: "lunch",
    cuisine: "indian",
    tags: ["no_preference"],
    ingredient_tags: ["masoor_dal", "leafy_greens", "fish", "mustard_oil"],
    recipe: {
      ingredients: [
        { name: "Masoor dal", amount: "1/4", unit: "cup", category: "lentils" },
        { name: "Leafy greens (xaak)", amount: "1", unit: "cup", category: "produce" },
        { name: "Small fish", amount: "100", unit: "g", category: "protein" },
        { name: "Tomato", amount: "1", unit: "piece", category: "produce" },
        { name: "Turmeric powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Mustard oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Garlic", amount: "2", unit: "cloves", category: "produce" },
        { name: "Green chili", amount: "1", unit: "piece", category: "produce" },
        { name: "Steamed rice", amount: "1/3", unit: "cup", category: "grains" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Cook masoor dal simply with turmeric, tomato, salt.",
        "Sauté leafy greens (any seasonal) with garlic in mustard oil.",
        "Pan-fry small fish with turmeric and salt in mustard oil.",
        "Serve all on plate with steamed rice and lemon wedge.",
        "Simple, balanced, traditional.",
      ],
      prep_time_min: 10,
      cook_time_min: 25,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // EAST INDIAN DINNER (2 meals)
  // ═══════════════════════════════════════════════════════════════

  // 17. Shorshe Ilish (Hilsa in Mustard Sauce)
  {
    name: "Shorshe Ilish (Hilsa in Mustard Sauce)",
    description:
      "Classic Bengali delicacy of hilsa fish steamed in a pungent mustard and poppy seed sauce. Rich in omega-3 fatty acids.",
    calories: 320,
    protein_g: 28,
    carbs_g: 12,
    fat_g: 16,
    servings: 2,
    category: "dinner",
    cuisine: "indian",
    tags: ["no_preference", "pescatarian"],
    ingredient_tags: ["hilsa_fish", "mustard_seeds", "poppy_seeds", "mustard_oil"],
    recipe: {
      ingredients: [
        { name: "Hilsa fish steaks", amount: "200", unit: "g", category: "protein" },
        { name: "Mustard seeds", amount: "2", unit: "tbsp", category: "spices" },
        { name: "Poppy seeds", amount: "1", unit: "tbsp", category: "spices" },
        { name: "Green chili", amount: "3", unit: "pieces", category: "produce" },
        { name: "Turmeric powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Mustard oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Grind mustard seeds and poppy seeds with green chili and water to fine paste.",
        "Marinate hilsa with turmeric and salt.",
        "Spread mustard paste over fish.",
        "Place in a pot, drizzle mustard oil.",
        "Add 1/4 cup water. Cover tightly and cook on low 15 min.",
        "Do not stir. The steam cooks the fish.",
        "Serve with plain rice.",
      ],
      prep_time_min: 15,
      cook_time_min: 15,
    },
  },

  // 18. Aloo Dum (Bengali Style Spiced Baby Potatoes)
  {
    name: "Aloo Dum (Bengali Style Spiced Baby Potatoes)",
    description:
      "Spiced baby potatoes in a rich tomato gravy. A hearty Bengali vegetarian dinner with warm garam masala notes.",
    calories: 300,
    protein_g: 6,
    carbs_g: 48,
    fat_g: 10,
    servings: 4,
    category: "dinner",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["potatoes", "tomato", "ginger", "garam_masala"],
    recipe: {
      ingredients: [
        { name: "Baby potatoes", amount: "10-12", unit: "pieces", category: "produce" },
        { name: "Tomato puree", amount: "1/2", unit: "cup", category: "produce" },
        { name: "Ginger paste", amount: "1", unit: "tsp", category: "produce" },
        { name: "Cumin powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Coriander powder", amount: "1", unit: "tsp", category: "spices" },
        { name: "Red chili powder", amount: "1/2", unit: "tsp", category: "spices" },
        { name: "Turmeric powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Sugar", amount: "1/2", unit: "tsp", category: "pantry" },
        { name: "Oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Bay leaf", amount: "1", unit: "piece", category: "spices" },
        { name: "Garam masala", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
      ],
      steps: [
        "Boil baby potatoes, peel. Prick with fork.",
        "Fry in oil until golden. Remove potatoes.",
        "Add bay leaf, ginger paste to oil.",
        "Add tomato puree and all spices. Cook 5 min.",
        "Add potatoes and 1/2 cup water. Simmer 10 min until thick.",
        "Finish with garam masala.",
      ],
      prep_time_min: 15,
      cook_time_min: 20,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // EAST INDIAN SNACKS (2 meals)
  // ═══════════════════════════════════════════════════════════════

  // 19. Jhalmuri (Spiced Puffed Rice)
  {
    name: "Jhalmuri (Spiced Puffed Rice)",
    description:
      "Bengali street snack of puffed rice tossed with mustard oil, peanuts, onion, and spices. Quick, light, and addictive.",
    calories: 120,
    protein_g: 3,
    carbs_g: 22,
    fat_g: 3,
    servings: 4,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian", "vegan"],
    ingredient_tags: ["puffed_rice", "mustard_oil", "peanuts", "onion"],
    recipe: {
      ingredients: [
        { name: "Puffed rice (muri)", amount: "2", unit: "cups", category: "grains" },
        { name: "Mustard oil", amount: "1", unit: "tsp", category: "pantry" },
        { name: "Onion (finely chopped)", amount: "1/2", unit: "medium", category: "produce" },
        { name: "Green chili", amount: "1", unit: "piece", category: "produce" },
        { name: "Roasted peanuts", amount: "1", unit: "tbsp", category: "pantry" },
        { name: "Chanachur/bhujia", amount: "1", unit: "tbsp", category: "pantry" },
        { name: "Fresh coriander", amount: "2", unit: "tbsp", category: "produce" },
        { name: "Lemon juice", amount: "1", unit: "tbsp", category: "produce" },
        { name: "Salt", amount: "to taste", unit: "", category: "pantry" },
        { name: "Chat masala", amount: "1/2", unit: "tsp", category: "spices" },
      ],
      steps: [
        "Take puffed rice in a large bowl.",
        "Add chopped onion, green chili, peanuts, chanachur.",
        "Drizzle mustard oil and lemon juice.",
        "Add salt and chat masala.",
        "Toss everything together.",
        "Garnish with coriander. Serve immediately — best eaten fresh.",
      ],
      prep_time_min: 5,
      cook_time_min: 0,
    },
  },

  // 20. Sandesh (Bengali Cottage Cheese Sweet)
  {
    name: "Sandesh (Bengali Cottage Cheese Sweet)",
    description:
      "Light protein-rich Bengali sweet made from fresh chenna. Delicately flavoured with cardamom and saffron.",
    calories: 130,
    protein_g: 8,
    carbs_g: 16,
    fat_g: 4,
    servings: 4,
    category: "snack",
    cuisine: "indian",
    tags: ["vegetarian"],
    ingredient_tags: ["paneer", "chenna", "cardamom", "saffron"],
    recipe: {
      ingredients: [
        { name: "Paneer/chenna (fresh)", amount: "1", unit: "cup", category: "dairy" },
        { name: "Sugar", amount: "2", unit: "tbsp", category: "pantry" },
        { name: "Cardamom powder", amount: "1/4", unit: "tsp", category: "spices" },
        { name: "Saffron strands", amount: "4-5", unit: "pieces", category: "spices" },
        { name: "Pistachios (chopped)", amount: "1", unit: "tsp", category: "pantry" },
      ],
      steps: [
        "Crumble fresh chenna/paneer.",
        "Knead until completely smooth (5 min).",
        "Add sugar and cardamom.",
        "Cook on low heat stirring continuously 5 min until mixture thickens and leaves the pan.",
        "Shape into small discs. Press a pistachio piece on top.",
        "Let cool. Refrigerate until firm.",
      ],
      prep_time_min: 10,
      cook_time_min: 5,
    },
  },
];
