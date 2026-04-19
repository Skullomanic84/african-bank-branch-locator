import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
} from "mongoose";

const StoreSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    suburb: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    province: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    hasATM: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    services: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (value: number[]) {
            return Array.isArray(value) && value.length === 2;
          },
          message: "Location coordinates must be [longitude, latitude]",
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

StoreSchema.index({ province: 1, city: 1, suburb: 1 });
StoreSchema.index({ hasATM: 1, isActive: 1 });
StoreSchema.index({ location: "2dsphere" });

export type StoreDocument = InferSchemaType<typeof StoreSchema>;

const StoreModel =
  (models.Store as Model<StoreDocument>) ||
  model<StoreDocument>("Store", StoreSchema);

export default StoreModel;
