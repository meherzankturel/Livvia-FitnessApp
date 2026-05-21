# Meal Macro Audit Report

Source: **Edamam Nutrition Analysis API** (USDA-backed).
For Indian dishes flagged with 🇮🇳, cross-check against IFCT 2017 manually.

## Summary

- ✓ Verified (≤10% delta): **29**
- · Borderline (10-15%): **9**
- ⚠ Recommend update (>15%): **50**
- 🇮🇳 Flag for IFCT cross-check (Indian, >15%): **38**
- ✗ Failed to audit: **5**

---

## Full results (sorted by absolute delta, worst first)

| Status | Meal | Cuisine | Cur cal | Edamam cal | Δ% | Cur P/C/F | Edamam P/C/F |
|---|---|---|---|---|---|---|---|
| 🇮🇳 | Undhiyu (Gujarati Mixed Veg) | indian | 310 | 1340 | ++332% | 10/45/10 | 65/273/15 |
| 🇮🇳 | Upma with Vegetables | indian | 340 | 1171 | ++244% | 14/44/12 | 39/173/38 |
| 🇮🇳 | Ragi Dosa with Coconut Chutney | indian | 320 | 919 | ++187% | 16/42/10 | 29/124/36 |
| 🇮🇳 | Dal Palak + Multigrain Roti | indian | 380 | 1076 | ++183% | 20/52/10 | 55/172/22 |
| 🇮🇳 | Luchi with Cholar Dal | indian | 340 | 934 | ++175% | 14/55/9 | 34/165/16 |
| ⚠ | Caprese Toast | italian | 360 | 963 | ++168% | 18/32/18 | 45/151/20 |
| ⚠ | Vegetable Curry with Rice | mediterranean | 500 | 1333 | ++167% | 14/65/20 | 23/98/101 |
| ⚠ | Keto Egg Cups | american | 350 | 915 | ++161% | 28/4/25 | 70/5/66 |
| ⚠ | Avocado Toast with Eggs | mediterranean | 480 | 1222 | ++155% | 22/35/28 | 47/163/46 |
| ⚠ | Chicken Thigh with Mashed Potatoes | american | 580 | 1474 | ++154% | 35/45/28 | 78/88/90 |
| 🇮🇳 | Rajma Chawal | indian | 460 | 1165 | ++153% | 18/72/10 | 53/215/13 |
| 🇮🇳 | Roasted Chana | indian | 160 | 381 | ++138% | 10/24/3 | 21/64/6 |
| ⚠ | Lentil Soup & Bread | mediterranean | 400 | 940 | ++135% | 22/55/8 | 52/150/17 |
| 🇮🇳 | Paneer Tikka + Green Salad | indian | 360 | 822 | ++128% | 26/14/22 | 47/39/56 |
| 🇮🇳 | Poha with Peanuts | indian | 360 | 805 | ++124% | 16/48/12 | 22/146/15 |
| 🇮🇳 | Roasted Makhana | indian | 120 | 253 | ++111% | 4/18/4 | 10/42/6 |
| 🇮🇳 | Baked Vada Pav Bites | indian | 200 | 414 | ++107% | 5/32/6 | 12/81/5 |
| 🇮🇳 | Fish Curry + Steamed Rice | indian | 450 | 928 | ++106% | 32/50/12 | 53/97/38 |
| ⚠ | Croque Monsieur | french | 580 | 1168 | ++101% | 35/43/30 | 54/152/38 |
| ⚠ | Mujadara | middle_eastern | 540 | 1042 | ++93% | 20/82/14 | 34/164/29 |
| 🇮🇳 | Moong Dal Cheela | indian | 280 | 42 | -85% | 18/32/8 | 2/6/2 |
| 🇮🇳 | Idli Sambar | indian | 290 | 535 | ++84% | 10/52/4 | 37/56/19 |
| ⚠ | Chicken Burrito Bowl | mexican | 620 | 1136 | ++83% | 44/64/22 | 66/184/14 |
| ⚠ | Tofu Pad Thai | asian | 500 | 890 | ++78% | 20/60/18 | 41/102/38 |
| ⚠ | Black Bean Tacos | mexican | 400 | 703 | ++76% | 16/58/13 | 37/136/5 |
| 🇮🇳 | Thepla with Yogurt | indian | 320 | 562 | ++76% | 12/42/12 | 31/99/12 |
| ⚠ | Ratatouille | french | 280 | 488 | ++74% | 6/30/15 | 11/55/30 |
| 🇮🇳 | Chicken Curry + Brown Rice | indian | 520 | 886 | ++70% | 38/52/16 | 41/108/31 |
| 🇮🇳 | Pesarattu | indian | 260 | 80 | -69% | 16/34/6 | 3/15/2 |
| 🇮🇳 | Pav Bhaji | indian | 420 | 698 | ++66% | 12/58/17 | 23/142/9 |
| 🇮🇳 | Egg Curry + Jeera Rice | indian | 480 | 765 | ++59% | 22/54/18 | 30/104/26 |
| ⚠ | Chickpea & Spinach Stew | mediterranean | 420 | 664 | ++58% | 18/55/12 | 27/94/24 |
| ⚠ | Italian Meatball Bowl | italian | 620 | 978 | ++58% | 38/48/30 | 49/88/46 |
| 🇮🇳 | Dalia Khichdi | indian | 310 | 131 | -58% | 14/50/6 | 5/19/5 |
| 🇮🇳 | Chole + Multigrain Roti | indian | 440 | 687 | ++56% | 18/60/14 | 30/110/16 |
| ⚠ | Tuna Salad Bowl | mediterranean | 380 | 171 | -55% | 35/15/18 | 31/5/3 |
| ⚠ | Bean & Cheese Enchiladas | mexican | 520 | 786 | ++51% | 22/55/22 | 37/103/27 |
| ⚠ | Greek Yogurt & Honey | american | 180 | 272 | ++51% | 18/20/3 | 21/15/15 |
| ⚠ | String Cheese & Crackers | american | 220 | 330 | ++50% | 14/18/10 | 16/26/19 |
| 🇮🇳 | Palak Paneer + Roti | indian | 440 | 654 | ++49% | 24/38/20 | 29/62/33 |
| 🇮🇳 | Baingan Bharta + Roti | indian | 460 | 683 | ++48% | 24/46/20 | 29/92/25 |
| ⚠ | Veggie Stir Fry with Tofu | asian | 480 | 710 | ++48% | 22/55/16 | 40/80/29 |
| 🇮🇳 | Jhalmuri (Spiced Puffed Rice) | indian | 120 | 63 | -48% | 3/22/3 | 1/10/2 |
| ⚠ | Greek Yogurt Parfait | mediterranean | 350 | 513 | ++47% | 25/40/10 | 27/48/25 |
| ⚠ | Chicken Shawarma Bowl | middle_eastern | 580 | 846 | ++46% | 42/50/22 | 42/66/48 |
| ⚠ | Quiche Lorraine | french | 480 | 700 | ++46% | 22/24/32 | 29/10/60 |
| 🇮🇳 | Goan Fish Curry + Rice | indian | 450 | 656 | ++46% | 32/40/18 | 48/48/33 |
| 🇮🇳 | Gujarati Dal + Rice + Sabzi | indian | 420 | 611 | ++45% | 16/65/10 | 18/115/10 |
| 🇮🇳 | Aloo Dum (Bengali Style Spiced Baby Potatoes) | indian | 300 | 167 | -44% | 6/48/10 | 4/36/2 |
| 🇮🇳 | Paneer Bhurji with Roti | indian | 420 | 601 | ++43% | 24/38/18 | 28/61/28 |
| 🇮🇳 | Dal Tadka + Brown Rice + Cucumber Raita | indian | 480 | 685 | ++43% | 20/68/12 | 23/121/14 |
| ⚠ | Salmon Poke Bowl | asian | 520 | 734 | ++41% | 32/50/20 | 42/58/38 |
| ⚠ | Keto Chicken Alfredo | italian | 480 | 657 | ++37% | 38/10/32 | 52/16/43 |
| ⚠ | Chicken Breast with Quinoa | mediterranean | 519 | 703 | ++35% | 42/45/19 | 54/68/24 |
| 🇮🇳 | Sandesh (Bengali Cottage Cheese Sweet) | indian | 130 | 84 | -35% | 8/16/4 | 6/9/3 |
| ⚠ | Tofu Scramble | american | 320 | 431 | ++35% | 22/15/18 | 37/17/28 |
| ⚠ | Bacon & Egg Wrap | american | 500 | 669 | ++34% | 30/30/28 | 32/32/45 |
| 🇮🇳 | Machher Jhol (Bengali Fish Curry) + Rice | indian | 430 | 575 | ++34% | 30/42/16 | 50/76/10 |
| ⚠ | Beef Stir Fry | asian | 550 | 731 | ++33% | 35/55/18 | 42/79/26 |
| ⚠ | Edamame | american | 190 | 129 | -32% | 18/14/8 | 13/9/6 |
| ⚠ | Shrimp & Grits | american | 520 | 683 | ++31% | 30/45/22 | 43/67/27 |
| ⚠ | Chicken Souvlaki Plate | mediterranean | 600 | 776 | ++29% | 46/42/26 | 43/35/53 |
| 🇮🇳 | Chicken Tikka + Raita | indian | 340 | 241 | -29% | 40/8/16 | 32/9/9 |
| ⚠ | Hummus & Pita Plate | middle_eastern | 380 | 485 | ++28% | 14/48/16 | 16/56/26 |
| 🇮🇳 | Masala Omelette with Multigrain Toast | indian | 380 | 479 | ++26% | 24/30/18 | 30/42/22 |
| ⚠ | Pasta al Pomodoro | italian | 520 | 646 | ++24% | 16/90/12 | 15/83/29 |
| ⚠ | Coq au Vin | french | 580 | 715 | ++23% | 44/18/32 | 41/14/45 |
| ⚠ | Black Bean Burrito Bowl | mexican | 550 | 673 | ++22% | 20/70/18 | 22/109/19 |
| ⚠ | Vegetable Pad Thai | asian | 520 | 635 | ++22% | 22/72/16 | 35/86/20 |
| ⚠ | Korean Chicken Lettuce Wraps | asian | 380 | 297 | -22% | 34/12/22 | 31/11/15 |
| ⚠ | Oatmeal with Banana & Peanut Butter | american | 450 | 352 | -22% | 15/60/16 | 10/59/11 |
| 🇮🇳 | Paneer Tikka Bites | indian | 220 | 267 | ++21% | 16/6/16 | 16/4/21 |
| 🇮🇳 | Moong Dal Khichdi + Papad | indian | 340 | 411 | ++21% | 14/54/8 | 9/82/5 |
| ⚠ | Mushroom Risotto | italian | 560 | 674 | ++20% | 16/78/18 | 22/90/20 |
| ⚠ | Chicken Piccata | italian | 580 | 698 | ++20% | 42/50/22 | 45/67/28 |
| ⚠ | Grilled Chicken & Rice | american | 504 | 602 | ++19% | 40/50/16 | 46/60/19 |
| 🇮🇳 | Khandvi | indian | 150 | 121 | -19% | 7/18/5 | 7/14/5 |
| ⚠ | Turkey Sandwich | american | 420 | 339 | -19% | 30/40/14 | 34/29/10 |
| ⚠ | Miso Tofu Bowl | asian | 420 | 342 | -19% | 22/52/12 | 21/47/9 |
| ⚠ | Teriyaki Salmon Bowl | asian | 580 | 687 | ++18% | 38/60/18 | 46/65/25 |
| 🇮🇳 | Besan Chilla with Mint Chutney | indian | 300 | 245 | -18% | 16/28/14 | 13/37/6 |
| ⚠ | Chicken Quesadilla | mexican | 500 | 590 | ++18% | 32/35/24 | 35/34/35 |
| ⚠ | Lamb Kofta Skewers | middle_eastern | 620 | 721 | ++16% | 36/38/36 | 40/30/48 |
| 🇮🇳 | Masala Chaas | indian | 75 | 63 | -16% | 6/8/2 | 4/6/3 |
| ⚠ | Shakshuka | middle_eastern | 340 | 393 | ++16% | 15/18/24 | 19/29/25 |
| ⚠ | Beef Bibimbap | asian | 640 | 739 | ++15% | 36/70/24 | 37/64/37 |
| ⚠ | Huevos Rancheros | mexican | 480 | 553 | ++15% | 24/42/22 | 34/69/17 |
| ⚠ | Baked Salmon with Sweet Potato | mediterranean | 546 | 628 | ++15% | 38/40/26 | 39/37/37 |
| · | Steak with Roasted Vegetables | american | 581 | 668 | ++15% | 45/35/29 | 40/42/38 |
| · | Dal Pakhala (Fermented Rice with Lentils) | indian | 350 | 298 | -15% | 12/60/6 | 8/61/3 |
| · | Dhokla | indian | 180 | 155 | -14% | 8/28/4 | 8/21/4 |
| · | Scrambled Eggs & Toast | american | 420 | 478 | ++14% | 25/35/20 | 27/29/28 |
| · | French Onion Soup | french | 420 | 477 | ++14% | 18/38/22 | 26/39/25 |
| · | Grilled Fish Tacos | mexican | 480 | 542 | ++13% | 32/40/20 | 42/52/22 |
| · | Spinach Feta Wrap | mediterranean | 420 | 369 | -12% | 18/48/18 | 16/47/15 |
| · | Overnight Oats | american | 400 | 444 | ++11% | 15/55/14 | 15/59/19 |
| · | Hard Boiled Eggs | american | 160 | 143 | -11% | 12/2/10 | 13/1/10 |
| ✓ | Keto Burger Bowl | american | 480 | 528 | ++10% | 35/8/34 | 33/12/39 |
| ✓ | Fruit Chaat with Chaat Masala | indian | 170 | 154 | -9% | 4/32/3 | 4/32/3 |
| ✓ | Smoked Salmon Bagel | american | 400 | 437 | ++9% | 25/30/18 | 23/55/14 |
| ✓ | Banana Pancakes | american | 350 | 318 | -9% | 15/45/12 | 14/45/10 |
| ✓ | Stuffed Bell Peppers | american | 450 | 485 | ++8% | 30/40/16 | 35/46/19 |
| ✓ | Trail Mix | american | 300 | 277 | -8% | 10/25/20 | 7/24/19 |
| ✓ | Rice Cake with Almond Butter | american | 200 | 185 | -8% | 6/25/10 | 5/24/9 |
| ✓ | Mixed Sabzi + Dal + Roti | indian | 420 | 451 | ++7% | 16/60/12 | 16/71/12 |
| ✓ | Pasta with Meat Sauce | italian | 604 | 648 | ++7% | 32/65/24 | 36/53/34 |
| ✓ | Salmon en Papillote | french | 460 | 493 | ++7% | 38/10/28 | 32/15/32 |
| ✓ | Shrimp Tacos | mexican | 450 | 479 | ++6% | 30/40/18 | 40/43/19 |
| ✓ | Grilled Chicken Salad | american | 400 | 375 | -6% | 35/15/22 | 38/15/18 |
| ✓ | Sushi Bowl | asian | 560 | 593 | ++6% | 32/56/22 | 32/47/31 |
| ✓ | Protein Smoothie | american | 300 | 316 | ++5% | 30/30/5 | 28/43/6 |
| ✓ | Salade Niçoise | french | 620 | 587 | -5% | 44/42/32 | 48/39/27 |
| ✓ | Misal Pav | indian | 380 | 362 | -5% | 16/52/11 | 15/61/9 |
| ✓ | Grilled Tandoori Chicken + Salad | indian | 350 | 366 | ++5% | 42/10/14 | 23/15/24 |
| ✓ | Kolhapuri Chicken | indian | 380 | 397 | ++4% | 35/15/22 | 24/21/26 |
| ✓ | Shorshe Ilish (Hilsa in Mustard Sauce) | indian | 320 | 332 | ++4% | 28/12/16 | 24/10/22 |
| ✓ | Beef Jerky | american | 120 | 116 | -3% | 15/5/4 | 9/3/7 |
| ✓ | Assamese Thali (Dal, Xaak, Rice, Fish) | indian | 480 | 465 | -3% | 28/55/16 | 37/66/7 |
| ✓ | Pesto Pasta with Chicken | italian | 580 | 563 | -3% | 35/55/24 | 48/49/18 |
| ✓ | Classic French Omelette | french | 310 | 317 | ++2% | 18/1/26 | 19/1/26 |
| ✓ | Sprouts Chaat | indian | 180 | 176 | -2% | 12/28/2 | 3/40/3 |
| ✓ | Apple & Peanut Butter | american | 280 | 286 | ++2% | 8/30/16 | 8/32/17 |
| ✓ | Hummus & Veggies | american | 200 | 197 | -2% | 8/22/10 | 6/21/11 |
| ✓ | Cottage Cheese Bowl | american | 280 | 283 | ++1% | 28/25/6 | 25/24/10 |
| ✓ | Tabbouleh with Grilled Halloumi | middle_eastern | 460 | 457 | -1% | 22/38/24 | 17/31/32 |
| ✓ | Aloo Posto (Potatoes in Poppy Seed Paste) | indian | 330 | 329 | -0% | 14/38/15 | 12/45/12 |

## Audit failures

| Meal | Error |
|---|---|
| Chicken Caesar Wrap | HTTP 555: {"error":"low_quality"} |
| Mediterranean Plate | HTTP 555: {"error":"low_quality"} |
| Protein Bar | HTTP 555: {"error":"low_quality"} |
| Falafel Wrap | HTTP 555: {"error":"low_quality"} |
| Pitha (Rice Flour Pancakes) | HTTP 555: {"error":"low_quality"} |
