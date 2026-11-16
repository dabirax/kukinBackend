const CATEGORY_CLOSING: Record<string, string> = {
  "Health News":
    "Health news is a starting point, not a prescription. If a headline sounds too good to be true, check the original source and speak with a qualified professional before changing treatment.",
  Nutrition:
    "Nutrition advice works best when it fits your budget, culture and routine. Small, consistent choices beat short bursts of perfection.",
  Recipes:
    "Taste as you cook and adjust seasoning before adding more salt or oil. Cool leftovers promptly and refrigerate them within two hours.",
  "Food Safety":
    "When in doubt, throw it out. Clean hands, clean surfaces and safe temperatures prevent most food-borne illness.",
  "Myths & Facts":
    "A single food rarely makes or breaks a diet. Look at the whole pattern of what you eat across the week.",
};

const CATEGORY_SOURCES: Record<string, { label: string; url: string }[]> = {
  "Health News": [
    {
      label: "WHO - Healthy diet",
      url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    },
    {
      label: "NIH - Health information",
      url: "https://www.nih.gov/health-information",
    },
  ],
  Nutrition: [
    {
      label: "Harvard - The Nutrition Source",
      url: "https://nutritionsource.hsph.harvard.edu/",
    },
    {
      label: "FAO - Nutrition",
      url: "https://www.fao.org/nutrition/en",
    },
  ],
  Recipes: [
    {
      label: "WHO - Healthy diet",
      url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    },
    {
      label: "FAO - Nutrition",
      url: "https://www.fao.org/nutrition/en",
    },
  ],
  "Food Safety": [
    {
      label: "WHO - Food safety",
      url: "https://www.who.int/news-room/fact-sheets/detail/food-safety",
    },
    {
      label: "CDC - Food safety",
      url: "https://www.cdc.gov/food-safety/about/index.html",
    },
  ],
  "Myths & Facts": [
    {
      label: "Harvard - The Nutrition Source",
      url: "https://nutritionsource.hsph.harvard.edu/",
    },
    {
      label: "NHS - Eat well",
      url: "https://www.nhs.uk/live-well/eat-well/",
    },
  ],
};

type SeedInput = {
  title: string;
  category: string;
  excerpt: string;
  focus: string;
  tags: string[];
  image: string;
  featured?: boolean;
};

