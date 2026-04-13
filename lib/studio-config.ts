import type { LucideIcon } from "lucide-react";
import {
  Camera,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";
import type { StudioAction, StudioOption } from "@/lib/types";

export type ActionConfig = {
  id: StudioAction;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type OptionConfig = {
  id: StudioOption;
  title: string;
  description: string;
  accent?: string;
  promptLabel: string;
  group?: "Popular" | "More Colors";
};

export const studioActions: ActionConfig[] = [
  {
    id: "clean-studio",
    title: "Clean Studio",
    description: "Make this look like a professional studio shoot",
    icon: Camera,
  },
  {
    id: "change-color",
    title: "Change Outfit Color",
    description: "Generate color variations of this outfit",
    icon: Palette,
  },
  {
    id: "upgrade-model",
    title: "Change Face",
    description: "Swap facial identity while keeping the outfit and pose",
    icon: Sparkles,
  },
  {
    id: "create-campaign",
    title: "Create Occasion",
    description: "Place the same model and outfit into a real occasion",
    icon: Users,
  },
];

export const optionsByAction: Record<StudioAction, OptionConfig[]> = {
  "clean-studio": [
    {
      id: "white-studio",
      title: "White Studio",
      description: "Bright, clean studio backdrop",
      promptLabel: "a bright white studio background",
    },
    {
      id: "beige-studio",
      title: "Beige Studio",
      description: "Soft neutral studio setting",
      promptLabel: "a warm beige studio background",
    },
    {
      id: "dark-luxury",
      title: "Dark Luxury",
      description: "Premium dark editorial backdrop",
      promptLabel: "a dark luxury studio background",
    },
  ],
  "change-color": [
    {
      id: "white",
      title: "White",
      description: "Minimal crisp white variation",
      accent: "#F5F5F5",
      promptLabel: "white",
      group: "Popular",
    },
    {
      id: "black",
      title: "Black",
      description: "Deep black colorway",
      accent: "#111111",
      promptLabel: "black",
      group: "Popular",
    },
    {
      id: "red",
      title: "Red",
      description: "Bold red variation",
      accent: "#D92D20",
      promptLabel: "red",
      group: "Popular",
    },
    {
      id: "gold",
      title: "Gold",
      description: "Rich gold finish",
      accent: "#C99700",
      promptLabel: "gold",
      group: "Popular",
    },
    {
      id: "pink",
      title: "Pink",
      description: "Soft pink variant",
      accent: "#E9A3B0",
      promptLabel: "pink",
      group: "Popular",
    },
    {
      id: "wine",
      title: "Wine",
      description: "Dark wine tone",
      accent: "#6E1F32",
      promptLabel: "wine",
      group: "Popular",
    },
    {
      id: "cream",
      title: "Cream",
      description: "Warm soft neutral",
      accent: "#F3E6C9",
      promptLabel: "cream",
      group: "More Colors",
    },
    {
      id: "navy",
      title: "Navy",
      description: "Clean deep blue",
      accent: "#243B6B",
      promptLabel: "navy blue",
      group: "More Colors",
    },
    {
      id: "emerald",
      title: "Emerald",
      description: "Rich green tone",
      accent: "#13795B",
      promptLabel: "emerald green",
      group: "More Colors",
    },
    {
      id: "olive",
      title: "Olive",
      description: "Muted earthy green",
      accent: "#66703C",
      promptLabel: "olive",
      group: "More Colors",
    },
    {
      id: "silver",
      title: "Silver",
      description: "Cool metallic neutral",
      accent: "#C7CDD4",
      promptLabel: "silver",
      group: "More Colors",
    },
    {
      id: "mocha",
      title: "Mocha",
      description: "Deep brown everyday tone",
      accent: "#705043",
      promptLabel: "mocha brown",
      group: "More Colors",
    },
  ],
  "upgrade-model": [
    {
      id: "nigerian-female-face",
      title: "Nigerian Female",
      description: "Fresh Nigerian female commercial face",
      promptLabel: "a polished Nigerian female commercial face with natural African features",
    },
    {
      id: "nigerian-male-face",
      title: "Nigerian Male",
      description: "Strong Nigerian male commercial face",
      promptLabel: "a polished Nigerian male commercial face with natural African features",
    },
    {
      id: "african-editorial-face",
      title: "African Editorial",
      description: "Premium African editorial facial identity",
      promptLabel: "a refined African editorial face with authentic Nigerian or West African facial features",
    },
  ],
  "create-campaign": [
    {
      id: "owambe-party",
      title: "Owambe Party",
      description: "Traditional celebration scene with the same look",
      promptLabel: "a polished owambe party occasion scene",
    },
    {
      id: "dinner-date",
      title: "Dinner Date",
      description: "Elegant dinner setting with the same model",
      promptLabel: "an upscale dinner date occasion scene",
    },
    {
      id: "weekend-brunch",
      title: "Weekend Brunch",
      description: "Bright daytime brunch scene with the same outfit",
      promptLabel: "a premium weekend brunch occasion scene",
    },
    {
      id: "evening-event",
      title: "Evening Event",
      description: "Refined night event atmosphere with the same model",
      promptLabel: "a refined evening event occasion scene",
    },
  ],
};

export function getDefaultOption(action: StudioAction): StudioOption {
  return optionsByAction[action][0].id;
}

export function getActionConfig(action: StudioAction) {
  return studioActions.find((item) => item.id === action) || null;
}

export function getOptionConfig(
  action: StudioAction,
  option: StudioOption,
) {
  return optionsByAction[action].find((item) => item.id === option) || null;
}

export function resolveLegacyStyle(style?: string) {
  if (!style) {
    return {
      action: "clean-studio" as const,
      option: "white-studio" as const,
    };
  }

  const normalized = style.trim().toLowerCase();

  if (normalized.includes("beige")) {
    return {
      action: "clean-studio" as const,
      option: "beige-studio" as const,
    };
  }

  if (normalized.includes("dark")) {
    return {
      action: "clean-studio" as const,
      option: "dark-luxury" as const,
    };
  }

  return {
    action: "clean-studio" as const,
    option: "white-studio" as const,
  };
}

export function buildPrompt(action: StudioAction, option: StudioOption) {
  const optionConfig = getOptionConfig(action, option);

  if (!optionConfig) {
    throw new Error("Unsupported option.");
  }

  const masterPrompt = `You are a high-end ecommerce photo retoucher.

Your job is to edit the provided product image with maximum realism and minimum unnecessary change.

NON-NEGOTIABLE RULES:
- Preserve the original product exactly unless the task explicitly says to change color
- Preserve garment shape, stitching, folds, texture, fit, silhouette, branding, seams, buttons, zippers, prints, and proportions
- Preserve the original pose, body position, camera angle, crop, framing, and composition
- Preserve the subject identity unless the task explicitly says to change the face
- Do not add props, accessories, jewelry, extra garments, text, patterns, logos, or background objects
- Do not stylize the image
- Do not create an illustration, CGI look, or fantasy beauty retouching
- Keep the result photorealistic, commercially usable, and suitable for a premium fashion ecommerce storefront

QUALITY RULES:
- Make the result sharp, clean, crisp, and realistic
- Improve lighting evenly and professionally
- Improve contrast and clarity subtly
- Keep skin tones natural
- Keep edges clean around the subject
- Preserve full framing with comfortable headroom and breathing room around the subject
- Keep the full head, hair, shoulders, arms, and lower body in frame whenever they are present in the source image
- Never crop into the top of the head, chin, or key garment areas
- Expand the composition naturally if needed to preserve the full subject
- Prefer a zoomed-out composition over a tight crop
- Keep the complete look visible from head to below the knees whenever the source image allows it
- Avoid distortion, warped limbs, duplicated features, broken hands, altered clothing construction, and unnatural shadows

OUTPUT REQUIREMENT:
Return one realistic, premium, studio-quality ecommerce image that looks like the same original photo professionally retouched.`;

  switch (action) {
    case "clean-studio":
      return `${masterPrompt}

TASK:
Replace the entire background with ${optionConfig.promptLabel}.
Keep the subject and outfit exactly the same.
Keep the original face exactly the same.
Do not redesign the clothing.
Do not change the pose.
Do not change the body.
Do not change the face.
Do not change the camera angle.
Only improve the background, lighting, subject separation, and overall polish.

BACKGROUND RULES:
- Background must be plain, seamless, minimal, and luxury ecommerce style
- No props
- No furniture
- No scenery
- No texture-heavy backdrop
- No environmental scene

LIGHTING RULES:
- Use soft professional studio lighting
- Make the image bright, clean, balanced, and premium
- Remove dull shadows and muddy tones
- Keep realistic contact shadows under the subject if visible

FRAMING RULES:
- Keep the full subject comfortably in frame
- Preserve extra headroom above the head
- Do not crop the top of the head or cut into the body
- Keep the entire outfit visible and centered with clean margins around the subject

FINAL LOOK:
A crisp premium Shopify-quality studio product image.`;
    case "change-color":
      return `${masterPrompt}

TASK:
Recolor ONLY the visible main outfit to ${optionConfig.promptLabel}.
Keep the face, hair, skin, body, background, and pose exactly the same.

STRICT COLOR EDIT RULES:
- Change only the color of the primary clothing item shown in the photo
- If multiple garments are visible, recolor only the main hero garment and leave every other item unchanged
- Do not change garment design
- Do not change garment fit, length, cut, drape, layering, or styling
- Do not change fabric texture
- Do not change stitching
- Do not change folds
- Do not change trim, buttons, zippers, hems, lace, embroidery, beading, or garment structure
- Do not remove or add sleeves, collars, pockets, or embellishments
- Do not change skin tone
- Do not change hair
- Do not change face
- Do not change pose
- Do not change body shape
- Do not change hands, legs, shoes, accessories, props, or background
- Do not replace the entire outfit with a different garment
- Do not restyle the image

COLOR RULES:
- Apply the new color evenly and realistically across the outfit
- Preserve natural highlights, shadows, depth, wrinkles, and material texture
- Keep the garment looking like the same physical clothing item
- Preserve realistic fabric sheen, weave, and tonal variation from the original image
- Keep edge boundaries clean where the outfit meets skin or background
- Do not invent new patterns
- Do not add shine unless already present in the original fabric
- Do not oversaturate
- Avoid patchy recoloring, missed sections, color spill onto skin, and color spill onto the background

TARGET COLOR:
- The final garment color should read clearly as ${optionConfig.promptLabel}
- Keep the tone premium, believable, and suitable for ecommerce
- Match all visible sections of the same garment to the same color family

FINAL LOOK:
The exact same outfit and photo, but recolored naturally to ${optionConfig.promptLabel}, with premium ecommerce realism.`;
    case "upgrade-model":
      return `${masterPrompt}

TASK:
Change ONLY the face to ${optionConfig.promptLabel}.
Keep the outfit, body, pose, camera angle, crop, and framing locked.

STRICT RULES:
- Preserve the clothing exactly
- Preserve garment construction, folds, fit, and proportions
- Preserve the original camera angle and composition
- Preserve the original body shape, skin coverage, hair silhouette, and pose
- Keep the image photorealistic
- Replace only the facial identity with a clean generic commercial avatar look
- Keep the new face clearly African, with Nigerian or West African facial features when suitable
- Do not change the outfit
- Do not change the body
- Do not change the background unless needed for realism
- Do not create fantasy beauty retouching
- Do not add accessories or props
- Keep the pose exactly as close as possible to the original
- Keep the full head and body comfortably in frame with natural headroom
- Keep the complete outfit visible without tight cropping

PRIORITY:
The outfit must remain identical to the source image and the new face must look naturally integrated.

FINAL LOOK:
A believable premium fashion ecommerce photo with the same outfit and body, but a different locked-in face direction.`;
    case "create-campaign":
      return `${masterPrompt}

TASK:
Place the same single model into ${optionConfig.promptLabel}.

STRICT RULES:
- Keep the same single model as the source image
- Keep the same outfit exactly, with the same fabric, details, fit, and styling
- Do not add extra people, family members, couples, or group casts
- Do not change the garment into another design or occasion wear
- Maintain premium commercial photography quality
- Do not create cartoonish, surreal, or overly dramatic scenes
- Keep styling minimal, aspirational, and brand-safe
- Do not clutter the frame
- Do not change the face, body, or identity
- Do not change the hairstyle
- Do not crop the head, shoulders, or lower garment
- Keep the subject fully visible with breathing room around the body

SCENE RULES:
- Create a realistic premium occasion setting around the same model and outfit
- Keep the model standing or posed in a natural commercial fashion pose close to the source image
- Clean premium composition
- Soft polished lighting
- Editorial but commercially usable
- The image must still look like the same person wearing the same clothing in a different real-life setting
- Use background storytelling only; the outfit and model remain the hero
- The occasion must feel subtle, upscale, and believable rather than theatrical

FINAL LOOK:
A realistic premium occasion photo of the same model in the same outfit, placed into the selected scene.`;
    default:
      throw new Error("Unsupported action.");
  }
}

export function getGenerationSize(action: StudioAction) {
  switch (action) {
    case "clean-studio":
    case "upgrade-model":
    case "create-campaign":
      return "1024x1536" as const;
    case "change-color":
      return "1024x1024" as const;
    default:
      return "1024x1024" as const;
  }
}

export function getGenerationQuality(action: StudioAction) {
  switch (action) {
    case "change-color":
    case "create-campaign":
      return "high" as const;
    default:
      return "medium" as const;
  }
}
