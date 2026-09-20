import { model, models, Schema, type Model } from "mongoose";

export interface EventDocument {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const requiredText = {
  type: String,
  required: true,
  trim: true,
  validate: {
    validator: (value: string): boolean => value.length > 0,
    message: "This field cannot be empty.",
  },
};

const nonEmptyStringArray = {
  type: [String],
  required: true,
  validate: {
    validator: (values: string[]): boolean =>
      values.length > 0 && values.every((value) => value.trim().length > 0),
    message: "Provide at least one non-empty value.",
  },
};

const eventSchema = new Schema<EventDocument>(
  {
    title: requiredText,
    slug: { type: String, trim: true },
    description: requiredText,
    overview: requiredText,
    image: requiredText,
    venue: requiredText,
    location: requiredText,
    date: requiredText,
    time: requiredText,
    mode: requiredText,
    audience: requiredText,
    agenda: nonEmptyStringArray,
    organizer: requiredText,
    tags: nonEmptyStringArray,
  },
  { timestamps: true },
);

eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", function () {
  const textFields: Array<
    keyof Pick<
      EventDocument,
      | "title"
      | "description"
      | "overview"
      | "image"
      | "venue"
      | "location"
      | "date"
      | "time"
      | "mode"
      | "audience"
      | "organizer"
    >
  > = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];

  // Keep required text and list fields meaningful, not merely present.
  if (
    textFields.some((field) => this[field].trim().length === 0) ||
    [this.agenda, this.tags].some(
      (values) => values.length === 0 || values.some((value) => !value.trim()),
    )
  ) {
    throw new Error("Event fields must contain non-empty values.");
  }

  // Normalize valid dates and 24-hour times before persisting them.
  const parsedDate = new Date(this.date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Event date must be a valid date.");
  }
  this.date = parsedDate.toISOString();

  const timeMatch = /^(?:0?\d|1\d|2[0-3]):([0-5]\d)$/.exec(this.time);
  if (!timeMatch) {
    throw new Error("Event time must use 24-hour HH:mm format.");
  }
  this.time = this.time.padStart(5, "0");

  // Rebuild the URL-safe slug only when its source value changes.
  if (this.isModified("title")) {
    this.slug = this.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!this.slug) {
      throw new Error("Event title must contain letters or numbers.");
    }
  }
});

export const Event: Model<EventDocument> =
  (models.Event as Model<EventDocument> | undefined) ??
  model<EventDocument>("Event", eventSchema);
