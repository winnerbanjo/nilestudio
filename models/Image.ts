import { model, models, Schema } from "mongoose";

const imageSchema = new Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    generatedUrl: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: false,
    },
    action: {
      type: String,
      enum: [
        "clean-studio",
        "change-color",
        "upgrade-model",
        "create-campaign",
      ],
      required: true,
    },
    option: {
      type: String,
      enum: [
        "white-studio",
        "beige-studio",
        "dark-luxury",
        "white",
        "black",
        "red",
        "gold",
        "pink",
        "wine",
        "cream",
        "navy",
        "emerald",
        "olive",
        "silver",
        "mocha",
        "nigerian-female-face",
        "nigerian-male-face",
        "african-editorial-face",
        "owambe-party",
        "dinner-date",
        "weekend-brunch",
        "evening-event",
      ],
      required: true,
    },
    provider: {
      type: String,
      default: "openai",
    },
    changed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

export const ImageModel = models.Image || model("Image", imageSchema);