const ARTICLES: SeedInput[] = [
  {
    title: "Why Fibre Deserves a Place on Every Nigerian Plate",
    category: "Health News",
    excerpt:
      "Beans, vegetables, fruit and whole grains do more than fill the plate. They feed the gut and steady blood sugar through the day.",
    focus:
      "Fibre supports digestion, helps control cholesterol and keeps hunger in check. Adding one extra serving of vegetables or beans to a familiar meal is often easier than rebuilding the whole plate.",
    tags: ["fibre", "gut health", "beans", "vegetables"],
    image: "suya.jpg",
  },
  {
    title: "New WHO Guidance Puts Less Salt Within Reach",
    category: "Health News",
    excerpt:
      "Most of the salt we eat hides in seasoning cubes, processed snacks and restaurant food. Small swaps can make a measurable difference.",
    focus:
      "The World Health Organization recommends less than five grams of salt a day for adults. Cooking with garlic, ginger, chilli and herbs lets you reduce cubes without losing flavour.",
    tags: ["salt", "blood pressure", "seasoning", "who"],
    image: "jollofRice.jpg",
  },
  {
    title: "How Sleep and Blood Sugar Are More Connected Than You Think",
    category: "Health News",
    excerpt:
      "Late nights and short sleep can change appetite hormones and make sweet cravings harder to resist the next day.",
    focus:
      "Adults who consistently sleep less than six hours may notice poorer glucose control. A regular bedtime and a lighter evening meal are practical first steps.",
    tags: ["sleep", "blood sugar", "wellness", "lifestyle"],
    image: "okra.jpg",
  },
  {
    title: "Nigeria's Food Inflation Is Changing What Families Eat",
    category: "Health News",
    excerpt:
      "Rising prices are pushing households toward cheaper staples. Nutrition experts say planning and smart substitutions can protect meal quality.",
    focus:
      "Beans, eggs, leafy greens, sardines and local grains remain affordable sources of protein and micronutrients. Buying in bulk and cooking at home reduces the cost per plate.",
    tags: ["food prices", "budget", "nutrition", "families"],
    image: "friedRice.jpg",
  },
  {
    title: "The Case for Walking After Meals",
    category: "Health News",
    excerpt:
      "A ten-minute walk after eating may help blood sugar settle and support digestion, especially after a starchy meal.",
    focus:
      "Light movement after meals is low-risk and easy to build into the day. Start with a short walk around the compound and increase gradually.",
    tags: ["walking", "blood sugar", "exercise", "digestion"],
    image: "boli.jpg",
  },
  {
    title: "What the Latest Hypertension Data Means for Young Adults",
    category: "Health News",
    excerpt:
      "High blood pressure is increasingly common in people under forty. Many do not know they have it because symptoms are rare.",
    focus:
      "Regular checks, less salt and more movement are the foundation of prevention. Young adults with a family history should start monitoring earlier.",
    tags: ["hypertension", "young adults", "blood pressure", "screening"],
    image: "tuwo.jpg",
  },
  {
    title: "Five Health Checks Worth Booking This Year",
    category: "Health News",
    excerpt:
      "Blood pressure, blood sugar, eye checks, dental visits and routine screening can catch problems while they are still easy to manage.",
    focus:
      "Preventive checks are most useful when they are repeated consistently. Keep a simple record of results so changes over time are easier to spot.",
    tags: ["prevention", "screening", "health checks", "wellness"],
    image: "moimoi.jpg",
  },
  {
    title: "How Community Markets Support Better Nutrition",
    category: "Health News",
    excerpt:
      "Local markets give families access to seasonal produce, fresher ingredients and lower prices than many packaged alternatives.",
    focus:
      "Shopping seasonally is both cheaper and more nutritious. Market vendors can also tell you which produce arrived most recently.",
    tags: ["markets", "seasonal food", "community", "nutrition"],
    image: "cocoRice.jpg",
  },
  {
    title: "A Practical Guide to Building a Balanced Nigerian Meal",
    category: "Nutrition",
    excerpt:
      "A balanced plate does not require imported ingredients. Combine a staple, a protein, vegetables and a little healthy fat.",
    focus:
      "Think of the plate in three parts: energy foods, body-building foods and protective foods. Water is the default drink, and fruit can close the meal.",
    tags: ["balanced diet", "meal planning", "staples", "vegetables"],
    image: "egusi.jpg",
    featured: true,
  },
  {
    title: "Protein on a Budget: Beans, Fish and Eggs",
    category: "Nutrition",
    excerpt:
      "You do not need expensive cuts of meat to meet your protein needs. Beans, eggs, sardines and local fish are affordable and versatile.",
    focus:
      "Combine plant and animal proteins across the week for variety. Soaking beans and buying fish in season lowers cost without lowering quality.",
    tags: ["protein", "beans", "eggs", "budget"],
    image: "akara.jpg",
  },
  {
    title: "Understanding Healthy Fats in Palm Oil and Groundnut Oil",
    category: "Nutrition",
    excerpt:
      "Fats are essential, but type and quantity matter. Local oils can fit a healthy diet when used thoughtfully.",
    focus:
      "Palm oil is rich in vitamin A precursors, while groundnut oil provides unsaturated fats. Measure oil with a spoon instead of pouring freely.",
    tags: ["fats", "palm oil", "groundnut oil", "cooking"],
    image: "efoRiro.jpg",
  },
  {
    title: "Why Iron-Rich Foods Matter for Women and Children",
    category: "Nutrition",
    excerpt:
      "Iron supports energy and healthy blood. Pairing iron-rich foods with vitamin C helps the body absorb more of it.",
    focus:
      "Liver, beef, fish, beans, leafy greens and fortified cereals are useful sources. Tea and coffee close to meals can reduce absorption.",
    tags: ["iron", "women", "children", "anaemia"],
    image: "kilishi.jpg",
  },
  {
    title: "How to Read a Nutrition Label Without Getting Lost",
    category: "Nutrition",
    excerpt:
      "Serving size, total sugar, salt and fat are the numbers that matter most. Start at the top and work down.",
    focus:
      "Compare products using the same serving size. A shorter ingredient list is not automatically healthier, but it is often easier to understand.",
    tags: ["food labels", "sugar", "salt", "shopping"],
    image: "ofadaRice.jpg",
  },
  {
    title: "The Role of Vitamin A in Vision and Immunity",
    category: "Nutrition",
    excerpt:
      "Vitamin A supports eyesight and immune function. Orange vegetables, leafy greens, eggs and liver are reliable sources.",
    focus:
      "Adding a little fat to vitamin A-rich vegetables improves absorption. Deficiency is most concerning for young children and pregnant women.",
    tags: ["vitamin a", "vision", "immunity", "vegetables"],
    image: "afang.jpg",
  },
  {
    title: "Hydration Beyond Water: Foods That Keep You Cool",
    category: "Nutrition",
    excerpt:
      "Watermelon, cucumber, oranges and soups all contribute to fluid intake. Food can supply a meaningful share of daily hydration.",
    focus:
      "Plain water should still be the main drink. During hot weather or illness, sip regularly rather than waiting until you feel thirsty.",
    tags: ["hydration", "water", "fruit", "heat"],
    image: "puffPuff.jpg",
  },
  {
    title: "Portion Sizes: A Simple Handy Guide",
    category: "Nutrition",
    excerpt:
      "You do not need a scale at every meal. Your palm, fist, cupped hand and thumb can guide sensible portions.",
    focus:
      "Portion needs vary with age, activity and health goals. Serve vegetables first and keep serving dishes away from the table to make second helpings more deliberate.",
    tags: ["portion size", "meal planning", "healthy eating", "habits"],
    image: "amala.jpg",
  },
  {
    title: "Smoky Jollof Rice with Less Oil",
    category: "Recipes",
    excerpt:
      "A rich, smoky jollof is possible with less oil. Roast the pepper base first and let the rice finish over low heat.",
    focus:
      "Use a measured amount of oil, brown the tomato mixture properly and add vegetables for colour and fibre. A tight lid and low heat create the smoky finish.",
    tags: ["jollof rice", "rice", "less oil", "nigerian food"],
    image: "jollofRice.jpg",
    featured: true,
  },
  {
    title: "Egusi Soup with Spinach and Grilled Fish",
    category: "Recipes",
    excerpt:
      "This egusi variation pairs melon seeds with dark leafy greens and grilled fish for a lighter, protein-rich soup.",
    focus:
      "Grind the melon seeds coarsely for texture and add spinach at the end so it keeps its colour. Grilled fish adds flavour without deep frying.",
    tags: ["egusi", "spinach", "fish", "soup"],
    image: "egusi.jpg",
  },
  {
    title: "Quick Okra Soup for Busy Weeknights",
    category: "Recipes",
    excerpt:
      "Fresh okra cooks in minutes. A simple pepper base and a little fish make a satisfying soup without a long simmer.",
    focus:
      "Grate or chop the okra just before cooking to keep its texture. Add it late and stir briefly so the soup stays bright and tender.",
    tags: ["okra", "soup", "quick meals", "weeknight"],
    image: "okra.jpg",
  },
  {
    title: "Oven-Baked Suya Skewers",
    category: "Recipes",
    excerpt:
      "You can enjoy suya flavour without a grill. A spiced peanut rub and a hot oven produce tender skewers with less smoke.",
    focus:
      "Slice beef thinly and coat it evenly with the spice mix. Rest the skewers briefly before serving so the juices stay in the meat.",
    tags: ["suya", "beef", "oven baked", "skewers"],
    image: "suya.jpg",
  },
  {
    title: "Coconut Rice with Garden Vegetables",
    category: "Recipes",
    excerpt:
      "Coconut milk gives rice a gentle sweetness. Carrots, peas and peppers turn it into a colourful one-pot meal.",
    focus:
      "Use light coconut milk and measure it carefully so the rice does not become heavy. Add vegetables near the end to keep them crisp.",
    tags: ["coconut rice", "vegetables", "one pot", "rice"],
    image: "cocoRice.jpg",
  },
  {
    title: "Soft Puff-Puff with Whole Wheat Flour",
    category: "Recipes",
    excerpt:
      "Whole wheat flour adds fibre to a favourite snack. A slow prove gives puff-puff a light, airy centre.",
    focus:
      "Mix half whole wheat and half plain flour for a good balance of texture and fibre. Keep the oil at a steady moderate heat so the centres cook through.",
    tags: ["puff-puff", "whole wheat", "snack", "baking"],
    image: "puffPuff.jpg",
  },
  {
    title: "Efo Riro with Lean Chicken",
    category: "Recipes",
    excerpt:
      "Efo riro is a rich spinach stew. Using lean chicken and a measured amount of palm oil keeps it hearty without being heavy.",
    focus:
      "Squeeze excess water from the spinach before folding it into the pepper base. Simmer briefly so the greens stay vibrant.",
    tags: ["efo riro", "spinach", "chicken", "stew"],
    image: "efoRiro.jpg",
  },
  {
    title: "Ofada Rice and Pepper Sauce, Lightened Up",
    category: "Recipes",
    excerpt:
      "Ofada rice has a nutty aroma that pairs well with a smoky pepper sauce. Less oil and more peppers keep the sauce balanced.",
    focus:
      "Rinse the rice well and cook it until just tender. Blend the sauce smoothly and simmer it down before adding a small amount of oil.",
    tags: ["ofada rice", "pepper sauce", "local rice", "stew"],
    image: "ofadaRice.jpg",
  },
  {
    title: "How to Store Leftover Rice Safely",
    category: "Food Safety",
    excerpt:
      "Cooked rice can support harmful bacteria if it sits at room temperature. Cool it quickly and refrigerate it promptly.",
    focus:
      "Spread rice in a shallow container so it cools faster, then refrigerate within two hours. Reheat thoroughly and do not keep leftover rice for more than a day.",
    tags: ["rice", "leftovers", "storage", "food safety"],
    image: "friedRice.jpg",
  },
  {
    title: "Market Meat: Signs That Say Do Not Buy",
    category: "Food Safety",
    excerpt:
      "Colour, smell and texture tell you a lot about freshness. Trust your senses and buy from vendors with clean handling practices.",
    focus:
      "Fresh meat should feel firm, not sticky, and should not have a sour smell. Keep raw meat separate from other purchases and cook it thoroughly.",
    tags: ["meat", "market", "freshness", "food safety"],
    image: "nkwobi.jpg",
  },
  {
    title: "Washing Vegetables the Right Way",
    category: "Food Safety",
    excerpt:
      "Rinsing under running water removes soil and some surface germs. Soap is not needed and can leave residue.",
    focus:
      "Separate leaves and wash them in several changes of clean water. Peeled or cooked vegetables carry a lower risk than those eaten raw.",
    tags: ["vegetables", "washing", "hygiene", "food safety"],
    image: "okra.jpg",
  },
  {
    title: "Why Room-Temperature Beans Turn Sour",
    category: "Food Safety",
    excerpt:
      "Cooked beans left out for hours can ferment and spoil. Warm kitchens speed up the process.",
    focus:
      "Refrigerate cooked beans within two hours and reheat only the portion you plan to eat. Look for bubbles, a sour smell or sliminess before using leftovers.",
    tags: ["beans", "spoilage", "leftovers", "storage"],
    image: "moimoi.jpg",
  },
  {
    title: "Reheating Food: What Is Safe and What Is Not",
    category: "Food Safety",
    excerpt:
      "Most leftovers can be reheated once if they were stored safely. Some foods lose quality or become risky when reheated repeatedly.",
    focus:
      "Reheat to steaming hot all the way through, not just at the edges. Avoid reheating rice, seafood or meat more than once.",
    tags: ["reheating", "leftovers", "temperature", "food safety"],
    image: "egusi.jpg",
  },
  {
    title: "Keeping Food Safe During Power Outages",
    category: "Food Safety",
    excerpt:
      "Frequent outages make refrigeration harder. A few simple habits protect food and reduce waste.",
    focus:
      "Keep freezer doors closed and group items together to hold the cold. Discard food that has been above safe temperatures for too long.",
    tags: ["power outage", "refrigeration", "storage", "food safety"],
    image: "asun.jpg",
  },
  {
    title: "Street Food Safety: Questions Worth Asking",
    category: "Food Safety",
    excerpt:
      "Street food is part of everyday life. Observing how food is stored, handled and served helps you choose safer vendors.",
    focus:
      "Look for clean hands, covered food and hot serving temperatures. Avoid food that has been sitting uncovered in the sun for long periods.",
    tags: ["street food", "hygiene", "vendors", "food safety"],
    image: "suya.jpg",
  },
  {
    title: "Cross-Contamination in Small Kitchens",
    category: "Food Safety",
    excerpt:
      "One cutting board can spread bacteria from raw meat to salad. Separate tools and wash them between tasks.",
    focus:
      "Use separate boards for raw meat and ready-to-eat food where possible. Wash hands, knives and surfaces with soap and clean water after handling raw meat.",
    tags: ["cross-contamination", "kitchen", "hygiene", "food safety"],
    image: "iyan.jpg",
  },
  {
    title: "Does Eating Late at Night Cause Weight Gain?",
    category: "Myths & Facts",
    excerpt:
      "Total food intake and activity matter more than the clock. Late meals are not automatically fattening.",
    focus:
      "A late meal can still fit a healthy pattern if it is balanced and does not push total intake too high. Heavy meals close to bedtime may disrupt sleep for some people.",
    tags: ["late eating", "weight", "myth", "meal timing"],
    image: "boli.jpg",
  },
  {
    title: "Is Palm Oil Always Bad for You?",
    category: "Myths & Facts",
    excerpt:
      "Palm oil is high in saturated fat, but it is not toxic. The amount and the rest of your diet matter most.",
    focus:
      "Used in moderation, palm oil can be part of traditional cooking. Mixing it with other oils and measuring portions helps keep saturated fat in check.",
    tags: ["palm oil", "saturated fat", "myth", "cooking"],
    image: "efoRiro.jpg",
  },
  {
    title: "Can Hot Peppers Damage Your Stomach?",
    category: "Myths & Facts",
    excerpt:
      "Chilli can cause discomfort for some people, but it does not create stomach ulcers on its own.",
    focus:
      "Peppers may worsen symptoms in people with reflux or irritable bowel syndrome. If a food consistently causes pain, reduce it and speak to a clinician.",
    tags: ["pepper", "stomach", "ulcers", "myth"],
    image: "asun.jpg",
  },
  {
    title: "Do Detox Teas Clean Your Liver?",
    category: "Myths & Facts",
    excerpt:
      "The liver detoxifies the body on its own. Teas marketed as detox products rarely do what their labels promise.",
    focus:
      "Some herbal products can interact with medicines or cause digestive upset. Focus on sleep, water, vegetables and less alcohol instead of expensive detox products.",
    tags: ["detox", "liver", "teas", "myth"],
    image: "fufu.jpg",
  },
  {
    title: "Is Brown Bread Always Healthier?",
    category: "Myths & Facts",
    excerpt:
      "Colour alone does not prove a bread is whole grain. Check the ingredient list for whole wheat or whole grain flour.",
    focus:
      "Some brown breads are white bread with colouring or caramel. Fibre content on the label is a better guide than appearance.",
    tags: ["bread", "whole grain", "fibre", "myth"],
    image: "ofadaRice.jpg",
  },
  {
    title: "Does Drinking Water With Meals Dilute Digestion?",
    category: "Myths & Facts",
    excerpt:
      "Water does not wash away digestive juices or stop digestion. It can actually help with swallowing and fullness.",
    focus:
      "Most people can drink water with meals comfortably. People with specific digestive conditions should follow individual advice from their clinician.",
    tags: ["water", "digestion", "myth", "hydration"],
    image: "amala.jpg",
  },
  {
    title: "Are Eggs Bad for Cholesterol?",
    category: "Myths & Facts",
    excerpt:
      "For most people, dietary cholesterol from eggs has a modest effect on blood cholesterol compared with saturated fat.",
    focus:
      "Eggs are a convenient source of protein and nutrients. The bigger cholesterol concerns are often fried foods, processed meat and excess saturated fat.",
    tags: ["eggs", "cholesterol", "protein", "myth"],
    image: "kilishi.jpg",
  },
  {
    title: "Can You Catch a Cold From Cold Drinks?",
    category: "Myths & Facts",
    excerpt:
      "Colds are caused by viruses, not by cold drinks or cold weather. Temperature can affect comfort but not infection.",
    focus:
      "Cold air and cold drinks do not create viruses. Handwashing, rest and staying away from sick people remain the practical prevention steps.",
    tags: ["cold", "drinks", "virus", "myth"],
    image: "cocoRice.jpg",
  },
];

