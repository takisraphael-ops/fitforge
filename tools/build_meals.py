#!/usr/bin/env python3
"""Build data/meals.js — FitForge's curated Quick Add meal database.

Each entry: (name, synonyms, protein/100g, carbs/100g, fat/100g, regular_g, unit, [portion_override])
Values are editorial estimates grounded in USDA FoodData Central (FNDDS for
composite dishes, SR Legacy for single items), rounded for a UK diet.
kcal is derived in-app from macros at 4/4/9 so totals always reconcile.
Portions: small/regular/large gram weights. Default small=0.7x, large=1.35x
(rounded to 5 g) unless overridden.
"""
import json, re

M = []
def m(name, syn, p, c, f, reg, unit="serving", portions=None):
    M.append((name, syn, p, c, f, reg, unit, portions))

# ============ Breakfasts ============
m("Porridge with semi-skimmed milk", ["oatmeal", "oats"], 4.4, 13.5, 2.9, 300, "bowl")
m("Porridge with water", ["oatmeal water"], 2.4, 10.5, 1.5, 300, "bowl")
m("Protein porridge", ["proats"], 9.5, 13.0, 3.2, 320, "bowl")
m("Overnight oats", [], 5.5, 16.0, 4.0, 250, "jar")
m("Weetabix with milk (2 biscuits)", ["weetabix"], 5.0, 17.0, 2.0, 220, "bowl")
m("Cornflakes with milk", ["cereal"], 4.2, 20.0, 1.8, 220, "bowl")
m("Muesli with milk", [], 5.5, 20.0, 3.5, 230, "bowl")
m("Granola with Greek yoghurt", ["granola yogurt"], 7.5, 18.0, 6.5, 220, "bowl")
m("Greek yoghurt with honey", ["greek yogurt"], 8.0, 9.5, 4.5, 200, "bowl")
m("Full English breakfast", ["fry up", "cooked breakfast", "english fry"], 9.0, 9.0, 12.0, 450, "plate")
m("Scrambled eggs on toast (2 eggs)", ["scrambled egg toast"], 10.0, 13.0, 9.5, 200, "plate")
m("Fried egg on toast", ["egg on toast"], 9.5, 15.0, 10.0, 150, "plate")
m("Boiled eggs with toast soldiers (2 eggs)", ["dippy eggs", "eggs and soldiers"], 10.5, 14.0, 8.0, 190, "plate")
m("Three-egg omelette with cheese", ["cheese omelette", "omelet"], 13.0, 1.5, 14.5, 220, "omelette")
m("Bacon sandwich", ["bacon butty", "bacon sarnie", "bacon roll"], 12.0, 23.0, 11.0, 160, "sandwich")
m("Sausage sandwich", ["sausage butty", "sausage bap"], 10.5, 22.0, 13.0, 170, "sandwich")
m("Beans on toast", ["baked beans toast"], 6.5, 19.0, 3.0, 260, "plate")
m("Avocado on toast", ["avo toast"], 4.5, 15.0, 10.5, 180, "plate")
m("Eggs Benedict", [], 9.0, 10.0, 14.0, 260, "plate")
m("Pancakes with maple syrup", ["american pancakes"], 5.5, 34.0, 7.0, 200, "stack")
m("Crumpets with butter (2)", ["crumpet"], 5.5, 34.0, 6.5, 110, "plate")
m("Toast with jam (2 slices)", ["jam on toast"], 6.0, 42.0, 5.0, 110, "plate")
m("Toast with peanut butter (2 slices)", ["peanut butter toast"], 11.0, 33.0, 15.0, 105, "plate")
m("Croissant", [], 8.0, 45.0, 21.0, 60, "pastry", [45, 60, 90])
m("Pain au chocolat", ["chocolate croissant"], 7.5, 45.0, 22.0, 65, "pastry", [45, 65, 95])
m("Breakfast burrito", [], 9.5, 17.0, 9.0, 280, "burrito")
m("Fruit smoothie", [], 1.5, 12.5, 0.5, 300, "glass", [200, 300, 450])
m("Protein shake with milk", ["whey shake", "protein drink"], 9.0, 4.5, 1.8, 350, "shake", [250, 350, 500])
m("Berries with Greek yoghurt", ["yoghurt berries"], 6.5, 8.0, 3.5, 220, "bowl")

