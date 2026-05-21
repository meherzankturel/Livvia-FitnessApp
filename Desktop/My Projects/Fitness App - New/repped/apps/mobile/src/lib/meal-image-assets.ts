/**
 * Static asset map for AI-generated meal images.
 * React Native requires literal require() calls — paths cannot be dynamic.
 * Maps dish name (as it appears in MEAL_TEMPLATES) → bundled JPEG.
 */

import type { ImageSourcePropType } from "react-native";

export const LOCAL_MEAL_IMAGES: Record<string, ImageSourcePropType> = {
  // French
  "Classic French Omelette": require("../../assets/meals/classic-french-omelette.jpg"),
  "Croque Monsieur":         require("../../assets/meals/croque-monsieur.jpg"),
  "Salade Niçoise":          require("../../assets/meals/salade-ni-oise.jpg"),
  "Coq au Vin":              require("../../assets/meals/coq-au-vin.jpg"),
  "Ratatouille":             require("../../assets/meals/ratatouille.jpg"),
  "Quiche Lorraine":         require("../../assets/meals/quiche-lorraine.jpg"),
  "Salmon en Papillote":     require("../../assets/meals/salmon-en-papillote.jpg"),
  "French Onion Soup":       require("../../assets/meals/french-onion-soup.jpg"),

  // Middle Eastern
  "Shakshuka":                       require("../../assets/meals/shakshuka.jpg"),
  "Chicken Shawarma Bowl":           require("../../assets/meals/chicken-shawarma-bowl.jpg"),
  "Falafel Wrap":                    require("../../assets/meals/falafel-wrap.jpg"),
  "Lamb Kofta Skewers":              require("../../assets/meals/lamb-kofta-skewers.jpg"),
  "Mujadara":                        require("../../assets/meals/mujadara.jpg"),
  "Hummus & Pita Plate":             require("../../assets/meals/hummus-pita-plate.jpg"),
  "Tabbouleh with Grilled Halloumi": require("../../assets/meals/tabbouleh-with-grilled-halloumi.jpg"),

  // Italian
  "Caprese Toast":         require("../../assets/meals/caprese-toast.jpg"),
  "Pasta al Pomodoro":     require("../../assets/meals/pasta-al-pomodoro.jpg"),
  "Mushroom Risotto":      require("../../assets/meals/mushroom-risotto.jpg"),
  "Chicken Piccata":       require("../../assets/meals/chicken-piccata.jpg"),
  "Italian Meatball Bowl": require("../../assets/meals/italian-meatball-bowl.jpg"),

  // Asian
  "Teriyaki Salmon Bowl":         require("../../assets/meals/teriyaki-salmon-bowl.jpg"),
  "Beef Bibimbap":                require("../../assets/meals/beef-bibimbap.jpg"),
  "Vegetable Pad Thai":           require("../../assets/meals/vegetable-pad-thai.jpg"),
  "Miso Tofu Bowl":               require("../../assets/meals/miso-tofu-bowl.jpg"),
  "Sushi Bowl":                   require("../../assets/meals/sushi-bowl.jpg"),
  "Korean Chicken Lettuce Wraps": require("../../assets/meals/korean-chicken-lettuce-wraps.jpg"),

  // Mexican
  "Chicken Burrito Bowl": require("../../assets/meals/chicken-burrito-bowl.jpg"),
  "Black Bean Tacos":     require("../../assets/meals/black-bean-tacos.jpg"),
  "Huevos Rancheros":     require("../../assets/meals/huevos-rancheros.jpg"),

  // Mediterranean
  "Chicken Souvlaki Plate": require("../../assets/meals/chicken-souvlaki-plate.jpg"),
  "Spinach Feta Wrap":      require("../../assets/meals/spinach-feta-wrap.jpg"),

  // American (the one snack that was missing from the JSON map)
  "Edamame": require("../../assets/meals/edamame.jpg"),
};
