# Search & Personalization Specification 🔍

## 1. User Search History
- **Data Capture**: Every search query entered by a logged-in user is stored in the `SearchHistory` model.
- **Privacy**: Users can clear their search history from the Profile settings.
- **Retention**: History is used for 90 days to influence suggestions before being archived.

## 2. Smart Suggestions (Google Search API Integration)
- **Hybrid Search**:
    1. **Internal Catalog**: Priority 1 - Match against existing product names/categories.
    2. **Google Search API**: Priority 2 - If internal results are low or to provide "Trending" context, use Google Search API to fetch relevant organic food trends or synonyms.
- **Autocomplete**: Predictive text as the user types, based on:
    - User's past history.
    - Global trending searches.
    - Category keywords.

## 3. Hero Section Enhancements
- **The "Big 5" Tabs**: A horizontal scrollable or grid-based tab bar at the very top of the Hero section.
- **Proposed Tabs**:
    1. **FreshOn Pride**: Rapid access to membership benefits.
    2. **Organic Hub**: Direct link to the most "Organic" certified categories.
    3. **Bulk Orders**: For catering/large family needs.
    4. **Farmer Stories**: Video-first discovery of our farmers.
    5. **Flash Deals**: High-discount daily items.

## 4. Product Catalog Refactoring
- **Flat Navigation**: Remove the "Sub-Category" drill-down requirement.
- **Behavior**: Clicking a Category (e.g., "Vegetables") leads directly to a product grid containing all items in that category, with "Sub-Category" becoming a filter pill on the same page instead of a separate navigation step.