# ============ Sandwiches & lunch ============
m("Cheese sandwich", ["cheese sarnie"], 10.5, 24.0, 14.0, 160, "sandwich")
m("Ham sandwich", ["ham sarnie"], 11.5, 25.0, 6.5, 160, "sandwich")
m("Ham and cheese sandwich", [], 12.5, 22.0, 11.0, 170, "sandwich")
m("Chicken salad sandwich", ["chicken sandwich"], 12.0, 21.0, 6.0, 190, "sandwich")
m("Tuna mayo sandwich", ["tuna sandwich", "tuna mayonnaise"], 12.5, 20.0, 9.0, 190, "sandwich")
m("Egg mayo sandwich", ["egg mayonnaise sandwich"], 9.5, 20.0, 10.5, 180, "sandwich")
m("BLT sandwich", ["blt", "bacon lettuce tomato"], 10.0, 19.0, 10.0, 190, "sandwich")
m("Club sandwich", [], 11.0, 17.0, 9.5, 250, "sandwich")
m("Chicken wrap", ["chicken tortilla wrap"], 12.0, 18.0, 7.0, 220, "wrap")
m("Falafel and houmous wrap", ["falafel wrap"], 7.5, 22.0, 9.0, 240, "wrap")
m("Cheese toastie", ["grilled cheese", "toasted cheese sandwich"], 12.0, 25.0, 15.5, 160, "toastie")
m("Ham and cheese toastie", ["ham toastie"], 13.0, 23.0, 13.0, 170, "toastie")
m("Jacket potato with baked beans", ["jacket potato beans", "baked potato beans"], 5.0, 19.5, 0.7, 400, "potato")
m("Jacket potato with cheese", ["baked potato cheese"], 6.5, 18.5, 6.0, 380, "potato")
m("Jacket potato with tuna mayo", ["baked potato tuna"], 7.5, 17.0, 4.0, 400, "potato")
m("Tomato soup", [], 1.0, 7.0, 1.5, 300, "bowl")
m("Chicken soup", [], 3.5, 5.0, 1.5, 300, "bowl")
m("Leek and potato soup", [], 1.5, 7.5, 2.0, 300, "bowl")
m("Minestrone soup", [], 2.5, 8.0, 1.0, 300, "bowl")
m("Sausage roll", [], 9.0, 25.0, 22.0, 120, "roll", [70, 120, 160])
m("Cornish pasty", ["pasty"], 8.0, 25.0, 14.5, 250, "pasty")
m("Pork pie", [], 10.0, 23.0, 24.0, 140, "pie", [75, 140, 200])
m("Scotch egg", [], 12.0, 12.0, 16.0, 120, "egg", [60, 120, 180])
m("Quiche Lorraine slice", ["quiche"], 9.5, 17.0, 18.0, 160, "slice")
m("Caesar salad with chicken", ["chicken caesar"], 11.0, 5.0, 9.5, 320, "bowl")
m("Greek salad", [], 4.5, 4.5, 10.0, 300, "bowl")
m("Couscous salad", ["cous cous"], 4.5, 18.0, 4.5, 280, "bowl")
m("Ploughman's lunch", ["ploughmans"], 11.0, 16.0, 14.0, 350, "plate")
m("Fish finger sandwich", ["fish finger butty"], 9.0, 24.0, 8.5, 190, "sandwich")
m("Prawn mayo sandwich", ["prawn sandwich"], 10.5, 19.0, 9.0, 180, "sandwich")
m("Houmous with pitta bread", ["hummus pitta"], 7.5, 24.0, 8.5, 160, "plate")
m("Halloumi salad", [], 10.5, 4.0, 13.0, 300, "bowl")
m("Chicken and bacon pasta salad", ["pasta salad"], 9.5, 16.0, 8.0, 300, "bowl")

