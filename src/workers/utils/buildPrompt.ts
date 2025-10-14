

export function buildPromptFromDiary(args: {
    period: string;
    periodKey: string;
    diaryText?: string | null;
    seedValue: number;
}) {
    const { period, periodKey, diaryText, seedValue } = args;
    // If no diary text found, fall back to a generic calm garden prompt.
    const userText = (diaryText ?? "").trim();
    const hasDiary = userText.length > 0;
    const baseInstruction = `
        Create a single symbolic garden scene (Mood Garden) that visually expresses the target feelings or mixed
        moods of the given diary excerpt.
        Rules:
        • It must always be a garden. May be wild or cultivated, lush or sparse, depending on the mood.
        Varying styles can be used as a template: Formal Garden, Cottage Garden, Wildflower Garden,
        Zen Garden, Japanese Garden, Mediterranean Garden, Rock Garden, Water Garden,
        Contemporary Garden, Potager, Tropical Garden, Desert Garden, Topiary Garden. The style should fit the general mood of
        the diary excerpt.
        • Use selective elements only - never the full catalogue at once.
        • Combine elements to honour layered or mixed emotions.
        • Style can vary (cute, pastel, painterly, whimsical, minimal), but do not reference named artists.
        • Keep the scene coherent, balanced and uncluttered.
        • No text or letters.
        • No frames or borders.
        • No images that are literal interpretations of words in the text
        • Square composition (1:1).
        Steps:
        Read the mood(s) carefully.
        Pick a colour palette and tones that fit, guided by colour psychology.
        Choose a few symbolic flowers, trees and/or plants from the catalogue that match the mood.
        Creatures (optional): include only if their symbolism supports the mood. Keep them small
        (butterfly, bee, ladybird, frog, snail, rabbit, etc).
        Select lighting/atmosphere that reflects the feeling (e.g. golden sunlight, mist, stars,
        moonlight, fireflies, fairy lights).
        Optionally add fruit/harvest plants, natural elements, sky/weather, or paths/gates to deepen
        the meaning.
        Compose the garden so it feels real and emotionally alive, as though someone could step into
        it.
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
        • Bright red — danger, warning
        • Scarlet — romance, passion
        • Burgundy — luxury, powerful   
        Oranges
        • Coral — playfulness, innocence
        • Rust — neglect
        • Orange — warmth, energy, creativity
        Yellows
        • Bright yellow — optimism, hope, happiness
        • Light yellow — thinking, friendship 
        • Golden yellow — vibrancy, enthusiasm 
        • Mustard — confidence, boldness, comfort
        Greens
        • Mint — fresh beginnings, relaxation
        • Emerald — luck, renewal
        • Olive — wisdom, peace
        • Dark green — strength, jealousy
        • Lime — excitement, energy
        Blues
        • Powder blue — innocence, tranquility 
        • Sky blue — trust, optimism 
        • Turquoise — protection, healing, balance
        • Indigo — sophistication, spirituality, introspection 
        • Midnight blue — stability, knowledge
        • Navy blue — sadness, melancholy 
        Purples
        • Lilac — affection, femininity 
        • Lavender — calm, reflection
        • Mauve — self discovery, transformation 
        • Violet — mystery, intuition, creativity 
        • Royal purple — nobility, pride 
        • Plum — elegance, money 
        Pinks
        • Baby pink — purity, vulnerability
        • Hot pink — vibrancy, confidence, self expression 
        • Magenta — compassion, kindness, flamboyance
        Neutrals & Lights
        • White — purity, clarity
        • Grey — sadness, moodiness
        • Silver — reflection, intuition
        Darks & Metallics
        • Black — depression, despair
        • Gold — prosperity, vitality, achievement 
        • Copper — trust, security, warmth
        • Bronze — durability, success

        Flowers
        • Rose — love, romance 
        • Black Rose – depression, vengeance
        • Lily — mourning, loss
        • Sunflower — optimism, Joy
        • Lavender — calm, healing
        • Daisy — innocence, hope
        • Peony — wedding related 
        • Lotus — meditation, mindfulness
        • Tulip — affection, grace
        • Marigold — creativity, imagination
        • Poppy — rememberance, death, dreams
        • Hydrangea — apology, regret
        • Orchid — elegance, fertility 
        • Hibiscus — beauty, passion
        • Bluebell — solitude, loneliness
        • Foxglove — deception, danger
        • Carnation — admiration
        • Daffodil — unrequited love
        • Gardenia — secret love
        • Buttercup – Childishness
        • Hyacinth — sincerity
        • Jasmine — desire, sensuality 
        • Snapdragon — strength
        `.trim()

    const plants = `
        Trees:
        Classic
        • Oak — strength, endurance, stubbornness
        • Willow — sadness, intuition
        • Birch — fragility
        • Pine — clarity, severity
        • Apple — temptation, desire
        • Cherry blossom — joy, beauty 
        • Maple — generosity, sweetness
        • Ash — intuition, growth 
        • Yew — transformation, death
        • Cypress — protection, grief
        • Olive — peace, wisdom
        • Fig — abundance, fertility 
        • Magnolia — beauty, vanity 
        • Palm — victory, pride
        • Eucalyptus — cleansing, detachment
        • Jacaranda — creativity, regret
        Citrus Trees
        • Lemon tree — vitality, bitterness 
        • Orange tree — prosperity, joy, restlessness
        • Lime tree — energy, friendship, irritability
        Extra Fruit Tree
        • Avocado tree — nourishment, fertility ✦ heaviness, overindulgence
        Tropical & Exotic Trees
        • Avocado tree — nourishment, overprotectiveness
        • Banana tree — playfulness, transience
        • Coconut tree — resilience, emotional distance 
        • Mango tree — sweetness, fulfilment
        Fruit & Harvest Plants
        • Strawberries — love, passion, sweetness
        • Grapevine — celebration, abundance
        Fruit & Harvest Plants
        • Strawberry bush — love, sweetness
        • Raspberry bush — kindness, affection 
        • Blueberry bush — calm, intuition
        • Grapevine — celebration, connection
        `.trim()

    const creatures = `
        Small Creatures:
        • Butterfly — transformation, freedom
        • Bee — work, busy
        • Dragonfly — adaptability
        • Ladybird — luck, protection
        • Firefly — inspiration 
        • Moth — vulnerability, danger
        • Ant — drudgery, burden
        • Spider web — trapped, imposition 
        • Spider — powerful, ingenuity 
        • Snail — stagnation, slowness
        • Caterpillar — growth, potential
        • Grasshopper — opportunity, courage 
        • Beetle — resilience, transformation
        • Frog — renewal, change 
        • Rabbit —playfulness, energetic
        • Hedgehog — defensive, sensitive
        • Mouse — timidity, vulnerability
        `.trim()

    const lighting = `
        Lighting & Atmosphere:
        • Dawn glow — fresh hope, renewal
        • Golden hour — romance, nostalgia
        • Midday sun — clarity, energy 
        • Overcast daylight — gloom, heaviness
        • Silver moonlight — purity, dreaminess
        • Crescent moon — incompleteness, hope 
        • Full moon — fulfilment, intensity 
        • Starlight — wonder, awe
        • Aurora skies — inspiration, spirituality 
        • Fairy lights — playfulness, whimsy
        • Lanterns — warmth, cosiness
        • Candlelight — intimacy, tenderness
        • Bonfire/Torches — passion, fieriness 
        • Glowing mushrooms — strangeness, eeriness, drug use
        • Fireflies — hope, closeness, safety 
        • Morning mist — cleansing, freshness
        • God-rays (sunbeams) — revelation, grace
        • Water reflections — insight, understanding 
        • Storm light — drama, fear, chaos
        `.trim()

    const elements = `
        Natural Elements:
        • Still water — calm, mellow
        • Moving water — overwhelm, conflict
        • Rocks/Stones — stability, stubbornness
        • Soil/Earth — fertility, reliability
        • Wind — freedom, inspiration
        `.trim()

    const skyAndWeather = `
    Sky & Weather:
    • Clear sky — openness, trouble free 
    • Drifting clouds — thinking
    • Storm clouds — anger, conflict
    • Rainbow — joy, optimism, connected
    • Falling snow — stillness, quiet
    • Sun halo — revelation, wonder
    • Fog/Mist — mystery, dreaminess, confusion
    • Twilight — reflection, transition, endings
    `.trim()

    const features = `
Paths & Garden Features:
• Winding path — curiosity, uncertainty 
• Straight path — determination, ambition 
• Overgrown path — hidden potential, neglect
• Stone path — hardship, progress
• Wooden bridge — transition, trust
• Stone bridge — endurance, surety 
• Open gate — opportunity, freedom, openness 
• Closed gate — safety, protection, fear
`.trim()

    const landscape = `
Landscape features:
• Pond — Pondering, musing, deep thoughts
• Lawn (Tended) — Positive: Order, Pride
• Lawn (Wild) — Positive: chaos, rebellion
• Wildflowers — Spontaneity, possibilities
• Hills — Obstacles, goals
• Mountains — Endurance, boundaries
`

    const perspective1 = `
        Flat perspective, with plants in the foreground, and sky/large features in the background.
        `

    const perspective2 = `
        Perspective: garden in the distance, with landscape visible
        `

    const perspective3 = `
        The perspective is from the centre of the garden
        `
    const items = [perspective1, perspective2, perspective3];
    const randomIndex = Math.floor(Math.random() * items.length);
    const perspective = items[randomIndex];


    // Final prompt
    return `
        Task:
        ${baseInstruction}

        ${diarySection}

        ${context}
        Use the following as a guide -
        Color psychology:
        ${colourPsychology}
        Plants symbolism:
        ${plants}

        ${creatures}

        ${lighting}
    
        ${elements}

        ${features}

        ${skyAndWeather}
    
        ${landscape}

        Render a single cohesive scene that embodies the diary's emotional tone through plants, color, and atmosphere. No text. Square image. ${perspective}
        `.trim();
}