const DRAFTS: SeedInput[] = [
  {
    title: "Understanding Food Labels in Nigerian Markets",
    category: "Nutrition",
    excerpt:
      "A draft guide to reading locally packaged foods, comparing serving sizes and spotting added sugar and salt.",
    focus:
      "This draft will walk through common label formats found in Nigerian supermarkets and open markets, with practical examples for busy shoppers.",
    tags: ["food labels", "shopping", "nutrition"],
    image: "ofadaRice.jpg",
  },
  {
    title: "A Beginner's Guide to Meal Planning",
    category: "Recipes",
    excerpt:
      "A simple planning approach that starts with familiar meals, seasonal produce and a realistic weekly budget.",
    focus:
      "The draft covers batch cooking, smart shopping lists, and how to reuse ingredients across several meals without getting bored.",
    tags: ["meal planning", "budget", "cooking"],
    image: "jollofRice.jpg",
  },
  {
    title: "Keeping a Food Diary That Works",
    category: "Myths & Facts",
    excerpt:
      "Food diaries can build awareness without becoming a source of stress. The draft explores a low-pressure approach.",
    focus:
      "Readers will learn what to record, how often to review it, and when a diary should be paused in favour of a more flexible habit.",
    tags: ["food diary", "habits", "wellbeing"],
    image: "moimoi.jpg",
  },
];