# ============ British dinners ============
m("Spaghetti bolognese", ["spag bol", "bolognaise", "bolognese"], 7.0, 12.5, 4.5, 450, "plate")
m("Lasagne", ["lasagna"], 8.0, 11.0, 7.5, 400, "plate")
m("Cottage pie", [], 6.5, 10.0, 5.5, 450, "plate")
m("Shepherd's pie", ["shepherds pie"], 6.5, 10.0, 6.0, 450, "plate")
m("Fish and chips", ["chippy tea", "fish n chips", "fish supper"], 8.5, 17.5, 11.5, 450, "portion")
m("Bangers and mash with gravy", ["sausage and mash", "bangers"], 7.0, 12.0, 9.5, 450, "plate")
m("Roast chicken dinner", ["sunday roast chicken", "roast dinner"], 11.0, 10.5, 6.0, 500, "plate")
m("Roast beef dinner with Yorkshire pudding", ["sunday roast beef", "roast beef"], 11.5, 11.0, 6.5, 500, "plate")
m("Roast lamb dinner", ["sunday roast lamb"], 10.5, 10.0, 8.5, 500, "plate")
m("Toad in the hole", [], 8.0, 15.0, 11.0, 350, "plate")
m("Steak and chips", ["steak frites"], 14.5, 13.0, 9.0, 450, "plate")
m("Beef stew with dumplings", ["beef casserole"], 8.0, 9.5, 6.0, 450, "bowl")
m("Chilli con carne with rice", ["chilli", "chili con carne"], 8.0, 14.5, 4.5, 450, "plate")
m("Chicken casserole", [], 9.5, 7.5, 4.5, 450, "bowl")
m("Fish pie", [], 8.0, 10.0, 5.5, 400, "portion")
m("Gammon, egg and chips", ["gammon and chips"], 13.5, 12.0, 10.5, 450, "plate")
m("Sausage casserole", [], 7.0, 9.0, 8.5, 450, "bowl")
m("Macaroni cheese", ["mac and cheese", "mac n cheese"], 8.0, 17.0, 8.5, 350, "bowl")
m("Cauliflower cheese", [], 5.5, 6.0, 7.0, 300, "portion")
m("Steak pie with mash", ["pie and mash"], 8.5, 14.5, 10.0, 450, "plate")
m("Chicken Kiev with potatoes", ["chicken kiev"], 12.0, 12.0, 11.0, 400, "plate")
m("Liver and onions with mash", ["liver and onions"], 12.0, 10.5, 6.5, 400, "plate")
m("Corned beef hash", [], 9.0, 11.0, 8.0, 400, "plate")
m("Bubble and squeak", [], 3.0, 12.0, 5.0, 300, "portion")
m("Cheese and onion pie", [], 7.5, 18.0, 13.0, 300, "slice")
m("Beef Wellington", [], 12.0, 12.5, 15.0, 350, "portion")
m("Hunter's chicken with chips", ["hunters chicken"], 13.0, 12.0, 9.0, 450, "plate")
m("Mixed grill", [], 15.0, 6.0, 12.0, 500, "plate")

