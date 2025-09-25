export function buildPromptFromDiary(args) {
    const { period, periodKey, diaryText, seedValue } = args;
    // If no diary text found, fall back to a generic calm garden prompt.
    const userText = (diaryText ?? "").trim();
    const hasDiary = userText.length > 0;
    const baseInstruction = `
        You are creating a "Mood Garden": a single illustrative scene that visually reflects the emotional mood of a diary entry. 
        Translate emotions to visual elements (colors, plants, weather, composition) — NOT text. 
        Avoid any words or typography.

        Constraints:
        - No text or letters.
        - No frames or borders.
        - Square composition (1:1).
        `.trim();
    const diarySection = hasDiary
        ? `Diary excerpt (verbatim, for mood only):
            """
            ${userText}
            """
            `
        : `No diary text was provided; design a gentle, calming garden that suggests reflection and resilience.`;
    const context = `Generate the mood garden for ${period} ${periodKey}. Seed: ${seedValue}.`;
    // A short directive to keep image model outputs consistent
    const artDirection = `
        `.trim();
    const colourPsychology = `
Reds
• Pastel rose — tenderness, sweetness ✦ naivety, fragility
• Rose red — romance, affection ✦ heartbreak, vulnerability
• Scarlet — vitality, excitement ✦ aggression, recklessness
• Crimson — passion, sacrifice ✦ anger, danger
• Brick red — groundedness, stability ✦ stubbornness, heaviness
• Burgundy — devotion, richness ✦ brooding, resentment
Oranges
• Pastel peach — gentleness, comfort ✦ dependency, fragility
• Pastel coral — playfulness, innocence ✦ fickleness, superficiality
• Amber — warmth, vitality ✦ impatience, restlessness
• Rust — resilience, grounding ✦ weariness, decay
• Burnt orange — boldness, endurance ✦ irritability, overexertion
Yellows
• Buttercream — tenderness, light joy ✦ timidity, naivety
• Pastel lemon — freshness, clarity ✦ nervousness, flightiness
• Golden yellow — optimism, prosperity ✦ vanity, arrogance
• Mustard — confidence, boldness ✦ caution, envy
• Ochre — warmth, steadiness ✦ dryness, dullness
Greens
• Mint — gentle renewal ✦ false calm, hollowness
• Celadon — serenity, patience ✦ aloofness, withdrawal
• Seafoam — dreamy lightness ✦ detachment, fragility
• Emerald — vitality, richness ✦ envy, possessiveness
• Olive — wisdom, peace ✦ bitterness, fatigue
• Forest green — strength, endurance ✦ gloom, jealousy
• Dark pine — stability, protection ✦ severity, stagnation
• Lime — zest, innovation ✦ immaturity, restlessness
Blues
• Baby blue — openness, calm ✦ passivity, fragility
• Powder blue — clarity, lightness ✦ uncertainty, weakness
• Robin’s egg blue — creativity, freshness ✦ hesitation, dreaminess
• Sky blue — peace, tranquillity ✦ detachment, passivity
• Azure — inspiration, openness ✦ coldness, aloofness
• Turquoise — communication, harmony ✦ overexposure, vulnerability
• Indigo — depth, intuition ✦ melancholy, withdrawal
• Navy — stability, loyalty ✦ rigidity, sorrow
• Midnight blue — mystery, dignity ✦ heaviness, despair
Purples
• Pastel lilac — gentleness, enchantment ✦ wistfulness, fragility
• Lavender mist — calm, reflection ✦ longing, quiet sadness
• Mauve — nostalgia, dignity ✦ melancholy, fading vitality
• Violet — spirituality, imagination ✦ confusion, moodiness
• Royal purple — nobility, pride ✦ arrogance, isolation
• Plum — depth, wisdom ✦ secrecy, suppression
Pinks
• Baby pink — tenderness, affection ✦ naivety, vulnerability
• Blush pink — kindness, warmth ✦ shyness, insecurity
• Hot pink — vibrancy, playfulness ✦ volatility, overexcitement
• Magenta — transformation, boldness ✦ intensity, tension
• Fuchsia — confidence, flamboyance ✦ excess, instability
Neutrals & Lights
• Ivory — simplicity, elegance ✦ emptiness, sterility
• Pearl white — purity, clarity ✦ fragility, coldness
• Powder white — newness, innocence ✦ blankness, detachment
• Pale dove grey — neutrality, subtlety ✦ indecision, weakness
• Silver — reflection, intuition ✦ detachment, coldness
• Charcoal — wisdom, strength ✦ heaviness, despair
Darks & Metallics
• Black — elegance, depth ✦ grief, fear
• Jet black — authority, mystery ✦ despair, void
• Gold — prosperity, vitality ✦ greed, obsession
• Copper — transformation, warmth ✦ corrosion, decay
• Bronze — tradition, grounding ✦ rigidity, dullness
}
Flowers
• Rose — love, romance ✦ heartbreak, pain
• Lily — purity, renewal ✦ mourning, loss
• Sunflower — optimism, loyalty ✦ obsession, blindness
• Lavender — calm, healing ✦ detachment, numbness
• Daisy — innocence, hope ✦ fragility, naivety
• Iris — wisdom ✦ grief, transition
• Chrysanthemum — loyalty, cheer ✦ solemnity, death
• Peony — romance, prosperity ✦ vanity, fleetingness
• Violet — devotion ✦ secrecy, suppressed feelings
• Lotus — awakening, enlightenment ✦ struggle, hardship
• Tulip — affection, charity ✦ impermanence, fragility
• Marigold — creativity, warmth ✦ jealousy, cruelty
• Poppy — peace, dreams ✦ forgetfulness, death
• Hydrangea — gratitude ✦ apology, regret
• Orchid — elegance, fertility ✦ mystery, pride
• Camellia — refinement ✦ fragile longing
• Hibiscus — beauty ✦ fleeting passion
• Bluebell — humility ✦ mourning, solitude
• Foxglove — imagination ✦ deception, danger
• Carnation — admiration ✦ fickleness
• Daffodil — rebirth ✦ unrequited love
• Freesia — innocence ✦ hesitation
• Gardenia — secret love ✦ fragility
• Gerbera Daisy — cheer ✦ superficial happiness
• Hyacinth — sincerity ✦ sorrow, rashness
• Jasmine — love ✦ desire, indulgence
• Snapdragon — strength ✦ concealment, deception
• Ranunculus — charm ✦ vanity
`.trim();
    const plants = `
Trees
Classic
• Oak — strength ✦ stubbornness
• Willow — resilience ✦ sorrow
• Birch — renewal ✦ fragility
• Pine — clarity ✦ severity
• Apple — love ✦ temptation
• Cherry blossom — joy ✦ impermanence
• Maple — generosity ✦ fading passion
• Elm — dignity ✦ heaviness
• Ash — wisdom ✦ rigidity
• Rowan — protection ✦ severity
• Hawthorn — hope ✦ danger
• Yew — eternal life ✦ death
• Cypress — protection ✦ mourning
• Olive — peace ✦ bitterness
• Fig — abundance ✦ overindulgence
• Linden (lime blossom tree) — love ✦ dependency
• Magnolia — beauty ✦ pride
• Palm — peace ✦ vanity
• Eucalyptus — cleansing ✦ detachment
• Jacaranda — creativity ✦ melancholy
Citrus Trees
• Lemon tree — clarity, cleansing ✦ bitterness, sharpness
• Orange tree — abundance, joy ✦ overindulgence, fleetingness
• Lime tree — refreshment, renewal ✦ sourness, irritability
• Grapefruit tree — balance, healing ✦ intensity, conflict
Extra Fruit Tree
• Avocado tree — nourishment, fertility ✦ heaviness, overindulgence
Tropical & Exotic Trees
• Banana tree — fertility, playfulness ✦ excess, transience
• Coconut palm — resilience, sustenance ✦ isolation, emptiness
• Mango tree — sweetness, generosity ✦ overindulgence, laziness
• Papaya tree — healing, vitality ✦ fragility, fleetingness
• Guava tree — nourishment, balance ✦ sourness, secrecy
• Date palm — endurance, prosperity ✦ longing, dryness
Fruit & Harvest Plants
• Strawberry bush — love, passion, sweetness ✦ fleeting joy, fragility
• Raspberry bush — vitality, protection ✦ irritation, conflict
• Blackberry bramble — resilience, resourcefulness ✦ entanglement, obstacles
• Blueberry bush — calm, intuition, wisdom ✦ melancholy, withdrawal
• Gooseberry bush — humility, hidden strength ✦ sourness, secrecy
• Grapevine — celebration, abundance ✦ indulgence, loss of control
Outdoor Plants, Vines & Herbs
• Fern — sincerity ✦ hiddenness
• Ivy — fidelity ✦ entrapment
• Bamboo — resilience ✦ invasiveness
• Hosta — calm ✦ passivity
• Spider plant — renewal ✦ fragility
• Aloe — healing ✦ harshness
• Succulents — endurance ✦ coldness
• Sage — wisdom ✦ severity
• Rosemary — remembrance ✦ regret
• Mint — clarity ✦ instability
• Basil — prosperity ✦ volatility
• Thyme — courage ✦ weariness
• Chamomile — rest ✦ weakness
• Lemon balm — joy ✦ fleetingness
• Yarrow — healing ✦ bitterness
• Fennel — vitality ✦ dominance
• Parsley — renewal ✦ triviality
• Oregano — warmth ✦ overuse
• Marjoram — gentleness ✦ frailty
• Chives — renewal ✦ sharpness
• Holly — protection ✦ severity
• Mistletoe — vitality ✦ dependency
• Heather — luck ✦ solitude
• Clover — faith ✦ chance
• Nettle — strength ✦ pain
• Dandelion — optimism ✦ fragility
`.trim();
    const creatures = `
Small Creatures
• Butterfly — transformation, freedom ✦ fragility, impermanence
• Bee — diligence, community ✦ overwork, self-sacrifice
• Dragonfly — clarity, adaptability ✦ fleetingness, instability
• Ladybird — luck, protection ✦ short-lived joy
• Firefly — wonder, inspiration ✦ fading hope, brevity
• Moth — change, attraction ✦ vulnerability, danger
• Ant — perseverance, teamwork ✦ drudgery, burden
• Spider — creativity, weaving fate ✦ entrapment, fear
• Snail — patience, persistence ✦ stagnation, slowness
• Caterpillar — growth, potential ✦ uncertainty, fragility
• Grasshopper — opportunity, courage ✦ risk, recklessness
• Cricket — intuition, guidance ✦ fragility, smallness
• Beetle — resilience, transformation ✦ heaviness, harshness
• Frog — renewal, cleansing ✦ awkward transition, unease
• Rabbit —playfulness, sensitivity, renewal ✦ anxiety, vulnerability, restlessness
• Hedgehog — protection, defence ✦ withdrawal, isolation
• Mouse — humility, gentleness ✦ timidity, vulnerability
`.trim();
    const lighting = `
Lighting & Atmosphere
• Dawn glow — fresh hope, renewal ✦ uncertainty, fragility
• Golden hour — romance, nostalgia ✦ longing, fading joy
• Midday sun — clarity, energy ✦ harshness, exposure
• Overcast daylight — calm, quiet ✦ gloom, heaviness
• Silver moonlight — purity, dreaminess ✦ loneliness, coldness
• Crescent moon — subtle magic, mystery ✦ fragility, incompleteness
• Full moon — enchantment, fullness ✦ unease, unrest
• Starlight — wonder, awe ✦ smallness, insignificance
• Aurora skies — inspiration, otherworldly awe ✦ distance, detachment
• Fairy lights — playfulness, whimsy ✦ artificiality, superficiality
• Lanterns — warmth, guidance ✦ fading light, impermanence
• Candlelight — intimacy, tenderness ✦ fragility, fleetingness
• Bonfire/Torches — celebration, passion ✦ chaos, danger
• Glowing mushrooms — wonder, enchantment ✦ strangeness, eeriness
• Fireflies — hope, beauty ✦ fleetingness, fragility
• Morning mist — cleansing, freshness ✦ obscurity, confusion
• God-rays (sunbeams) — revelation, grace ✦ harsh spotlight, pressure
• Water reflections — clarity, insight ✦ distortion, illusion
• Twilight haze — transition, endings ✦ melancholy, uncertainty
• Storm light — drama, intensity ✦ fear, chaos
• Rainbow glow — joy, blessing ✦ fragile hope, transience
`.trim();
    const elements = `
Natural Elements
• Water — flow, renewal ✦ overwhelm, drowning in feeling
• Rocks/Stones — grounding, permanence ✦ heaviness, obstacles
• Soil/Earth — fertility, foundation ✦ depletion, barrenness
• Wind — freedom, movement ✦ chaos, instability
Sky & Weather
• Clear sky — openness, peace ✦ emptiness, exposure
• Drifting clouds — thought, imagination ✦ uncertainty, hesitation
• Storm clouds — power, cleansing ✦ anger, conflict
• Rainbow — hope, promise ✦ fleetingness, fragility
• Falling snow — purity, stillness ✦ coldness, isolation
• Sun halo — revelation, sacredness ✦ intensity, overwhelm
• Fog/Mist — mystery, dreaminess ✦ confusion, obscurity
• Twilight — gentleness, transition ✦ endings, melancholy
`.trim();
    const features = `
Paths & Garden Features
• Winding path — personal journey, curiosity ✦ uncertainty, doubt
• Straight path — clarity, determination ✦ rigidity, lack of flexibility
• Overgrown path — hidden potential ✦ neglect, confusion
• Stone path — balance, grounding ✦ heaviness, burden
• Wooden bridge — transition, crossing ✦ risk, instability
• Open gate — welcome, opportunity ✦ exposure, vulnerability
• Closed gate — safety, protection ✦ barrier, isolation
`.trim();
    // Final prompt
    return `
        Mood Garden Task:
        ${baseInstruction}

        ${diarySection}

        ${context}
        Use the following as a guide -
        Color psychology:
        ${colourPsychology}
        Plants symbolism:
        ${plants}
        Creatures symoblism:
        ${creatures}
        Other:
        ${lighting}
        ${elements}
        ${features}
        ${artDirection}
        Render a single cohesive scene that embodies the diary's emotional tone through plants, color, and atmosphere. No text. Square image.
        `.trim();
}
