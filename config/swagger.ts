import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "arkID API",
      version: "1.0.0",
      description:
        "REST API for the arkID digital card platform. Handles card management, orders, payments via Paystack, and discount codes.",
    },
    servers: [
      {
        url: "/api",
        description: "API base path",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Privy authentication token (Bearer <token>)",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        Card: {
          type: "object",
          properties: {
            card_id: { type: "string", example: "ark001" },
            username: { type: "string", example: "john_doe" },
            user_id: { type: "string" },
            email: { type: "string", example: "john@example.com" },
            isActivated: { type: "boolean" },
            display_name: { type: "string", example: "John Doe" },
            bio: { type: "string", example: "Software engineer" },
            profile_photo: { type: "string", example: "https://..." },
            social_links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string", example: "twitter" },
                  url: { type: "string", example: "https://twitter.com/johndoe" },
                  visible: { type: "boolean" },
                  order: { type: "integer" },
                },
              },
            },
            taps_count: { type: "integer", example: 42 },
            profile_views: { type: "integer", example: 10 },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            phone: { type: "string", example: "+2348012345678" },
            address: { type: "string", example: "123 Main St" },
            city: { type: "string", example: "Lagos" },
            state: { type: "string", example: "Lagos" },
            cardLink: { type: "string" },
            amount: { type: "number", example: 10000 },
            currency: { type: "string", example: "NGN" },
            status: { type: "string", enum: ["pending", "completed", "failed"] },
            reference: { type: "string" },
            discount: { type: "string" },
          },
        },
        Discount: {
          type: "object",
          properties: {
            _id: { type: "string" },
            code: { type: "string", example: "SAVE2024" },
            description: { type: "string", example: "Special launch offer" },
            isActive: { type: "boolean" },
            usageLimit: { type: "integer", nullable: true, example: 100 },
            usedCount: { type: "integer", example: 5 },
            expiryDate: { type: "string", format: "date-time", nullable: true },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../routes/*.ts"),
    path.join(__dirname, "../routes/*.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