# ============ Curries & South Asian ============
m("Chicken tikka masala with rice", ["tikka masala", "ctm"], 8.5, 14.0, 6.5, 500, "plate")
m("Chicken korma with rice", ["korma"], 8.0, 14.5, 8.5, 500, "plate")
m("Chicken jalfrezi with rice", ["jalfrezi"], 9.0, 13.5, 5.0, 500, "plate")
m("Lamb rogan josh with rice", ["rogan josh"], 9.0, 13.0, 7.0, 500, "plate")
m("Beef madras with rice", ["madras"], 9.0, 13.0, 6.5, 500, "plate")
m("Chicken bhuna with rice", ["bhuna"], 9.5, 13.0, 6.0, 500, "plate")
m("Vegetable curry with rice", ["veg curry"], 3.5, 15.5, 4.5, 500, "plate")
m("Dhal with rice", ["dal", "daal", "lentil curry"], 5.5, 17.0, 3.5, 450, "plate")
m("Prawn curry with rice", [], 7.0, 14.0, 4.5, 480, "plate")
m("Chicken katsu curry", ["katsu"], 8.5, 17.5, 6.0, 480, "plate")
m("Saag paneer with rice", ["palak paneer"], 6.5, 12.0, 8.0, 450, "plate")
m("Chicken biryani", ["biryani"], 8.5, 17.0, 5.5, 450, "plate")
m("Onion bhaji (2)", ["bhaji"], 4.5, 20.0, 12.0, 120, "portion")
m("Vegetable samosa (2)", ["samosa"], 4.5, 26.0, 12.5, 130, "portion")
m("Naan bread", ["naan"], 8.0, 47.0, 8.0, 130, "naan", [70, 130, 180])
m("Pilau rice", ["pilaf rice"], 3.0, 26.0, 3.5, 250, "portion")

# ============ East & Southeast Asian ============
m("Thai green curry with rice", ["green curry"], 6.5, 14.5, 7.0, 480, "plate")
m("Thai red curry with rice", ["red curry"], 6.5, 14.5, 7.0, 480, "plate")
m("Pad thai", [], 8.0, 18.5, 7.5, 400, "plate")
m("Chicken chow mein", ["chow mein"], 8.5, 14.0, 5.0, 400, "plate")
m("Sweet and sour chicken with rice", ["sweet and sour"], 7.0, 20.0, 4.5, 480, "plate")
m("Egg fried rice", [], 5.5, 24.0, 5.5, 300, "portion")
m("Special fried rice", [], 7.5, 22.0, 6.0, 350, "plate")
m("Beef in black bean sauce with rice", ["black bean beef"], 8.5, 15.0, 5.0, 480, "plate")
m("Chicken ramen", ["ramen"], 6.5, 12.0, 4.0, 550, "bowl")
m("Chicken satay skewers", ["satay"], 15.0, 5.0, 10.0, 180, "portion")
m("Sushi selection (8 pieces)", ["sushi"], 6.0, 25.0, 2.5, 260, "box")
m("Singapore noodles", [], 7.5, 16.0, 6.0, 400, "plate")
m("Crispy duck pancakes (4)", ["duck pancakes"], 11.0, 18.0, 10.5, 240, "portion")
m("Chicken teriyaki with rice", ["teriyaki"], 9.5, 18.0, 3.5, 450, "plate")
m("Chicken katsu sando", ["katsu sandwich"], 10.5, 22.0, 9.0, 220, "sandwich")
m("Vegetable stir fry with noodles", ["stir fry"], 5.0, 13.5, 4.5, 400, "plate")
m("Tofu stir fry with rice", ["tofu rice"], 6.5, 14.0, 5.0, 450, "plate")
m("Prawn tempura", [], 8.0, 15.0, 9.5, 180, "portion")