function buildContent(article: SeedInput) {
  return [
    article.excerpt,
    article.focus,
    "Make one small change this week and give it time to become routine. Consistency matters more than a perfect plan.",
    CATEGORY_CLOSING[article.category] || "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function decorate(article: SeedInput) {
  return {
    ...article,
    content: buildContent(article),
    sources: CATEGORY_SOURCES[article.category] || [],
  };
}

const SEED_ARTICLES = ARTICLES.map(decorate);
const SEED_DRAFTS = DRAFTS.map(decorate);

const ASSET_FILES = Array.from(
  new Set(
    [...SEED_ARTICLES, ...SEED_DRAFTS].map((article) => article.image)
  )
).sort();

const DEMO_USERS = [
  {
    email: "editorial@kukin.test",
    name: "Kukin Editorial",
    role: "admin",
    password: "KukinDemo123!",
  },
  {
    email: "reader@kukin.test",
    name: "Demo Reader",
    role: "customer",
    password: "KukinDemo123!",
  },
  {
    email: "tester@kukin.test",
    name: "Demo Tester",
    role: "customer",
    password: "KukinDemo123!",
  },
];

module.exports = {
  SEED_ARTICLES,
  SEED_DRAFTS,
  ASSET_FILES,
  DEMO_USERS,
  CATEGORY_CLOSING,
};