# ============ Italian & pizza ============
m("Margherita pizza", ["cheese pizza", "margarita pizza"], 10.5, 30.0, 8.5, 300, "pizza", [150, 300, 450])
m("Pepperoni pizza", [], 11.5, 28.0, 11.5, 300, "pizza", [150, 300, 450])
m("Ham and pineapple pizza", ["hawaiian pizza"], 10.5, 29.0, 8.0, 300, "pizza", [150, 300, 450])
m("Spaghetti carbonara", ["carbonara"], 9.0, 16.0, 9.5, 400, "plate")
m("Penne arrabbiata", ["arrabiata"], 5.5, 19.0, 3.5, 400, "plate")
m("Pasta with pesto", ["pesto pasta"], 6.5, 20.0, 9.0, 380, "plate")
m("Tuna pasta bake", [], 8.5, 16.5, 5.5, 400, "portion")
m("Spaghetti with meatballs", ["meatballs pasta"], 8.5, 15.0, 6.5, 450, "plate")
m("Mushroom risotto", ["risotto"], 4.5, 17.0, 5.0, 400, "plate")
m("Gnocchi with tomato sauce", ["gnocchi"], 4.0, 22.0, 3.5, 380, "plate")
m("Spinach and ricotta ravioli", ["ravioli"], 7.0, 20.0, 7.0, 350, "plate")
m("Garlic bread (3 slices)", ["garlic baguette"], 7.0, 41.0, 14.0, 120, "portion")
m("Bruschetta", [], 5.0, 26.0, 6.5, 150, "portion")

# ============ Fast food & takeaway ============
m("Beef burger with fries", ["burger and chips", "hamburger meal"], 9.5, 19.0, 11.0, 400, "meal")
m("Cheeseburger", [], 13.0, 22.0, 12.5, 220, "burger")
m("Double cheeseburger", [], 14.5, 18.0, 14.5, 280, "burger")
m("Chicken burger", ["chicken sandwich burger"], 12.0, 21.0, 9.5, 230, "burger")
m("Doner kebab", ["donner kebab", "kebab"], 11.0, 15.0, 12.5, 400, "kebab")
m("Chicken shish kebab wrap", ["shish kebab", "chicken kebab"], 13.0, 15.5, 6.0, 380, "wrap")
m("Fried chicken (2 pieces) with chips", ["kfc", "fried chicken chips"], 12.5, 16.0, 12.5, 400, "meal")
m("Chicken nuggets (6) with chips", ["nuggets and chips"], 9.5, 20.0, 11.5, 330, "meal")
m("Chips (chip shop portion)", ["chippy chips"], 3.2, 30.0, 9.0, 300, "portion")
m("Chips with curry sauce", ["curry chips"], 3.0, 27.0, 8.5, 380, "portion")
m("Hot dog", [], 9.5, 20.0, 12.5, 180, "hot dog")
m("Burrito with chicken and rice", ["burrito"], 9.0, 17.0, 6.5, 450, "burrito")
m("Doner meat and chips", [], 10.0, 18.0, 14.0, 400, "portion")
m("Southern fried chicken wrap", [], 11.0, 19.5, 9.0, 280, "wrap")
m("Loaded nachos with cheese", ["nachos"], 7.0, 22.0, 12.0, 350, "portion")
m("Peri peri chicken with rice", ["nandos", "peri chicken"], 14.0, 13.5, 5.5, 450, "plate")
m("Chicken wings (6)", ["wings"], 17.0, 3.0, 13.5, 300, "portion")

# ============ Protein-focused / gym staples ============
m("Chicken breast with rice and broccoli", ["chicken rice broccoli", "chicken and rice"], 13.5, 15.0, 2.0, 450, "plate")
m("Salmon fillet with new potatoes", ["salmon potatoes"], 12.0, 9.5, 7.0, 400, "plate")
m("Tuna steak with vegetables", ["tuna steak"], 15.0, 5.5, 2.5, 380, "plate")
m("Beef mince with rice (5% fat)", ["mince and rice", "lean mince rice"], 12.0, 16.0, 3.0, 450, "plate")
m("Turkey mince pasta", ["turkey pasta"], 11.5, 16.5, 3.5, 450, "plate")
m("Baked cod with vegetables", ["cod and veg", "white fish veg"], 12.5, 5.5, 1.5, 400, "plate")
m("Prawns with noodles", ["prawn noodles"], 9.0, 15.0, 3.0, 400, "plate")
m("Steak with sweet potato", ["steak sweet potato"], 14.0, 11.0, 6.5, 420, "plate")
m("Cottage cheese bowl", ["cottage cheese"], 11.0, 4.0, 4.0, 250, "bowl")
m("Chicken and vegetable skewers", ["chicken skewers"], 16.0, 5.0, 4.0, 300, "portion")
m("Quorn chilli with rice", ["quorn"], 7.0, 15.5, 2.5, 450, "plate")
m("Turkey breast with potatoes and veg", ["turkey dinner"], 13.0, 10.5, 2.5, 450, "plate")
m("Egg white omelette with spinach", ["egg white omelette"], 11.5, 1.5, 3.0, 220, "omelette")
m("Tuna and rice bowl", ["tuna rice"], 12.5, 17.0, 2.0, 380, "bowl")
m("Chicken fajitas (2)", ["fajitas"], 11.0, 15.0, 6.0, 380, "portion")
m("Poke bowl with salmon", ["poke"], 9.0, 15.5, 5.0, 400, "bowl")

# ============ Snacks, fruit & desserts ============
m("Banana", [], 1.1, 20.0, 0.3, 118, "banana", [80, 118, 150])
m("Apple", [], 0.3, 12.0, 0.2, 180, "apple", [130, 180, 240])
m("Orange", [], 0.9, 9.5, 0.1, 150, "orange", [100, 150, 200])
m("Grapes", [], 0.6, 16.0, 0.2, 150, "handful", [80, 150, 250])
m("Blueberries", [], 0.7, 12.0, 0.3, 120, "punnet", [60, 120, 200])
m("Crisps (single bag)", ["walkers", "packet of crisps", "potato chips"], 6.0, 50.0, 30.0, 32, "bag", [25, 32, 50])
m("Chocolate bar", ["dairy milk", "chocolate"], 7.0, 56.0, 30.0, 45, "bar", [30, 45, 65])
m("Digestive biscuits (2)", ["digestives", "biscuits"], 6.5, 62.0, 21.0, 30, "portion", [15, 30, 60])
m("Flapjack", [], 5.5, 55.0, 22.0, 75, "flapjack", [50, 75, 110])
m("Cereal bar", ["granola bar"], 6.5, 60.0, 14.0, 35, "bar", [25, 35, 50])
m("Mixed nuts (handful)", ["nuts"], 17.5, 12.0, 50.0, 30, "handful", [15, 30, 50])
m("Peanut butter on rice cakes (2)", ["rice cakes"], 10.0, 45.0, 18.0, 45, "portion")
m("Protein bar", [], 30.0, 32.0, 10.0, 60, "bar", [45, 60, 80])
m("Boiled egg", ["hard boiled egg"], 12.6, 0.7, 9.5, 50, "egg", [50, 100, 150])
m("Cheese and crackers", [], 12.0, 32.0, 22.0, 80, "portion")
m("Popcorn (sweet and salty)", ["popcorn"], 7.0, 60.0, 20.0, 40, "bag", [25, 40, 70])
m("Ice cream (2 scoops)", ["vanilla ice cream"], 3.5, 24.0, 11.0, 130, "portion", [65, 130, 200])
m("Apple crumble with custard", ["crumble"], 3.0, 30.0, 8.0, 220, "portion")
m("Sticky toffee pudding with custard", ["sticky toffee"], 3.5, 38.0, 11.0, 200, "portion")
m("Victoria sponge slice", ["victoria sponge", "sponge cake"], 4.5, 45.0, 16.0, 90, "slice")
m("Chocolate brownie", ["brownie"], 5.0, 48.0, 22.0, 70, "brownie", [45, 70, 110])
m("Jam doughnut", ["donut", "doughnut"], 5.5, 45.0, 14.0, 75, "doughnut", [55, 75, 110])
m("Blueberry muffin", ["muffin"], 5.0, 45.0, 17.0, 100, "muffin", [65, 100, 130])
m("Scone with jam and clotted cream", ["cream tea", "scone"], 5.0, 45.0, 15.0, 130, "scone")
m("Cheesecake slice", ["cheesecake"], 5.5, 26.0, 22.0, 120, "slice")
m("Trifle", [], 3.0, 22.0, 8.0, 180, "portion")
m("Rice pudding", [], 3.5, 17.0, 3.0, 200, "bowl")
m("Malt loaf slice with butter", ["malt loaf"], 6.0, 55.0, 8.0, 50, "slice", [35, 50, 90])
m("Hot cross bun with butter", ["hot cross bun"], 7.0, 50.0, 10.0, 80, "bun")
m("Mince pie", [], 3.5, 55.0, 15.0, 60, "pie", [55, 60, 120])

# ============ Drinks ============
m("Semi-skimmed milk (glass)", ["milk"], 3.5, 4.8, 1.8, 250, "glass", [150, 250, 400])
m("Orange juice (glass)", ["oj", "orange juice"], 0.7, 9.5, 0.2, 250, "glass", [150, 250, 400])
m("Latte (semi-skimmed)", ["coffee latte"], 3.2, 4.5, 1.7, 260, "mug", [180, 260, 400])
m("Cappuccino", [], 3.0, 4.0, 1.6, 220, "mug", [160, 220, 350])
m("Flat white", [], 3.3, 4.6, 1.8, 200, "cup", [150, 200, 300])
m("Hot chocolate", [], 3.0, 12.0, 3.0, 260, "mug", [180, 260, 400])
m("Cola (can)", ["coke", "fizzy drink"], 0.0, 10.6, 0.0, 330, "can", [150, 330, 500])
m("Beer (pint of lager)", ["lager", "pint"], 0.3, 3.5, 0.0, 568, "pint", [284, 568, 1136])
m("Red wine (glass)", ["wine"], 0.1, 2.6, 0.0, 175, "glass", [125, 175, 250])
m("Milkshake", [], 3.3, 15.0, 3.5, 350, "glass", [250, 350, 500])

# NOTE on alcohol: beer/wine kcal from 4/4/9 macros understates true kcal
# (alcohol is 7 kcal/g and isn't a macro). We add an "alcohol kcal" fudge via
# extra carbs equivalent is WRONG; instead these two entries carry an `xk`
# (extra kcal per 100g) field handled by the app so the food room stays honest.
ALCOHOL_XK = {"Beer (pint of lager)": 26, "Red wine (glass)": 60}

def slug(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s

def round5(x):
    return max(5, int(round(x / 5.0) * 5))

out = []
seen = set()
for (name, syn, p, c, f, reg, unit, portions) in M:
    sid = slug(name)
    assert sid not in seen, f"duplicate id {sid}"
    seen.add(sid)
    if portions is None:
        portions = [round5(reg * 0.7), int(reg), round5(reg * 1.35)]
    entry = {
        "id": sid, "name": name,
        "p": p, "c": c, "f": f,          # per 100 g
        "g": portions,                    # small / regular / large grams
        "unit": unit
    }
    if syn: entry["syn"] = syn
    if name in ALCOHOL_XK: entry["xk"] = ALCOHOL_XK[name]
    out.append(entry)

js = "// FitForge Quick Add meal database — curated UK meals.\n"
js += "// Macros per 100 g; kcal derived in-app at 4/4/9 so totals reconcile.\n"
js += "// Values are editorial estimates grounded in USDA FoodData Central\n"
js += "// (FNDDS composite dishes / SR Legacy items). All figures are approximate.\n"
js += "window.MEALS_DB = " + json.dumps(out, separators=(",", ":")) + ";\n"
open("data/meals.js", "w").write(js)

kcals = [round((4*(e["p"]+e["c"]) + 9*e["f"]) * e["g"][1] / 100) + e.get("xk", 0) * e["g"][1] / 100 for e in out]
print(f"{len(out)} meals, {len(js)/1024:.1f} KB")
print(f"regular-portion kcal range: {min(kcals):.0f} – {max(kcals):.0f}")
import statistics; print(f"median {statistics.median(kcals):.0f} kcal")
